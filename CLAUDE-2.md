# CLAUDE.md — Mission Intelligence
## Interaktive Präsentation der EU-Missionen in Österreich

---

## Projektübersicht

**Zweck:** Interaktive 7-Folien-Präsentation für die Jahrestagung Missionsorientierte Innovationspolitik 2026 (13. Oktober 2026, TechGate Wien, ~200 Personen). Wird auf einem Firmenlaptop über GitHub Pages im Browser präsentiert.

**Titel der Präsentation:** Mission Intelligence  
**Veranstaltung:** Jahrestagung Missionsorientierte Innovationspolitik 2026 – Umsetzung mit Impact  
**Betreiber:** FFG (Österreichische Forschungsförderungsgesellschaft)

**Technische Eckdaten:**
- Statische Web-App, ausgeliefert über GitHub Pages
- Kein Backend, kein Server-Prozess
- Internetverbindung am Veranstaltungsort erforderlich (YouTube IFrame API, Kartenkacheln, Google Fonts)
- Zielauflösung: 1920×1080 (Beamer), 16:9
- Bedienung durch eine Person vom Pult (Maus)
- Videos: YouTube IFrame API (unlisted, werbefrei konfiguriert)

---

## Dateistruktur (Phase 1 — wird in diesem Sprint angelegt)

```
mission-intelligence/
├── index.html              # Einstiegspunkt, lädt die App
├── CLAUDE.md               # Diese Datei
├── LICENSE                 # Proprietäre Lizenz, alle Rechte FFG
├── README.md               # Projektbeschreibung, Work-in-Progress-Hinweis
├── assets/
│   ├── logos/
│   │   ├── FFG_Logo.svg              # FFG-Logo (weiß/transparent)
│   │   ├── 5Missions_flower.svg      # Missionsblume (alle 5)
│   │   ├── Mission_Climate.svg       # Klimawandel meistern
│   │   ├── Mission_Cities.svg        # Klimaneutrale Stadt
│   │   ├── Mission_Cancer.svg        # Krebs besiegen
│   │   ├── Mission_Soil.svg          # Gesunde Böden
│   │   └── Mission_Waters.svg        # Wasser und Gewässer
│   ├── thumbnails/
│   │   └── [projektname].jpg         # Thumbnails für Missionspins (15 Stück)
│   └── fonts/                        # Asap-Schriftfamilie (lokal, Fallback)
├── data/
│   ├── projects.csv                  # Projektdaten (Schema siehe unten)
│   └── config.js                     # Konfiguration (Charts, Stat Cards, Video-IDs)
├── css/
│   ├── tokens.css                    # Design Tokens (Farben, Schriften, Abstände)
│   ├── layout.css                    # Grundlayout (Header, Sidebar, Map-Container)
│   └── slides.css                    # Folien-spezifische Styles + Übergänge
└── js/
    ├── app.js                        # Einstieg, Router, Folien-Orchestrierung
    ├── data.js                       # CSV-Loader, Datenmodell
    ├── map.js                        # Leaflet-Karte, Pins, Animationen
    ├── slides/
    │   ├── slide-start.js            # Folie 1: Startseite
    │   ├── slide-overview.js         # Folie 2: Gesamtübersicht
    │   └── slide-mission.js          # Folien 3–7: Missionsseiten (generisch)
    ├── components/
    │   ├── tile.js                   # Kachel-Komponente (Missionspin)
    │   ├── chart.js                  # Balken-/Kreisdiagramme
    │   └── legend.js                 # Sidebar-Legende
    └── youtube.js                    # YouTube IFrame API Wrapper
```

---

## CSV-Schema (`data/projects.csv`)

### Format-Konventionen

**Trennzeichen:** Semikolon (`;`) — kompatibel mit deutschsprachigem Excel (Datei speichern als „CSV UTF-8 (durch Trennzeichen getrennt)").  
**Dezimalzeichen:** Komma (`,`) für Dezimalzahlen — d.h. Koordinaten wie `48,2436` nicht `48.2436`.  
**Encoding:** UTF-8 mit BOM (Excel-Standard beim CSV-Export auf Deutsch).  
**Texte mit Semikolon:** In doppelte Anführungszeichen setzen, z.B. `"Universität Wien; TU Graz"`.  
**Mehrere Organisationen:** Innerhalb des Feldes mit ` | ` (Leerzeichen-Pipe-Leerzeichen) trennen.  
**Keywords:** Innerhalb des Feldes mit ` | ` trennen (nicht Komma, da Komma Dezimalzeichen ist).

### Pflichtfelder für alle Einträge

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutiger Bezeichner, lowercase, Bindestriche statt Leerzeichen (z.B. `wasserbaulabor`) |
| `type` | `pin` \| `point` | `pin` = Missionspin (interagierbar, Kachel), `point` = Missionspunkt (nur Marker) |
| `mission` | `climate` \| `cities` \| `cancer` \| `soil` \| `water` | Mission-Zuordnung |
| `name` | string | Projektname |
| `organisation` | string | Durchführende Organisation(en), mehrere mit ` \| ` getrennt |
| `city` | string | Standortstadt |
| `bundesland` | string | Bundesland (Werte: `Wien`, `Niederösterreich`, `Oberösterreich`, `Steiermark`, `Tirol`, `Salzburg`, `Kärnten`, `Vorarlberg`, `Burgenland`) |
| `lat` | float | Breitengrad WGS84, Dezimalkomma (z.B. `48,2436`) |
| `lng` | float | Längengrad WGS84, Dezimalkomma (z.B. `16,3850`) |
| `link` | string | Projekt-Webseite (vollständige URL) |
| `keywords` | string | Schlagworte, mit ` \| ` getrennt |

### Zusatzfelder für `type=pin`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `foerderung_eur` | integer | Förderbetrag in EUR, ganzzahlig, kein Punkt/Komma als Tausendertrenner (z.B. `850000`). Leer lassen wenn nicht verfügbar. |
| `thumbnail_path` | string | Relativer Pfad zum Thumbnail, z.B. `assets/thumbnails/wasserbaulabor.jpg` |
| `video_type` | `youtube` \| leer | `youtube` = dieser Pin zeigt Video statt Foto |
| `video_id` | string | YouTube Video-ID (11 Zeichen), nur wenn `video_type=youtube` |
| `video_pin_order` | integer | Sortierreihenfolge in der Missionsseitenlegende; Video-Pin bekommt höchste Zahl (erscheint zuletzt) |

### Regeln

- Pro Mission: genau 3 Einträge mit `type=pin`
- Pro Mission: genau 1 Pin hat `video_type=youtube` (steht in der Sidebar-Liste immer zuletzt)
- `type=point` Einträge: Felder `foerderung_eur`, `thumbnail_path`, `video_type`, `video_id`, `video_pin_order` leer lassen
- `foerderung_eur` darf leer sein; die UI zeigt es dann nicht an
- Koordinaten (`lat`/`lng`) sind Pflicht für alle Einträge
- Neue Spalten können jederzeit am Ende ergänzt werden — `data.js` ignoriert unbekannte Spalten

### Beispielzeilen

```csv
id;type;mission;name;organisation;city;bundesland;lat;lng;link;keywords;foerderung_eur;thumbnail_path;video_type;video_id;video_pin_order
wasserbaulabor;pin;water;Wasserbaulabor;Universität für Bodenkultur;Wien;Wien;48,2436;16,3850;https://iwa.boku.ac.at/;Wasserbau | Hydrologie | Monitoring;850000;assets/thumbnails/wasserbaulabor.jpg;youtube;xjCXpfE01yc;3
life-pannonic-salt;pin;water;LIFE Pannonic Salt;Land Burgenland;Eisenstadt;Burgenland;47,8458;16,5251;https://www.life-pannonic-salt.eu/;Salzlacken | Renaturierung | Biodiversität;1200000;assets/thumbnails/life-pannonic-salt.jpg;;;1
beispiel-punkt;point;water;Beispielprojekt Wasser;Universität Graz;Graz;Steiermark;47,0707;15,4395;https://example.com;Wasserqualität | Monitoring;;;;;;
```

---

## Konfigurationsdatei (`data/config.js`)

Inhalte die sich ändern können ohne den Code anzufassen, werden hier gepflegt — insbesondere die Chart-Daten auf Folie 2, die noch nicht feststehen.

```javascript
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
    showChartByMission: true,

    // Diagramm: Projekte pro Bundesland
    // true = aus CSV berechnet (automatisch), false = ausgeblendet
    showChartByBundesland: true,

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
```

**Änderungen an `config.js` erfordern keinen Code-Eingriff.** Neue Stat Cards einfach in das Array eintragen, Charts einzeln ein-/ausblenden. Sobald die Inhalte für Folie 2 feststehen, wird nur diese Datei aktualisiert.

---

## Design Tokens (`css/tokens.css`)

```css
:root {
  /* Mission Farben */
  --m-climate:     #d34a56;
  --m-cities:      #76a772;
  --m-cancer:      #d39c45;
  --m-soil:        #7d5e9c;
  --m-water:       #6a8cb7;

  /* Neutrale Palette (Taupe-Anker-System) */
  --paper:         #faf6f4;
  --neutral-50:    #f5efed;
  --neutral-100:   #e9e0dd;
  --neutral-200:   #d6c8c4;
  --neutral-300:   #b8a39f;
  --neutral-400:   #9a7e7a;   /* Taupe-Anker */
  --neutral-500:   #85746f;
  --neutral-600:   #695b57;
  --neutral-700:   #514643;
  --neutral-800:   #3d3431;
  --neutral-900:   #2b2422;

  /* FFG Brand */
  --ffg-red:       #e30613;
  --terracotta:    #b5604a;

  /* Typografie */
  --font-sans:     'Asap', system-ui, sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-semibold: 600;
  --font-weight-bold:    700;

  /* Layout */
  --sidebar-width:     280px;
  --header-height:     60px;
  --tab-bar-height:    44px;
  --map-border-radius: 0px;

  /* Animationen */
  --transition-slide:  600ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-pin:    400ms cubic-bezier(0.34, 1.56, 0.64, 1); /* Einflug-Bounce */
  --transition-fast:   150ms ease;
}
```

---

## Folienstruktur

### Folie 1 — Startseite (`slide-start`)

**Layout:** Vollbild, kein Header, kein Sidebar  
**Hintergrund:** Gedimmtes YouTube-Video (muted autoplay loop, eines der 9 Projektvideos — Video-ID wird in `config.js` definiert)  
**Inhalt:**
- Großer Typewriter-Effekt: Text tippt sich selbst: `"Mission Intelligence"`, dann Pause, dann löscht sich, dann beginnt neu (Loop)
- Untertitel darunter (statisch, klein): `"Die EU-Missionen in Österreich — Umsetzung mit Impact"`
- FFG-Logo unten links
- Klick irgendwo auf die Folie → Swoosh-Übergang zu Folie 2

**Swoosh-Übergang:** CSS-Klassen-basierter Übergang. Folie 1 gleitet nach links raus (`transform: translateX(-100%)`), Folie 2 kommt von rechts rein (`translateX(100%) → 0`). Dauer: 600ms, Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.

**Tabs:** NICHT sichtbar auf Folie 1.

---

### Folie 2 — Gesamtübersicht (`slide-overview`)

**Layout:** Header (mit Tabs) + Sidebar links + Kartenbereich  
**Beim ersten Öffnen:** Alle Missionspins und -punkte fliegen sequenziell von der Kartenmitte auf ihre Koordinaten (Stagger-Animation, 50ms Delay zwischen Pins)

**Header:**
- FFG-Logo links
- 6 Tabs (Übersicht + 5 Missionen), aktiver Tab hervorgehoben in Missionsfarbe

**Sidebar (links, 280px):**
- Oben: Ansichts-Toggle — `"Nach Mission"` | `"Nach Bundesland"`
- Bei `"Nach Mission"`: Missionslegende mit Pentagon-Icons + Projektanzahl pro Mission (klickbar zum Filtern)
- Bei `"Nach Bundesland"`: Liste der 9 Bundesländer + Projektanzahl (klickbar zum Filtern)
- Unten: Missionsblume SVG + Beschriftung `"Die 5 EU-Missionen"`

**Karte:**
- Österreich zentriert, Bundesländergrenzen sichtbar, umliegende Länder abgedunkelt (bestehende Implementierung übernehmen aus dem Piloten)
- Missionspins (Pentagon-SVG-Icons, farbkodiert) — interagierbar
- Missionspunkte (kleiner Kreis, farbkodiert, ~10px) — NICHT interagierbar, kein Hover/Click
- Klick auf Missionspin → Popup mit Kachel (siehe Kachel-Spezifikation)

**Unter der Karte (oder als Overlay-Panel):**
- Statistik-Panel, gesteuert durch `data/config.js` → `overview`:
  - Zwei kompakte Balkendiagramme (nur wenn in `config.js` aktiviert): Projekte pro Mission + Projekte pro Bundesland
  - Stat Cards: frei konfigurierbare Kennzahl-Kacheln aus `config.js` → `statCards` (leer = Panel ausgeblendet)
  - Fördermittel-Summe: nur anzeigen wenn Anteil Pins mit Daten ≥ `foerderungMinCoverage`
- **Inhalte stehen noch nicht fest** — Chart-Panel in Phase 2 als Platzhalter bauen, Befüllung erfolgt später über `config.js` ohne Code-Eingriff

---

### Folien 3–7 — Missionsseiten (`slide-mission`, generische Komponente)

Jede Missionsfolie ist eine Instanz derselben Komponente, parametrisiert mit dem Mission-Key (`climate`, `cities`, `cancer`, `soil`, `water`).

**Layout:** Identisch zu Folie 2 (Header + Sidebar + Karte)

**Beim ersten Öffnen:** Nur die Pins und Punkte der jeweiligen Mission fliegen ein

**Sidebar:**
- Oben: Missionsname + Pentagon-Icon (groß)
- Projektliste: Die 3 Missionspins der Mission, aufgelistet nach `video_pin_order`
  - Jeder Eintrag: kleine Vorschau (Thumbnail oder Video-Icon) + Projektname + Kurzinfo
  - Klick auf Eintrag → Karte fliegt animiert zum Pin (`map.flyTo`), danach öffnet sich die Kachel
  - Video-Pin steht immer als letzter Eintrag
- Unten: Missionsblume SVG

**Karte:**
- Zeigt nur Pins und Punkte der jeweiligen Mission
- Missionspins: Pentagon-SVG-Icons (wie Übersicht)
- Missionspunkte: kleine Kreise

---

## Kachel-Spezifikation (Missionspin Popup)

Erscheint als zentriertes Modal über der Karte. Breite: 520px.

**Kachel mit Foto (type: pin, video_type leer):**
```
┌─────────────────────────────────┐
│  [Thumbnail 16:9]               │
├─────────────────────────────────┤
│  [Mission-Pentagon] Mission     │
│  Projektname (groß)             │
│  Organisation                   │
│  📍 Stadt, Bundesland           │
│  🏷 keyword1 · keyword2 · ...   │
│  💰 € X,X Mio. Förderung        │  ← nur wenn vorhanden
│                          [↗ Link]│
└─────────────────────────────────┘
```

**Kachel mit Video (video_type: youtube):**
- Identisch, aber statt Thumbnail: YouTube-Thumbnail mit Play-Button-Overlay
- Klick auf Thumbnail → YouTube IFrame API öffnet Video, `requestFullscreen()` sofort (innerhalb des Click-Handlers)
- Nach Video-Ende oder Escape: Kachel bleibt offen, Fullscreen wird beendet

---

## Karten-Implementierung

Basis: Leaflet.js 1.9.4 + CartoDB Positron Tiles  
GeoJSON Bundesländer: `https://raw.githubusercontent.com/ginseng666/GeoJSON-TopoJSON-Austria/master/2017/simplified-99.5/laender_995_geo.json` (wird zur Build-Zeit eingebettet)

**Bestehende Implementierungen übernehmen:**
- Österreich-Maske (dunkler Overlay außerhalb)
- Bundesländer-Grenzen
- Spider-Fan Layout für geclusterte Pins (2km Threshold, 1.8° Radius)
- Cluster-Verbindungslinien

**Neue Implementierungen:**
- Missionspunkte: `L.circleMarker`, Radius 7px, Missionsfarbe, `interactive: false`
- Einflug-Animation: Pins starten bei `map.getCenter()`, bewegen sich zu Zielkoordinaten, mit `--transition-pin` Bounce-Easing. Stagger: 50ms pro Pin.
- `map.flyTo(coords, 11)` bei Klick auf Sidebar-Eintrag (Missionsseiten)

---

## YouTube IFrame API (`js/youtube.js`)

```javascript
// Initialisierung
YT.ready(() => { /* ... */ });

// Video öffnen + Fullscreen
function openVideoFullscreen(videoId) {
  // 1. Erstelle/zeige Modal mit iframe
  // 2. player.playVideo()
  // 3. iframe.requestFullscreen() — MUSS synchron im Click-Handler aufgerufen werden
  // 4. Bei onStateChange ENDED: exitFullscreen(), Modal bleibt offen
}
```

**Wichtig:** `requestFullscreen()` muss innerhalb des ursprünglichen Click-Event-Handlers aufgerufen werden, nicht in einem asynchronen Callback. Ansonsten verweigert der Browser die Anfrage.

---

## Phasenplan

### Phase 1 — Fundament (aktueller Sprint)
**Ziel:** Claudio kann parallel Daten eingeben, Claude Code baut die Infrastruktur

Aufgaben:
- [ ] `LICENSE` mit folgendem Inhalt anlegen:

```
Copyright (c) 2026 FFG – Österreichische Forschungsförderungsgesellschaft mbH
Alle Rechte vorbehalten.

Dieses Repository und sein Inhalt – einschließlich Code, Daten, Grafiken und Logos –
sind Eigentum der FFG. Eine Vervielfältigung, Weitergabe oder Nutzung in jeglicher
Form ohne ausdrückliche schriftliche Genehmigung der FFG ist untersagt.

All rights reserved. No part of this repository may be reproduced, distributed,
or used in any form without explicit written permission from FFG.
```

- [ ] `README.md` mit folgendem Inhalt anlegen:

```markdown
# Mission Intelligence

**Interaktive Präsentation der EU-Missionen in Österreich**

Entwickelt von der FFG (Österreichische Forschungsförderungsgesellschaft)
für die Jahrestagung Missionsorientierte Innovationspolitik 2026.

---

⚠️ **Work in Progress** — Dieses Projekt befindet sich in aktiver Entwicklung.
Inhalte und Daten sind vorläufig und nicht als finale Aussagen der FFG zu verstehen.

---

Für Rückfragen: [ffg.at](https://www.ffg.at)
```

- [ ] Dateistruktur anlegen (alle Ordner, leere Dateien mit Platzhaltern)
- [ ] `tokens.css` mit allen Design Tokens
- [ ] `data/config.js` mit allen Konfigurationswerten (Charts deaktiviert als Platzhalter, Stat Cards leer)
- [ ] `data/projects.csv` mit Beispieldaten (3–5 Zeilen, validiertes Schema)
- [ ] `data.js`: CSV einlesen (Semikolon-getrennt, Dezimalkomma), parsen, validieren, Datenmodell aufbauen; unbekannte Spalten ignorieren (Erweiterbarkeit)
- [ ] `app.js`: Router mit 7 Folien, Tab-Navigation, Swoosh-Übergang (CSS-basiert)
- [ ] `layout.css`: Header, Tab-Bar, Sidebar, Map-Container
- [ ] Statischer Shell: Alle 7 Folien-Container im DOM, nur aktive sichtbar
- [ ] README.md mit Setup-Anleitung (GitHub Pages, Daten befüllen)

**Abnahmekriterium:** Die 7 Folien sind durch Tabs navigierbar, Swoosh-Übergang funktioniert, CSV wird korrekt eingelesen und in der Browser-Konsole geloggt.

### Phase 2 — Übersichtskarte
- [ ] Leaflet-Karte mit Österreich-Maske (aus Piloten migrieren)
- [ ] Missionspins (Pentagon-Icons) und Missionspunkte (Kreise) rendern
- [ ] Einflug-Animation beim ersten Öffnen
- [ ] Sidebar: Missions-/Bundesland-Toggle + Filter
- [ ] Popup/Kachel für Missionspins (Foto-Version)
- [ ] Balkendiagramme (Chart.js oder D3, klein)
- [ ] Fördermittel-Summe

### Phase 3 — Missionsseiten
- [ ] Generische `slide-mission` Komponente
- [ ] Missionsfilter auf Karte
- [ ] Sidebar-Projektliste mit Fly-to-Animation
- [ ] Kachel Video-Version (YouTube IFrame API + Fullscreen)

### Phase 4 — Startseite
- [ ] Typewriter-Effekt (loop)
- [ ] YouTube Hintergrundvideo (muted, autoplay, loop, gedimmt)
- [ ] Swoosh-Übergang bei Klick

### Phase 5 — Finalisierung
- [ ] Offline-Fallback wenn Kacheln nicht laden
- [ ] Keyboard-Navigation (Pfeiltasten zwischen Folien)
- [ ] Vollbild-Modus (F11 oder Button)
- [ ] Test auf Veranstaltungsrechner (Windows, Chrome)
- [ ] GitHub Pages Deployment-Check

---

## Bekannte offene Punkte

| Punkt | Status | Verantwortlich |
|---|---|---|
| Klagenfurt Video-ID `r1OBDsP123s` | Verdächtig, prüfen | Claudio |
| GPS-Koordinaten aller Projekte | Nicht verifiziert | Claudio |
| FFG Logo (SVG mit korrektem Text) | Aktuell nur Symbol sichtbar | Claudio (IT/Brand anfragen) |
| Thumbnails für 15 Missionspins | Noch nicht beschafft | Claudio |
| Werbung auf YouTube-Videos | YouTube Studio → Monetarisierung deaktivieren | Claudio |
| Tabs auf Startseite | Nicht sichtbar (Entscheidung) | ✓ |
| Fördermittel-Vollständigkeit | Partiell, Schwellenwert 50% | ✓ |

---

## Nicht in Scope

- Barrierefreiheit (WCAG)
- Mobile Ansicht
- Mehrsprachigkeit
- CMS oder Admin-Interface
- Analytics
- Print-Ausgabe
