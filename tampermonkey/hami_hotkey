// ==UserScript==
// @name               Hami Hoykey
// @name:zh-TW         Hami 快捷鍵
// @namespace          http://tampermonkey.net/
// @version            0.1
// @description        add hotkey for HamiVideo
// @description:zh-tw  幫HamiVideo增加快捷鍵
// @author             Long
// @match              https://hamivideo.hinet.net/play/*
// @icon               https://www.google.com/s2/favicons?domain=hinet.net
// @grant              none
// ==/UserScript==

(function () {
  "use strict";

  function toggleFullscreen() {
    let $fullScreenEle = document.getElementById('h5video');
    if(!$fullScreenEle) {
      console.warn('[Hami Hotkey] fullscreen element not found.');
      return;
    }
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
      if ($fullScreenEle.requestFullscreen) {
        $fullScreenEle.requestFullscreen();
      } else if ($fullScreenEle.msRequestFullscreen) {
        $fullScreenEle.msRequestFullscreen();
      } else if ($fullScreenEle.mozRequestFullScreen) {
        $fullScreenEle.mozRequestFullScreen();
      } else if ($fullScreenEle.webkitRequestFullscreen) {
        $fullScreenEle.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  window.onload = function() {
    var loop = setInterval(function () {
      var $video = document.getElementById('h5video_html5_api');
      // console.log($video);
      if ($video) {
        $video.addEventListener('keydown', (e) => {
          // console.log(e);
          if(e.key === 'ArrowLeft') {
            $video.currentTime = Math.max(0, $video.currentTime - 5);
          } else if(e.key === 'ArrowRight') {
            $video.currentTime = Math.min($video.duration, $video.currentTime + 5);
          } else if (e.key === ' ') {
            if($video.paused) {
              $video.play();
            } else {
              $video.pause();
            }
          } else if (e.shiftKey && e.key === '<') {
            $video.playbackRate = Math.max(0.75, $video.playbackRate - 0.25);
          } else if (e.shiftKey && e.key === '>') {
            $video.playbackRate = Math.min(2, $video.playbackRate + 0.25);
          } else if(e.key === 'f') {
            toggleFullscreen();
          }
        });
        clearInterval(loop);
        console.log("[Hami Hotkey] hotkey loaded.");
      }
    }, 500);
  };
})();
