CREATE TABLE forecast_cache (
  id BIGSERIAL PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES paragliding_locations(id),
  time TIMESTAMPTZ NOT NULL,
  isPromising BOOLEAN DEFAULT FALSE,
  
  -- Surface conditions
  temperature NUMERIC(4,1),
  windSpeed NUMERIC(4,1),
  windDirection INTEGER,
  windGusts NUMERIC(4,1),
  precipitation NUMERIC(5,2),
  precipitationProbability INTEGER,
  pressureMsl NUMERIC(6,1),
  weatherCode VARCHAR(10),
  isDay SMALLINT CHECK (isDay IN (0, 1)),
  
  -- Atmospheric conditions - Wind at different pressure levels
  windSpeed1000hPa NUMERIC(4,1),
  windDirection1000hPa INTEGER,
  windSpeed925hPa NUMERIC(4,1),
  windDirection925hPa INTEGER,
  windSpeed850hPa NUMERIC(4,1),
  windDirection850hPa INTEGER,
  windSpeed700hPa NUMERIC(4,1),
  windDirection700hPa INTEGER,
  
  -- Atmospheric conditions - Temperature at different pressure levels
  temperature1000hPa NUMERIC(4,1),
  temperature925hPa NUMERIC(4,1),
  temperature850hPa NUMERIC(4,1),
  temperature700hPa NUMERIC(4,1),
  
  -- Atmospheric conditions - Cloud cover
  cloudCover INTEGER,
  cloudCoverLow INTEGER,
  cloudCoverMid INTEGER,
  cloudCoverHigh INTEGER,
  
  -- Atmospheric conditions - Stability and convection
  cape NUMERIC(6,1),
  convectiveInhibition NUMERIC(6,1),
  liftedIndex NUMERIC(4,1),
  boundaryLayerHeight NUMERIC(6,1),
  freezingLevelHeight NUMERIC(6,1),
  
  -- Atmospheric conditions - Geopotential heights
  geopotentialHeight1000hPa NUMERIC(6,1),
  geopotentialHeight925hPa NUMERIC(6,1),
  geopotentialHeight850hPa NUMERIC(6,1),
  geopotentialHeight700hPa NUMERIC(6,1),
  
  -- Landing data (optional)
  landing_wind NUMERIC(4,1),
  landing_gust NUMERIC(4,1),
  landing_wind_direction INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique constraint for upsert operations
  UNIQUE(location_id, time)
);

-- Indexes for efficient queries
CREATE INDEX idx_forecast_location_time ON forecast_cache(location_id, time);
CREATE INDEX idx_forecast_time ON forecast_cache(time);
CREATE INDEX idx_forecast_promising ON forecast_cache(isPromising);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_forecast_updated_at 
    BEFORE UPDATE ON forecast_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();