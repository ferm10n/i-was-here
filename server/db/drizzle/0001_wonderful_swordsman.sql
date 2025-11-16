--> statement-breakpoint
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geom column to existing locations table
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "geom" geometry(Point, 4326);

--> statement-breakpoint
-- Create spatial index
CREATE INDEX IF NOT EXISTS "locations_geom_idx" ON "locations" USING gist ("geom");
--> statement-breakpoint
-- Create trigger function to auto-populate geom from lat/lng
CREATE OR REPLACE FUNCTION update_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
-- Create trigger to automatically populate geom column
DROP TRIGGER IF EXISTS locations_geom_trigger ON locations;
--> statement-breakpoint
CREATE TRIGGER locations_geom_trigger
  BEFORE INSERT OR UPDATE OF lat, lng ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_location_geom();
--> statement-breakpoint
-- Populate geom for existing rows
UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326) WHERE geom IS NULL;
--> statement-breakpoint
-- Make geom NOT NULL after populating existing rows
ALTER TABLE "locations" ALTER COLUMN "geom" SET NOT NULL;
