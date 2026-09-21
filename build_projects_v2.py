"""
Erzeugt data/projects_v2.csv aus data/projects.csv + Backend Project Selection.xlsx.

Korrigiert gegenüber projects.csv:
  1. foerderung_eur  — frisch aus der xlsx, auf ganze EUR gerundet
                       (geocode_projects-3.py hatte den Dezimalpunkt gelöscht → ×10 … ×100000).
                       Quelle ist die korrigierte xlsx vom 2026-09-21: foerderung_eur = EU-Förderung
                       der jeweiligen Organisation (CORDIS ecContribution) für EU FP und LIFE.
  2. Standorte       — Bundesland-Korrekturen geprüft, Nominatim-Fehltreffer korrigiert,
                       doppelte Ortsnamen vereinheitlicht
  3. Datumsangaben   — neue Spalten project_start / project_end im ISO-8601-Format

Alle anderen Felder (Koordinaten, Pin-Felder, Video-IDs) werden unverändert übernommen.

Ausführung (nur Standardbibliothek + openpyxl):
    python3 build_projects_v2.py
"""

import csv
import datetime
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

from openpyxl import load_workbook

PROJECT_DIR = Path(__file__).resolve().parent
XLSX_FILE = PROJECT_DIR / "Backend Project Selection.xlsx"
XLSX_SHEET = "Tabelle1"
BASE_CSV_FILE = PROJECT_DIR / "data" / "projects.csv"
OUTPUT_CSV_FILE = PROJECT_DIR / "data" / "projects_v2.csv"

CSV_DELIMITER = ";"
CSV_ENCODING = "utf-8-sig"  # UTF-8 mit BOM, wie von deutschsprachigem Excel erwartet
NEW_COLUMNS = ["project_start", "project_end"]

# Bundesland-Fehler in der xlsx (Stadt, Bundesland_xlsx) -> korrektes Bundesland.
# Identisch mit geocode_projects-3.py; wird hier nur noch gegen projects.csv geprüft.
BUNDESLAND_CORRECTIONS = {
    ("Salzburg", "Niederösterreich"): "Salzburg",
    ("Linz", "Niederösterreich"): "Oberösterreich",
    ("Wien", "Niederösterreich"): "Wien",
    ("Klagenfurt am Wörthersee", "Wien"): "Kärnten",
    ("Klagenfurt Am Wörthersee", "Wien"): "Kärnten",
}

# Bundesland-Fehler, die schon in projects.csv falsch sind (Stadt, Bundesland_alt) -> korrekt.
BUNDESLAND_FIXES = {
    ("Niederranna", "Kärnten"): "Oberösterreich",  # Global Hydro Energy, Hofkirchen im Mühlkreis
}

# Gleicher Ort unter zwei Namen (identische Koordinaten) -> ein Name.
CITY_ALIASES = {
    "Tulln": "Tulln an der Donau",
}

# Nominatim-Fehltreffer: Suche nach "Ort, Bundesland" traf Fluss/See statt Gemeinde.
# Koordinaten = Ortszentrum laut OpenStreetMap, 4 Nachkommastellen wie im Rest der Datei.
COORD_CORRECTIONS = {
    "Enns|Oberösterreich":      ("48,2130", "14,4757"),  # war 47,5549/14,2171 (Fluss Enns, Stmk.)
    "Traun|Oberösterreich":     ("48,2206", "14,2394"),  # war 47,9186/13,8023 (Traunsee-Gebiet)
    "Hagenberg|Oberösterreich": ("48,3683", "14,5167"),  # war 48,392/13,8089 (nicht Hagenberg i. M.)
    "Niederranna|Oberösterreich": ("48,4672", "13,7981"),  # war 46,835/14,502 (manuell, Kärnten)
}

# Seit der korrigierten xlsx (2026-09-21) für alle Quellen die EU-Förderung der Organisation;
# "Project Cost" sind die Kosten und wird hier nicht verwendet.
DEFAULT_FUNDING_COLUMN = "foerderung_eur"

MISSING_MARKERS ={None, "", "N/A", "n/a"}  # so kennzeichnet die xlsx fehlende Förderbeträge

DATE_DMY_LONG =re.compile(r"^(\d{2})\.(\d{2})\.(\d{4})$")   # FFG:  01.10.2024
DATE_DMY_SHORT = re.compile(r"^(\d{2})\.(\d{2})\.(\d{2})$")  # LIFE: 01.07.25
DATE_YEAR_ONLY = re.compile(r"^\d{4}$")                      # EU FP Startdatum: nur Jahr


def load_xlsx_by_id():
    """Liest die xlsx und gibt {id: {Spaltenname: Wert}} zurück."""
    ws = load_workbook(XLSX_FILE, read_only=True, data_only=True)[XLSX_SHEET]
    rows = ws.iter_rows(values_only=True)
    header = next(rows)
    records = {}
    for row in rows:
        record = dict(zip(header, row))
        records[str(record["id"])] = record
    return records


def format_funding(value):
    """Wandelt einen xlsx-Förderbetrag (float/None/'N/A') in ganze EUR als String um."""
    if value in MISSING_MARKERS:
        return ""
    # Decimal(str(...)) vermeidet Float-Rundungsartefakte; kaufmännisch runden statt abschneiden
    return str(Decimal(str(value)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def format_date(value):
    """Normalisiert die vier Datumsformate der xlsx auf ISO 8601 (YYYY-MM-DD oder YYYY)."""
    if value is None or value == "":
        return ""
    if isinstance(value, datetime.datetime):
        return value.date().isoformat()
    text = str(value).strip()
    if DATE_YEAR_ONLY.match(text):
        # Bewusst nur das Jahr: Monat/Tag sind in der Quelle nicht vorhanden, nicht erfinden
        return text
    match = DATE_DMY_LONG.match(text)
    if match:
        day, month, year = match.groups()
        return datetime.date(int(year), int(month), int(day)).isoformat()
    match = DATE_DMY_SHORT.match(text)
    if match:
        day, month, year = match.groups()
        return datetime.date(2000 + int(year), int(month), int(day)).isoformat()
    raise ValueError(f"Unbekanntes Datumsformat: {value!r}")


def check_bundesland(row, xlsx_record):
    """Prüft, dass das Bundesland in der CSV dem korrigierten xlsx-Bundesland entspricht."""
    key = (xlsx_record["city"], xlsx_record["bundesland"])
    expected = BUNDESLAND_CORRECTIONS.get(key, xlsx_record["bundesland"])
    if row["bundesland"] != expected:
        raise ValueError(
            f"{row['id']}: Bundesland {row['bundesland']!r} in CSV, erwartet {expected!r}"
        )


def fix_location(row):
    """Korrigiert Bundesland, Ortsnamen und bekannte falsche Koordinaten; gibt True bei Änderung zurück."""
    changed = False
    bl_key = (row["city"], row["bundesland"])
    if bl_key in BUNDESLAND_FIXES:
        row["bundesland"] = BUNDESLAND_FIXES[bl_key]
        changed = True
    if row["city"] in CITY_ALIASES:
        row["city"] = CITY_ALIASES[row["city"]]
        changed = True
    key = f"{row['city']}|{row['bundesland']}"
    if key in COORD_CORRECTIONS:
        row["lat"], row["lng"] = COORD_CORRECTIONS[key]
        changed = True
    return changed


def build():
    """Liest Basis-CSV und xlsx, wendet alle Korrekturen an und schreibt projects_v2.csv."""
    xlsx = load_xlsx_by_id()

    with open(BASE_CSV_FILE, encoding=CSV_ENCODING, newline="") as f:
        reader = csv.DictReader(f, delimiter=CSV_DELIMITER)
        base_columns = reader.fieldnames
        rows = list(reader)

    missing = [row["id"] for row in rows if row["id"] not in xlsx]
    if missing:
        raise KeyError(f"{len(missing)} IDs aus projects.csv fehlen in der xlsx: {missing[:5]}")

    funding_changed = location_changed = 0
    for row in rows:
        record = xlsx[row["id"]]
        check_bundesland(row, record)

        new_funding = format_funding(record[DEFAULT_FUNDING_COLUMN])
        if new_funding != row["foerderung_eur"]:
            funding_changed += 1
        row["foerderung_eur"] = new_funding

        if fix_location(row):
            location_changed += 1

        row["project_start"] = format_date(record["Project Start Date"])
        row["project_end"] = format_date(record["Project End Date"])

    with open(OUTPUT_CSV_FILE, "w", encoding=CSV_ENCODING, newline="") as f:
        writer = csv.DictWriter(f, fieldnames=base_columns + NEW_COLUMNS, delimiter=CSV_DELIMITER)
        writer.writeheader()
        writer.writerows(rows)

    print(f"{len(rows)} Zeilen -> {OUTPUT_CSV_FILE.relative_to(PROJECT_DIR)}")
    print(f"  foerderung_eur geändert: {funding_changed}")
    print(f"  Standorte geändert:      {location_changed}")


if __name__ == "__main__":
    build()
