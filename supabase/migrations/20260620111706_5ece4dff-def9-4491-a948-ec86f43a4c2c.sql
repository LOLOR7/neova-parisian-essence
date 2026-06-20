
-- request_activity_log: open to public role (matches existing admin tables)
DROP POLICY IF EXISTS "authenticated read request_activity_log"   ON public.request_activity_log;
DROP POLICY IF EXISTS "authenticated insert request_activity_log" ON public.request_activity_log;
DROP POLICY IF EXISTS "authenticated update request_activity_log" ON public.request_activity_log;
DROP POLICY IF EXISTS "authenticated delete request_activity_log" ON public.request_activity_log;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_activity_log TO anon;

CREATE POLICY "Public can read request_activity_log"   ON public.request_activity_log FOR SELECT USING (true);
CREATE POLICY "Public can insert request_activity_log" ON public.request_activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update request_activity_log" ON public.request_activity_log FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete request_activity_log" ON public.request_activity_log FOR DELETE USING (true);

-- request_documents: same pattern
DROP POLICY IF EXISTS "authenticated read request_documents"   ON public.request_documents;
DROP POLICY IF EXISTS "authenticated insert request_documents" ON public.request_documents;
DROP POLICY IF EXISTS "authenticated update request_documents" ON public.request_documents;
DROP POLICY IF EXISTS "authenticated delete request_documents" ON public.request_documents;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_documents TO anon;

CREATE POLICY "Public can read request_documents"   ON public.request_documents FOR SELECT USING (true);
CREATE POLICY "Public can insert request_documents" ON public.request_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update request_documents" ON public.request_documents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete request_documents" ON public.request_documents FOR DELETE USING (true);

-- prepared_agreements: existing policies are `authenticated` only — same blocker.
DROP POLICY IF EXISTS "authenticated read prepared_agreements"   ON public.prepared_agreements;
DROP POLICY IF EXISTS "authenticated insert prepared_agreements" ON public.prepared_agreements;
DROP POLICY IF EXISTS "authenticated update prepared_agreements" ON public.prepared_agreements;
DROP POLICY IF EXISTS "authenticated delete prepared_agreements" ON public.prepared_agreements;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prepared_agreements TO anon;

CREATE POLICY "Public can read prepared_agreements"   ON public.prepared_agreements FOR SELECT USING (true);
CREATE POLICY "Public can insert prepared_agreements" ON public.prepared_agreements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update prepared_agreements" ON public.prepared_agreements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete prepared_agreements" ON public.prepared_agreements FOR DELETE USING (true);

-- Storage: allow upload/read for the agreements bucket from public role
-- (bucket stays private — access is still via signed URLs only)
DROP POLICY IF EXISTS "auth write agreements bucket"             ON storage.objects;
DROP POLICY IF EXISTS "auth read agreements bucket"              ON storage.objects;
DROP POLICY IF EXISTS "auth update agreements bucket"            ON storage.objects;
DROP POLICY IF EXISTS "auth delete agreements bucket"            ON storage.objects;
DROP POLICY IF EXISTS "authenticated read agreements documents"  ON storage.objects;
DROP POLICY IF EXISTS "authenticated write agreements documents" ON storage.objects;

CREATE POLICY "Public can read agreements bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agreements');

CREATE POLICY "Public can write agreements bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'agreements');

CREATE POLICY "Public can update agreements bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'agreements')
  WITH CHECK (bucket_id = 'agreements');

CREATE POLICY "Public can delete agreements bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'agreements');
