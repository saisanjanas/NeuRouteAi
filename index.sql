-- ============================================================
-- NER SMART LOGISTICS
-- PostgreSQL / PostGIS Spatial Indexes
-- ============================================================

CREATE INDEX vehicle_locations_geo_idx
ON vehicle_locations
USING GIST (location);

CREATE INDEX districts_geo_idx
ON districts
USING GIST (geometry);

CREATE INDEX roads_geo_idx
ON roads
USING GIST (geometry);

CREATE INDEX bridges_geo_idx
ON bridges
USING GIST (geometry);

CREATE INDEX incidents_geo_idx
ON incidents
USING GIST (location);

CREATE INDEX weather_data_geo_idx
ON weather_data
USING GIST (location);

CREATE INDEX hazard_predictions_geo_idx
ON hazard_predictions
USING GIST (location);

CREATE INDEX routes_origin_geo_idx
ON routes
USING GIST (origin);

CREATE INDEX routes_destination_geo_idx
ON routes
USING GIST (destination);

CREATE INDEX routes_geometry_geo_idx
ON routes
USING GIST (route_geometry);

CREATE INDEX alerts_geo_idx
ON alerts
USING GIST (location);