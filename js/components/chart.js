// Stats panel for Folie 2: Stat Cards, funding total, chart placeholders.
// Reads from APP_CONFIG.overview — currently all disabled, so panel stays hidden.
// Enable content in data/config.js without any code changes.

(function () {
  'use strict';

  function init(containerId, projects) {
    const cfg = window.APP_CONFIG?.overview;
    if (!cfg) return;

    const el = document.getElementById(containerId);
    if (!el) return;

    const hasCards   = cfg.statCards?.length > 0;
    const hasFunding = _checkFundingThreshold(projects, cfg.foerderungMinCoverage ?? 0.5);
    const hasCharts  = cfg.showChartByMission || cfg.showChartByBundesland;

    if (!hasCards && !hasFunding && !hasCharts) return;  // nothing to show — keep hidden

    el.classList.add('visible');
    el.innerHTML = _buildPanel(cfg, projects, hasFunding);
  }

  function _checkFundingThreshold(projects, threshold) {
    const pins = projects.filter(p => p.type === 'pin');
    if (!pins.length) return false;
    return pins.filter(p => p.foerderung_eur !== null && p.foerderung_eur !== undefined).length / pins.length >= threshold;
  }

  function _buildPanel(cfg, projects, hasFunding) {
    let html = '';

    // Stat Cards
    if (cfg.statCards?.length) {
      cfg.statCards.forEach(card => {
        html += `<div class="stat-card">
          <span class="stat-value">${card.value}${card.unit ? ' ' + card.unit : ''}</span>
          <span class="stat-label">${card.label}</span>
        </div>`;
      });
    }

    // Funding total
    if (hasFunding) {
      const total = projects
        .filter(p => p.type === 'pin' && p.foerderung_eur)
        .reduce((s, p) => s + p.foerderung_eur, 0);
      html += `<div class="stat-card">
        <span class="stat-value">€ ${(total / 1_000_000)
          .toLocaleString('de-AT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio.</span>
        <span class="stat-label">Fördermittel gesamt</span>
      </div>`;
    }

    // Chart placeholders — will be Chart.js bars in a later iteration
    if (cfg.showChartByMission) {
      html += '<div class="stats-chart-placeholder">Projekte pro Mission</div>';
    }
    if (cfg.showChartByBundesland) {
      html += '<div class="stats-chart-placeholder">Projekte pro Bundesland</div>';
    }

    return html;
  }

  window.APP_STATS = { init };

})();
