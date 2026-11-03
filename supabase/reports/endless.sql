-- OWNER ONLY, READ ONLY; every result omits browser/session/run identifiers.
-- Edit UTC window/build in each params CTE. NULL build includes all builds;
-- use a production commit when comparing releases. Raw retention limits coverage.
with params as (select now()-interval '14 days' since_utc,now() until_utc,null::text build), scoped as (
 select e.* from playtest_private.events e cross join params p
 where e.received_at>=p.since_utc and e.received_at<p.until_utc and e.event->>'mode'='endless'
 and(p.build is null or e.event->>'buildId'=p.build)
), runs as (
 select s.event,s.received_at,(select t.event from scoped t where t.event->>'runId'=s.event->>'runId'
 and t.event->>'installationId'=s.event->>'installationId' and t.event->>'type'='run_end' order by t.received_at limit 1) terminal
 from scoped s where s.event->>'type'='run_start'
)
select (select since_utc from params) window_start_utc,(select until_utc from params) window_end_exclusive_utc,
 event->>'buildId' build,coalesce(terminal->>'inputType',event->>'inputType') input_type,
 count(*) run_samples,count(*)filter(where terminal->'payload'->>'outcome'='banked') banked,
 count(*)filter(where terminal->'payload'->>'outcome'='failed') failed,
 count(*)filter(where terminal->'payload'->>'outcome'='exit') explicit_exits,
 count(*)filter(where terminal is null) completion_unknown
from runs group by 3,4 order by 3,4;

-- Per-stage samples are the denominator; not a funnel of all people who started.
with params as (select now()-interval '14 days' since_utc,now() until_utc,null::text build)
select e.event->>'buildId' build,e.event->>'inputType' input_type,
 (e.event->'payload'->>'stageIndex')::int+1 stage_number,(e.event->'payload'->>'stageIndex')::int/3+1 loop_number,
 count(*) stage_samples,count(*)filter(where(e.event->'payload'->>'qualified')::boolean) qualified,
 round(avg((e.event->'payload'->>'activeMs')::numeric)) mean_active_ms,
 round(avg((e.event->'payload'->>'pickups')::numeric),2) mean_sparks,
 round(avg((e.event->'payload'->>'bassUses')::numeric),2) mean_bass_uses
from playtest_private.events e cross join params p where e.received_at>=p.since_utc and e.received_at<p.until_utc
and e.event->>'mode'='endless' and e.event->>'type'='stage_end' and(p.build is null or e.event->>'buildId'=p.build)
group by 1,2,3,4 order by 3,1,2;

-- Cancelled swaps do not emit a choice. These are choice events, not unique players.
with params as (select now()-interval '14 days' since_utc,now() until_utc,null::text build)
select e.event->>'buildId' build,e.event->>'inputType' input_type,e.event->'payload'->>'action' action,
 e.event->'payload'->>'perk' taken_perk,e.event->'payload'->>'replaced' replaced_perk,count(*) choice_samples
from playtest_private.events e cross join params p where e.received_at>=p.since_utc and e.received_at<p.until_utc
and e.event->>'mode'='endless' and e.event->>'type'='perk_choice' and(p.build is null or e.event->>'buildId'=p.build)
group by 1,2,3,4,5 order by 3,4;
