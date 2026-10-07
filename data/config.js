// data/config.js
// Alle Werte hier können ohne Code-Änderung angepasst werden.
// Nach Änderung: Seite neu laden, kein Build-Schritt nötig.

window.APP_CONFIG = {

  // Hintergrundvideo der Startseite (YouTube Video-ID)
  startVideoId: 'Tw96q4yA7uc',

  // Übersichtsfolie: Statistik-Panel
  // Steuerung welche Datenfelder und Diagramme auf Folie 2 angezeigt werden.
  // Inhalte stehen noch nicht fest — Platzhalter aktivieren/deaktivieren einzelne Panels.
  overview: {

    // Diagramm: Projekte pro Mission
    // true = aus CSV berechnet (automatisch), false = ausgeblendet
    showChartByMission: false,

    // Diagramm: Projekte pro Bundesland
    // true = aus CSV berechnet (automatisch), false = ausgeblendet
    showChartByBundesland: false,

    // Fördermittel-Summe: nur anzeigen wenn Anteil Pins mit Daten >= Schwellenwert
    foerderungMinCoverage: 0.5,   // 0.5 = 50%

    // Zusätzliche Kennzahl-Kacheln ("Stat Cards") — frei konfigurierbar.
    // Leer lassen [] wenn noch keine Inhalte feststehen.
    // Werden als große Zahl + Label im Statistik-Panel angezeigt.
    statCards: [
      // Beispiele — auskommentiert bis Inhalte feststehen:
      // { label: 'Geförderte Projekte', value: '47', unit: '' },
      // { label: 'Beteiligte Bundesländer', value: '9', unit: 'von 9' },
      // { label: 'Projektpartner', value: '120+', unit: '' },
    ],
  },

  // Österreichische EU-Förderung pro Mission: ALLE österreichischen Beteiligungen
  // (EU-Rahmenprogramme + LIFE) in den auf der Karte gezeigten Projekten.
  // Quelle: Backend Project Selection, ergänzt um CORDIS-Abruf vom 06.10.2026
  // (reports/Backend Project Selection_alle-AT-Beteiligungen_2026-10-06.xlsx, Blatt
  // "Beteiligungen"), Basis Projekt_Typ = point — also ohne die Pin-Projekte, genau wie
  // _aggregate() in slide-stats.js nur type === 'point' summiert.
  //
  // Warum nicht aus projects_v2.csv: die CSV enthält je Projekt nur EINE kuratierte
  // österreichische Beteiligung (Fokus: österreichische Erfolge auf der Karte). 295 der
  // 923 EU-Projekte (32 %) haben mehr als eine österreichische Beteiligung, 293 davon
  // mehr als eine eigene Organisation; 510 Beteiligungen fehlen dadurch, und zwar
  // ungleichmäßig je Mission, was die Donut-Anteile verzerrt.
  // STAND 07.10.2026: Diese Werte werden auf Folie 2 NICHT MEHR ANGEZEIGT. Der Donut
  // zeigt seither Projekte pro Mission, nicht Förderanteile — Förderbeträge hätten sonst
  // über die Donut-Proportionen weitergewirkt, obwohl EU- und FFG-Zahlen unterschiedliche
  // Grundgesamtheiten haben. Der Block bleibt als Beleg der geprüften Summen stehen und
  // ist die Grundlage für mündliche Aussagen zum Fördervolumen.
  // Die Karte bleibt unverändert: die 510 ergänzten Beteiligungen sind keine Kartenpunkte.
  //
  // Einschränkungen:
  // - LIFE ist mit kuratierten Anteilen enthalten (12.292.954 EUR): die LIFE-Datenbank
  //   veröffentlicht nur Projektwerte, keine Beteiligungsdaten.
  // - Die Projektauswahl selbst bleibt eine Auswahl. Die Summe gilt für "alle
  //   österreichischen Beteiligungen in den gezeigten Projekten", nicht für "alle
  //   österreichischen Missionsprojekte".

  euParticipationFunding: {
    byMission: {
      climate: 201032241,   // EU 199.791.266 + LIFE 1.240.975
      cities:   64917366,   // EU  60.804.149 + LIFE 4.113.217
      cancer:  136211653,   // EU 136.211.653 + LIFE         0
      soil:     37174807,   // EU  37.174.807 + LIFE         0
      water:   153963374,   // EU 147.024.612 + LIFE 6.938.762 — in der Quelle "waters"
    },
    euTotal:        581006487,
    lifeTotal:       12292954,
    addedParticipations: 510,
    source: 'Backend Project Selection + CORDIS-Abruf 06.10.2026',
  },

  // Nationale FFG-Förderung pro Mission, aggregiert.
  // Quelle: FFG Förderstatistik 10.2026 (FFG_261001_Tic46400_Missionsprojekte_FFG.xlsx),
  // 602 von 733 Projekten zuordenbar, Summe 220.204.765 EUR.
  // Diese Beträge stehen NICHT in projects_v2.csv: sie decken mehr Projekte ab als die Karte
  // zeigt (z.B. cities 411 statt 145) und lassen sich keinem Kartenpunkt zuordnen.
  // STAND 07.10.2026: Werden auf Folie 2 NICHT MEHR ANGEZEIGT (siehe
  // euParticipationFunding oben). Bleiben als Beleg stehen.
  nationalFunding: {
    byMission: {
      climate:  49133072,
      cities:  139033497,
      cancer:   18156849,
      soil:      5581683,
      water:     8299664,   // in der Quelle "waters"
    },
    projects: 602,
    source: 'FFG Förderstatistik 10.2026',
  },

  // Missions-Metadaten (Anzeigetexte, Farben)
  // Hier ändern wenn Bezeichnungen angepasst werden sollen
  missions: {
    climate: { label: 'Klimawandel meistern',                           color: '#d34a56' },
    cities:  { label: 'Klimaneutrale Stadt',                            color: '#76a772' },
    cancer:  { label: 'Krebs besiegen',                                 color: '#d39c45' },
    soil:    { label: 'Gesunde Böden',                                  color: '#7d5e9c' },
    water:   { label: 'Wasser und Gewässer schützen',                   color: '#6a8cb7' },
  },
};
