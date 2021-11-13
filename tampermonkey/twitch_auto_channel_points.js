// ==UserScript==
// @name               Twitch Auto Channel Points
// @name:zh-TW         Twitch 自動獲得忠誠點數
// @namespace          http://tampermonkey.net/
// @version            1.3
// @description        auto get Channel Points
// @description:zh-tw  自動獲得忠誠點數，其他人的腳本一直失靈，只好自己重寫一個
// @author             Long
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// ==/UserScript==

(function () {
  "use strict";

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
      max-width: 30rem;
      font-weight: var(--font-weight-semibold);
      right: 0;
      line-height: 1.2;
      pointer-events: none;
      position: absolute;
      text-align: left;
      white-space: nowrap;
      z-index: 2000;
      top: 50%;
      transform: translate(calc(100% + 5px), -50%);
      transition: all .2s ease-in-out;
      opacity: 0;
    }

    #total-got-points:hover::before{
      opacity: 1;
    }
  `);

  // find button
  let findButtonRetry = 100;
  // get points
  let getPointsLoop = 1000;
  let pointsOneTime = 50;
  let GMkeyName = location.origin + location.pathname + ':auto-channel-points';
  let totalGotPoints = GM_getValue(GMkeyName, 0);
  let beforePoints = 0;
  console.log("[Twitch-Auto-Channel-Points] totalGotPoints: ", totalGotPoints);


  let getPoints = function() {
    // console.debug('[Twitch-Auto-Channel-Points] get points');
    let $pointsSummaryButtons = document.querySelectorAll('[data-test-selector="community-points-summary"] button');
    let canGetPoints = $pointsSummaryButtons.length > 1;
    if(canGetPoints) {
      beforePoints = document.querySelector('.chat-input__buttons-container button').innerText;
      $pointsSummaryButtons[1].click();
      $pointsSummaryButtons[1].remove();
      totalGotPoints += pointsOneTime;
      GM_setValue(GMkeyName, totalGotPoints);
      showTotalGotPoints();
      console.log("[Twitch-Auto-Channel-Points] Got points!!");
      console.log("[Twitch-Auto-Channel-Points] totalGotPoints: ", totalGotPoints);
    }
  };

  let showTotalGotPoints = function() {
    let $totalGotPoints = document.querySelector('#total-got-points span');
    if(!$totalGotPoints) {
      let $totalGotPointsContainer = document.createElement('div');
      $totalGotPointsContainer.id = 'total-got-points';
      let $buttonDiv = document.querySelectorAll('.chat-input__buttons-container div')[0];
      $buttonDiv.appendChild($totalGotPointsContainer);
      let $pointImage = document.querySelector('.channel-points-icon__image');
      if($pointImage) {
        let pointName = $pointImage.alt;
        $totalGotPointsContainer.style.setProperty('--point-name', '"自動領取' + pointName + '"');
        $totalGotPointsContainer.appendChild($pointImage.cloneNode(true));
      } else {
        $totalGotPointsContainer.appendChild(document.querySelector('.chat-input__buttons-container button svg').cloneNode(true));;
      }
      $totalGotPointsContainer.appendChild(document.createElement('span'));
      $totalGotPoints = document.querySelector('#total-got-points span');
    }
    $totalGotPoints.textContent = new Intl.NumberFormat().format(totalGotPoints);;
  };

  let findButtonInterval = setInterval(function () {
    // console.debug('[Twitch-Auto-Channel-Points] find button...');
    let $pointButton = document.querySelector('[data-test-selector="community-points-summary"] button');
    if ($pointButton) {
      setInterval(getPoints, getPointsLoop);
      showTotalGotPoints();
      clearInterval(findButtonInterval);
      console.log("[Twitch-Auto-Channel-Points] found point-button. start get points");
    } else if (!findButtonRetry) {
      clearInterval(findButtonInterval);
      console.warn("[Twitch-Auto-Channel-Points] point-button not found.");
    }
    findButtonRetry--;
  }, 500);
})();

