// ==UserScript==
// @name         open_all_xfplay
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  在58b.tv，於影片連結右側，增加一個按鈕可以打開全部先鋒連結
// @author       Long
// @include      https://www.58b.tv/vod-read-id-*
// @grant        none
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

var $ = window.jQuery;
$('<div id="open_all_xfplay">下載先鋒<br>(全部)</div>').appendTo('body');
$('#open_all_xfplay').css({
    "position": "fixed",
    "right": "0",
    "top": "50%",
    "transform": "translateY(-50%)",
    "background-color": "rgb(24, 194, 200)",
    "padding": "10px",
    "font-size": "1.2rem",
    "cursor": "pointer",
    "color": "white",
    "opacity": "0.5",
    "transition": "opacity 0.5s",
    "text-align": "center"
});
$('#open_all_xfplay')
    .hover(function() {
        $(this).css('opacity', '1');
    })
    .mouseout(function() {
        $(this).css('opacity', '0.5');
    });

$('#open_all_xfplay').click(function(){
    javascript:(function(){function callback(){(function($){var jQuery=$;var run = function () {var id = window.location.pathname.replace('/vod-read-id-', '').replace('.html', '');var checkId = Number.isInteger(parseInt(id));if (!checkId) {swal('唉呀', '找不到影片的ID', 'warning');return;}var $hasXfplayer = $('p:contains("xfplay先鋒資源")');if(!$hasXfplayer.length) {swal('唉呀', '好像沒有先鋒資源哦', 'warning');return;}var $links = $(`a[href*="/vod-play-id-${id}"]`, $hasXfplayer.parent());if (!$links.length) {swal('唉呀', '找不到先鋒的連結', 'warning');}$links.each((index, $link) => {$link.click();});};if(typeof sweetAlert !== 'function') {function loadScript(url) {var script = document.createElement("script");script.type = "text/javascript";script.src = url;document.body.appendChild(script);}function loadStyles(url) {var link = document.createElement("link");link.type = "text/css";link.rel = "stylesheet";link.href = url;document.getElementsByTagName("head")[0].appendChild(link);}loadScript("//cdn.bootcss.com/sweetalert/1.1.3/sweetalert.min.js");loadStyles("//cdn.bootcss.com/sweetalert/1.1.3/sweetalert.min.css");var checkLoaded = function() {if (typeof sweetAlert === 'function') {clearInterval(runner);run();}};var runner = setInterval(checkLoaded, 100);} else {run();}})(jQuery.noConflict(true))}var s=document.createElement("script");s.src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js";if(s.addEventListener){s.addEventListener("load",callback,false)}else if(s.readyState){s.onreadystatechange=callback}document.body.appendChild(s);})()
});
