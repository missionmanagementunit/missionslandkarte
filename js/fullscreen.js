// Fullscreen toggle for the presentation.
// Triggered by the header button or the F key (wired in keyboard.js).

(function () {
  'use strict';

  const _btn = document.getElementById('fullscreen-btn');

  function _isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggle() {
    if (_isFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    } else {
      const el = document.documentElement;
      const enter = el.requestFullscreen || el.webkitRequestFullscreen;
      if (enter) enter.call(el);
    }
  }

  function _updateButton() {
    if (!_btn) return;
    _btn.setAttribute('data-fullscreen', _isFullscreen() ? 'true' : 'false');
    _btn.title = _isFullscreen() ? 'Vollbild beenden (F)' : 'Vollbild (F)';
  }

  document.addEventListener('fullscreenchange',       _updateButton);
  document.addEventListener('webkitfullscreenchange', _updateButton);

  if (_btn) _btn.addEventListener('click', toggle);

  window.APP_FULLSCREEN = { toggle };

})();
