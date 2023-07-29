// ==UserScript==
// @name         Photo Station 6 影片快轉
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Control Video forward/backward for Photo Station 6
// @author       You
// @match        http://twmedia.coreop.net/photo/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=coreop.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const SECONDS = 5;

    document.addEventListener('keydown', (event) => {
        console.log(event.key)
        const extMain = window.Main;
        if (!extMain) {
            console.log('extJs main not found.');
            return;
        }
        if (event.key === '[') {
            const position = extMain.getScope("PhotoStation.VideoPlayer").player.getPosition();
            extMain.getScope("PhotoStation.VideoPlayer").player.seek(position - SECONDS);
        } else if (event.key === ']') {
            const position = extMain.getScope("PhotoStation.VideoPlayer").player.getPosition();
            extMain.getScope("PhotoStation.VideoPlayer").player.seek(position + SECONDS);
        }
    });
})();
