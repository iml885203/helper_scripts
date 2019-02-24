var run = function () {
  var id = window.location.pathname.replace('/vod-read-id-', '').replace('.html', '');
  var checkId = Number.isInteger(parseInt(id));
  if (!checkId) {
    swal('唉呀', '找不到影片的ID', 'warning');
    return;
  }
  var $hasXfplayer = $('p:contains("xfplay先鋒資源")');
  if(!$hasXfplayer.length) {
    swal('唉呀', '好像沒有先鋒資源哦', 'warning');
    return;
  }
  var $links = $(`a[href*="/vod-play-id-${id}"]`, $hasXfplayer.parent());
  if (!$links.length) {
    swal('唉呀', '找不到先鋒的連結', 'warning');
  }
  $links.each((index, $link) => {
    $link.click();
  });
};

if(typeof sweetAlert !== 'function') {
  function loadScript(url) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    document.body.appendChild(script);
  }
  
  function loadStyles(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
  }

  loadScript("//cdn.bootcss.com/sweetalert/1.1.3/sweetalert.min.js");
  loadStyles("//cdn.bootcss.com/sweetalert/1.1.3/sweetalert.min.css");

  var checkLoaded = function() {
    if (typeof sweetAlert === 'function') {
      clearInterval(runner);
      run();
    }
  };

  var runner = setInterval(checkLoaded, 100);
} else {
  run();
}
