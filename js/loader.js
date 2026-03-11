/* ============================================================
   Orb — Orbital Loader Animation
   IIFE: shows loader only on first visit (sessionStorage gating)
   ============================================================ */
(function () {
    var loader    = document.getElementById('orbitdesk-loader');
    var ringGroup = document.getElementById('orb-ring-group');
    var ring      = document.getElementById('orb-ring');
    var core      = document.getElementById('orb-core');
    var planet    = document.getElementById('orb-planet');

    if (!loader) return;

    var t    = 0;
    var anim = null;
    var LOADER_KEY = 'orbitdesk_loader_shown';

    if (!sessionStorage.getItem(LOADER_KEY)) {
        /* Animate the Orb logo */
        function animateOrbLogo() {
            t += 0.03;
            /* Planet orbits the center */
            if (ringGroup) {
                var deg = (t * 60) % 360;
                ringGroup.setAttribute('transform', 'rotate(' + deg + ' 80 80)');
            }
            /* Core pulses subtly */
            if (core) {
                var r = 16 + 3 * Math.abs(Math.sin(t * 2));
                core.setAttribute('r', r);
            }
            /* Outer ring breathes */
            if (ring) {
                var rr = 56 + 2 * Math.abs(Math.sin(t * 1.5));
                ring.setAttribute('r', rr);
            }
            anim = requestAnimationFrame(animateOrbLogo);
        }
        animateOrbLogo();

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
