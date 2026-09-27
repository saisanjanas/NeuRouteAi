-- Find incidents within 5 km of a location

SELECT
    incident_id,
    incident_type,
    description,
    severity,
    status,
    ST_Distance(
        location,
        ST_SetSRID(
            ST_MakePoint(91.7362, 26.1445),
            4326
        )::geography
    ) / 1000 AS distance_km
FROM incidents
WHERE ST_DWithin(
    location,
    ST_SetSRID(
        ST_MakePoint(91.7362, 26.1445),
        4326
    )::geography,
    5000
)
ORDER BY distance_km;