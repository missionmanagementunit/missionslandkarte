// Leaflet map factory for Mission Intelligence.
// APP_MAP.create(containerId, options) returns an independent map controller —
// used once for the overview (Folie 2) and once per mission slide (Folien 3–7).
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

  const DEFAULT_CENTER     = [47.6, 13.5];
  const DEFAULT_ZOOM       = 7;
  const PIN_SIZE           = 36;
  const PIN_Z_INDEX_OFFSET = 1000;   // keeps pins above points regardless of screen position
  const SPIDER_THRESHOLD   = 0.018;   // ~2 km
  const SPIDER_RADIUS      = 0.018;
  const POINT_THRESHOLD    = 0.009;   // ~1 km
  const FLY_IN_MIN_MS      = 800;     // minimum wait after slide opens
  const FLY_IN_STAGGER_MS  = 50;
  const TILES_TIMEOUT_MS   = 4000;    // fallback if tiles never fire 'load'

  // GeoJSON is fetched once and shared across every map instance.
  let _geojsonPromise = null;
  function _loadGeoJSON() {
    if (!_geojsonPromise) {
      _geojsonPromise = fetch(GEOJSON_URL)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .catch(err => {
          console.error('[map.js] GeoJSON Fehler:', err);
          return null;
        });
    }
    return _geojsonPromise;
  }

  // ── Base layers ───────────────────────────────────────────────────────

  function _addBundeslandBorders(map, data) {
    L.geoJSON(data, {
      style: { fill: false, color: 'rgba(184,163,159,0.55)', weight: 1, dashArray: '5 4' },
      interactive: false,
    }).addTo(map);
  }

  function _addAustriaMask(map, data) {
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
    }).addTo(map);
  }

  // ── Icons ─────────────────────────────────────────────────────────────

  function _createPinIcon(mission, hidden) {
    const src      = `assets/logos/Mission_${MISSION_SVG[mission] || 'Climate'}.svg`;
    const innerCls = hidden ? 'pin-inner anim-hidden' : 'pin-inner';
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

  function _startFlyIn(elements) {
    elements.forEach((el, i) => {
      setTimeout(() => {
        requestAnimationFrame(() => el.classList.remove('anim-hidden'));
      }, FLY_IN_STAGGER_MS * i);
    });
  }

  // ── Factory ───────────────────────────────────────────────────────────

  /**
   * Creates an independent map controller bound to containerId.
   * options:
   *   missionFilter — restrict all rendering to a single mission (mission slides)
   *   onPinClick(project) — called on pin click; falls back to the global
   *                          'map:pin-click' event when omitted (overview behaviour)
   *   center, zoom — defaults to Austria overview (47.6, 13.5) @ zoom 7
   */
  function create(containerId, options) {
    options = options || {};
    const missionFilter = options.missionFilter || null;
    const center = options.center || DEFAULT_CENTER;
    const zoom   = options.zoom != null ? options.zoom : DEFAULT_ZOOM;

    const map = L.map(containerId, {
      center, zoom,
      zoomControl: true,
      attributionControl: true,
    });

    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    let tilesReady = false;
    const tilesCallbacks = [];
    function markTilesReady() {
      if (tilesReady) return;
      tilesReady = true;
      tilesCallbacks.forEach(fn => fn());
      tilesCallbacks.length = 0;
    }
    function whenTilesReady(fn) {
      if (tilesReady) fn(); else tilesCallbacks.push(fn);
    }
    tileLayer.once('load', markTilesReady);
    setTimeout(markTilesReady, TILES_TIMEOUT_MS);

    const pinLayer    = L.layerGroup().addTo(map);
    const pointLayer  = L.layerGroup().addTo(map);
    const spiderLayer = L.layerGroup().addTo(map);

    _loadGeoJSON().then(data => {
      if (!data) return;
      _addBundeslandBorders(map, data);
      _addAustriaMask(map, data);
    });

    let hasFlownIn   = false;
    let openTimeMs   = null;
    let activeFilter = null; // mission/bundesland toggle — overview only

    function renderMarkers(filter) {
      const willAnimate = !hasFlownIn;
      activeFilter = filter || null;
      if (!window.APP_DATA) return;

      pinLayer.clearLayers();
      pointLayer.clearLayers();
      spiderLayer.clearLayers();

      let pins   = window.APP_DATA.projects.filter(p => p.type === 'pin');
      let points = window.APP_DATA.projects.filter(p => p.type === 'point');

      if (missionFilter) {
        pins   = pins.filter(p => p.mission === missionFilter);
        points = points.filter(p => p.mission === missionFilter);
      } else if (activeFilter) {
        const match = activeFilter.type === 'mission'
          ? p => p.mission    === activeFilter.value
          : p => p.bundesland === activeFilter.value;
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
          // Leaflet z-indexes markers by their on-screen Y position by default,
          // so a pin further "north" could otherwise be drawn under a point
          // further "south". This offset guarantees pins always win.
          zIndexOffset: PIN_Z_INDEX_OFFSET,
        });
        marker.on('click', () => {
          if (options.onPinClick) options.onPinClick(pin);
          else document.dispatchEvent(new CustomEvent('map:pin-click', { detail: { project: pin } }));
        });
        pinLayer.addLayer(marker);
        if (pin._center) {
          spiderLayer.addLayer(L.polyline(
            [pin._center, [tLat, tLng]],
            { color: 'rgba(184,163,159,0.4)', weight: 1, interactive: false }
          ));
        }
      });

      clusters.forEach(c => {
        pointLayer.addLayer(L.marker([c.lat, c.lng], {
          icon: _createPointIcon(c.missions, willAnimate),
          interactive: false,
          keyboard: false,
        }));
      });

      // ── Fly-in (first render only) ────────────────────────────────────
      if (willAnimate) {
        hasFlownIn = true;
        openTimeMs = Date.now();

        requestAnimationFrame(() => {
          const pane   = map.getPane('markerPane');
          const hidden = Array.from(pane.querySelectorAll('.anim-hidden'));

          whenTilesReady(() => {
            const elapsed  = Date.now() - openTimeMs;
            const waitMore = Math.max(0, FLY_IN_MIN_MS - elapsed);
            setTimeout(() => _startFlyIn(hidden), waitMore);
          });
        });
      }
    }

    function setFilter(filter) {
      hasFlownIn = true;   // skip animation on filter changes
      renderMarkers(filter);
    }

    function clearFilter() {
      setFilter(null);
    }

    function invalidateSize() {
      map.invalidateSize();
    }

    function flyTo(lat, lng, zoomLevel, durationSec) {
      map.flyTo([lat, lng], zoomLevel, { duration: durationSec != null ? durationSec : 1.5 });
    }

    function flyToHome() {
      map.flyTo(center, zoom, { duration: 1.0 });
    }

    return { map, renderMarkers, setFilter, clearFilter, invalidateSize, flyTo, flyToHome };
  }

  window.APP_MAP = { create };

})();
