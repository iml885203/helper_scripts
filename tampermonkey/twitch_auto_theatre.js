// ==UserScript==
// @name               Twitch Auto Theatre
// @name:zh-TW         Twitch 自動劇院模式
// @namespace          http://tampermonkey.net/
// @version            2023.12
// @description        auto click theatre mode button
// @description:zh-tw  進入頁面自動啟動劇院模式
// @author             Long
// @match              https://www.twitch.tv/*
// @icon               https://www.google.com/s2/favicons?domain=twitch.tv
// @grant              none
// ==/UserScript==

(function () {
    "use strict";

    let twitchAutoTheatreIntervalRetry = 300;
    const twitchAutoTheatreInterval = setInterval(function () {
        console.log("[Twitch-Auto-Theatre] try to enable theatre-mode...");
        if (!twitchAutoTheatreIntervalRetry) {
            clearInterval(twitchAutoTheatreInterval);
            console.warn("[Twitch-Auto-Theatre] theatre-mode-button not found.");
            return;
        }

        const $persistentPlayer = document.querySelector(".persistent-player");
        if (!$persistentPlayer) {
            console.warn("[Twitch-Auto-Theatre] .persistent-player not found.");
            twitchAutoTheatreIntervalRetry--;
            return;
        }

        const isEnabled = $persistentPlayer.classList.contains("persistent-player--theatre");
        if (isEnabled) {
            clearInterval(twitchAutoTheatreInterval);
            console.log("[Twitch-Auto-Theatre] theatre-mode enabled.");
            return;
        }

        const $theatreModeButton = document.querySelector('[aria-label*="alt+t"]');
        if ($theatreModeButton) {
            $theatreModeButton.click();
            console.log("[Twitch-Auto-Theatre] theatre-mode-button clicked.");
        }
        twitchAutoTheatreIntervalRetry--;
    }, 500);
})();
