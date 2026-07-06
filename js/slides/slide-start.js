// Folie 1 — Typewriter-Loop auf dem Titel + YouTube-Hintergrundvideo.

(function () {
  'use strict';

  const TITLE_TEXT      = 'Mission Intelligence';
  const TYPE_SPEED_MS   = 80;
  const DELETE_SPEED_MS = 40;
  const PAUSE_FULL_MS   = 2200;  // pause at end before deleting
  const PAUSE_EMPTY_MS  = 500;   // pause at empty before retyping

  // ── Typewriter ────────────────────────────────────────────────────────

  function _startTypewriter(el) {
    let i        = 0;
    let deleting = false;

    function tick() {
      if (!deleting) {
        el.textContent = TITLE_TEXT.slice(0, ++i);
        if (i === TITLE_TEXT.length) { deleting = true; setTimeout(tick, PAUSE_FULL_MS); }
        else                          { setTimeout(tick, TYPE_SPEED_MS); }
      } else {
        el.textContent = TITLE_TEXT.slice(0, --i);
        if (i === 0) { deleting = false; setTimeout(tick, PAUSE_EMPTY_MS); }
        else         { setTimeout(tick, DELETE_SPEED_MS); }
      }
    }

    tick();
  }

  // ── Background video ─────────────────────────────────────────────────

  function _initBackgroundVideo() {
    const videoId = window.APP_CONFIG?.startVideoId;
    if (!videoId) return;
    APP_YOUTUBE.createBackgroundPlayer('yt-bg-player', videoId);
  }

  // ── Init ─────────────────────────────────────────────────────────────

  const titleEl = document.querySelector('.slide-start__title');
  if (titleEl) {
    titleEl.textContent = '';
    _startTypewriter(titleEl);
  }

  _initBackgroundVideo();

})();
