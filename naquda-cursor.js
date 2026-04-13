(function() {
  'use strict';

  // Only on desktop (mouse/trackpad)
  if (!window.matchMedia('(pointer:fine)').matches) return;

  function init() {
    var cursorEl = document.getElementById('cursor');
    if (!cursorEl) {
      if ((init._t = (init._t || 0) + 1) < 20) setTimeout(init, 50);
      return;
    }

    var dotEl      = document.getElementById('cursor-dot');
    var ringTextEl = document.getElementById('cursor-ring-text');
    var textPathEl = document.getElementById('cursor-textpath');
    var ringEl     = document.getElementById('cursor-ring');
    var wrapEl     = document.getElementById('cursor-text-wrap');

    // Show cursor, parked off-screen
    cursorEl.style.display = 'block';
    cursorEl.style.transform = 'translate3d(-200px,-200px,0)';

    var tx = -200, ty = -200;
    var cx = -200, cy = -200;
    var rafId = null;
    var currentText = '';
    var currentDark = false;
    var fadeTimer   = null;
    var lastRaf     = 0;

    // -- RAF LOOP: smooth lerp toward mouse
    function tick() {
      lastRaf = Date.now();
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cursorEl.style.transform = 'translate3d(' + (cx - 40) + 'px,' + (cy - 40) + 'px,0)';
      rafId = requestAnimationFrame(tick);
    }

    function startRaf() {
      if (rafId) cancelAnimationFrame(rafId);
      // Restart ring animation (Safari workaround)
      if (ringEl) {
        ringEl.style.animation = 'none';
        void ringEl.offsetWidth; // reflow
        ringEl.style.animation = '';
      }
      cx = tx; cy = ty; // snap to current position on restart
      rafId = requestAnimationFrame(tick);
    }

    // Watchdog: if RAF freezes, restart it
    setInterval(function() {
      if (Date.now() - lastRaf > 1000) startRaf();
    }, 500);

    // -- CURSOR TEXT
    function setStyle(text, dark) {
      if (text === currentText && dark === currentDark) return;
      currentText = text; currentDark = dark;
      clearTimeout(fadeTimer);
      if (wrapEl) wrapEl.classList.add('fading');
      fadeTimer = setTimeout(function() {
        if (textPathEl) textPathEl.textContent = text;
        if (ringTextEl) ringTextEl.setAttribute('fill',
          dark ? 'rgba(248,237,227,0.92)' : 'rgba(20,13,9,0.78)');
        if (wrapEl) wrapEl.classList.remove('fading');
      }, 130);
    }

    // -- MOUSE EVENTS
    var moved = false;
    document.addEventListener('mousemove', function(e) {
      tx = e.clientX; ty = e.clientY;

      if (!moved) {
        moved = true;
        cx = tx; cy = ty;
        startRaf();
      }

      // Restart RAF if frozen
      if (Date.now() - lastRaf > 300) startRaf();

      // Detect cursor zone
      var text = null, dark = false, foundDark = false;
      var el = e.target;
      while (el && el !== document.body) {
        if (el.dataset) {
          if (text === null && el.dataset.cursor) text = el.dataset.cursor;
          if (!foundDark && 'cursorDark' in el.dataset) {
            dark = el.dataset.cursorDark !== 'false';
            foundDark = true;
          }
        }
        if (text !== null && foundDark) break;
        el = el.parentElement;
      }
      setStyle(text !== null ? text : currentText, dark);
    }, { passive: true });

    // Dot scale on interactive elements
    document.querySelectorAll('a, button').forEach(function(el) {
      el.addEventListener('mouseenter', function() { if (dotEl) dotEl.setAttribute('r', '8'); });
      el.addEventListener('mouseleave', function() { if (dotEl) dotEl.setAttribute('r', '5'); });
    });

    // Restore after tab switch / bfcache
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) { cx = tx; cy = ty; startRaf(); }
    });
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) { cx = tx; cy = ty; startRaf(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
