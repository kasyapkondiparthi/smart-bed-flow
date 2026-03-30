
-- Create severity enum
CREATE TYPE public.patient_severity AS ENUM ('Critical', 'Moderate', 'Low');

-- Create bed assignment enum
CREATE TYPE public.bed_assignment AS ENUM ('ICU', 'Normal', 'Waiting');

-- Create patients table (public, no auth required for this demo)
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  severity patient_severity NOT NULL,
  needs_icu BOOLEAN NOT NULL DEFAULT false,
  assigned_bed bed_assignment NOT NULL DEFAULT 'Waiting',
  oxygen_level NUMERIC,
  heart_rate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert/delete for this demo system (no auth)
CREATE POLICY "Anyone can read patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete patients" ON public.patients FOR DELETE USING (true);
CREATE POLICY "Anyone can update patients" ON public.patients FOR UPDATE USING (true);
