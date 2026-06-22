// Orchestrates Folie 2 (Gesamtübersicht): initialises the Leaflet map, sidebar
// legend, stats panel, and tile modal listener on first visit.

(function () {
  'use strict';

  let _initialized = false;

  function _init() {
    // ── Map container
    const mapContainer = document.getElementById('map-overview');
    mapContainer.innerHTML = '';
    const mapDiv = Object.assign(document.createElement('div'), {
      id: 'leaflet-overview',
      style: 'width:100%;height:100%',
    });
    mapContainer.appendChild(mapDiv);

    APP_MAP.initMap('leaflet-overview');

    // Leaflet needs a size recalculation after the slide's CSS transition ends.
    setTimeout(() => APP_MAP.invalidateSize(), 660);

    // ── Data-dependent setup
    function _setup() {
      const projects = window.APP_DATA?.projects || [];
      APP_LEGEND.init('sidebar-overview', projects, filter => APP_MAP.setFilter(filter));
      APP_MAP.renderMarkers(null);
      APP_STATS.init('stats-overview', projects);
    }

    if (window.APP_DATA) {
      _setup();
    } else {
      document.addEventListener('app:data-ready', _setup, { once: true });
    }

    // ── Tile modal
    document.addEventListener('map:pin-click', e => APP_TILE.show(e.detail.project));
  }

  // Trigger on first navigation to slide 2
  document.addEventListener('app:slide-changed', e => {
    if (e.detail.to === 2 && !_initialized) {
      _initialized = true;
      _init();
    }
  });

})();
