/* Shared "share this page" button + toast, matching the main SPA's nav social row.
   Unlike the main SPA (which always shares the homepage, since it's one single-page
   app), pages using this share the page they're actually on — window.location.href —
   since each state/salary/article page now has its own real, meaningful URL. */
function shareSite() {
    var url = window.location.href;
    function done() { showShareToast(); }
    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url); done(); });
    } else {
        fallbackCopy(url); done();
    }
}
function showShareToast() {
    var t = document.getElementById('shareToast');
    if (!t) return;
    t.classList.add('show');
    clearTimeout(window.__shareToastTimer);
    window.__shareToastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
}
