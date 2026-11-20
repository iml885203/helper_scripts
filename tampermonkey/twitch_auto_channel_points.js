// ==UserScript==
// @name               Twitch - Auto Channel Points
// @name:zh-TW         Twitch - 自動獲得忠誠點數
// @namespace          http://tampermonkey.net/
// @version            2026.11.3
// @description        Automatically claim channel points
// @description:zh-TW  自動獲得忠誠點數
// @author             Long
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// @downloadURL https://update.greasyfork.org/scripts/435447/Twitch%20Auto%20Channel%20Points.user.js
// @updateURL https://update.greasyfork.org/scripts/435447/Twitch%20Auto%20Channel%20Points.meta.js
// ==/UserScript==

(() => {
    'use strict';

    const isChinese = /^zh\b/i.test(document.documentElement.lang || navigator.language);
    const locale = isChinese ? 'zh-TW' : 'en-US';
    const numberFormat = new Intl.NumberFormat(locale);
    const compactFormat = new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
        roundingMode: 'floor',
    });
    const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });
    const strings = isChinese
        ? {
            title: '領取歷程', empty: '尚無領取紀錄', close: '關閉',
            points: '忠誠點數', prefix: '自動領取',
            total: (points) => `累計領取 ${numberFormat.format(points)} 點`,
            unlisted: (points) => `有 ${numberFormat.format(points)} 點未列在下方歷程`,
        }
        : {
            title: 'Claim history', empty: 'No claim history yet', close: 'Close',
            points: 'Channel Points', prefix: 'Auto-claimed ',
            total: (points) => `Total claimed: ${numberFormat.format(points)} ${points === 1 ? 'point' : 'points'}`,
            unlisted: (points) => `${numberFormat.format(points)} ${points === 1 ? 'point isn’t' : 'points aren’t'} shown in the history below`,
        };
    const summarySelector = '[data-test-selector="community-points-summary"]';
    let channelPath;
    let counter;
    let dialog;
    let pending;

    GM_addStyle(`
        #total-got-points {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            height: var(--button-size-default, 3rem);
            padding: 0 var(--button-padding-x, .8rem);
            border-radius: var(--border-radius-medium, .4rem);
            color: var(--color-text-alt-2, #dedee3);
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
        }
        #total-got-points:hover, #total-got-points:focus-visible {
            background: var(--color-background-button-text-hover, #34343b);
        }
        #total-got-points img, #total-got-points svg { width: 2rem; height: 2rem; }
        #total-got-points:hover::before, #total-got-points:focus-visible::before {
            content: var(--point-name);
            position: absolute;
            right: 0;
            bottom: calc(100% + 5px);
            z-index: 2000;
            pointer-events: none;
            width: max-content;
            max-width: min(18rem, 70vw);
            white-space: normal;
            overflow-wrap: anywhere;
            padding: .5rem;
            border-radius: .4rem;
            color: var(--color-text-tooltip, #0e0e10);
            background: var(--color-background-tooltip, #fff);
        }
        #auto-points-history {
            box-sizing: border-box;
            width: min(36rem, calc(100vw - 2rem));
            max-height: calc(100dvh - 2rem);
            margin: auto;
            overflow: auto;
            padding: 1.6rem;
            border: 1px solid var(--color-border-base, #48484d);
            border-radius: .8rem;
            color: var(--color-text-base, #efeff1);
            background: var(--color-background-base, #18181b);
        }
        #auto-points-history::backdrop { background: rgb(0 0 0 / 55%); }
        #auto-points-history header, #auto-points-history li {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            gap: .8rem;
        }
        #auto-points-history header button { cursor: pointer; padding: .4rem .8rem; }
        #auto-points-history p { margin: .6rem 0; }
        #auto-points-history .claim-total {
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        #auto-points-history .claim-total img,
        #auto-points-history .claim-total svg {
            width: 2rem;
            height: 2rem;
            flex-shrink: 0;
        }
        #auto-points-history .unlisted-points {
            color: var(--color-text-alt-2, #adadb8);
            font-size: .875em;
            opacity: .7;
        }
        #auto-points-history ol { list-style: none; padding: 0; }
        #auto-points-history li { padding: .6rem 0; }
    `);

    function appendText(parent, tag, text) {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.append(element);
        return element;
    }

    function renderHistory(history, total) {
        const content = dialog.querySelector('section');
        content.replaceChildren();
        const totalLine = document.createElement('p');
        totalLine.className = 'claim-total';
        content.append(totalLine);
        if (counter?.icon) totalLine.append(counter.icon.cloneNode(true));
        appendText(totalLine, 'strong', strings.total(total));

        const unlisted = total - history.reduce((sum, entry) => sum + entry.points, 0);
        if (unlisted > 0) {
            appendText(content, 'p', strings.unlisted(unlisted)).className = 'unlisted-points';
        }

        if (!history.length) {
            appendText(content, 'p', strings.empty);
            return;
        }

        const list = document.createElement('ol');
        content.append(list);
        for (const entry of history) {
            const row = document.createElement('li');
            list.append(row);
            const date = new Date(entry.timestamp);
            const time = appendText(row, 'time', dateFormat.format(date));
            time.setAttribute('datetime', date.toISOString());
            appendText(row, 'strong', '+' + numberFormat.format(entry.points));
        }
    }

    function openHistory(totalKey, historyKey) {
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'auto-points-history';
            dialog.setAttribute('aria-labelledby', 'auto-points-history-title');
            const header = document.createElement('header');
            dialog.append(header, document.createElement('section'));
            const title = appendText(header, 'h2', strings.title);
            title.id = 'auto-points-history-title';
            const close = appendText(header, 'button', strings.close);
            close.type = 'button';
            close.addEventListener('click', () => dialog.close());
            document.body.append(dialog);
        }
        renderHistory(GM_getValue(historyKey, []), GM_getValue(totalKey, 0));
        if (!dialog.open) dialog.showModal();
    }

    function createCounter(host, totalKey, historyKey) {
        const element = document.createElement('button');
        element.id = 'total-got-points';
        element.type = 'button';
        element.setAttribute('aria-haspopup', 'dialog');
        const count = appendText(element, 'span', '');
        element.addEventListener('click', () => openHistory(totalKey, historyKey));
        host.append(element);
        return { element, count, name: strings.points };
    }

    function syncCounterIcon(balance) {
        const iconContainer = balance?.previousElementSibling;
        const image = iconContainer?.querySelector('img');
        const source = image ?? iconContainer?.querySelector('svg');
        const markup = source?.outerHTML;
        if (counter.iconSource === source && counter.iconMarkup === markup) return false;

        counter.icon?.remove();
        counter.iconSource = source;
        counter.iconMarkup = markup;
        counter.icon = source?.cloneNode(true);
        counter.name = image?.alt || strings.points;
        if (counter.icon) {
            counter.icon.setAttribute('aria-hidden', 'true');
            if (image) {
                counter.icon.alt = '';
            } else {
                const style = getComputedStyle(source);
                counter.icon.style.color = style.color;
                counter.icon.style.fill = style.fill;
            }
            counter.element.insertBefore(counter.icon, counter.count);
        }
        return true;
    }

    function readPoints(element) {
        const match = element.textContent.match(/\+\s*([\d,]+)/);
        return match ? Number(match[1].replace(/,/g, '')) : 0;
    }

    function update() {
        if (location.pathname !== channelPath) {
            channelPath = location.pathname;
            counter?.element.remove();
            if (dialog?.open) dialog.close();
            counter = null;
            pending = null;
        }
        if (channelPath.startsWith('/directory')) return;

        const summary = document.querySelector(summarySelector);
        const bonusIcon = summary?.querySelector('[data-test-selector="claimable-bonus__icon"]')
            ?? summary?.querySelector('.claimable-bonus__icon');
        const bonus = bonusIcon?.closest('button');
        const balance = summary?.querySelector('[data-test-selector="copo-balance-string"]');
        const host = summary?.closest('.chat-input__buttons-container')?.querySelector('div');
        if (!host) return;

        const totalKey = location.origin + channelPath + ':auto-channel-points';
        const historyKey = totalKey + ':history';
        if (counter?.element.parentElement !== host) {
            counter?.element.remove();
            counter = createCounter(host, totalKey, historyKey);
        }

        let total = GM_getValue(totalKey, 0);
        const nativeButton = balance?.closest('button');
        if (nativeButton) {
            const radius = getComputedStyle(nativeButton).borderRadius;
            if (counter.element.style.borderRadius !== radius) {
                counter.element.style.borderRadius = radius;
            }
        } else if (counter.element.style.borderRadius) {
            counter.element.style.borderRadius = '';
        }
        const iconChanged = syncCounterIcon(balance);
        if (iconChanged && dialog?.open) renderHistory(GM_getValue(historyKey, []), total);
        const animations = summary.querySelectorAll('.pulse-animation');
        if (pending && Date.now() >= pending.deadline) pending = null;
        if (pending) {
            for (const animation of animations) {
                const points = readPoints(animation);
                if (!points || pending.previous.get(animation) === points) continue;

                pending = null;
                total += points;
                const history = [{ timestamp: Date.now(), points }, ...GM_getValue(historyKey, [])].slice(0, 100);
                GM_setValue(totalKey, total);
                GM_setValue(historyKey, history);
                if (dialog?.open) renderHistory(history, total);
                break;
            }
        }

        if (counter.total !== total || iconChanged) {
            counter.total = total;
            const formatted = numberFormat.format(total);
            counter.count.textContent = total < (isChinese ? 10000 : 1000)
                ? formatted : compactFormat.format(total);
            const label = strings.prefix + counter.name + (isChinese ? '：' : ': ') + formatted;
            counter.element.style.setProperty('--point-name', JSON.stringify(label));
            counter.element.setAttribute('aria-label', label);
        }

        if (!pending && bonus && !bonus.disabled) {
            pending = {
                deadline: Date.now() + 5000,
                previous: new Map(Array.from(animations, (element) => [element, readPoints(element)])),
            };
            bonus.click();
        }
    }

    update();
    window.setInterval(update, 250);
})();
