-- District-wise accessibility status

SELECT
    d.district_name,
    d.state_name,
    a.score,
    a.road_score,
    a.bridge_score,
    a.weather_score,
    a.hazard_score,
    a.traffic_score,
    a.status,
    a.calculated_at
FROM districts d
LEFT JOIN accessibility_scores a
    ON d.district_id = a.district_id
ORDER BY a.score ASC;