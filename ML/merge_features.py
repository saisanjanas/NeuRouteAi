import csv

# Real datasets
rainfall_file = r".\ML\data\ne_india_landslides_with_imd_rainfall.csv"
elevation_file = r".\ML\data\ne_india_landslides_with_elevation.csv"

# Final combined dataset
output_file = r".\ML\data\ne_india_ml_dataset.csv"


# -----------------------------
# Read rainfall dataset
# -----------------------------
rainfall_data = {}

with open(rainfall_file, encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)

    for row in reader:
        rainfall_data[row["event_id"]] = row


# -----------------------------
# Read elevation dataset
# -----------------------------
elevation_data = {}

with open(elevation_file, encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)

    for row in reader:
        elevation_data[row["event_id"]] = row


# -----------------------------
# Merge datasets
# -----------------------------
merged = []

for event_id, rainfall_row in rainfall_data.items():

    if event_id not in elevation_data:
        continue

    row = rainfall_row.copy()

    row["srtm_elevation_m"] = elevation_data[event_id]["srtm_elevation_m"]

    merged.append(row)


# -----------------------------
# Save final dataset
# -----------------------------
if merged:

    fieldnames = list(merged[0].keys())

    with open(
        output_file,
        "w",
        newline="",
        encoding="utf-8"
    ) as f:

        writer = csv.DictWriter(f, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(merged)


print("Merge completed!")
print("Records:", len(merged))
print("Output:", output_file)