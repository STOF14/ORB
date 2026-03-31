/* ============================================================
   Orb — Mobile Workflow Layer
   Global mobile usability helpers for all pages
   ============================================================ */
(function () {
	if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;

	var RECENT_KEY = 'orb_recent_pages_v1';
	var SCROLL_KEY_PREFIX = 'orb_scroll_';
	var MAX_RECENT = 6;
	var path = (location.pathname.split('/').pop() || 'index.html');
	var title = (document.title || path).replace(/\s*[\-|\u2014]\s*Orb\s*$/i, '').trim();

	function readJson(key, fallback) {
		try {
			var val = localStorage.getItem(key);
			return val ? JSON.parse(val) : fallback;
		} catch (e) {
			return fallback;
		}
	}

	function writeJson(key, val) {
		try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
	}

	function updateRecentPages() {
		var recent = readJson(RECENT_KEY, []);
		recent = recent.filter(function (item) { return item && item.path !== path; });
		recent.unshift({ path: path, title: title, ts: Date.now() });
		if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
		writeJson(RECENT_KEY, recent);
		return recent;
	}

	function attachRecentShortcut(recent) {
		var header = document.querySelector('.nav-overlay__header');
		if (!header) return;
		if (header.querySelector('.nav-overlay__recent')) return;
		var next = recent.find(function (item) { return item.path !== path; });
		if (!next) return;

		var link = document.createElement('a');
		link.className = 'nav-overlay__recent';
		link.href = next.path;
		link.textContent = 'Back: ' + (next.title.length > 16 ? next.title.slice(0, 16) + '...' : next.title);
		link.setAttribute('aria-label', 'Go back to ' + next.title);
		var closeButton = header.querySelector('.nav-overlay__close');
		if (closeButton && closeButton.parentNode === header) {
			header.insertBefore(link, closeButton);
		} else {
			header.appendChild(link);
		}
	}

	function restoreScroll() {
		var key = SCROLL_KEY_PREFIX + path;
		var y = parseInt(localStorage.getItem(key) || '0', 10);
		if (!Number.isNaN(y) && y > 0) {
			requestAnimationFrame(function () {
				window.scrollTo(0, y);
			});
		}
	}

	function persistScroll() {
		var key = SCROLL_KEY_PREFIX + path;
		var onScroll = function () {
			try { localStorage.setItem(key, String(window.scrollY || 0)); } catch (e) {}
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('beforeunload', onScroll);
		document.addEventListener('visibilitychange', function () {
			if (document.visibilityState === 'hidden') onScroll();
		});
	}

	function setupTopButton() {
		var btn = document.createElement('button');
		btn.className = 'mobile-top-btn';
		btn.type = 'button';
		btn.setAttribute('aria-label', 'Scroll to top');
		btn.textContent = 'Top';
		document.body.appendChild(btn);

		var onScroll = function () {
			if ((window.scrollY || 0) > 520) btn.classList.add('show');
			else btn.classList.remove('show');
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		btn.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	function setupInputFocusMode() {
		var focusables = 'input, textarea, select, [contenteditable="true"]';
		document.addEventListener('focusin', function (event) {
			var target = event.target;
			if (!target || !target.matches || !target.matches(focusables)) return;
			document.body.classList.add('mobile-input-active');
		});
		document.addEventListener('focusout', function () {
			setTimeout(function () {
				var active = document.activeElement;
				if (!active || !active.matches || !active.matches(focusables)) {
					document.body.classList.remove('mobile-input-active');
				}
			}, 40);
		});
	}

	function setupEdgeSwipeOpenMenu() {
		var overlay = document.getElementById('navOverlay');
		var toggle = document.getElementById('navToggle');
		if (!overlay || !toggle) return;

		var startX = 0;
		var startY = 0;
		var tracking = false;

		document.addEventListener('touchstart', function (event) {
			if (!event.touches || event.touches.length !== 1) return;
			if (overlay.classList.contains('open')) return;
			var t = event.touches[0];
			if (t.clientX > 22) return;
			startX = t.clientX;
			startY = t.clientY;
			tracking = true;
		}, { passive: true });

		document.addEventListener('touchmove', function (event) {
			if (!tracking || !event.touches || event.touches.length !== 1) return;
			var t = event.touches[0];
			var dx = t.clientX - startX;
			var dy = Math.abs(t.clientY - startY);
			if (dx > 58 && dy < 26) {
				tracking = false;
				toggle.click();
			}
			if (dy > 36 || dx < -10) tracking = false;
		}, { passive: true });

		document.addEventListener('touchend', function () {
			tracking = false;
		}, { passive: true });
	}

	function setupBottomNavDoubleTap() {
		var label = document.querySelector('.bottom-nav__page');
		if (!label) return;
		var lastTap = 0;
		label.addEventListener('click', function () {
			var now = Date.now();
			if (now - lastTap < 300) {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
			lastTap = now;
		});
	}

	var recent = updateRecentPages();
	attachRecentShortcut(recent);
	restoreScroll();
	persistScroll();
	setupTopButton();
	setupInputFocusMode();
	setupEdgeSwipeOpenMenu();
	setupBottomNavDoubleTap();
})();
