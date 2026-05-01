-- Create the property_requests table
CREATE TABLE public.property_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  budget TEXT,
  surface TEXT,
  property_type TEXT,
  intended_use TEXT,
  timeline TEXT,
  works_level TEXT,
  current_condition TEXT,
  renovation_objective TEXT,
  address TEXT,
  support_level TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'Find Your Property form',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + authenticated) to insert submissions
CREATE POLICY "Anyone can submit a property request"
ON public.property_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies = nobody can read/modify via the API.
-- Admins access submissions through the Lovable Cloud backend dashboard.

CREATE INDEX idx_property_requests_created_at ON public.property_requests (created_at DESC);