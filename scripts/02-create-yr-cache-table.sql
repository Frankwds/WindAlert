CREATE TABLE yr_cache (
  location_id TEXT PRIMARY KEY,
  expires TIMESTAMPTZ NOT NULL,
  last_modified TEXT NOT NULL,
  data JSONB NOT NULL
);
