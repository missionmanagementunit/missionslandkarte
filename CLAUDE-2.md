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

## Dateistruktur (Stand: Phase 5 abgeschlossen)

```
missionslandkarte/
├── index.html                        # Einstiegspunkt, lädt die App
├── CLAUDE-2.md                       # Diese Datei (in .gitignore)
├── .nojekyll                         # Verhindert Jekyll-Verarbeitung auf GitHub Pages
├── .gitignore                        # Ignoriert CLAUDE*.md, .DS_Store, *.code-workspace
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions Deployment-Workflow
├── assets/
│   ├── logos/
│   │   ├── FFG white.png             # FFG-Logo weiß (PNG) — verwendet in Header + Folie 1
│   │   ├── FFG_Logo.svg              # FFG-Logo dunkel (nicht mehr verwendet)
│   │   ├── 5Missions_flower.svg      # Missionsblume — Text als Pfade (kein Font-Problem)
│   │   ├── Mission_Climate.svg       # Klimawandel meistern
│   │   ├── Mission_Cities.svg        # Klimaneutrale Stadt
│   │   ├── Mission_Cancer.svg        # Krebs besiegen
│   │   ├── Mission_Soil.svg          # Gesunde Böden
│   │   └── Mission_Waters.svg        # Wasser und Gewässer
│   └── thumbnails/
│       └── [projektname].[ext]       # 15 Thumbnails (jpg/png/webp)
├── data/
│   ├── projects.csv                  # Projektdaten — 1193 Zeilen, 16 Spalten
│   └── config.js                     # Konfiguration (Video-IDs, Charts, Missions-Labels)
├── css/
│   ├── tokens.css                    # Design Tokens (Farben, Schriften, Abstände)
│   ├── layout.css                    # Grundlayout + Fullscreen-Button
│   └── slides.css                    # Folien-Styles, Übergänge, Fly-in, Tile-Modal
└── js/
    ├── app.js                        # Router, Swoosh-Übergang, Tab-Navigation
    ├── data.js                       # CSV-Loader, Datenmodell, MISSION_ALIASES
    ├── map.js                        # Leaflet-Karte Factory (APP_MAP.create)
    ├── youtube.js                    # YouTube IFrame API Wrapper
    ├── fullscreen.js                 # Vollbild-Toggle (F-Taste + Button)
    ├── keyboard.js                   # Tastatur-Navigation (Zahlen + Pfeiltasten)
    ├── slides/
    │   ├── slide-start.js            # Folie 1: Typewriter + Hintergrundvideo
    │   ├── slide-overview.js         # Folie 2: Gesamtübersicht
    │   └── slide-mission.js          # Folien 3–7: Missionsseiten (APP_MISSION_NAV)
    └── components/
        ├── tile.js                   # Kachel-Modal (Foto + Video, APP_TILE)
        ├── chart.js                  # Statistik-Panel (derzeit deaktiviert)
        └── legend.js                 # Sidebar-Legende (Mission/Bundesland-Toggle)
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
  // Aktuell: KING-Projekt Graz — bei Bedarf hier austauschen
  startVideoId: 'Tw96q4yA7uc',

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

### Phase 1 — Fundament ✅ abgeschlossen
- Dateistruktur, Design Tokens, CSV-Loader, 7-Folien-Router, Swoosh-Übergang

### Phase 2 — Übersichtskarte ✅ abgeschlossen
- Leaflet-Karte (CartoDB Positron), Österreich-Maske, Bundesländergrenzen
- Missionspins (SVG-Icons) + Missionspunkte (Pie-Chart-Kreise)
- Spider-Fan bei geclusterten Pins, Z-Index-Fix (Pins immer über Punkten)
- Fly-in-Animation (opacity+scale, Gate: Tiles geladen + 800ms Minimum)
- Sidebar: Mission/Bundesland-Toggle + Filter
- Tile-Modal (Foto-Version)

### Phase 3 — Missionsseiten ✅ abgeschlossen
- Generische `slide-mission`-Komponente für Folien 3–7
- Map-Factory (`APP_MAP.create`) für 6 unabhängige Leaflet-Instanzen
- Sidebar: Pins sortiert nach `video_pin_order`, Thumbnail-Vorschau
- FlyTo bei Sidebar-/Karten-Klick (2s, dann Tile öffnen nach 1.8s)
- Tile-Video-Version: YouTube IFrame API, synchrones `requestFullscreen()`
- Fly-Back zu Ausgangsansicht beim Tile-Schließen

### Phase 4 — Startseite ✅ abgeschlossen
- Typewriter-Effekt auf Titel (loop: tippen → Pause → löschen → repeat)
- YouTube-Hintergrundvideo (muted, autoplay, loop, 80% gedimmt)
- Untertitel deaktiviert via `player.unloadModule('captions')`
- Swoosh-Übergang bei Klick bereits in Phase 1 implementiert

### Phase 5 — Finalisierung (Stand: Juli 2026)
- ✅ Keyboard-Navigation:
  - Coverfolie: Pfeil rechts → Übersicht
  - Folien 2–7: Zahlentasten 1–5 → Missionsfolie 3–7
  - Missionsfolien: Pfeiltasten ← → ↑ ↓ → Pin-Navigation (flyTo + Tile öffnet sich)
- ✅ Vollbild-Modus: F-Taste + Button oben rechts im Header, Icon wechselt
- ✅ GitHub Pages Deployment: https://missionmanagementunit.github.io/missionslandkarte/
  - Workflow: `.github/workflows/deploy.yml` (Actions-basiert, nicht legacy)
  - Auto-Deploy bei jedem Push auf `main`
- [ ] Offline-Fallback wenn Kartenkacheln nicht laden
- [ ] Test auf Veranstaltungsrechner (Windows, Chrome)

---

## Bekannte offene Punkte

| Punkt | Status | Verantwortlich |
|---|---|---|
| Klagenfurt Video-ID `r1OBDsP123s` | Verdächtig, prüfen ob korrekt | Claudio |
| GPS-Koordinaten aller Projekte | Nicht verifiziert | Claudio |
| FFG Logo | ✅ Gelöst: `FFG white.png` ersetzt SVG | — |
| Thumbnails 15 Missionspins | ✅ Neue Projektfotos eingebunden | — |
| 5Missions_flower.svg Font | ✅ Text zu Pfaden konvertiert | — |
| Thumbnail-Pfade (3 kaputte) | ✅ In projects.csv korrigiert (Danube4All, UNCAN, Tumorzentrum, DECO2) | — |
| Werbung auf YouTube-Videos | YouTube Studio → Monetarisierung deaktivieren | Claudio |
| Offline-Fallback Kartenkacheln | Noch nicht implementiert | — |
| Test Windows/Chrome (Veranstaltungsrechner) | Noch ausstehend | Claudio |

---

## Nicht in Scope

- Barrierefreiheit (WCAG)
- Mobile Ansicht
- Mehrsprachigkeit
- CMS oder Admin-Interface
- Analytics
- Print-Ausgabe
