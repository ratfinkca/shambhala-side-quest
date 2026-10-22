create extension if not exists pg_cron;
select cron.schedule('playtest-daily-maintenance','10 0 * * *','select public.maintain_playtest()');

select cron.schedule('playtest-rate-cleanup','10 * * * *',
  $$delete from playtest_private.rate_limits where window_start < now()-interval '24 hours'$$);
