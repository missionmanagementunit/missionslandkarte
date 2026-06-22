// Tile modal (photo version) for Missionspins.
// Video version with YouTube IFrame API is Phase 4.

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

  function show(project) {
    _overlay.innerHTML = _buildCard(project);
    _overlay.classList.add('visible');

    _overlay.querySelector('.tile-close')
      .addEventListener('click', hide);
  }

  function hide() {
    _overlay.classList.remove('visible');
  }

  // Close on backdrop click
  _overlay.addEventListener('click', e => { if (e.target === _overlay) hide(); });

  // ── Card HTML ─────────────────────────────────────────────────────────

  function _buildCard(p) {
    const missionLabel = MISSION_LABELS[p.mission] || p.mission;
    const missionSvg   = `assets/logos/Mission_${MISSION_SVG[p.mission] || 'Climate'}.svg`;

    const thumbnailHtml = p.thumbnail_path
      ? `<img class="tile-thumbnail" src="${p.thumbnail_path}" alt="${_esc(p.name)}"
              onerror="this.classList.add('tile-thumbnail--placeholder')">`
      : `<div class="tile-thumbnail tile-thumbnail--placeholder"></div>`;

    const keywordsHtml = p.keywords?.length
      ? `<div class="tile-keywords">${p.keywords.map(k => `<span class="tile-kw">${_esc(k)}</span>`).join('')}</div>`
      : '';

    const fundingHtml = p.foerderung_eur
      ? `<div class="tile-funding">€ ${(p.foerderung_eur / 1_000_000)
          .toLocaleString('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio. Förderung</div>`
      : '';

    const linkHtml = p.link
      ? `<a class="tile-link" href="${_esc(p.link)}" target="_blank" rel="noopener noreferrer">↗ Projektseite</a>`
      : '';

    return `
      <div class="tile-card">
        <button class="tile-close" aria-label="Schließen">&#x2715;</button>
        ${thumbnailHtml}
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

  window.APP_TILE = { show, hide };

})();
