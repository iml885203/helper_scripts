// ==UserScript==
// @name         auto_click_xfplayer
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  58btv先鋒連結自動打開應用程式並關閉分頁
// @author       Long
// @match        https://www.58b.tv/vod-play-id-*
// @grant        none
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

var $ = window.jQuery;

console.log('ready');
var $iframeXfplayer = $('iframe[src*="xfplay"]');
console.log($('iframe[src*="xfplayinstall"]', $iframeXfplayer.contents()));

if(!$iframeXfplayer.length) {
    console.error('$iframeXfplayer not found');
} else {
    $iframeXfplayer.on('load', function(){
        console.log('$iframeXfplayer loaded');
        var $iframeXfplayerInstall = $('iframe[src*="xfplayinstall"]', $iframeXfplayer.contents());
        //console.log($iframeXfplayerInstall);
        //console.log(!$iframeXfplayerInstall.length);
        //console.log($('a[href*="xfplay"]', $iframeXfplayerInstall.contents()));
        if(!$iframeXfplayerInstall.length) {
            console.error('$iframeXfplayerInstall not found');
            return;
        }

        var $link = $('a[href*="xfplay"]', $iframeXfplayerInstall.contents());
        //console.log(!$link.length);
        if(!$link.length){
            console.error('xfplay link not found.');
            return;
        }
        //console.log($link[0].href);
        var win = window.open($link[0].href, '_blank');
        window.setTimeout(function(){
            win.close();
        }, 0);

        if(!win){
            console.error('open link failed');
            return;
        }

        window.setTimeout(function(){
            window.close();
        }, 0);
    });
}
