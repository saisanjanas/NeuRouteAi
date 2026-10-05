# ==========================================
# CLEAN REAL LANDSLIDE DATA
# ==========================================

import csv
from pathlib import Path

# Get ML folder
BASE_DIR = Path(__file__).resolve().parent

# Input and output files
INPUT_FILE = BASE_DIR / "data" / "Global_Landslide_Catalog_Export_rows.csv"
OUTPUT_FILE = BASE_DIR / "data" / "ne_india_landslides.csv"

# North-Eastern states
NE_STATES = {
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Tripura",
    "Sikkim"
}

# ==========================================
# READ REAL NASA LANDSLIDE DATA
# ==========================================

with open(INPUT_FILE, "r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)

    rows = list(reader)

print("Original rows:", len(rows))

# ==========================================
# FILTER NORTH-EASTERN INDIA
# ==========================================

filtered_rows = []

for row in rows:

    state = str(row.get("admin_division_name", "")).strip()

    latitude = row.get("latitude", "")
    longitude = row.get("longitude", "")

    # Keep only NE states with coordinates
    if state in NE_STATES and latitude and longitude:
        filtered_rows.append(row)

print("North-East rows:", len(filtered_rows))

# ==========================================
# SAVE CLEAN DATASET
# ==========================================

if filtered_rows:

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=filtered_rows[0].keys()
        )

        writer.writeheader()
        writer.writerows(filtered_rows)

# ==========================================
# SHOW RECORDS BY STATE
# ==========================================

state_counts = {}

for row in filtered_rows:

    state = row.get("admin_division_name", "").strip()

    state_counts[state] = state_counts.get(state, 0) + 1

print("\nRecords by state:")

for state, count in sorted(state_counts.items()):
    print(f"{state}: {count}")

print("\nSaved to:")
print(OUTPUT_FILE)  