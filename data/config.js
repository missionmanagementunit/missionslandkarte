// data/config.js
// Alle Werte hier können ohne Code-Änderung angepasst werden.
// Nach Änderung: Seite neu laden, kein Build-Schritt nötig.

window.APP_CONFIG = {

  // Hintergrundvideo der Startseite (YouTube Video-ID)
  startVideoId: 'xjCXpfE01yc',

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
