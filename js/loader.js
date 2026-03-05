/* ============================================================
   OrbitDesk — Swiss-Style Loader Animation
   IIFE: shows loader only on first visit (sessionStorage gating)
   ============================================================ */
(function () {
    var loader    = document.getElementById('orbitdesk-loader');
    var bar       = document.getElementById('swiss-bar');
    var barV      = document.getElementById('swiss-bar-v');
    var barsGroup = document.getElementById('swiss-bars-group');
    var dot       = document.getElementById('swiss-dot');

    if (!loader) return;

    var t    = 0;
    var anim = null;
    var LOADER_KEY = 'orbitdesk_loader_shown';

    if (!sessionStorage.getItem(LOADER_KEY)) {
        /* Animate the Swiss logo */
        function animateSwissLogo() {
            t += 0.06;
            var h = 10 + 6 * Math.abs(Math.sin(t));
            if (bar)  { bar.setAttribute('height', h);  bar.setAttribute('y', 80 - h / 2); }
            if (barV) { barV.setAttribute('width', h);   barV.setAttribute('x', 80 - h / 2); }
            if (barsGroup) {
                var rot = Math.sin(t / 1.5) * 18;
                barsGroup.setAttribute('transform', 'rotate(' + rot + ' 80 80)');
            }
            if (dot) {
                var r = 28 + 4 * Math.abs(Math.sin(t * 2));
                dot.setAttribute('r', r);
                dot.setAttribute('cx', 80);
                dot.setAttribute('cy', 80 + Math.abs(Math.sin(t * 2)) * 18);
            }
            anim = requestAnimationFrame(animateSwissLogo);
        }
        animateSwissLogo();

        /* Hide after 3 s */
        setTimeout(function () {
            loader.style.opacity = '0';
            setTimeout(function () {
                loader.style.display = 'none';
                if (anim) cancelAnimationFrame(anim);
            }, 600);
        }, 3000);

        sessionStorage.setItem(LOADER_KEY, '1');

        /* Hide on browser back */
        if (window.history && window.history.pushState) {
            window.addEventListener('popstate', function () {
                if (loader) loader.style.display = 'none';
            });
        }
    } else {
        loader.style.display = 'none';
    }
})();
