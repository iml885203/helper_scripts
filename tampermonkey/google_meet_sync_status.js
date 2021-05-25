// ==UserScript==
// @name         GoogleMeetLinkStatus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自動同步Google Meet的link到Rocket Chat狀態
// @author       You
// @include      /^https:\/\/meet.google.com\/[a-zA-Z]{3}-[a-zA-Z]{4}-[a-zA-Z]{3}$/
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @grant        GM_xmlhttpRequest
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==


(function() {
    'use strict';

    const ROCKET_URL = "ROCKET_URL";
    const ROCKET_AUTH_TOKEN = "ROCKET_AUTH_TOKEN";
    const ROCKET_USER_ID = "ROCKET_USER_ID";

    var path = window.location.pathname.replace('/', '');
    var defaultSettings = {
        "url": ROCKET_URL + "/api/v1/users.setStatus",
        "method": "POST",
        "headers": {
            "X-Auth-Token": ROCKET_AUTH_TOKEN,
            "X-User-Id": ROCKET_USER_ID,
            "Content-Type": "application/json"
        },
        onload: function(response) {
            console.log('[GoogleMeetLinkStatus]', response.responseText);
        }
    }

    if(path) {
        var updateStatus = function() {
            GM_xmlhttpRequest({
                ...defaultSettings,
                "data": JSON.stringify({
                    "message": "即時通訊：" + window.location.href
                }),
            });
        };
        GM_xmlhttpRequest({
            ...defaultSettings,
            "url": ROCKET_URL + "/api/v1/users.getStatus",
            "method": "GET",
            onload: function(response) {
                try {
                    var message = JSON.parse(response.response).message;
                    console.log('[GoogleMeetLinkStatus] Get current statue: ', message);
                    if(!message.includes(window.location.href)) {
                        updateStatus();
                    }
                } catch (e) {
                    console.error(response.responseText);
                    return;
                }
            }
        });

        $(window).on('beforeunload',function(e) {
            console.log('[GoogleMeetLinkStatus]', "detect close.");
            GM_xmlhttpRequest({
                ...defaultSettings,
                "data": JSON.stringify({
                    "message": "GoogleMeetLinkStatus腳本執行中"
                }),
            });
        });
    }
})();
