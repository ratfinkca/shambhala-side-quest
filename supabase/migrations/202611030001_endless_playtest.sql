-- Forward-compatible private metrics; preserve columns, grants, retention and maintenance.
create or replace view playtest_private.metrics as
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
 ('banked_runs',case when terminal->'payload'->>'outcome'='banked' then 1 else 0 end),
 ('failed_runs',case when terminal->'payload'->>'outcome'='failed' then 1 else 0 end),
 ('explicit_exits',case when terminal->'payload'->>'outcome'='exit' then 1 else 0 end),
 ('unknown_completions',case when terminal is null then 1 else 0 end)) as m(metric,value)
), other_metrics as (
 select (received_at at time zone 'UTC')::date as day,coalesce(event->>'mode','menu') mode,
 event->>'inputType' input_type,event->>'scoringVersion' scoring_version,
 case event->>'type' when 'replay' then 'replay_events' when 'perk' then 'perk_'||(event->'payload'->>'perk')
 when 'perk_choice' then 'perk_'||(event->'payload'->>'action')
 when 'menu' then 'menu_'||(event->'payload'->>'action') end metric,1::double precision value
 from playtest_private.events where event->>'type' in ('replay','perk','perk_choice','menu')
), chosen_perks as (
 select (received_at at time zone 'UTC')::date as day,event->>'mode' mode,
 event->>'inputType' input_type,event->>'scoringVersion' scoring_version,
 'perk_'||(event->'payload'->>'perk') metric,1::double precision value
 from playtest_private.events where event->>'type'='perk_choice' and event->'payload'->>'action' in ('add','swap')
)
select day,mode,input_type,scoring_version,metric,sum(value) value
from (select * from stage_metrics union all select * from run_metrics union all select * from other_metrics union all select * from chosen_perks) m
 group by day,mode,input_type,scoring_version,metric;
revoke all on playtest_private.metrics from public,anon,authenticated;

