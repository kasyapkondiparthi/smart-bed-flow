-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Drop insecure public policies
DROP POLICY IF EXISTS "Anyone can read patients" ON public.patients;
DROP POLICY IF EXISTS "Anyone can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Anyone can delete patients" ON public.patients;
DROP POLICY IF EXISTS "Anyone can update patients" ON public.patients;

-- Create secure Authenticated-only policies
CREATE POLICY "Authenticated staff can read patients" 
  ON public.patients FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Authenticated staff can insert patients" 
  ON public.patients FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated staff can update patients" 
  ON public.patients FOR UPDATE 
  TO authenticated USING (true);

CREATE POLICY "Authenticated staff can delete patients" 
  ON public.patients FOR DELETE 
  TO authenticated USING (true);
