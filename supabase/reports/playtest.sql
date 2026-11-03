-- Owner-only READ-ONLY reports. No maintenance/cleanup is run by this file.
-- metrics recomputes available raw days; daily preserves older identifier-free days.
with fresh as (select * from playtest_private.metrics), combined as (
 select * from fresh union all select d.* from playtest_private.daily d
 where not exists(select 1 from fresh f where f.day=d.day)
)
select day,mode,input_type,scoring_version,
 sum(value) filter(where metric='run_samples') as sample_runs,
 sum(value) filter(where metric='completed_runs') as completed_runs,
 sum(value) filter(where metric='banked_runs') as banked_runs,
 sum(value) filter(where metric='failed_runs') as failed_runs,
 sum(value) filter(where metric='explicit_exits') as explicit_exits,
 sum(value) filter(where metric='unknown_completions') as completion_unknown,
 sum(value) filter(where metric='replay_events') as replay_events
from combined group by day,mode,input_type,scoring_version order by day desc;
-- Zero and absent samples differ. Unknown means no terminal event observed;
-- replays are not unique-player retention. Public score submissions are separate.
with fresh as (select * from playtest_private.metrics), combined as (
 select * from fresh union all select d.* from playtest_private.daily d
 where not exists(select 1 from fresh f where f.day=d.day)
)
select * from combined
where metric in ('stage_samples','qualified_stages','sparks','bumps','close_passes','bass_ms','bass_uses','flow_uses','perk_add','perk_swap','perk_keep')
 or metric like 'perk_%' order by day desc,mode,input_type,metric;
