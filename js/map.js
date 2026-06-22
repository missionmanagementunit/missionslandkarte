// Leaflet map for Mission Intelligence — Folie 2 (Gesamtübersicht).
// Fly-in: markers land at their target position immediately (opacity 0, scale 0).
// After CartoDB tiles have loaded AND ≥800ms since first open, they fade + spring in.

(function () {
  'use strict';

  const GEOJSON_URL = 'https://raw.githubusercontent.com/ginseng666/GeoJSON-TopoJSON-Austria/master/2017/simplified-99.5/laender_995_geo.json';

  const MISSION_SVG = {
    climate: 'Climate',
    cities:  'Cities',
    cancer:  'Cancer',
    soil:    'Soil',
    water:   'Waters',
  };

  const MISSION_COLORS = {
    climate: '#d34a56',
    cities:  '#76a772',
    cancer:  '#d39c45',
    soil:    '#7d5e9c',
    water:   '#6a8cb7',
  };

  const PIN_SIZE          = 36;
  const SPIDER_THRESHOLD  = 0.018;   // ~2 km
  const SPIDER_RADIUS     = 0.018;
  const POINT_THRESHOLD   = 0.009;   // ~1 km
  const FLY_IN_MIN_MS     = 800;     // minimum wait after slide opens
  const FLY_IN_STAGGER_MS = 50;
  const TILES_TIMEOUT_MS  = 4000;    // fallback if tiles never fire 'load'

  let _map          = null;
  let _tileLayer    = null;
  let _pinLayer     = null;
  let _pointLayer   = null;
  let _spiderLayer  = null;

  let _hasFlownIn     = false;   // true after first animation runs
  let _tilesReady     = false;   // true after tileLayer fires 'load'
  let _tilesCallbacks = [];      // queued callbacks waiting for tiles
  let _openTimeMs     = null;    // timestamp of first renderMarkers call

  // ── Map initialisation ────────────────────────────────────────────────

  function initMap(containerId) {
    if (_map) { _map.invalidateSize(); return _map; }

    _map = L.map(containerId, {
      center: [47.6, 13.5],
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
    });

    _tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(_map);

    // Mark tiles ready on first full load; fallback after TILES_TIMEOUT_MS.
    _tileLayer.once('load', _markTilesReady);
    setTimeout(_markTilesReady, TILES_TIMEOUT_MS);

    _pinLayer    = L.layerGroup().addTo(_map);
    _pointLayer  = L.layerGroup().addTo(_map);
    _spiderLayer = L.layerGroup().addTo(_map);

    fetch(GEOJSON_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        _addBundeslandBorders(data);
        _addAustriaMask(data);
      })
      .catch(err => console.error('[map.js] GeoJSON Fehler:', err));

    return _map;
  }

  function invalidateSize() {
    if (_map) _map.invalidateSize();
  }

  function _markTilesReady() {
    if (_tilesReady) return;
    _tilesReady = true;
    _tilesCallbacks.forEach(fn => fn());
    _tilesCallbacks = [];
  }

  function _whenTilesReady(fn) {
    if (_tilesReady) { fn(); return; }
    _tilesCallbacks.push(fn);
  }

  // ── Base layers ───────────────────────────────────────────────────────

  function _addBundeslandBorders(data) {
    L.geoJSON(data, {
      style: { fill: false, color: 'rgba(184,163,159,0.55)', weight: 1, dashArray: '5 4' },
      interactive: false,
    }).addTo(_map);
  }

  function _addAustriaMask(data) {
    const world = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
    const holes = [];
    data.features.forEach(f => {
      const g = f.geometry;
      if (g.type === 'Polygon') {
        holes.push(g.coordinates[0].map(([lng, lat]) => [lat, lng]));
      } else if (g.type === 'MultiPolygon') {
        g.coordinates.forEach(poly => holes.push(poly[0].map(([lng, lat]) => [lat, lng])));
      }
    });
    L.polygon([world, ...holes], {
      color: 'rgba(200,184,176,0.75)',
      weight: 1.5,
      fillColor: '#1a1410',
      fillOpacity: 0.62,
      interactive: false,
    }).addTo(_map);
  }

  // ── Icons ─────────────────────────────────────────────────────────────

  function _createPinIcon(mission, hidden) {
    const src       = `assets/logos/Mission_${MISSION_SVG[mission] || 'Climate'}.svg`;
    const innerCls  = hidden ? 'pin-inner anim-hidden' : 'pin-inner';
    return L.divIcon({
      html: `<div class="${innerCls}"><img src="${src}" width="${PIN_SIZE}" height="${PIN_SIZE}" draggable="false"></div>`,
      className: 'mission-pin-icon',
      iconSize:   [PIN_SIZE, PIN_SIZE],
      iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
    });
  }

  function _createPointIcon(missionCounts, hidden) {
    const sz = 24, r = 12;
    const entries = Object.entries(missionCounts);
    const total   = entries.reduce((s, [, v]) => s + v, 0);
    const innerCls = hidden ? 'point-inner anim-hidden' : 'point-inner';

    let innerHtml;
    if (entries.length === 1) {
      const fill = MISSION_COLORS[entries[0][0]] || '#888';
      innerHtml = `<svg width="${sz}" height="${sz}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r}" fill="${fill}"/></svg>`;
    } else {
      let cum = 0, paths = '';
      entries.forEach(([mission, count]) => {
        const a0 = (cum / total) * 2 * Math.PI - Math.PI / 2;
        const a1 = ((cum + count) / total) * 2 * Math.PI - Math.PI / 2;
        const x1 = r + r * Math.cos(a0), y1 = r + r * Math.sin(a0);
        const x2 = r + r * Math.cos(a1), y2 = r + r * Math.sin(a1);
        paths += `<path d="M${r},${r}L${x1.toFixed(2)},${y1.toFixed(2)}A${r},${r},0,${count/total>0.5?1:0},1,${x2.toFixed(2)},${y2.toFixed(2)}Z" fill="${MISSION_COLORS[mission]||'#888'}"/>`;
        cum += count;
      });
      innerHtml = `<svg width="${sz}" height="${sz}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
    }

    return L.divIcon({
      html: `<div class="${innerCls}">${innerHtml}</div>`,
      className: 'mission-point-icon',
      iconSize: [sz, sz], iconAnchor: [r, r],
    });
  }

  // ── Spider fan ────────────────────────────────────────────────────────

  function _applySpider(pins) {
    const assigned = new Set();
    pins.forEach((pin, i) => {
      if (assigned.has(i)) return;
      const group = [i];
      assigned.add(i);
      pins.forEach((other, j) => {
        if (j === i || assigned.has(j)) return;
        if (Math.hypot(pin.lat - other.lat, pin.lng - other.lng) < SPIDER_THRESHOLD) {
          group.push(j); assigned.add(j);
        }
      });
      if (group.length < 2) return;
      const cLat = group.reduce((s, k) => s + pins[k].lat, 0) / group.length;
      const cLng = group.reduce((s, k) => s + pins[k].lng, 0) / group.length;
      group.forEach((k, n) => {
        const a = (2 * Math.PI * n / group.length) - Math.PI / 2;
        pins[k]._dLat   = cLat + SPIDER_RADIUS * Math.cos(a);
        pins[k]._dLng   = cLng + SPIDER_RADIUS * Math.sin(a);
        pins[k]._center = [cLat, cLng];
      });
    });
  }

  // ── Point clustering ──────────────────────────────────────────────────

  function _clusterPoints(points) {
    const clusters = [], assigned = new Set();
    points.forEach((p, i) => {
      if (assigned.has(i)) return;
      const c = { lat: p.lat, lng: p.lng, missions: { [p.mission]: 1 } };
      assigned.add(i);
      points.forEach((q, j) => {
        if (j === i || assigned.has(j)) return;
        if (Math.hypot(p.lat - q.lat, p.lng - q.lng) < POINT_THRESHOLD) {
          c.missions[q.mission] = (c.missions[q.mission] || 0) + 1;
          assigned.add(j);
        }
      });
      clusters.push(c);
    });
    return clusters;
  }

  // ── Render ────────────────────────────────────────────────────────────

  function renderMarkers(filter) {
    const willAnimate = !_hasFlownIn;

    _activeFilter = filter || null;
    if (!_map || !window.APP_DATA) return;

    _pinLayer.clearLayers();
    _pointLayer.clearLayers();
    _spiderLayer.clearLayers();

    let pins   = window.APP_DATA.projects.filter(p => p.type === 'pin');
    let points = window.APP_DATA.projects.filter(p => p.type === 'point');

    if (filter) {
      const match = filter.type === 'mission'
        ? p => p.mission    === filter.value
        : p => p.bundesland === filter.value;
      pins   = pins.filter(match);
      points = points.filter(match);
    }

    _applySpider(pins);
    const clusters = _clusterPoints(points);

    pins.forEach(pin => {
      const tLat = pin._dLat ?? pin.lat;
      const tLng = pin._dLng ?? pin.lng;
      const marker = L.marker([tLat, tLng], {
        icon: _createPinIcon(pin.mission, willAnimate),
        title: pin.name,
        riseOnHover: true,
      });
      marker.on('click', () =>
        document.dispatchEvent(new CustomEvent('map:pin-click', { detail: { project: pin } }))
      );
      _pinLayer.addLayer(marker);
      if (pin._center) {
        _spiderLayer.addLayer(L.polyline(
          [pin._center, [tLat, tLng]],
          { color: 'rgba(184,163,159,0.4)', weight: 1, interactive: false }
        ));
      }
    });

    clusters.forEach(c => {
      _pointLayer.addLayer(L.marker([c.lat, c.lng], {
        icon: _createPointIcon(c.missions, willAnimate),
        interactive: false,
        keyboard: false,
      }));
    });

    // ── Fly-in (first render only) ──────────────────────────────────────
    if (willAnimate) {
      _hasFlownIn  = true;
      _openTimeMs  = Date.now();

      // Wait one frame for Leaflet to insert marker elements into the DOM,
      // then queue the animation behind the tile-load gate + minimum delay.
      requestAnimationFrame(() => {
        const pane    = _map.getPane('markerPane');
        const hidden  = Array.from(pane.querySelectorAll('.anim-hidden'));

        _whenTilesReady(() => {
          const elapsed  = Date.now() - _openTimeMs;
          const waitMore = Math.max(0, FLY_IN_MIN_MS - elapsed);

          setTimeout(() => _startFlyIn(hidden), waitMore);
        });
      });
    }
  }

  function _startFlyIn(elements) {
    elements.forEach((el, i) => {
      setTimeout(() => {
        // One extra rAF ensures the browser painted the anim-hidden (opacity:0)
        // state at least once before we remove the class and trigger the transition.
        requestAnimationFrame(() => {
          el.classList.remove('anim-hidden');
        });
      }, FLY_IN_STAGGER_MS * i);
    });
  }

  // ── Public API ────────────────────────────────────────────────────────

  let _activeFilter = null;

  function setFilter(filter) {
    _hasFlownIn = true;   // skip animation on filter changes
    renderMarkers(filter);
  }

  function clearFilter() {
    setFilter(null);
  }

  window.APP_MAP = { initMap, invalidateSize, renderMarkers, setFilter, clearFilter };

})();
