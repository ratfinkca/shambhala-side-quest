-- Owner SQL editor only. Refresh aggregates before reading; never expose publicly.
select public.maintain_playtest();
select day,mode,input_type,scoring_version,
 sum(value) filter(where metric='run_samples') as sample_runs,
 sum(value) filter(where metric='completed_runs') as completed_runs,
 sum(value) filter(where metric='explicit_exits') as explicit_exits,
 sum(value) filter(where metric='unknown_completions') as completion_unknown,
 sum(value) filter(where metric='replay_events') as replay_events
from playtest_private.daily group by day,mode,input_type,scoring_version order by day desc;
-- Replay event counts are not unique-player retention. Unknown means no end observed.
select * from playtest_private.daily
where metric in ('stage_samples','qualified_stages','sparks','bumps','close_passes','bass_ms','bass_uses','flow_uses')
 or metric like 'perk_%' order by day desc,mode,input_type,metric;
