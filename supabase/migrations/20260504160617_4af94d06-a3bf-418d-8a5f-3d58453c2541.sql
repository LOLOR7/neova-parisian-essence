CREATE TABLE public.demand_contact_outreach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id uuid NOT NULL,
  contact_id uuid,
  contact_name text NOT NULL,
  contact_email text,
  email_subject text,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  included_client_contact boolean NOT NULL DEFAULT false,
  sent_by_admin text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demand_contact_outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read outreach" ON public.demand_contact_outreach FOR SELECT USING (true);
CREATE POLICY "Public can insert outreach" ON public.demand_contact_outreach FOR INSERT WITH CHECK (true);

CREATE INDEX idx_demand_contact_outreach_demand ON public.demand_contact_outreach(demand_id);