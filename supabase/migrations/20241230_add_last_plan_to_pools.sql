-- Add last_treatment_plan column to pools table
ALTER TABLE pools 
ADD COLUMN IF NOT EXISTS last_treatment_plan JSONB DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN pools.last_treatment_plan IS 'Stores the latest generated treatment plan (JSON) for quick access.';
