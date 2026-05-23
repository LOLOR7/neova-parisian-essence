-- 1) Reclaim space now
TRUNCATE TABLE cron.job_run_details;

-- 2) Daily cleanup job at 03:15 UTC — keep last 7 days only
SELECT cron.schedule(
  'cleanup-cron-job-run-details',
  '15 3 * * *',
  $$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days';$$
);