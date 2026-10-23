select cron.schedule('arcade-maintenance','20 * * * *','select public.maintain_arcade()');
