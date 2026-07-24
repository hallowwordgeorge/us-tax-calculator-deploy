        // Apple-style nav: ONE shared panel (#sharedMegaMenu) whose content is swapped from
        // each item's matching template (data-mega-tpl attribute) — moving between items only ever swaps
        // .innerHTML, the panel element itself is never hidden/removed in between, so there's
        // no flicker. Hover-driven on desktop (with a short close-delay so crossing the gap
        // between trigger and panel doesn't drop it); tap-to-toggle + click-outside on touch.
        (function () {
            var supportsHover = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
            var panel = document.getElementById('sharedMegaMenu');
            var content = document.getElementById('megaMenuContent');
            var items = Array.prototype.slice.call(document.querySelectorAll('.an-item[data-mega]'));
            var closeTimer = null;
            var activeKey = null;

            function showFor(item) {
                var key = item.getAttribute('data-mega');
                clearTimeout(closeTimer);
                if (activeKey !== key) {
                    var tpl = item.querySelector('template[data-mega-tpl]');
                    if (!tpl) return;
                    content.innerHTML = '';
                    content.appendChild(tpl.content.cloneNode(true));
                    activeKey = key;
                }
                panel.classList.add('mega-visible');
                items.forEach(function (i) {
                    var trig = i.querySelector('.an-link[aria-haspopup]');
                    if (trig) trig.setAttribute('aria-expanded', i.getAttribute('data-mega') === key ? 'true' : 'false');
                });
                if (key === 'search') {
                    if (typeof initSiteSearchWidget === 'function') initSiteSearchWidget();
                    var input = document.getElementById('siteSearchInput');
                    if (input) setTimeout(function () { input.focus(); }, 60);
                }
            }
            function hidePanel() {
                panel.classList.remove('mega-visible');
                activeKey = null;
                items.forEach(function (i) {
                    var trig = i.querySelector('.an-link[aria-haspopup]');
                    if (trig) trig.setAttribute('aria-expanded', 'false');
                });
            }
            function scheduleHide() {
                clearTimeout(closeTimer);
                closeTimer = setTimeout(hidePanel, 180);
            }

            if (supportsHover) {
                items.forEach(function (item) {
                    item.addEventListener('mouseenter', function () { showFor(item); });
                    item.addEventListener('mouseleave', scheduleHide);
                    item.addEventListener('focusin', function () { showFor(item); });
                });
                panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
                panel.addEventListener('mouseleave', scheduleHide);
            } else {
                items.forEach(function (item) {
                    var trigger = item.querySelector('.an-link[aria-haspopup]');
                    if (!trigger) return;
                    trigger.addEventListener('click', function (e) {
                        e.preventDefault();
                        var key = item.getAttribute('data-mega');
                        if (panel.classList.contains('mega-visible') && activeKey === key) hidePanel();
                        else showFor(item);
                    });
                });
            }
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.an-item[data-mega]') && !e.target.closest('#sharedMegaMenu')) hidePanel();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') hidePanel();
            });
            // Choosing an actual destination inside the panel closes it (also closes the mobile hamburger panel)
            content.addEventListener('click', function (e) {
                if (e.target.closest('a')) {
                    hidePanel();
                    var wrap = document.querySelector('.an-wrap');
                    if (wrap) wrap.classList.remove('an-open');
                }
            });

            // Plain (non-mega) items — lang toggle, social row — keep the older simple open/close pattern
            function closeSimpleMenus() {
                document.querySelectorAll('.an-item.open').forEach(function (item) {
                    item.classList.remove('open');
                });
            }
            var toggle = document.getElementById('anMobileToggle');
            var wrap = document.querySelector('.an-wrap');
            if (toggle && wrap) {
                toggle.addEventListener('click', function () {
                    var open = wrap.classList.toggle('an-open');
                    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                    if (!open) { closeSimpleMenus(); hidePanel(); }
                });
            }
            document.querySelectorAll('.an-items > .an-social-item a, .an-items > .an-social-item button').forEach(function (el) {
                el.addEventListener('click', function () {
                    if (wrap) wrap.classList.remove('an-open');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                });
            });
        })();