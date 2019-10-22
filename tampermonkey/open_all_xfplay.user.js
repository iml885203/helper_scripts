// ==UserScript==
// @name         open_all_xfplay
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  在58b.tv，於影片連結右側，增加一個按鈕可以打開全部先鋒連結
// @author       Long
// @include      https://www.58b.tv/vod-read-id-*
// @grant        none
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

var $ = window.jQuery;

var id = window.location.pathname.replace('/vod-read-id-', '').replace('.html', '');
var checkId = Number.isInteger(parseInt(id));
var isDisabled = false;
var errMsg = '';

if (!checkId) {
  isDisabled = true;
  errMsg = '無影片ID';
}
var $hasXfplayer = $('p:contains("xfplay先鋒資源")');
if(!$hasXfplayer.length) {
  isDisabled = true;
  errMsg = '無先鋒資源';
}
var $links = $(`a[href*="/vod-play-id-${id}"]`, $hasXfplayer.parent());
if (!$links.length) {
  isDisabled = true;
  errMsg = '無先鋒連結';
}
if ($links.length >= 50) {
  isDisabled = true;
  errMsg = '連結過多';
}

var msg = errMsg ? errMsg : `${$links.length}個`;
var $btn = $(`<div id="open_all_xfplay">腳本開啟<br>先鋒連結<br>(${msg})</div>`);
$btn.appendTo('body');

$('#open_all_xfplay').css({
    "position": "fixed",
    "right": "0",
    "top": "50%",
    "transform": "translateY(-50%)",
    "background-color": "rgb(24, 194, 200)",
    "padding": "10px",
    "font-size": "1rem",
    "cursor": "pointer",
    "color": "white",
    "opacity": "0.5",
    "transition": "opacity 0.5s",
    "text-align": "center"
});

if(isDisabled) {
  $('#open_all_xfplay').css({
    "cursor": "not-allowed",
  });
} else {
  $('#open_all_xfplay')
    .hover(function() {
      $(this).css('opacity', '1');
    })
    .mouseout(function() {
      $(this).css('opacity', '0.5');
    });
  $('#open_all_xfplay').click(function(){
    $links.each((index, $link) => {
      $link.click();
    });
  });
}
