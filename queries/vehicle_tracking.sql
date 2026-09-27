-- Get latest vehicle locations

SELECT
    v.vehicle_id,
    v.vehicle_number,
    vl.latitude,
    vl.longitude,
    vl.speed,
    vl.recorded_at
FROM vehicles v
JOIN vehicle_locations vl
    ON v.vehicle_id = vl.vehicle_id
ORDER BY vl.recorded_at DESC;