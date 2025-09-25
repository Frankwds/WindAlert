-- Create materialized view for latest station data with weather stations join
-- This view provides the latest data point for each active weather station
CREATE MATERIALIZED VIEW latest_station_data_materialized AS
SELECT DISTINCT ON (station_id)
    sd.id,
    ws.station_id,
    sd.wind_speed,
    sd.wind_gust,
    sd.wind_min_speed,
    sd.direction,
    sd.temperature,
    sd.updated_at
FROM station_data sd
JOIN weather_stations ws ON sd.station_id = ws.station_id
WHERE ws.is_active = true
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
