// Stats panel for Folie 2 — 4-step overlay covering the map.
// Step 1: total funding (count-up)   Step 2: donut by mission
// Step 3: bar by Bundesland          Step 4: stacked bar mission × Bundesland
//
// Exposed as APP_STATS_PANEL: { init, nextStep, prevStep, isOpen, close }

(function () {
  'use strict';

  const MAX_STEPS = 4;

  let _step   = 0;
  let _panel  = null;
  let _data   = null;
  let _charts = {};   // step number → Chart instance

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
    Object.values(_charts).forEach(c => { try { c.destroy(); } catch (_) {} });
    _charts = {};
    _step   = 0;
    _panel.classList.remove('visible');
    _panel.querySelectorAll('.stats-card').forEach(c => c.classList.remove('visible'));
  }

  // Close automatically when navigating away from slide 2
  document.addEventListener('app:slide-changed', e => {
    if (e.detail.from === 2) close();
  });

  // ── Grid scaffold ─────────────────────────────────────────────────────

  function _buildGrid() {
    _panel.innerHTML = `
      <div class="stats-grid">
        <div class="stats-card" id="stats-card-1">
          <div class="stats-card-title">Gesamtvolumen Förderungen</div>
          <div class="stats-card-content" id="stats-content-1"></div>
        </div>
        <div class="stats-card" id="stats-card-2">
          <div class="stats-card-title">Fördervolumen pro Mission</div>
          <div class="stats-card-content" id="stats-content-2">
            <canvas id="stats-chart-mission"></canvas>
          </div>
        </div>
        <div class="stats-card" id="stats-card-3">
          <div class="stats-card-title">Projekte pro Bundesland</div>
          <div class="stats-card-content" id="stats-content-3">
            <canvas id="stats-chart-bundesland"></canvas>
          </div>
        </div>
        <div class="stats-card" id="stats-card-4">
          <div class="stats-card-title">Missionen pro Bundesland</div>
          <div class="stats-card-content" id="stats-content-4">
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
    _renderCard(step);
  }

  function _deactivateCard(step) {
    const card = document.getElementById(`stats-card-${step}`);
    if (card) card.classList.remove('visible');
    if (_charts[step]) {
      _charts[step].destroy();
      delete _charts[step];
    }
  }

  // ── Step renderers ────────────────────────────────────────────────────

  function _renderCard(step) {
    if (step === 1) _renderTotal();
    else if (step === 2) _renderMissionDonut();
    else if (step === 3) _renderBundeslandBar();
    else if (step === 4) _renderStackedBar();
  }

  function _renderTotal() {
    const el = document.getElementById('stats-content-1');
    if (!el) return;
    el.innerHTML = '<div class="stats-total-value" id="stats-total-num"></div>';
    _countUp(document.getElementById('stats-total-num'), _data.totalFunding, 1800);
  }

  function _renderMissionDonut() {
    const canvas = document.getElementById('stats-chart-mission');
    if (!canvas || typeof Chart === 'undefined') return;
    const missions = ['climate', 'cities', 'cancer', 'soil', 'water'];
    _charts[2] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels:   missions.map(_missionLabel),
        datasets: [{
          data:            missions.map(m => _data.byMission[m] || 0),
          backgroundColor: missions.map(_missionColor),
          borderWidth:     2,
          borderColor:     '#1a1a1a',
          hoverOffset:     6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 700, easing: 'easeOutQuart' },
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color:    'rgba(255,255,255,0.75)',
              font:     { size: 11 },
              boxWidth: 10,
              padding:  10,
              generateLabels: chart => {
                const ds  = chart.data.datasets[0];
                const tot = ds.data.reduce((a, b) => a + b, 0);
                return chart.data.labels.map((label, i) => ({
                  text:        `${label}  ${(ds.data[i] / 1_000_000).toLocaleString('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio.`,
                  fillStyle:   ds.backgroundColor[i],
                  strokeStyle: ds.backgroundColor[i],
                  lineWidth:   0,
                  hidden:      false,
                  index:       i,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` € ${(ctx.raw / 1_000_000).toLocaleString('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio.`,
            },
          },
        },
      },
    });
  }

  function _renderBundeslandBar() {
    const canvas = document.getElementById('stats-chart-bundesland');
    if (!canvas || typeof Chart === 'undefined') return;
    const entries = Object.entries(_data.byBundesland).sort((a, b) => b[1] - a[1]);
    _charts[3] = new Chart(canvas, {
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
        animation: { duration: 700, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            border: { display: false },
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.75)', font: { size: 11 } },
            grid:  { display: false },
            border: { display: false },
          },
        },
      },
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
    _charts[4] = new Chart(canvas, {
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
        animation: { duration: 700, easing: 'easeOutQuart' },
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
            ticks:   { color: 'rgba(255,255,255,0.4)', stepSize: 1 },
            grid:    { color: 'rgba(255,255,255,0.07)' },
            border:  { display: false },
          },
          y: {
            stacked: true,
            ticks:   { color: 'rgba(255,255,255,0.75)', font: { size: 11 } },
            grid:    { display: false },
            border:  { display: false },
          },
        },
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  function _countUp(el, targetEur, duration) {
    if (!el) return;
    const start = Date.now();
    const tick = () => {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = eased * targetEur;
      el.innerHTML   = `€ ${(value / 1_000_000).toLocaleString('de-AT', {
        minimumFractionDigits: 1, maximumFractionDigits: 1,
      })} <span class="stats-total-unit">Mio.</span>`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function _aggregate(projects) {
    const pins = projects.filter(p => p.type === 'pin');
    const totalFunding        = pins.reduce((s, p) => s + (p.foerderung_eur || 0), 0);
    const byMission           = {};
    const byBundesland        = {};
    const byBundeslandMission = {};

    pins.forEach(p => {
      byMission[p.mission]  = (byMission[p.mission]  || 0) + (p.foerderung_eur || 0);
      byBundesland[p.bundesland] = (byBundesland[p.bundesland] || 0) + 1;
      if (!byBundeslandMission[p.bundesland]) byBundeslandMission[p.bundesland] = {};
      byBundeslandMission[p.bundesland][p.mission] =
        (byBundeslandMission[p.bundesland][p.mission] || 0) + 1;
    });

    return { totalFunding, byMission, byBundesland, byBundeslandMission };
  }

  function _missionLabel(key) {
    return window.APP_CONFIG?.missions?.[key]?.label || key;
  }

  function _missionColor(key) {
    return window.APP_CONFIG?.missions?.[key]?.color || '#888';
  }

  window.APP_STATS_PANEL = { init, nextStep, prevStep, isOpen, close };

})();
