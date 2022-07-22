// ==UserScript==
// @name               Twitch Auto Theatre
// @name:zh-TW         Twitch 自動劇院模式
// @namespace          http://tampermonkey.net/
// @version            0.7
// @description        auto click theatre mode button
// @description:zh-tw  進入頁面自動啟動劇院模式
// @author             Long
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              none
// ==/UserScript==

(function () {
  "use strict";

  window.onload = function() {
    let twitchAutoTheatreIntervalRetry = 300;
    const twitchAutoTheatreInterval = setInterval(function () {
      const isEnabled = document.querySelector('.persistent-player').classList.contains('persistent-player--theatre')
      if (isEnabled) {
        clearInterval(twitchAutoTheatreInterval);
        console.warn("[Twitch-Auto-Theatre] theatre-mode enabled.");
      }

      if (!twitchAutoTheatreIntervalRetry) {
        clearInterval(twitchAutoTheatreInterval);
        console.warn("[Twitch-Auto-Theatre] theatre-mode-button not found.");
      }

      const $theatreModeButton = document.querySelector('[data-a-target="player-theatre-mode-button"]')
      if ($theatreModeButton) {
        $theatreModeButton.click();
        clearInterval(twitchAutoTheatreInterval);
        console.log("[Twitch-Auto-Theatre] theatre-mode-button clicked.");
      }
      twitchAutoTheatreIntervalRetry--;
    }, 500);
  };
})();
