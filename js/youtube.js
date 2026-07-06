// YouTube IFrame API wrapper. Initialises the API once on page load and exposes
// preparePlayer/openVideoFullscreen/stopVideo/destroyPlayer for tile.js's video tiles.
//
// requestFullscreen() must run synchronously inside the original click handler —
// preparePlayer() is called as soon as a video tile opens (well before any click),
// so by the time the user clicks the play overlay, player.getIframe() already
// returns a live DOM element and openVideoFullscreen() can act on it immediately.

(function () {
  'use strict';

  const _players = {};   // elementId -> { player, ready, pendingPlay, pendingFullscreen }
  let _apiReady = false;
  const _apiReadyCallbacks = [];

  window.onYouTubeIframeAPIReady = function () {
    _apiReady = true;
    _apiReadyCallbacks.forEach(fn => fn());
    _apiReadyCallbacks.length = 0;
  };

  function _whenApiReady(fn) {
    if (_apiReady) fn();
    else _apiReadyCallbacks.push(fn);
  }

  /** Creates a YT.Player bound to elementId (a div already in the DOM), cued to videoId. */
  function preparePlayer(elementId, videoId) {
    const entry = { player: null, ready: false, pendingPlay: false, pendingFullscreen: false };
    _players[elementId] = entry;

    _whenApiReady(() => {
      const el = document.getElementById(elementId);
      if (!el) return; // tile was closed again before the API finished loading

      entry.player = new YT.Player(elementId, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1 },
        events: {
          onReady: p => {
            entry.ready = true;
            p.target.unloadModule('captions');
            if (entry.pendingFullscreen) { openVideoFullscreen(elementId); entry.pendingFullscreen = false; }
            else if (entry.pendingPlay) { entry.player.playVideo(); entry.pendingPlay = false; }
          },
          onStateChange: e => {
            if (e.data === YT.PlayerState.ENDED) _exitFullscreen();
          },
        },
      });
    });
  }

  /** Synchronous entry point for the play-button click handler: fullscreen + play. */
  function openVideoFullscreen(elementId) {
    const entry = _players[elementId];
    if (!entry) return;

    if (!entry.player) {
      // API/player not ready yet — defer; note this can only request fullscreen
      // later if the browser still treats it as gesture-triggered.
      entry.pendingFullscreen = true;
      return;
    }

    const iframe = entry.player.getIframe();
    const requestFs = iframe.requestFullscreen || iframe.webkitRequestFullscreen;
    if (requestFs) requestFs.call(iframe);

    if (entry.ready) entry.player.playVideo();
    else entry.pendingPlay = true;
  }

  function stopVideo(elementId) {
    const entry = _players[elementId];
    if (entry?.ready) entry.player.stopVideo();
  }

  function destroyPlayer(elementId) {
    const entry = _players[elementId];
    if (entry?.player?.destroy) entry.player.destroy();
    delete _players[elementId];
  }

  function _exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if ((document.fullscreenElement || document.webkitFullscreenElement) && exit) {
      exit.call(document);
    }
  }

  /** Creates a muted, autoplaying, looping background player — for Folie 1. */
  function createBackgroundPlayer(elementId, videoId) {
    _whenApiReady(() => {
      const el = document.getElementById(elementId);
      if (!el) return;
      new YT.Player(elementId, {
        videoId,
        playerVars: {
          autoplay:       1,
          mute:           1,
          loop:           1,
          playlist:       videoId, // required for loop to work
          controls:       0,
          rel:            0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline:    1,
          disablekb:      1,
          cc_load_policy: 0,       // disable closed captions
        },
        events: {
          onReady: e => {
            e.target.playVideo();
            e.target.unloadModule('captions');  // disable subtitles/captions
          },
        },
      });
    });
  }

  window.APP_YOUTUBE = { preparePlayer, openVideoFullscreen, stopVideo, destroyPlayer, createBackgroundPlayer };

})();
