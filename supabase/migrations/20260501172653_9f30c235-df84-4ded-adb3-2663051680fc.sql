-- 1. Extend property_requests with demand reference + envelope id
ALTER TABLE public.property_requests
  ADD COLUMN IF NOT EXISTS demand_reference text UNIQUE,
  ADD COLUMN IF NOT EXISTS docusign_envelope_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Sequence + trigger for demand_reference (NEO-00001 style)
CREATE SEQUENCE IF NOT EXISTS public.demand_reference_seq START 1;

CREATE OR REPLACE FUNCTION public.set_demand_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.demand_reference IS NULL THEN
    NEW.demand_reference := 'NEO-' || LPAD(nextval('public.demand_reference_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_property_requests_demand_ref ON public.property_requests;
CREATE TRIGGER trg_property_requests_demand_ref
BEFORE INSERT ON public.property_requests
FOR EACH ROW EXECUTE FUNCTION public.set_demand_reference();

DROP TRIGGER IF EXISTS trg_property_requests_updated_at ON public.property_requests;
CREATE TRIGGER trg_property_requests_updated_at
BEFORE UPDATE ON public.property_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Backfill any existing rows with demand_reference
UPDATE public.property_requests
SET demand_reference = 'NEO-' || LPAD(nextval('public.demand_reference_seq')::text, 5, '0')
WHERE demand_reference IS NULL;

-- 2. agent_options table
CREATE TABLE IF NOT EXISTS public.agent_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  demand_id uuid NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  option_reference text UNIQUE,
  agent_name text NOT NULL,
  agency_name text,
  agent_email text NOT NULL,
  agent_phone text,
  property_address text,
  property_reference text,
  property_details text,
  asking_price text,
  status text NOT NULL DEFAULT 'AGENT_OPTION_SUBMITTED',
  docusign_envelope_id text,
  internal_note text
);

CREATE SEQUENCE IF NOT EXISTS public.option_reference_seq START 1;

CREATE OR REPLACE FUNCTION public.set_option_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.option_reference IS NULL THEN
    NEW.option_reference := 'OPT-' || LPAD(nextval('public.option_reference_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agent_options_ref ON public.agent_options;
CREATE TRIGGER trg_agent_options_ref
BEFORE INSERT ON public.agent_options
FOR EACH ROW EXECUTE FUNCTION public.set_option_reference();

DROP TRIGGER IF EXISTS trg_agent_options_updated_at ON public.agent_options;
CREATE TRIGGER trg_agent_options_updated_at
BEFORE UPDATE ON public.agent_options
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agent_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read agent_options" ON public.agent_options FOR SELECT USING (true);
CREATE POLICY "Public can insert agent_options" ON public.agent_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update agent_options" ON public.agent_options FOR UPDATE USING (true);
CREATE POLICY "Public can delete agent_options" ON public.agent_options FOR DELETE USING (true);

-- 3. viewing_requests table
CREATE TABLE IF NOT EXISTS public.viewing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  demand_id uuid NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.agent_options(id) ON DELETE CASCADE,
  client_name text,
  client_email text,
  agent_name text,
  agent_email text,
  property_address text,
  viewing_date timestamptz,
  status text NOT NULL DEFAULT 'VIEWING_REQUESTED',
  docusign_envelope_id text,
  internal_note text
);

DROP TRIGGER IF EXISTS trg_viewing_requests_updated_at ON public.viewing_requests;
CREATE TRIGGER trg_viewing_requests_updated_at
BEFORE UPDATE ON public.viewing_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read viewing_requests" ON public.viewing_requests FOR SELECT USING (true);
CREATE POLICY "Public can insert viewing_requests" ON public.viewing_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update viewing_requests" ON public.viewing_requests FOR UPDATE USING (true);
CREATE POLICY "Public can delete viewing_requests" ON public.viewing_requests FOR DELETE USING (true);

-- 4. docusign_envelopes audit table
CREATE TABLE IF NOT EXISTS public.docusign_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  envelope_id text,
  template_type text NOT NULL, -- 'CLIENT_REPRESENTATION' | 'AGENT_REFERRAL' | 'VIEWING_CONFIRMATION'
  related_entity_type text NOT NULL, -- 'demand' | 'option' | 'viewing'
  related_entity_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_configuration',
  signers jsonb,
  sent_at timestamptz,
  completed_at timestamptz,
  raw_payload jsonb
);

DROP TRIGGER IF EXISTS trg_docusign_envelopes_updated_at ON public.docusign_envelopes;
CREATE TRIGGER trg_docusign_envelopes_updated_at
BEFORE UPDATE ON public.docusign_envelopes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.docusign_envelopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read docusign_envelopes" ON public.docusign_envelopes FOR SELECT USING (true);
CREATE POLICY "Public can insert docusign_envelopes" ON public.docusign_envelopes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update docusign_envelopes" ON public.docusign_envelopes FOR UPDATE USING (true);
CREATE POLICY "Public can delete docusign_envelopes" ON public.docusign_envelopes FOR DELETE USING (true);