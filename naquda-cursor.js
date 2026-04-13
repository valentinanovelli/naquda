(function() {
  'use strict';

  var watchdogId = null;

  function init() {
    if (!window.matchMedia('(pointer:fine)').matches) return;

    var cursorEl = document.getElementById('cursor');

    /* Se #cursor non è ancora nel DOM → riprova ogni 50ms fino a 1 secondo */
    if (!cursorEl) {
      init._tries = (init._tries || 0) + 1;
      if (init._tries < 20) setTimeout(init, 50);
      return;
    }
    init._tries = 0;

    cursorEl.style.display = 'block';
    cursorEl.style.transform = 'translate(-200px,-200px)';

    var textPathEl = document.getElementById('cursor-textpath');
    var ringEl     = document.getElementById('cursor-ring');
    var ringTextEl = document.getElementById('cursor-ring-text');
    var dotEl      = document.getElementById('cursor-dot');

    var cx = -200, cy = -200, tx = -200, ty = -200;
    var firstMove = true;
    var cursorHidden = false;
    var currentText = '';
    var currentDark = false;
    var fadeTimer = null;
    var rafId = null;
    var lastTick = Date.now();

    function tickCursor() {
      lastTick = Date.now();
      if (firstMove && tx < 0) { rafId = requestAnimationFrame(tickCursor); return; }
      if (firstMove) { cx = tx; cy = ty; firstMove = false; }
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cursorEl.style.transform = 'translate3d(' + (cx - 40) + 'px,' + (cy - 40) + 'px,0)';
      rafId = requestAnimationFrame(tickCursor);
    }

    function restartRingAnimation() {
      if (!ringEl) return;
      ringEl.style.animation = 'none';
      void ringEl.offsetHeight;
      ringEl.style.animation = 'cursor-spin 6s linear infinite';
    }

    function resetAndRestart() {
      firstMove = true;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      restartRingAnimation();
      lastTick = Date.now();
      tickCursor();
    }

    /* ── WATCHDOG ────────────────────────────────────────────────────────────
       Ogni 500ms: se RAF è congelato da >1s, riavvia automaticamente */
    if (watchdogId !== null) clearInterval(watchdogId);
    watchdogId = setInterval(function() {
      if (Date.now() - lastTick > 1000) resetAndRestart();
    }, 500);

    function setCursorText(text, dark) {
      if (text === currentText && dark === currentDark) return;
      currentText = text;
      currentDark = dark;
      clearTimeout(fadeTimer);
      var wrap = document.getElementById('cursor-text-wrap');
      if (wrap) wrap.classList.add('fading');
      fadeTimer = setTimeout(function() {
        if (textPathEl) textPathEl.textContent = text;
        if (ringTextEl) ringTextEl.setAttribute('fill', dark ? 'rgba(248,237,227,0.85)' : 'rgba(20,13,9,0.70)');
        if (wrap) wrap.classList.remove('fading');
      }, 130);
    }

    /* Applica cursor:none solo al primo mousemove — in questo modo
       il cursore nativo è visibile durante il caricamento e la transizione
       al cursore custom avviene senza gap. */
    function activateCursorHide() {
      if (cursorHidden) return;
      cursorHidden = true;
      document.body.style.cursor = 'none';
      document.querySelectorAll('a, button, [role="button"]').forEach(function(el) {
        el.style.cursor = 'none';
      });
    }

    document.addEventListener('mousemove', function(e) {
      tx = e.clientX; ty = e.clientY;

      /* Nasconde il cursore nativo al primo movimento — nessun gap visivo */
      activateCursorHide();

      /* Heartbeat: se il loop è congelato da >200ms, riavvia subito */
      if (Date.now() - lastTick > 200) resetAndRestart();

      var text = null, dark = false, foundDark = false;
      var el = document.elementFromPoint(tx, ty);
      while (el && el !== document.body) {
        if (el.dataset) {
          if (text === null && el.dataset.cursor) text = el.dataset.cursor;
          if (!foundDark && 'cursorDark' in el.dataset) {
            dark = el.dataset.cursorDark !== 'false' && el.dataset.cursorDark !== '';
            foundDark = true;
          }
        }
        if (text !== null && foundDark) break;
        el = el.parentElement;
      }
      setCursorText(text !== null ? text : currentText, dark);
    });

    /* pageshow: bfcache restore */
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) resetAndRestart();
    });

    /* visibilitychange: ripristina dopo freeze da tab in background */
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) resetAndRestart();
    });

    tickCursor();

    document.querySelectorAll('a, button, [role="button"]').forEach(function(el) {
      el.addEventListener('mouseenter', function() { if (dotEl) dotEl.style.transform = 'scale(3)'; });
      el.addEventListener('mouseleave', function() { if (dotEl) dotEl.style.transform = 'scale(1)'; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
