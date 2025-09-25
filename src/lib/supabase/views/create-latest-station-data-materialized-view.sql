-- Create materialized view for latest station data
-- This view provides the latest data point for each station
CREATE MATERIALIZED VIEW latest_station_data_materialized AS
SELECT DISTINCT ON (station_id)
    id,
    station_id,
    wind_speed,
    wind_gust,
    wind_min_speed,
    direction,
    temperature,
    updated_at
FROM station_data
ORDER BY station_id, updated_at DESC;

-- Create index for better performance
CREATE INDEX idx_latest_station_data_station_id ON latest_station_data_materialized(station_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_latest_station_data()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW latest_station_data_materialized;
END;
$$ LANGUAGE plpgsql;
