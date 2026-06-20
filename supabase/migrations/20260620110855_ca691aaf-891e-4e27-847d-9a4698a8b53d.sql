
CREATE TABLE public.request_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email_sent','agreement_generated','agreement_attached','document_attached','status_changed','manual_note')),
  title text NOT NULL,
  description text,
  recipient_name text,
  recipient_email text,
  recipient_role text CHECK (recipient_role IS NULL OR recipient_role IN ('client','agent','professional','architect','other')),
  related_agreement_id uuid REFERENCES public.prepared_agreements(id) ON DELETE SET NULL,
  related_document_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_activity_log TO authenticated;
GRANT ALL ON public.request_activity_log TO service_role;

ALTER TABLE public.request_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read request_activity_log" ON public.request_activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert request_activity_log" ON public.request_activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update request_activity_log" ON public.request_activity_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete request_activity_log" ON public.request_activity_log FOR DELETE TO authenticated USING (true);
CREATE POLICY "service_role manages request_activity_log" ON public.request_activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_request_activity_log_request_id ON public.request_activity_log(request_id, created_at DESC);

CREATE TABLE public.request_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('brochure','service','project','property_option','other')),
  description text,
  file_path text,
  file_type text NOT NULL DEFAULT 'pdf',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_documents TO authenticated;
GRANT ALL ON public.request_documents TO service_role;

ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read request_documents" ON public.request_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert request_documents" ON public.request_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update request_documents" ON public.request_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete request_documents" ON public.request_documents FOR DELETE TO authenticated USING (true);
CREATE POLICY "service_role manages request_documents" ON public.request_documents FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_request_documents_updated_at
BEFORE UPDATE ON public.request_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.request_documents (name, category, description, sort_order) VALUES
('Plaquette Neova', 'brochure', 'Présentation générale de Neova et de notre approche.', 10),
('Service Property Finder', 'service', 'Recherche de bien sur-mesure pour clients exigeants.', 20),
('Service Rénovation', 'service', 'Rénovation premium clé en main avec architectes partenaires.', 30),
('Service Property Management', 'service', 'Gestion locative et conciergerie haut de gamme.', 40),
('Exemple de projet', 'project', 'Étude de cas et réalisations récentes.', 50),
('Option de bien sélectionnée', 'property_option', 'Fiche bien à présenter au client.', 60);

-- Storage policies for agreements bucket (documents/ subpath used by this feature)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='authenticated read agreements documents') THEN
    CREATE POLICY "authenticated read agreements documents"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'agreements');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='authenticated write agreements documents') THEN
    CREATE POLICY "authenticated write agreements documents"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'agreements');
  END IF;
END $$;
