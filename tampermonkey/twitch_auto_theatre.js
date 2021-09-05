// ==UserScript==
// @name               Twitch Auto Theatre
// @name:zh-TW         Twitch 自動劇院模式
// @namespace          http://tampermonkey.net/
// @version            0.6
// @description        auto click theatre mode button
// @description:zh-tw  進入頁面自動啟動劇院模式
// @author             Long
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              none
// ==/UserScript==

(function () {
  "use strict";

  // method 1
  // window.onload = function() {
  //   var twitchAutoTheatreIntervalRetry = 100;
  //   var twitchAutoTheatreInterval = setInterval(function () {
  //     let $theatreModeButton = document.querySelector('[data-a-target="player-theatre-mode-button"]');
  //     // console.log($theatreModeButton);
  //     if ($theatreModeButton) {
  //       $theatreModeButton.click();
  //       clearInterval(twitchAutoTheatreInterval);
  //       console.log("[Twitch-Auto-Theatre] theatre-mode-button clicked.");
  //     } else if (!twitchAutoTheatreIntervalRetry) {
  //       clearInterval(twitchAutoTheatreInterval);
  //       console.warn("[Twitch-Auto-Theatre] theatre-mode-button not found.");
  //     }
  //     twitchAutoTheatreIntervalRetry--;
  //   }, 500);
  // };

  // method 2
  let observer = new MutationObserver(mutations => {
    for(let mutation of mutations) {
      let node = mutation.target;
      if (node.matches('.player-controls__right-control-group')) {
        observer.disconnect();
        let $theatreModeButton = document.querySelector('[data-a-target="player-theatre-mode-button"]');
        if ($theatreModeButton) {
          $theatreModeButton.click();
          console.log("[Twitch-Auto-Theatre] theatre-mode-button clicked.");
        } else {
          console.warn("[Twitch-Auto-Theatre] control-group found. but button not found.")
        }
      }
    }
  });
  observer.observe(document.getElementById('root'), {
    childList: true,
    subtree: true,
  });
})();
