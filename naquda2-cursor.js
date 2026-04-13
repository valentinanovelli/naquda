(function() {
  'use strict';

  // any-pointer:fine catches Chrome configs where primary device isn't fine
  if (!window.matchMedia('(any-pointer:fine)').matches) return;

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

    cursorEl.style.display = 'block';
    cursorEl.style.transform = 'translate3d(-200px,-200px,0)';

    // Default: dark text for light backgrounds
    // Sections with data-cursor-dark="true" get light text
    var FILL_DARK  = 'rgba(20,13,9,0.80)';
    var FILL_LIGHT = 'rgba(248,237,227,0.92)';
    if (ringTextEl) ringTextEl.setAttribute('fill', FILL_DARK);

    var tx = -200, ty = -200;
    var cx = -200, cy = -200;
    var rafId = null;
    var currentText = '';
    var currentDark = false;
    var fadeTimer = null;
    var lastRaf = 0;
    var moved = false;

    function tick() {
      lastRaf = Date.now();
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cursorEl.style.transform = 'translate3d(' + (cx - 40) + 'px,' + (cy - 40) + 'px,0)';
      rafId = requestAnimationFrame(tick);
    }

    function startRaf() {
      if (rafId) cancelAnimationFrame(rafId);
      if (ringEl) {
        ringEl.style.animation = 'none';
        void ringEl.offsetWidth;
        ringEl.style.animation = '';
      }
      rafId = requestAnimationFrame(tick);
    }

    // Watchdog: restart RAF if frozen
    setInterval(function() {
      if (Date.now() - lastRaf > 1000 && moved) startRaf();
    }, 500);

    function setCursorText(text) {
      if (text === currentText) return;
      currentText = text;
      clearTimeout(fadeTimer);
      if (wrapEl) wrapEl.classList.add('fading');
      fadeTimer = setTimeout(function() {
        if (textPathEl) textPathEl.textContent = text;
        if (wrapEl) wrapEl.classList.remove('fading');
      }, 130);
    }

    function setCursorColor(dark) {
      if (dark === currentDark) return;
      currentDark = dark;
      if (ringTextEl) ringTextEl.setAttribute('fill', dark ? FILL_LIGHT : FILL_DARK);
    }

    document.addEventListener('mousemove', function(e) {
      tx = e.clientX; ty = e.clientY;
      if (!moved) { moved = true; cx = tx; cy = ty; startRaf(); }
      if (Date.now() - lastRaf > 300) startRaf();

      var text = null;
      var isDark = false;
      var el = e.target;
      while (el && el !== document.body) {
        if (el.dataset) {
          if (text === null && el.dataset.cursor) { text = el.dataset.cursor; }
          if (el.dataset.cursorDark === 'true') { isDark = true; }
        }
        el = el.parentElement;
      }
      setCursorText(text !== null ? text : currentText);
      setCursorColor(isDark);
    }, { passive: true });

    // Cursor re-appears immediately on click (when window regains focus)
    document.addEventListener('mousedown', function(e) {
      tx = e.clientX; ty = e.clientY;
      cx = tx; cy = ty;
      if (!moved) { moved = true; startRaf(); }
      else if (Date.now() - lastRaf > 200) startRaf();
    });

    // Re-entry into the page from outside browser window
    document.documentElement.addEventListener('mouseenter', function(e) {
      if (e.clientX !== undefined) {
        tx = e.clientX; ty = e.clientY;
        cx = tx; cy = ty;
        if (!moved) { moved = true; }
        startRaf();
      }
    });

    document.querySelectorAll('a, button').forEach(function(el) {
      el.addEventListener('mouseenter', function() { if (dotEl) dotEl.setAttribute('r', '8'); });
      el.addEventListener('mouseleave', function() { if (dotEl) dotEl.setAttribute('r', '5'); });
    });

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && moved) { startRaf(); }
    });
    window.addEventListener('pageshow', function(e) {
      if (e.persisted && moved) { cx = tx; cy = ty; startRaf(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
