CREATE TABLE public.email_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type text NOT NULL,
  demand_id uuid REFERENCES public.property_requests(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text,
  status text NOT NULL DEFAULT 'queued',
  is_test boolean NOT NULL DEFAULT false,
  provider_message_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_audit_log_created ON public.email_audit_log(created_at DESC);
CREATE INDEX idx_email_audit_log_demand ON public.email_audit_log(demand_id);
CREATE INDEX idx_email_audit_log_type ON public.email_audit_log(email_type);

ALTER TABLE public.email_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read email audit log"
  ON public.email_audit_log FOR SELECT
  USING (true);

CREATE POLICY "Public can insert email audit log"
  ON public.email_audit_log FOR INSERT
  WITH CHECK (true);
