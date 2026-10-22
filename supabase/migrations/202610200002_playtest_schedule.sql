create extension if not exists pg_cron;
select cron.schedule('playtest-daily-maintenance','10 0 * * *','select public.maintain_playtest()');
