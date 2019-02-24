javascript: (function() {
    var cssFileUrl = 'https://cdn.rawgit.com/iml885203/89773e800a1c65e88ec9d0f7414e8b1e/raw/18a414a3ce4899a1b42929f62b9fbb106f04ca22/google_translate_rwd.css';

    if (window.location.host != "translate.google.com.tw") {
        alert('這頁面不是Google翻譯哦!');
        return;
    }

    var cssId = 'google_translate_rwd_css';
    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssFileUrl;
        link.media = 'all';
        head.appendChild(link);
        alert('Google翻譯加入RWD!!');
    } else {
        alert('已經載入RWD哦');
    }

})();
