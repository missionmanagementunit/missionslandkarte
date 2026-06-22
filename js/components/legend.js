// Sidebar legend for Folie 2: "Nach Mission" / "Nach Bundesland" toggle,
// clickable filter items, and the Missionsblume footer.

(function () {
  'use strict';

  const MISSION_ORDER = ['climate', 'cities', 'cancer', 'soil', 'water'];
  const MISSION_SVG   = { climate: 'Climate', cities: 'Cities', cancer: 'Cancer', soil: 'Soil', water: 'Waters' };
  const BUNDESLAENDER = [
    'Wien', 'Niederösterreich', 'Oberösterreich', 'Steiermark',
    'Tirol', 'Salzburg', 'Kärnten', 'Vorarlberg', 'Burgenland',
  ];

  let _containerId = null;
  let _projects    = [];
  let _onFilter    = null;
  let _view        = 'mission';   // 'mission' | 'bundesland'
  let _filter      = null;        // { type, value } | null

  function init(containerId, projects, onFilterChange) {
    _containerId = containerId;
    _projects    = projects;
    _onFilter    = onFilterChange;
    _render();
  }

  // ── Rendering ─────────────────────────────────────────────────────────

  function _counts() {
    const byMission = {}, byBL = {};
    _projects.forEach(p => {
      byMission[p.mission]  = (byMission[p.mission]  || 0) + 1;
      byBL[p.bundesland]    = (byBL[p.bundesland]    || 0) + 1;
    });
    return { byMission, byBL };
  }

  function _render() {
    const el = document.getElementById(_containerId);
    if (!el) return;

    const { byMission, byBL } = _counts();
    const cfgMissions = window.APP_CONFIG?.missions || {};

    // ── Toggle
    let html = `<div class="legend-toggle">
      <button class="legend-toggle-btn${_view === 'mission' ? ' active' : ''}" data-view="mission">Nach Mission</button>
      <button class="legend-toggle-btn${_view === 'bundesland' ? ' active' : ''}" data-view="bundesland">Nach Bundesland</button>
    </div>
    <div class="legend-list">`;

    if (_view === 'mission') {
      MISSION_ORDER.forEach(key => {
        const label  = cfgMissions[key]?.label || key;
        const count  = byMission[key] || 0;
        const active = _filter?.type === 'mission' && _filter.value === key;
        html += `<div class="legend-item${active ? ' active' : ''}"
                      data-filter-type="mission" data-filter-value="${key}"
                      role="button" tabindex="0">
          <img src="assets/logos/Mission_${MISSION_SVG[key]}.svg"
               class="legend-icon" width="24" height="24" draggable="false">
          <span class="legend-label">${label}</span>
          <span class="legend-count">${count}</span>
        </div>`;
      });
    } else {
      BUNDESLAENDER.forEach(bl => {
        const count  = byBL[bl] || 0;
        const active = _filter?.type === 'bundesland' && _filter.value === bl;
        html += `<div class="legend-item${active ? ' active' : ''}"
                      data-filter-type="bundesland" data-filter-value="${bl}"
                      role="button" tabindex="0">
          <span class="legend-dot"></span>
          <span class="legend-label">${bl}</span>
          <span class="legend-count">${count}</span>
        </div>`;
      });
    }

    html += `</div>
    <div class="legend-flower">
      <img src="assets/logos/5Missions_flower.svg" alt="Die 5 EU-Missionen" width="64" height="64">
      <span class="legend-flower-label">Die 5 EU-Missionen</span>
    </div>`;

    el.innerHTML = html;
    _bindEvents(el);
  }

  function _bindEvents(el) {
    el.querySelectorAll('.legend-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _view   = btn.dataset.view;
        _filter = null;
        _render();
        _onFilter?.(null);
      });
    });

    el.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const newFilter = { type: item.dataset.filterType, value: item.dataset.filterValue };
        // Second click on same item clears the filter
        if (_filter?.type === newFilter.type && _filter?.value === newFilter.value) {
          _filter = null;
          _onFilter?.(null);
        } else {
          _filter = newFilter;
          _onFilter?.(_filter);
        }
        _render();
      });
    });
  }

  window.APP_LEGEND = { init };

})();
