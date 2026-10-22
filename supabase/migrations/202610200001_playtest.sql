-- Only server-owned RPCs access this schema. It is not exposed by PostgREST.
create schema if not exists playtest_private;
revoke all on schema playtest_private from public, anon, authenticated;
create table playtest_private.events (
 event_id uuid primary key,
 received_at timestamptz not null default now(),
 event jsonb not null check (jsonb_typeof(event)='object')
);
create index events_received on playtest_private.events(received_at);
create index events_run on playtest_private.events((event->>'runId'));
create table playtest_private.rate_limits (
 bucket text not null, window_start timestamptz not null, requests integer not null,
 primary key(bucket,window_start)
);
create table playtest_private.daily (
 day date not null, mode text not null, input_type text not null, scoring_version text not null,
 metric text not null, value double precision not null,
 primary key(day,mode,input_type,scoring_version,metric)
);
alter table playtest_private.events enable row level security;
alter table playtest_private.rate_limits enable row level security;
alter table playtest_private.daily enable row level security;
revoke all on all tables in schema playtest_private from public, anon, authenticated;

create function public.ingest_playtest(p_events jsonb,p_bucket text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare n integer; e jsonb; accepted jsonb='[]'::jsonb;
begin
 if jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events) not between 1 and 20
 or octet_length(p_events::text)>40000 or p_bucket !~ '^[0-9a-f]{64}$' then
  raise exception 'Invalid batch';
 end if;
 insert into playtest_private.rate_limits values(p_bucket,date_trunc('hour',now()),1)
 on conflict(bucket,window_start) do update set requests=playtest_private.rate_limits.requests+1
 returning requests into n;
 if n>120 then return jsonb_build_object('limited',true); end if;
 for e in select value from jsonb_array_elements(p_events) loop
  insert into playtest_private.events(event_id,event) values((e->>'eventId')::uuid,e)
  on conflict(event_id) do nothing;
  accepted=accepted||jsonb_build_array(e->>'eventId');
 end loop;
 return jsonb_build_object('accepted',accepted);
end $$;
revoke all on function public.ingest_playtest(jsonb,text) from public,anon,authenticated;
grant execute on function public.ingest_playtest(jsonb,text) to service_role;

-- Report raw data privately; daily stored summaries contain no identifiers.
create view playtest_private.metrics as
with stage_metrics as (
 select (received_at at time zone 'UTC')::date as day,coalesce(event->>'mode','menu') mode,
 event->>'inputType' input_type,event->>'scoringVersion' scoring_version,
 metric,value
 from playtest_private.events cross join lateral (values
 ('stage_samples',1::double precision),
 ('qualified_stages',case when (event->'payload'->>'qualified')::boolean then 1 else 0 end::double precision),
 ('sparks',coalesce((event->'payload'->>'pickups')::double precision,0)),
 ('bumps',coalesce((event->'payload'->>'bumps')::double precision,0)),
 ('close_passes',coalesce((event->'payload'->>'closePasses')::double precision,0)),
 ('bass_ms',coalesce((event->'payload'->>'bassMs')::double precision,0)),
 ('charge_ms',coalesce((event->'payload'->>'chargeMs')::double precision,0)),
 ('bass_uses',coalesce((event->'payload'->>'bassUses')::double precision,0)),
 ('flow_uses',coalesce((event->'payload'->>'flowUses')::double precision,0))
 ) as m(metric,value) where event->>'type'='stage_end'
), runs as (
 select s.received_at,s.event,
 (select e.event from playtest_private.events e where e.event->>'runId'=s.event->>'runId'
 and e.event->>'installationId'=s.event->>'installationId' and e.event->>'type'='run_end'
 order by e.received_at limit 1) terminal
 from playtest_private.events s where s.event->>'type'='run_start'
), run_metrics as (
 select (received_at at time zone 'UTC')::date as day,event->>'mode' mode,
 coalesce(terminal->>'inputType',event->>'inputType') input_type,event->>'scoringVersion' scoring_version,
 metric,value::double precision
 from runs cross join lateral (values ('run_samples',1),
 ('completed_runs',case when terminal->'payload'->>'outcome'='complete' then 1 else 0 end),
 ('explicit_exits',case when terminal->'payload'->>'outcome'='exit' then 1 else 0 end),
 ('unknown_completions',case when terminal is null then 1 else 0 end)) as m(metric,value)
), other_metrics as (
 select (received_at at time zone 'UTC')::date as day,coalesce(event->>'mode','menu') mode,
 event->>'inputType' input_type,event->>'scoringVersion' scoring_version,
 case event->>'type' when 'replay' then 'replay_events' when 'perk' then 'perk_'||(event->'payload'->>'perk')
 when 'menu' then 'menu_'||(event->'payload'->>'action') end metric,1::double precision value
 from playtest_private.events where event->>'type' in ('replay','perk','menu')
)
select day,mode,input_type,scoring_version,metric,sum(value) value
from (select * from stage_metrics union all select * from run_metrics union all select * from other_metrics) m
 group by day,mode,input_type,scoring_version,metric;
revoke all on playtest_private.metrics from public,anon,authenticated;

create function public.maintain_playtest() returns void
language plpgsql security definer set search_path = '' as $$
begin
 -- Replace only days still backed by raw data. Archived days are never erased.
 delete from playtest_private.daily where day in
 (select distinct (received_at at time zone 'UTC')::date from playtest_private.events);
 insert into playtest_private.daily select * from playtest_private.metrics;
 -- Delete the whole oldest UTC day to avoid retaining partial days or overwriting
 -- archived aggregates with partial data on the next maintenance run (29–30 days).
 delete from playtest_private.events where received_at <
 (((now() at time zone 'UTC')::date-29)::timestamp at time zone 'UTC');
 delete from playtest_private.rate_limits where window_start<now()-interval '24 hours';
end $$;
revoke all on function public.maintain_playtest() from public,anon,authenticated;
grant execute on function public.maintain_playtest() to service_role;
