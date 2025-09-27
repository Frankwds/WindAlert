-- Create function to compress station data older than specified hours
CREATE OR REPLACE FUNCTION compress_old_station_data(hours_old INTEGER DEFAULT 24)
RETURNS TABLE(
  original_records INTEGER,
  compressed_records INTEGER,
  stations_processed INTEGER
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_original_records INTEGER := 0;
  v_compressed_records INTEGER := 0;
  v_stations_processed INTEGER := 0;
BEGIN
  -- Step 1: Create compressed data for records older than specified hours
  WITH compressed_data AS (
    SELECT 
      station_id,
      DATE_TRUNC('hour', updated_at + INTERVAL '45 minutes') as compressed_hour,
      ROUND(AVG(wind_speed), 1) as wind_speed,
      ROUND(MAX(wind_gust), 1) as wind_gust,
      ROUND(MIN(wind_min_speed), 1) as wind_min_speed,
      ROUND(AVG(direction), 1) as direction,
      ROUND(AVG(temperature), 1) as temperature,
      MAX(updated_at) as updated_at
    FROM station_data 
    WHERE updated_at < NOW() - (hours_old || ' hours')::INTERVAL
    GROUP BY station_id, DATE_TRUNC('hour', updated_at + INTERVAL '45 minutes')
  ),
  -- Step 2: Delete original data older than specified hours
  deleted_data AS (
    DELETE FROM station_data 
    WHERE updated_at < NOW() - (hours_old || ' hours')::INTERVAL
    RETURNING station_id, updated_at
  ),
  -- Step 3: Insert compressed data with upsert
  inserted_data AS (
    INSERT INTO station_data (station_id, wind_speed, wind_gust, wind_min_speed, direction, temperature, updated_at)
    SELECT 
      station_id,
      wind_speed,
      wind_gust,
      wind_min_speed,
      direction,
      temperature,
      compressed_hour
    FROM compressed_data
    ON CONFLICT (station_id, updated_at) 
    DO UPDATE SET
      wind_speed = ROUND((station_data.wind_speed + EXCLUDED.wind_speed) / 2, 1),
      wind_gust = GREATEST(station_data.wind_gust, EXCLUDED.wind_gust),
      wind_min_speed = LEAST(station_data.wind_min_speed, EXCLUDED.wind_min_speed),
      direction = ROUND((station_data.direction + EXCLUDED.direction) / 2, 1),
      temperature = ROUND((station_data.temperature + EXCLUDED.temperature) / 2, 1)
    RETURNING station_id
  )
  -- Get statistics
  SELECT 
    (SELECT COUNT(*) FROM deleted_data) as original_count,
    (SELECT COUNT(*) FROM inserted_data) as compressed_count,
    (SELECT COUNT(DISTINCT station_id) FROM deleted_data) as stations_count
  INTO v_original_records, v_compressed_records, v_stations_processed;
  
  RETURN QUERY SELECT v_original_records, v_compressed_records, v_stations_processed;
END;
$$ LANGUAGE plpgsql;