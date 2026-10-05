import csv
import requests
import time

# Input: our real NASA landslide dataset
input_file = r".\ML\data\ne_india_landslides.csv"

# Output: same real landslide records + real SRTM elevation
output_file = r".\ML\data\ne_india_landslides_with_elevation.csv"

# Read landslide records
rows = []

with open(input_file, encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)

    for row in reader:
        try:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            rows.append((row, lat, lon))
        except:
            pass

print("Landslide records:", len(rows))

# Get elevation in batches
results = []

for start in range(0, len(rows), 50):

    batch = rows[start:start + 50]

    locations = "|".join(
        f"{lat},{lon}"
        for _, lat, lon in batch
    )

    url = "https://api.opentopodata.org/v1/srtm30m"

    response = requests.get(
        url,
        params={
            "locations": locations,
            "interpolation": "bilinear"
        },
        timeout=60
    )

    data = response.json()

    if data.get("status") != "OK":
        print("API error:", data)
        break

    elevations = data["results"]

    for (row, lat, lon), result in zip(batch, elevations):

        row["srtm_elevation_m"] = result.get("elevation")

        results.append(row)

    print(
        "Processed:",
        min(start + 50, len(rows)),
        "/",
        len(rows)
    )

    time.sleep(1)


# Save output
if results:

    fieldnames = list(results[0].keys())

    with open(
        output_file,
        "w",
        newline="",
        encoding="utf-8"
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(results)

    print("\nDone!")
    print("Output:", output_file)