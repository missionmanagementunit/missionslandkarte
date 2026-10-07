// Stats panel for Folie 2 — 3-step overlay covering the map.
// Step 1: donut by mission (top half)
// Step 2: bar by Bundesland        Step 3: stacked bar mission × Bundesland
// Steps 2 and 3 share the bottom half.
//
// Exposed as APP_STATS_PANEL: { init, nextStep, prevStep, isOpen, close }

(function () {
  'use strict';

  const MAX_STEPS = 3;

  // Alle neun Bundesländer, damit die Regionaldiagramme Österreich vollständig zeigen.
  // Burgenland hat derzeit 0 Projekte und erscheint dadurch als 0-Zeile statt zu fehlen.
  const BUNDESLAENDER = [
    'Burgenland', 'Kärnten', 'Niederösterreich', 'Oberösterreich', 'Salzburg',
    'Steiermark', 'Tirol', 'Vorarlberg', 'Wien',
  ];

  let _step   = 0;
  let _panel  = null;
  let _data   = null;
  let _charts         = {};   // step number → Chart instance
  let _renderTimeouts = {};   // step number → pending setTimeout ID

  // ── Public API ────────────────────────────────────────────────────────

  function init(containerId, projects) {
    _panel = document.getElementById(containerId);
    if (!_panel) return;
    _data  = _aggregate(projects);
    _step  = 0;
    _buildGrid();
  }

  function nextStep() {
    if (!_panel || _step >= MAX_STEPS) return;
    _step++;
    if (_step === 1) _panel.classList.add('visible');
    const delay = _step === 1 ? 320 : 0;   // let slide-up animation start first
    setTimeout(() => _activateCard(_step), delay);
  }

  function prevStep() {
    if (!_panel || _step <= 0) return;
    _deactivateCard(_step);
    _step--;
    if (_step === 0) _panel.classList.remove('visible');
  }

  function isOpen() { return _step > 0; }

  function close() {
    if (!_panel) return;
    Object.keys(_renderTimeouts).forEach(k => { clearTimeout(_renderTimeouts[k]); });
    _renderTimeouts = {};
    Object.values(_charts).forEach(c => { try { c.destroy(); } catch (_) {} });
    _charts = {};
    _step   = 0;
    _panel.classList.remove('visible');
    _panel.querySelectorAll('.stats-card').forEach(c => c.classList.remove('visible'));
  }

  // Close automatically when navigating away from slide 2
  document.addEventListener('app:slide-changed', e => {
    if (e.detail.to !== 2) close();
  });

  // ── Grid scaffold ─────────────────────────────────────────────────────

  function _buildGrid() {
    _panel.innerHTML = `
      <div class="stats-grid">
        <div class="stats-card stats-card--wide" id="stats-card-1">
          <div class="stats-card-title">Anteile am Fördervolumen</div>
          <div class="stats-card-content stats-card-content--donut" id="stats-content-1">
            <div class="stats-donut-canvas-wrap">
              <canvas id="stats-chart-mission"></canvas>
            </div>
            <div id="stats-donut-legend" class="stats-donut-legend"></div>
          </div>
        </div>
        <div class="stats-card" id="stats-card-2">
          <div class="stats-card-title">Projekte pro Bundesland</div>
          <div class="stats-card-content" id="stats-content-2">
            <canvas id="stats-chart-bundesland"></canvas>
          </div>
        </div>
        <div class="stats-card" id="stats-card-3">
          <div class="stats-card-title">Missionen pro Bundesland</div>
          <div class="stats-card-content" id="stats-content-3">
            <canvas id="stats-chart-stacked"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  function _activateCard(step) {
    const card = document.getElementById(`stats-card-${step}`);
    if (!card) return;
    card.classList.add('visible');
    // Wait for the 400ms CSS fade-in so Chart.js animation plays while the card
    // is already fully visible, not while it is still transparent.
    _renderTimeouts[step] = setTimeout(() => {
      delete _renderTimeouts[step];
      if (document.getElementById(`stats-card-${step}`)?.classList.contains('visible')) {
        // Two nested rAFs ensure the GPU compositor has fully committed the
        // opacity=1 layer on all OS/browser combinations before Chart.js starts
        // its own rAF loop. One rAF is sufficient on macOS; Windows Chrome and
        // Firefox need the second cycle to flush the compositor thread.
        requestAnimationFrame(() => requestAnimationFrame(() => _renderCard(step)));
      }
    }, 420);
  }

  function _deactivateCard(step) {
    clearTimeout(_renderTimeouts[step]);
    delete _renderTimeouts[step];
    const card = document.getElementById(`stats-card-${step}`);
    if (card) card.classList.remove('visible');
    if (_charts[step]) {
      _charts[step].destroy();
      delete _charts[step];
    }
  }

  // ── Step renderers ────────────────────────────────────────────────────

  function _renderCard(step) {
    if (step === 1) _renderMissionDonut();
    else if (step === 2) _renderBundeslandBar();
    else if (step === 3) _renderStackedBar();
  }

  function _renderMissionDonut() {
    const canvas   = document.getElementById('stats-chart-mission');
    const legendEl = document.getElementById('stats-donut-legend');
    if (!canvas || typeof Chart === 'undefined') return;

    const missions = ['climate', 'cities', 'cancer', 'soil', 'water'];
    const values   = missions.map(m => _data.byMission[m] || 0);
    const total    = values.reduce((a, b) => a + b, 0);

    // HTML legend — avoids canvas text clipping and fills any screen width.
    // Zeigt Anteile, keine Eurobeträge: Folie 2 nennt bewusst keine Summen mehr,
    // weil EU- und FFG-Beträge unterschiedliche Grundgesamtheiten haben.
    if (legendEl) {
      legendEl.innerHTML = missions.map((m, i) => {
        const pct = total === 0 ? 0 : values[i] / total * 100;
        return `<div class="stats-donut-legend-item">
          <span class="stats-donut-legend-swatch" style="background:${_missionColor(m)}"></span>
          <span class="stats-donut-legend-label">${_missionLabel(m)}</span>
          <span class="stats-donut-legend-value">${Math.round(pct)} %</span>
        </div>`;
      }).join('');
    }

    const pctLabels = {
      id: 'pctLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const ds = chart.data.datasets[0];
        if (total === 0) return;
        chart.getDatasetMeta(0).data.forEach((arc, i) => {
          const pct = ds.data[i] / total * 100;
          if (pct < 4) return;
          const pos = arc.tooltipPosition();
          ctx.save();
          ctx.fillStyle    = 'white';
          ctx.font         = 'bold 14px sans-serif';
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(pct)}%`, pos.x, pos.y);
          ctx.restore();
        });
      },
    };

    _charts[1] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels:   missions.map(_missionLabel),
        datasets: [{
          data:            values,
          backgroundColor: missions.map(_missionColor),
          borderWidth:     2,
          borderColor:     'rgba(255,255,255,0.35)',
          hoverOffset:     6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutQuart' },
        cutout: '62%',
        layout: { padding: 8 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${total === 0 ? 0 : Math.round(ctx.raw / total * 100)} %`,
            },
          },
        },
      },
      plugins: [pctLabels],
    });
  }

  function _renderBundeslandBar() {
    const canvas = document.getElementById('stats-chart-bundesland');
    if (!canvas || typeof Chart === 'undefined') return;
    const entries = Object.entries(_data.byBundesland).sort((a, b) => b[1] - a[1]);

    const barValues = {
      id: 'barValues',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.fillStyle    = 'rgba(255,255,255,0.75)';
        ctx.font         = '11px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'left';
        meta.data.forEach((bar, i) => {
          const val = chart.data.datasets[0].data[i];
          if (val == null) return;   // 0 wird bewusst beschriftet
          ctx.fillText(val, bar.x + 4, bar.y);
        });
        ctx.restore();
      },
    };

    _charts[2] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels:   entries.map(e => e[0]),
        datasets: [{
          data:            entries.map(e => e[1]),
          backgroundColor: 'rgba(255,255,255,0.65)',
          borderWidth:     0,
          borderRadius:    3,
        }],
      },
      options: {
        indexAxis:           'y',
        responsive:          true,
        maintainAspectRatio: false,
        clip:                false,
        animation:           { duration: 900, easing: 'easeOutQuart' },
        layout: { padding: { right: 28 } },
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks:  { color: 'rgba(255,255,255,0.4)', stepSize: 50 },
            grid:   { color: 'rgba(255,255,255,0.07)' },
            border: { display: false },
          },
          y: {
            ticks:  { color: 'rgba(255,255,255,0.75)', font: { size: 11 }, autoSkip: false },
            grid:   { display: false },
            border: { display: false },
          },
        },
      },
      plugins: [barValues],
    });
  }

  function _renderStackedBar() {
    const canvas = document.getElementById('stats-chart-stacked');
    if (!canvas || typeof Chart === 'undefined') return;
    const missions      = ['climate', 'cities', 'cancer', 'soil', 'water'];
    const bundeslaender = Object.keys(_data.byBundeslandMission).sort((a, b) => {
      const totA = Object.values(_data.byBundeslandMission[a]).reduce((s, v) => s + v, 0);
      const totB = Object.values(_data.byBundeslandMission[b]).reduce((s, v) => s + v, 0);
      return totB - totA;
    });

    const stackedLabels = {
      id: 'stackedLabels',
      afterDatasetsDraw(chart) {
        const { ctx, data, scales } = chart;
        const MIN_SEG_PX = 18;   // minimum segment width to draw a value inside it
        ctx.save();

        // Per-segment values (drawn inside each mission block where there's room)
        ctx.font         = 'bold 10px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'center';
        data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di);
          meta.data.forEach((bar, i) => {
            const val = ds.data[i];
            if (!val) return;
            const segWidth = Math.abs(bar.x - bar.base);
            if (segWidth < MIN_SEG_PX) return;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(val, (bar.x + bar.base) / 2, bar.y);
          });
        });

        // Row totals (drawn just past the end of each stacked row)
        const lastMeta = chart.getDatasetMeta(data.datasets.length - 1);
        ctx.font         = '11px sans-serif';
        ctx.textAlign    = 'left';
        data.labels.forEach((_, i) => {
          const total = data.datasets.reduce((s, ds) => s + (ds.data[i] || 0), 0);
          if (!Number.isFinite(total)) return;   // 0 wird bewusst beschriftet
          const xPx = scales.x.getPixelForValue(total);
          const yPx = lastMeta.data[i]?.y;
          if (yPx == null) return;
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.fillText(total, xPx + 4, yPx);
        });

        ctx.restore();
      },
    };

    _charts[3] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels:   bundeslaender,
        datasets: missions.map(m => ({
          label:           _missionLabel(m),
          data:            bundeslaender.map(bl => _data.byBundeslandMission[bl]?.[m] || 0),
          backgroundColor: _missionColor(m),
          borderWidth:     0,
          borderRadius:    2,
        })),
      },
      options: {
        indexAxis:           'y',
        responsive:          true,
        maintainAspectRatio: false,
        clip:                false,
        animation:           { duration: 900, easing: 'easeOutQuart' },
        layout: { padding: { right: 28 } },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color:    'rgba(255,255,255,0.65)',
              font:     { size: 10 },
              boxWidth: 10,
              padding:  8,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks:   { color: 'rgba(255,255,255,0.4)', stepSize: 50 },
            grid:    { color: 'rgba(255,255,255,0.07)' },
            border:  { display: false },
          },
          y: {
            stacked: true,
            ticks:   { color: 'rgba(255,255,255,0.75)', font: { size: 11 }, autoSkip: false },
            grid:    { display: false },
            border:  { display: false },
          },
        },
      },
      plugins: [stackedLabels],
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  function _aggregate(projects) {
    // Die Regionaldiagramme zählen alles, was die Karte zeigt — Punkte UND Pins.
    // Ohne die Pins stünde Vorarlberg auf 0, obwohl dort ein Pin-Projekt liegt
    // (aMooRe, Bregenz): es ist das einzige Projekt des Bundeslandes.
    const mapped = projects.filter(p => p.type === 'point' || p.type === 'pin');
    const byMission           = {};
    const byBundesland        = {};
    const byBundeslandMission = {};

    // Alle neun Bundesländer vorbelegen, damit die Regionaldiagramme Österreich
    // vollständig zeigen: Regionen ohne Projekte bleiben als 0-Zeile sichtbar,
    // statt stillschweigend zu fehlen.
    BUNDESLAENDER.forEach(bl => {
      byBundesland[bl]        = 0;
      byBundeslandMission[bl] = {};
    });

    // Die Bundesland-Diagramme zählen Projekte, kein Geld — sie kommen immer aus der CSV
    // und bleiben von den aggregierten Förderwerten unten unberührt.
    mapped.forEach(p => {
      if (!p.bundesland) return;   // skip rows with missing Bundesland
      byBundesland[p.bundesland] = (byBundesland[p.bundesland] || 0) + 1;
      if (!byBundeslandMission[p.bundesland]) byBundeslandMission[p.bundesland] = {};
      byBundeslandMission[p.bundesland][p.mission] =
        (byBundeslandMission[p.bundesland][p.mission] || 0) + 1;
    });

    // Österreichische EU-Förderung (EU-Rahmenprogramme + LIFE) pro Mission.
    // Die CSV enthält je Projekt nur eine kuratierte Beteiligung; euParticipationFunding
    // aus config.js deckt alle österreichischen Beteiligungen derselben Projekte ab.
    // Daher ERSETZEN diese Werte die CSV-Summen — addieren würde die kuratierten Zeilen
    // doppelt zählen. Ohne den Config-Block fällt die Summe auf die CSV-Beträge zurück.
    const euParticipation = window.APP_CONFIG?.euParticipationFunding?.byMission;
    if (euParticipation) {
      Object.entries(euParticipation).forEach(([mission, eur]) => {
        byMission[mission] = (byMission[mission] || 0) + eur;
      });
    } else {
      // Förderbeträge beziehen sich auf Projekt_Typ = point — gleiche Basis wie
      // euParticipationFunding in config.js, daher hier ohne Pins.
      projects.filter(p => p.type === 'point').forEach(p => {
        byMission[p.mission] = (byMission[p.mission] || 0) + (p.foerderung_eur || 0);
      });
    }

    // Nationale FFG-Förderung aus config.js dazurechnen. Sie ist nur pro Mission bekannt,
    // fließt also in Gesamtsumme und Donut ein, nicht in die Bundesland-Diagramme.
    const national = window.APP_CONFIG?.nationalFunding?.byMission;
    if (national) {
      Object.entries(national).forEach(([mission, eur]) => {
        byMission[mission] = (byMission[mission] || 0) + eur;
      });
    }

    return { byMission, byBundesland, byBundeslandMission };
  }

  function _missionLabel(key) {
    return window.APP_CONFIG?.missions?.[key]?.label || key;
  }

  function _missionColor(key) {
    return window.APP_CONFIG?.missions?.[key]?.color || '#888';
  }

  window.APP_STATS_PANEL = { init, nextStep, prevStep, isOpen, close };

})();
