
-- Add admin fields to property_requests
ALTER TABLE public.property_requests
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Nouvelle',
  ADD COLUMN IF NOT EXISTS internal_note TEXT;

-- Allow admin UI to read/update/delete property_requests (gated by PIN client-side)
DROP POLICY IF EXISTS "Admin can read property requests" ON public.property_requests;
CREATE POLICY "Admin can read property requests"
  ON public.property_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update property requests" ON public.property_requests;
CREATE POLICY "Admin can update property requests"
  ON public.property_requests FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admin can delete property requests" ON public.property_requests;
CREATE POLICY "Admin can delete property requests"
  ON public.property_requests FOR DELETE
  USING (true);

-- network_contacts
CREATE TABLE IF NOT EXISTS public.network_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'Autre',
  email TEXT NOT NULL,
  phone TEXT,
  sector TEXT,
  specialties TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS network_contacts_email_unique
  ON public.network_contacts (LOWER(email));

ALTER TABLE public.network_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read network_contacts" ON public.network_contacts;
CREATE POLICY "Public can read network_contacts"
  ON public.network_contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert network_contacts" ON public.network_contacts;
CREATE POLICY "Public can insert network_contacts"
  ON public.network_contacts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update network_contacts" ON public.network_contacts;
CREATE POLICY "Public can update network_contacts"
  ON public.network_contacts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete network_contacts" ON public.network_contacts;
CREATE POLICY "Public can delete network_contacts"
  ON public.network_contacts FOR DELETE USING (true);

-- request_sends
CREATE TABLE IF NOT EXISTS public.request_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  property_request_id UUID NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.network_contacts(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  include_client_details BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'queued'
);

CREATE INDEX IF NOT EXISTS request_sends_request_idx ON public.request_sends(property_request_id);

ALTER TABLE public.request_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read request_sends" ON public.request_sends;
CREATE POLICY "Public can read request_sends"
  ON public.request_sends FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert request_sends" ON public.request_sends;
CREATE POLICY "Public can insert request_sends"
  ON public.request_sends FOR INSERT WITH CHECK (true);

-- updated_at trigger for network_contacts
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS network_contacts_updated_at ON public.network_contacts;
CREATE TRIGGER network_contacts_updated_at
  BEFORE UPDATE ON public.network_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
