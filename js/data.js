// Loads data/projects.csv (semicolon-delimited, decimal comma for coordinates),
// parses it into typed project objects, and attaches the result to window.APP_DATA.
// Fires custom event 'app:data-ready' when done. Unknown CSV columns are ignored.

(function () {
  'use strict';

  const CSV_PATH = 'data/projects.csv';

  const VALID_TYPES    = new Set(['pin', 'point']);
  const VALID_MISSIONS = new Set(['climate', 'cities', 'cancer', 'soil', 'water']);

  // Real-world CORDIS exports use the plural "waters" as the mission category;
  // the rest of the app (config.js, map.js, tile.js, legend.js) keys on "water".
  const MISSION_ALIASES = { waters: 'water' };

  /** Split a semicolon-delimited line, respecting double-quoted fields. */
  function splitLine(line) {
    const fields = [];
    let cur = '', inQuote = false;
    for (const ch of line) {
      if      (ch === '"')              { inQuote = !inQuote; }
      else if (ch === ';' && !inQuote)  { fields.push(cur); cur = ''; }
      else                              { cur += ch; }
    }
    fields.push(cur);
    return fields;
  }

  /** Parse raw CSV text into an array of plain row objects. Handles UTF-8 BOM. */
  function parseCsv(text) {
    const clean   = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    const lines   = clean.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = splitLine(line);
      const row    = {};
      headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim(); });
      return row;
    });
  }

  /** Convert a raw row into a typed project record; returns null for invalid rows. */
  function toProject(raw) {
    const mission = MISSION_ALIASES[raw.mission] || raw.mission;

    if (!raw.id || !VALID_TYPES.has(raw.type) || !VALID_MISSIONS.has(mission)) {
      console.warn('[data.js] Ungültige Zeile übersprungen:', raw);
      return null;
    }

    const lat = parseFloat((raw.lat ?? '').replace(',', '.'));
    const lng = parseFloat((raw.lng ?? '').replace(',', '.'));

    const project = {
      id:           raw.id,
      type:         raw.type,
      mission,
      name:         raw.name         || '',
      organisation: raw.organisation || '',
      city:         raw.city         || '',
      bundesland:   raw.bundesland   || '',
      lat,
      lng,
      link:         raw.link         || '',
      // Real-world data is inconsistent about spacing around the pipe
      // ("A | B" vs "A| B"); split leniently and drop empty trailing entries.
      keywords:     raw.keywords ? raw.keywords.split(/\s*\|\s*/).map(k => k.trim()).filter(Boolean) : [],
    };

    if (raw.type === 'pin') {
      project.foerderung_eur  = raw.foerderung_eur  ? parseInt(raw.foerderung_eur, 10)  : null;
      project.thumbnail_path  = raw.thumbnail_path  || null;
      project.video_type      = raw.video_type       || null;
      project.video_id        = raw.video_id         || null;
      project.video_pin_order = raw.video_pin_order  ? parseInt(raw.video_pin_order, 10) : null;
    }

    return project;
  }

  function load() {
    fetch(CSV_PATH)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} beim Laden von ${CSV_PATH}`);
        return res.text();
      })
      .then(text => {
        const rows     = parseCsv(text);
        const projects = rows.map(toProject).filter(Boolean);

        window.APP_DATA = { projects };

        console.log(`[data.js] ${projects.length} Projekte geladen aus ${CSV_PATH}`);
        console.table(projects);

        document.dispatchEvent(
          new CustomEvent('app:data-ready', { detail: { projects } })
        );
      })
      .catch(err => console.error('[data.js] Fehler:', err));
  }

  load();
})();
