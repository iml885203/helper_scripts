// ==UserScript==
// @name         TwitchAutoTheatre
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  auto click theatre mode button
// @author       Long
// @match        https://www.twitch.tv/*
// @icon         https://www.google.com/s2/favicons?domain=twitch.tv
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  var twitchAutoTheatreIntervalRetry = 10;
  var twitchAutoTheatreInterval = setInterval(function () {
    let $theatreModeButton = document.querySelector('[data-a-target="player-theatre-mode-button"]');
    console.log($theatreModeButton);
    if ($theatreModeButton) {
      $theatreModeButton.click();
      clearInterval(twitchAutoTheatreInterval);
      console.log("[Twitch-Auto-Theatre] theatre-mode-button clicked.");
    } else if (!twitchAutoTheatreIntervalRetry) {
      clearInterval(twitchAutoTheatreInterval);
      console.warn("[Twitch-Auto-Theatre] theatre-mode-button not found.");
    }
    twitchAutoTheatreIntervalRetry--;
  }, 500);
})();



