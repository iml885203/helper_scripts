// ==UserScript==
// @name               Hami Hoykey
// @name:zh-TW         Hami 快捷鍵
// @namespace          http://tampermonkey.net/
// @version            0.4
// @description        add hotkey for HamiVideo. f=fullscreen, Left/Right=TimeControl, space=play/pause, shift+>=speedup, shift+<=speeddown
// @description:zh-tw  幫HamiVideo增加快捷鍵, f=全螢幕, Left/Right=時間控制, space=開始/暫停, shift+>=加速, shift+<=減速
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
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) { // current working methods
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

  function initHotkey($video) {
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
      } else if(e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    });
    $video.focus();
    console.log("[Hami Hotkey] hotkey loaded.", $video);
  };

  // handle dom created event
  let observer = new MutationObserver(mutations => {
    for(let mutation of mutations) {
      for(let node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches('#h5video_html5_api')) {
          initHotkey(node);
        }
      }
    }
  });
  observer.observe(document.getElementById('player'), {
    childList: true,
    attributes: true,
    attributeFilter: ['id']
  });
})();
