-- Route risk and estimated travel information

SELECT
    route_id,
    vehicle_id,
    shipment_id,
    distance_km,
    estimated_time_minutes,
    risk_score,
    route_status,
    created_at
FROM routes
ORDER BY risk_score DESC;