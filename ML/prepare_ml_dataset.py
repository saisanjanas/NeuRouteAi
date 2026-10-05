import csv

input_file = r".\ML\data\ne_india_ml_dataset.csv"
output_file = r".\ML\data\landslide_ml_ready.csv"

rows = []

with open(input_file, encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)

    for row in reader:

        # Keep only records with real required values
        if row["imd_rainfall_mm_day"] in ("", None):
            continue

        if row["srtm_elevation_m"] in ("", None):
            continue

        if row["landslide_size"] in ("", "unknown"):
            continue

        rows.append({
            "rainfall_mm_day": row["imd_rainfall_mm_day"],
            "elevation_m": row["srtm_elevation_m"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "landslide_trigger": row["landslide_trigger"],
            "landslide_category": row["landslide_category"],
            "landslide_size": row["landslide_size"]
        })


with open(
    output_file,
    "w",
    newline="",
    encoding="utf-8"
) as f:

    fieldnames = [
        "rainfall_mm_day",
        "elevation_m",
        "latitude",
        "longitude",
        "landslide_trigger",
        "landslide_category",
        "landslide_size"
    ]

    writer = csv.DictWriter(f, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(rows)


print("ML dataset created!")
print("Records:", len(rows))
print("Output:", output_file)