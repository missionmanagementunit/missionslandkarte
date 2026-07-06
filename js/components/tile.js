// Tile modal for Missionspins — photo version (Phase 2) and video version (Phase 3).
// Video tiles embed a YouTube IFrame player behind a play-button overlay; clicking
// it triggers fullscreen synchronously via APP_YOUTUBE (see js/youtube.js).

(function () {
  'use strict';

  const MISSION_LABELS = {
    climate: 'Klimawandel meistern',
    cities:  'Klimaneutrale Stadt',
    cancer:  'Krebs besiegen',
    soil:    'Gesunde Böden',
    water:   'Wasser und Gewässer schützen',
  };
  const MISSION_SVG = {
    climate: 'Climate', cities: 'Cities', cancer: 'Cancer', soil: 'Soil', water: 'Waters',
  };

  const _overlay = document.getElementById('tile-overlay');
  let _activeProject = null;
  let _onCloseCallback = null;

  /** Shows the tile for a project. options.onClose fires once, when the tile is hidden. */
  function show(project, options) {
    // Clean up any previously open video player before replacing the tile.
    if (_activeProject && _isVideo(_activeProject)) {
      APP_YOUTUBE.stopVideo(_playerElementId(_activeProject));
      APP_YOUTUBE.destroyPlayer(_playerElementId(_activeProject));
    }

    options = options || {};
    _activeProject    = project;
    _onCloseCallback  = options.onClose || null;

    _overlay.innerHTML = _buildCard(project);
    _overlay.classList.add('visible');
    _overlay.querySelector('.tile-close').addEventListener('click', hide);

    if (_isVideo(project)) {
      const elementId = _playerElementId(project);
      APP_YOUTUBE.preparePlayer(elementId, project.video_id);
      _overlay.querySelector('.tile-play-overlay')
        ?.addEventListener('click', () => APP_YOUTUBE.openVideoFullscreen(elementId));
    }
  }

  function hide() {
    if (_isVideo(_activeProject)) {
      const elementId = _playerElementId(_activeProject);
      APP_YOUTUBE.stopVideo(elementId);
      APP_YOUTUBE.destroyPlayer(elementId);
    }

    _overlay.classList.remove('visible');

    const cb = _onCloseCallback;
    _activeProject   = null;
    _onCloseCallback = null;
    if (cb) cb();
  }

  // Closes the tile without firing onClose — used by keyboard navigation so
  // flyToHome is not triggered when immediately navigating to the next pin.
  function hideQuiet() {
    if (_isVideo(_activeProject)) {
      const elementId = _playerElementId(_activeProject);
      APP_YOUTUBE.stopVideo(elementId);
      APP_YOUTUBE.destroyPlayer(elementId);
    }
    _overlay.classList.remove('visible');
    _activeProject   = null;
    _onCloseCallback = null;
  }

  // Close on backdrop click
  _overlay.addEventListener('click', e => { if (e.target === _overlay) hide(); });

  function _isVideo(p) {
    return !!(p && p.video_type === 'youtube' && p.video_id);
  }

  function _playerElementId(p) {
    return `yt-player-${p.id}`;
  }

  // ── Card HTML ─────────────────────────────────────────────────────────

  function _buildCard(p) {
    const missionLabel = MISSION_LABELS[p.mission] || p.mission;
    const missionSvg   = `assets/logos/Mission_${MISSION_SVG[p.mission] || 'Climate'}.svg`;

    const mediaHtml = _isVideo(p)
      ? `<div class="tile-thumbnail-wrap">
           <div id="${_playerElementId(p)}" class="tile-yt-player"></div>
           <button class="tile-play-overlay" aria-label="Video abspielen">
             <img src="https://img.youtube.com/vi/${p.video_id}/hqdefault.jpg" alt="${_esc(p.name)}">
             <span class="tile-play-icon">&#9658;</span>
           </button>
         </div>`
      : (p.thumbnail_path
          ? `<img class="tile-thumbnail" src="${p.thumbnail_path}" alt="${_esc(p.name)}"
                  onerror="this.classList.add('tile-thumbnail--placeholder')">`
          : `<div class="tile-thumbnail tile-thumbnail--placeholder"></div>`);

    const keywordsHtml = p.keywords?.length
      ? `<div class="tile-keywords">${p.keywords.map(k => `<span class="tile-kw">${_esc(k)}</span>`).join('')}</div>`
      : '';

    const fundingHtml = p.foerderung_eur
      ? `<div class="tile-funding">€ ${(p.foerderung_eur / 1_000_000)
          .toLocaleString('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio. Förderung</div>`
      : '';

    const linkHtml = p.link
      ? `<a class="tile-link" href="${_esc(p.link)}" target="_blank" rel="noopener noreferrer">↗ Projektseite</a>`
      : '';

    return `
      <div class="tile-card">
        <button class="tile-close" aria-label="Schließen">&#x2715;</button>
        ${mediaHtml}
        <div class="tile-body">
          <div class="tile-mission-row">
            <img src="${missionSvg}" class="tile-mission-icon" width="28" height="28" draggable="false">
            <span class="tile-mission-label">${_esc(missionLabel)}</span>
          </div>
          <h2 class="tile-name">${_esc(p.name)}</h2>
          <div class="tile-org">${_esc(p.organisation)}</div>
          <div class="tile-location">📍 ${_esc(p.city)}, ${_esc(p.bundesland)}</div>
          ${keywordsHtml}
          ${fundingHtml}
          ${linkHtml}
        </div>
      </div>
    `;
  }

  function _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.APP_TILE = { show, hide, hideQuiet };

})();
