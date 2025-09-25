-- Create function to compress yesterday's station data from 15-minute to hourly intervals
CREATE OR REPLACE FUNCTION compress_yesterday_station_data()
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
  -- Step 1: Create compressed data and get stats
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
    WHERE updated_at >= CURRENT_DATE - INTERVAL '1 day' 
      AND updated_at <= CURRENT_DATE
    GROUP BY station_id, DATE_TRUNC('hour', updated_at + INTERVAL '45 minutes')
  ),
  -- Step 2: Delete original 15-minute data for yesterday
  deleted_data AS (
    DELETE FROM station_data 
    WHERE updated_at >= CURRENT_DATE - INTERVAL '1 day' 
      AND updated_at <= CURRENT_DATE
    RETURNING station_id, updated_at
  ),
  -- Step 3: Insert compressed data
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
