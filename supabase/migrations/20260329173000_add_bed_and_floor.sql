-- Add bed_number and floor_number to patients table
ALTER TABLE public.patients
ADD COLUMN bed_number VARCHAR(10),
ADD COLUMN floor_number INTEGER;

-- Ensure RLS allows the public/anon to update these new columns, as before.
