-- Create changelog_landings table
CREATE TABLE IF NOT EXISTS changelog_landings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES all_paragliding_locations(id) ON DELETE CASCADE,
  flightlog_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_landing_latitude NUMERIC,
  previous_landing_longitude NUMERIC,
  previous_landing_altitude NUMERIC,
  new_landing_latitude NUMERIC,
  new_landing_longitude NUMERIC,
  new_landing_altitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create changelog_is_main table
CREATE TABLE IF NOT EXISTS changelog_is_main (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES all_paragliding_locations(id) ON DELETE CASCADE,
  flightlog_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_is_main BOOLEAN NOT NULL,
  new_is_main BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_changelog_landings_location_id ON changelog_landings(location_id);
CREATE INDEX IF NOT EXISTS idx_changelog_landings_flightlog_id ON changelog_landings(flightlog_id);
CREATE INDEX IF NOT EXISTS idx_changelog_landings_user_id ON changelog_landings(user_id);
CREATE INDEX IF NOT EXISTS idx_changelog_landings_created_at ON changelog_landings(created_at);

CREATE INDEX IF NOT EXISTS idx_changelog_is_main_location_id ON changelog_is_main(location_id);
CREATE INDEX IF NOT EXISTS idx_changelog_is_main_flightlog_id ON changelog_is_main(flightlog_id);
CREATE INDEX IF NOT EXISTS idx_changelog_is_main_user_id ON changelog_is_main(user_id);
CREATE INDEX IF NOT EXISTS idx_changelog_is_main_created_at ON changelog_is_main(created_at);

