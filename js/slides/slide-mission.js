// Generic mission slide controller for Folien 3–7, parametrised by mission key.
// Each mission gets its own Leaflet map instance (via APP_MAP.create) showing only
// that mission's pins/points, and a sidebar listing its 3 pins sorted by video_pin_order.

(function () {
  'use strict';

  const SLIDE_FOR_MISSION = { climate: 3, cities: 4, cancer: 5, soil: 6, water: 7 };
  const MISSION_SVG       = { climate: 'Climate', cities: 'Cities', cancer: 'Cancer', soil: 'Soil', water: 'Waters' };

  const PIN_FLYTO_ZOOM     = 11;
  const PIN_FLYTO_DURATION = 1.0;   // seconds
  const TILE_OPEN_DELAY_MS = 900;   // wait after flyTo before opening the tile

  const _initialized = new Set();   // mission keys already set up
  const _mapCtrls     = {};          // mission key -> map controller

  function _initMissionSlide(missionKey) {
    if (_initialized.has(missionKey)) return;
    _initialized.add(missionKey);

    const sidebarId      = `sidebar-${missionKey}`;
    const mapContainerId = `map-${missionKey}`;
    const leafletId      = `leaflet-${missionKey}`;

    const mapContainer = document.getElementById(mapContainerId);
    mapContainer.innerHTML = '';
    const mapDiv = Object.assign(document.createElement('div'), {
      id: leafletId,
      style: 'width:100%;height:100%',
    });
    mapContainer.appendChild(mapDiv);

    const mapCtrl = APP_MAP.create(leafletId, {
      missionFilter: missionKey,
      onPinClick: pin => _openTile(pin, mapCtrl),
    });
    _mapCtrls[missionKey] = mapCtrl;

    // Leaflet needs a size recalculation after the slide's CSS transition ends.
    setTimeout(() => mapCtrl.invalidateSize(), 660);

    function _setup() {
      const projects = window.APP_DATA?.projects || [];
      const missionProjects = projects.filter(p => p.mission === missionKey);
      _renderSidebar(missionKey, sidebarId, missionProjects, mapCtrl);
      mapCtrl.renderMarkers(null);
    }

    if (window.APP_DATA) {
      _setup();
    } else {
      document.addEventListener('app:data-ready', _setup, { once: true });
    }
  }

  function _openTile(pin, mapCtrl) {
    APP_TILE.show(pin, { onClose: () => mapCtrl.flyToHome() });
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────

  function _renderSidebar(missionKey, sidebarId, missionProjects, mapCtrl) {
    const el = document.getElementById(sidebarId);
    if (!el) return;

    const cfg  = window.APP_CONFIG?.missions?.[missionKey] || { label: missionKey };
    const pins = missionProjects
      .filter(p => p.type === 'pin')
      .sort((a, b) => (a.video_pin_order ?? 0) - (b.video_pin_order ?? 0));

    let html = `
      <div class="mission-sidebar-header">
        <img src="assets/logos/Mission_${MISSION_SVG[missionKey]}.svg" class="mission-sidebar-icon" width="64" height="64">
        <span class="mission-sidebar-title">${cfg.label}</span>
      </div>
      <div class="mission-pin-list">
    `;

    pins.forEach(pin => {
      const isVideo = pin.video_type === 'youtube' && pin.video_id;
      const previewHtml = isVideo
        ? `<div class="mission-pin-preview mission-pin-preview--video">
             <img src="https://img.youtube.com/vi/${pin.video_id}/mqdefault.jpg" alt=""
                  onerror="this.parentElement.classList.add('mission-pin-preview--empty')">
             <span class="mission-pin-preview-playicon">&#9658;</span>
           </div>`
        : `<div class="mission-pin-preview">
             <img src="${pin.thumbnail_path || ''}" alt=""
                  onerror="this.parentElement.classList.add('mission-pin-preview--empty')">
           </div>`;

      html += `
        <div class="mission-pin-item" data-pin-id="${pin.id}" role="button" tabindex="0">
          ${previewHtml}
          <span class="mission-pin-name">${pin.name}</span>
        </div>
      `;
    });

    html += `</div>
      <div class="legend-flower">
        <img src="assets/logos/5Missions_flower.svg" alt="Die 5 EU-Missionen" width="64" height="64">
        <span class="legend-flower-label">Die 5 EU-Missionen</span>
      </div>
    `;

    el.innerHTML = html;

    el.querySelectorAll('.mission-pin-item').forEach(item => {
      item.addEventListener('click', () => {
        const pin = pins.find(p => String(p.id) === item.dataset.pinId);
        if (!pin) return;
        mapCtrl.flyTo(pin.lat, pin.lng, PIN_FLYTO_ZOOM, PIN_FLYTO_DURATION);
        setTimeout(() => _openTile(pin, mapCtrl), TILE_OPEN_DELAY_MS);
      });
    });
  }

  // ── Slide router hook ─────────────────────────────────────────────────────

  document.addEventListener('app:slide-changed', e => {
    const missionKey = Object.keys(SLIDE_FOR_MISSION).find(k => SLIDE_FOR_MISSION[k] === e.detail.to);
    if (missionKey) _initMissionSlide(missionKey);
  });

})();
