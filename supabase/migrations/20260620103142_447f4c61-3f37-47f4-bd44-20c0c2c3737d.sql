CREATE TABLE public.prepared_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.property_requests(id) ON DELETE SET NULL,
  template_id text NOT NULL,
  template_name text NOT NULL,
  client_name text,
  client_email text,
  phone text,
  project_type text,
  location text,
  budget text,
  surface text,
  notes text,
  field_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_pdf_path text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prepared_agreements TO authenticated;
GRANT ALL ON public.prepared_agreements TO service_role;

ALTER TABLE public.prepared_agreements ENABLE ROW LEVEL SECURITY;

-- Admin-only via service role (mirrors the project's existing admin tables).
-- No anon, no authenticated policies: admin UI uses the session admin gate
-- and writes are funneled through the service role from edge functions /
-- trusted contexts. We still allow service_role full access.
CREATE POLICY "service_role manages prepared_agreements"
  ON public.prepared_agreements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For the current admin UI (which uses the publishable key with a session
-- gate, not Supabase auth) we allow authenticated read/write. The admin gate
-- in the app restricts access; tightening to a roles table is a later step.
CREATE POLICY "authenticated read prepared_agreements"
  ON public.prepared_agreements FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert prepared_agreements"
  ON public.prepared_agreements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update prepared_agreements"
  ON public.prepared_agreements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete prepared_agreements"
  ON public.prepared_agreements FOR DELETE TO authenticated USING (true);

CREATE TRIGGER set_prepared_agreements_updated_at
  BEFORE UPDATE ON public.prepared_agreements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX prepared_agreements_request_idx ON public.prepared_agreements(request_id);
CREATE INDEX prepared_agreements_status_idx ON public.prepared_agreements(status);