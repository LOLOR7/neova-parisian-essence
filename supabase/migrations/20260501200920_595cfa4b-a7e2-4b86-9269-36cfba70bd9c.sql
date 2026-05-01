-- 1. Workflow status columns on property_requests
ALTER TABLE public.property_requests
  ADD COLUMN IF NOT EXISTS request_type text,
  ADD COLUMN IF NOT EXISTS client_agreement_status text NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN IF NOT EXISTS phase_1_status text NOT NULL DEFAULT 'LOCKED',
  ADD COLUMN IF NOT EXISTS phase_2_status text NOT NULL DEFAULT 'LOCKED',
  ADD COLUMN IF NOT EXISTS property_deal_status text NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN IF NOT EXISTS selected_professional_types text;

-- Backfill request_type for existing rows (safe heuristic)
UPDATE public.property_requests
SET request_type = CASE
  WHEN service_type ILIKE '%project%only%' OR service_type ILIKE '%renovation%only%'
       OR service_type ILIKE '%architect%' OR service_type ILIKE '%contractor%' THEN 'PROJECT_ONLY'
  WHEN service_type ILIKE '%find%' AND (works_level IS NOT NULL AND works_level <> '' AND works_level NOT ILIKE '%none%')
       THEN 'REAL_ESTATE_AND_PROJECT'
  WHEN service_type ILIKE '%both%' OR service_type ILIKE '%project%' THEN 'REAL_ESTATE_AND_PROJECT'
  ELSE 'REAL_ESTATE_ONLY'
END
WHERE request_type IS NULL;

-- 2. Professional referrals
CREATE SEQUENCE IF NOT EXISTS public.professional_reference_seq START 1;

CREATE TABLE IF NOT EXISTS public.professional_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_reference text UNIQUE,
  demand_id uuid NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  professional_type text NOT NULL,
  professional_name text NOT NULL,
  company_name text,
  professional_email text NOT NULL,
  professional_phone text,
  commitment_fee text,
  success_fee text,
  commitment_fee_amount numeric,
  currency text DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'PROFESSIONAL_SELECTED',
  docusign_envelope_id text,
  payment_status text NOT NULL DEFAULT 'NOT_REQUIRED',
  payment_intent_id text,
  payment_method text,
  paid_at timestamptz,
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_professional_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.professional_reference IS NULL THEN
    NEW.professional_reference := 'PRO-' || LPAD(nextval('public.professional_reference_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_set_professional_reference ON public.professional_referrals;
CREATE TRIGGER trg_set_professional_reference
BEFORE INSERT ON public.professional_referrals
FOR EACH ROW EXECUTE FUNCTION public.set_professional_reference();

DROP TRIGGER IF EXISTS trg_professional_referrals_updated_at ON public.professional_referrals;
CREATE TRIGGER trg_professional_referrals_updated_at
BEFORE UPDATE ON public.professional_referrals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.professional_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read professional_referrals"
  ON public.professional_referrals FOR SELECT USING (true);
CREATE POLICY "Public can insert professional_referrals"
  ON public.professional_referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update professional_referrals"
  ON public.professional_referrals FOR UPDATE USING (true);
CREATE POLICY "Public can delete professional_referrals"
  ON public.professional_referrals FOR DELETE USING (true);

-- 3. Audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  related_entity_type text,
  related_entity_id uuid,
  envelope_id text,
  message text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read audit_logs"
  ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public can insert audit_logs"
  ON public.audit_logs FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_envelope
  ON public.audit_logs (envelope_id);

-- 4. Recompute phase statuses for existing rows based on derived request_type
UPDATE public.property_requests SET
  phase_1_status = CASE
    WHEN request_type = 'PROJECT_ONLY' THEN 'NOT_APPLICABLE'
    ELSE 'LOCKED'
  END,
  phase_2_status = CASE
    WHEN request_type = 'REAL_ESTATE_ONLY' THEN 'NOT_APPLICABLE'
    ELSE 'LOCKED'
  END
WHERE phase_1_status = 'LOCKED' AND phase_2_status = 'LOCKED';

-- If client agreement was already signed, unlock the appropriate phase
UPDATE public.property_requests SET
  client_agreement_status = 'CLIENT_AGREEMENT_SIGNED',
  phase_1_status = CASE
    WHEN request_type IN ('REAL_ESTATE_ONLY', 'REAL_ESTATE_AND_PROJECT') THEN 'ACTIVE'
    ELSE phase_1_status
  END,
  phase_2_status = CASE
    WHEN request_type = 'PROJECT_ONLY' THEN 'ACTIVE'
    ELSE phase_2_status
  END
WHERE status = 'CLIENT_AGREEMENT_SIGNED';