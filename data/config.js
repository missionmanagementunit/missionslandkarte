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

  // Nationale FFG-Förderung pro Mission, aggregiert.
  // Quelle: FFG Förderstatistik 10.2026 (FFG_261001_Tic46400_Missionsprojekte_FFG.xlsx),
  // 602 von 733 Projekten zuordenbar, Summe 220.204.765 EUR.
  // Diese Beträge stehen NICHT in projects_v2.csv: sie decken mehr Projekte ab als die Karte
  // zeigt (z.B. cities 411 statt 145) und lassen sich keinem Kartenpunkt zuordnen.
  // Sie fließen nur in das Gesamtvolumen und den Missions-Donut auf Folie 2 ein.
  // Auf null setzen, um sie wieder auszublenden.
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
