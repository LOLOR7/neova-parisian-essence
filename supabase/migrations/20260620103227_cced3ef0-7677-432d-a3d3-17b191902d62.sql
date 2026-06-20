CREATE POLICY "auth read agreements bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'agreements');
CREATE POLICY "auth write agreements bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agreements');
CREATE POLICY "auth update agreements bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'agreements') WITH CHECK (bucket_id = 'agreements');
CREATE POLICY "auth delete agreements bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agreements');