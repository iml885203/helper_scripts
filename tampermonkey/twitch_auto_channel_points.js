// ==UserScript==
// @name               Twitch - Auto Channel Points
// @name:zh-TW         Twitch - 自動獲得忠誠點數
// @namespace          http://tampermonkey.net/
// @version            2026.11.1
// @description        Automatically claim channel points
// @description:zh-tw  自動獲得忠誠點數
// @author             Long
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// @downloadURL https://update.greasyfork.org/scripts/435447/Twitch%20Auto%20Channel%20Points.user.js
// @updateURL https://update.greasyfork.org/scripts/435447/Twitch%20Auto%20Channel%20Points.meta.js
// ==/UserScript==

(function () {
    "use strict";

    const isChinese = /^zh\b/i.test(document.documentElement.lang || navigator.language);
    const locale = isChinese ? 'zh-TW' : 'en-US';
    const fullFormatter = new Intl.NumberFormat(locale);
    const compactFormatter = new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
        roundingMode: 'floor',
    });

    GM_addStyle(`
      #total-got-points {
        display: inline-flex;
        position: relative;
        align-items: center;
        padding : 0 var(--button-padding-x) 0 var(--button-padding-x);
        text-decoration: none;
        white-space: nowrap;
        user-select: none;
        color: var(--color-text-alt-2);
        font-weight: var(--font-weight-semibold);
        border-radius: var(--border-radius-medium);
        font-size: var(--button-text-default);
        height: var(--button-size-default);
        --point-name: '自動領取忠誠點數';
      }

      #total-got-points:hover {
        background-color: var(--color-background-button-text-hover);
      }

      #total-got-points img {
        height: 2rem;
        width: 2rem;
      }

      #total-got-points img, #total-got-points svg {
        margin-right: 5px;
      }

      #total-got-points::before{
        content: var(--point-name);
        user-select: none;
        color: var(--color-text-tooltip);
        background-color: var(--color-background-tooltip);
        font-size: var(--font-size-6);
        border-radius: 0.4rem;
        padding: 0.5rem;
        width: max-content;
        max-width: min(18rem, 70vw);
        overflow-wrap: anywhere;
        font-weight: var(--font-weight-semibold);
        right: 0;
        line-height: 1.2;
        pointer-events: none;
        position: absolute;
        text-align: left;
        white-space: normal;
        z-index: 2000;
        bottom: calc(100% + 5px);
        transition: all .2s ease-in-out;
        opacity: 0;
      }

      #total-got-points:hover::before{
        opacity: 1;
      }
    `);

    const ignorePathNames = [
        '/directory',
    ]
    const isPathIgnored = (pathname) => ignorePathNames.some(ignoredPath => pathname.startsWith(ignoredPath));

    // find button
    let findButtonRetry = 100;
    // get points
    const getPointsLoopMs = 1000;
    const gotPointsRegex = /\+?(\d+)/;
    let lastTimeGotPoints = null;
    let needToUpdateGotPoints = false;

    const startGetPointsLoop = () => {
        const GMkeyName = location.origin + location.pathname + ':auto-channel-points';
        let totalGotPoints = GM_getValue(GMkeyName, 0);
        showTotalGotPoints(totalGotPoints);
        window.getPointLoop = setInterval(function () {
            const $pointsSummaryButtons = document.querySelectorAll('[data-test-selector="community-points-summary"] button');
            const canGetPoints = $pointsSummaryButtons.length > 1;
            const $gotPointsEles = document.querySelectorAll('.pulse-animation');

            if (canGetPoints) {
                $pointsSummaryButtons[1].click();
                $pointsSummaryButtons[1].remove();
                console.log('[Twitch-Auto-Channel-Points] Getting points...');

                needToUpdateGotPoints = true;
            }

            if (needToUpdateGotPoints) {
                $gotPointsEles.forEach(($gotPointsEle) => {
                    const matches = $gotPointsEle.textContent.match(gotPointsRegex);
                    if (!matches) return;

                    lastTimeGotPoints = parseInt(matches[1]);
                });

                if (!lastTimeGotPoints) return;

                totalGotPoints += lastTimeGotPoints;
                GM_setValue(GMkeyName, totalGotPoints);
                console.log("[Twitch-Auto-Channel-Points] Got points: ", lastTimeGotPoints);
                showTotalGotPoints(totalGotPoints);

                lastTimeGotPoints = null;
                needToUpdateGotPoints = false;
            }
        }, getPointsLoopMs);
    }
    const stopGetPointsLoop = () => {
        if (!window.getPointLoop) return;
        clearInterval(window.getPointLoop);
        window.getPointLoop = null;
    }

    const appendGotPointsElement = () => {
        const $totalGotPointsContainer = document.createElement('div');
        $totalGotPointsContainer.id = 'total-got-points';
        const $buttonDiv = document.querySelectorAll('.chat-input__buttons-container div')[0];
        $buttonDiv.appendChild($totalGotPointsContainer);
        const pointButton = document.querySelector('[data-test-selector="community-points-summary"] button');
        const pointImage = pointButton?.querySelector('img');
        const sourceIcon = pointImage ?? pointButton?.querySelector('svg');
        const pointName = pointImage?.alt || (isChinese ? '忠誠點數' : 'Channel Points');
        $totalGotPointsContainer.dataset.pointLabel = isChinese ? '自動領取' + pointName : 'Auto-claimed ' + pointName;
        if (sourceIcon) {
            const icon = sourceIcon.cloneNode(true);
            icon.setAttribute('aria-hidden', 'true');
            if (pointImage) {
                icon.alt = '';
            } else {
                const style = getComputedStyle(sourceIcon);
                icon.style.color = style.color;
                icon.style.fill = style.fill;
            }
            $totalGotPointsContainer.appendChild(icon);
        }
        $totalGotPointsContainer.appendChild(document.createElement('span'));

        return document.querySelector('#total-got-points span');
    };

    const showTotalGotPoints = function (totalGotPoints) {
        let $gotPointsEle = document.querySelector('#total-got-points span');
        if (!$gotPointsEle) {
            $gotPointsEle = appendGotPointsElement();
        }
        const fullNumber = fullFormatter.format(totalGotPoints);
        const threshold = isChinese ? 10000 : 1000;
        $gotPointsEle.textContent = totalGotPoints < threshold ? fullNumber : compactFormatter.format(totalGotPoints);
        const container = $gotPointsEle.parentElement;
        const label = container.dataset.pointLabel + (isChinese ? '：' : ': ') + fullNumber;
        container.style.setProperty('--point-name', JSON.stringify(label));
        console.log("[Twitch-Auto-Channel-Points] totalGotPoints: ", totalGotPoints);
    };

    const startFindPointButtonLoop = () => {
        window.findPointButtonLoop = setInterval(function () {
            console.log('[Twitch-Auto-Channel-Points] find point-button...');
            let $pointButton = document.querySelector('[data-test-selector="community-points-summary"] button');
            if ($pointButton) {
                startGetPointsLoop();
                stopFindPointButtonLoop();
                console.log("[Twitch-Auto-Channel-Points] found point-button. start auto get points");
            } else if (!findButtonRetry) {
                stopFindPointButtonLoop();
                console.warn("[Twitch-Auto-Channel-Points] point-button not found.");
            }
            findButtonRetry--;
        }, 500);
    };
    const stopFindPointButtonLoop = () => {
        if (!window.findPointButtonLoop) return;
        clearInterval(window.findPointButtonLoop);
        window.findPointButtonLoop = null;
    }

    const handlePageLoaded = (pathname) => {
        if (isPathIgnored(pathname)) return;
        startFindPointButtonLoop();
    }
    const handlePageChanged = () => {
        window.navigation.addEventListener("navigate", (event) => {
            stopFindPointButtonLoop();
            stopGetPointsLoop();

            const url = new URL(event.destination.url);
            handlePageLoaded(url.pathname);
        });
    }

    const main = () => {
        handlePageLoaded(location.pathname);
        handlePageChanged();
    }
    main();
})();
