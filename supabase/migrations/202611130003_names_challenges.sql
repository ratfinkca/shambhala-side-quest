-- Add public rave names and ticket-bound challenge partitions for v3 only.
-- Historical initials, records, ticket receipts and RPC shapes remain intact.

alter table arcade_private.tickets add column challenge text;
alter table arcade_private.tickets add constraint arcade_ticket_challenge check (
 (version='arcade-v3' and challenge is not null and challenge in ('first-timer','been-around','seasoned-vet'))
 or (version<>'arcade-v3' and challenge is null)
);
alter table arcade_private.scores alter column initials drop not null;
alter table arcade_private.scores add column display_name text;
alter table arcade_private.scores add column challenge text;
alter table arcade_private.scores add constraint arcade_score_identity check (
 (version='arcade-v3' and initials is null and display_name is not null and char_length(display_name) between 2 and 16
  and display_name !~ '[[:cntrl:]<>]' and challenge is not null and challenge in ('first-timer','been-around','seasoned-vet'))
 or (version<>'arcade-v3' and initials is not null and display_name is null and challenge is null)
);
create index arcade_challenge_rank on arcade_private.scores(mode,version,challenge,score desc,stages_cleared desc,received_at,id) where not hidden and version='arcade-v3';
create index arcade_challenge_endless_rank on arcade_private.scores(version,challenge,stages_cleared desc,score desc,received_at,id) where mode='endless' and not hidden and version='arcade-v3';

create function public.arcade_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text,p_challenge text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not arcade_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_run is null or p_version is null or p_version not in ('arcade-v1','arcade-v2','arcade-v3') or p_build is null or p_mode is null or p_mode not in ('rush','festival','endless')
 or (p_version='arcade-v3' and (p_challenge is null or p_challenge not in ('first-timer','been-around','seasoned-vet')))
 or (p_version<>'arcade-v3' and p_challenge is not null)
 then return jsonb_build_object('code','invalid');end if;
 insert into arcade_private.tickets(hash,run_id,mode,version,build,challenge)
 values(p_hash,p_run,p_mode,p_version,p_build,p_challenge)
  returning expires_at into expiry;
 if expiry is null then return jsonb_build_object('code','conflict');end if;
 return jsonb_build_object('expiresAt',expiry);
end $$;

create or replace function public.arcade_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text) returns jsonb language sql security definer set search_path='' as $$
 select public.arcade_ticket(p_hash,p_run,p_mode,p_version,p_build,p_bucket,null);
$$;

create or replace function public.arcade_submit(p_hash text,p_digest text,p_record jsonb,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t arcade_private.tickets; begin
 if not arcade_private.rate_ok('submit',p_bucket,120) then return jsonb_build_object('code','limited');end if;
 select * into t from arcade_private.tickets where hash=p_hash for update;
 if not found then return jsonb_build_object('code','invalid_ticket');end if;
 if jsonb_typeof(p_record) is distinct from 'object'
 or t.run_id::text is distinct from p_record->>'runId'
 or t.mode is distinct from p_record->>'mode'
 or t.version is distinct from p_record->>'scoringVersion'
 or t.build is distinct from p_record->>'buildId'
 or t.challenge is distinct from p_record->>'challenge'
 or (t.version<>'arcade-v3' and p_record ? 'challenge') then return jsonb_build_object('code','invalid_ticket');end if;
 if t.version='arcade-v3' then
  if jsonb_typeof(p_record->'displayName') is distinct from 'string'
  or char_length(p_record->>'displayName') not between 2 and 16
  or p_record->>'displayName' ~ '[[:cntrl:]<>]'
  or p_record ? 'initials' then return jsonb_build_object('code','invalid_name');end if;
 elsif p_record ? 'displayName' then return jsonb_build_object('code','invalid');end if;

 -- Partition identity is checked before replaying a previously accepted receipt.
 if t.payload_hash is not null then
  if t.payload_hash=p_digest then return jsonb_build_object('accepted',true);else return jsonb_build_object('code','conflict');end if;
 end if;
 if t.expires_at<=now() then return jsonb_build_object('code','expired');end if;
 if jsonb_typeof(p_record->'stages') is distinct from 'array' then return jsonb_build_object('code','invalid_ticket');end if;
 if extract(epoch from now()-t.issued_at)*1000+5000<jsonb_array_length(p_record->'stages')*60000 then return jsonb_build_object('code','invalid_ticket');end if;
 insert into arcade_private.scores(ticket_hash,initials,display_name,challenge,score,stages_cleared,record,input_type,mode,version)
 values(p_hash,p_record->>'initials',p_record->>'displayName',t.challenge,(p_record->>'totalScore')::bigint,(p_record->>'stagesCleared')::integer,p_record,p_record->>'inputType',t.mode,t.version);
 update arcade_private.tickets set payload_hash=p_digest where hash=p_hash;
 return jsonb_build_object('accepted',true);
end $$;

create function public.arcade_board(p_mode text,p_version text,p_challenge text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(row)),'[]'::jsonb)
 from (
  select display_name as "displayName",challenge,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
  from arcade_private.scores where mode=p_mode and version=p_version and version='arcade-v3' and challenge=p_challenge and not hidden

  order by case when p_mode='endless' then stages_cleared end desc,score desc,stages_cleared desc,received_at,id limit 50
 ) row;
$$;


-- Legacy board entry points preserve their original exact response keys.
create or replace function public.arcade_board(p_mode text,p_version text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_mode='endless' then
  return (select coalesce(jsonb_agg(row),'[]'::jsonb) from (
   select initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
   from arcade_private.scores where mode='endless' and version=p_version and version<>'arcade-v3' and not hidden
   order by stages_cleared desc,score desc,received_at,id limit 50) row);
 end if;
 return (select coalesce(jsonb_agg(row),'[]'::jsonb) from (
  select initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
  from arcade_private.scores where mode=p_mode and version=p_version and version<>'arcade-v3' and not hidden
  order by score desc,stages_cleared desc,received_at,id limit 50) row);
end $$;


revoke all on function public.arcade_ticket(text,uuid,text,text,text,text,text),public.arcade_board(text,text,text),public.arcade_ticket(text,uuid,text,text,text,text),public.arcade_submit(text,text,jsonb,text),public.arcade_board(text,text) from public,anon,authenticated;
grant execute on function public.arcade_ticket(text,uuid,text,text,text,text,text),public.arcade_board(text,text,text),public.arcade_ticket(text,uuid,text,text,text,text),public.arcade_submit(text,text,jsonb,text),public.arcade_board(text,text) to service_role;

alter table smf_private.tickets add column challenge text;
alter table smf_private.tickets add constraint smf_ticket_challenge check (
 (version='smf-v3' and challenge is not null and challenge in ('first-timer','been-around','seasoned-vet'))
 or (version<>'smf-v3' and challenge is null)
);
alter table smf_private.scores alter column initials drop not null;
alter table smf_private.scores add column display_name text;
alter table smf_private.scores add column challenge text;
alter table smf_private.scores add constraint smf_score_identity check (
 (version='smf-v3' and initials is null and display_name is not null and char_length(display_name) between 2 and 16
  and display_name !~ '[[:cntrl:]<>]' and challenge is not null and challenge in ('first-timer','been-around','seasoned-vet'))
 or (version<>'smf-v3' and initials is not null and display_name is null and challenge is null)
);
create index smf_challenge_rank on smf_private.scores(mode,version,challenge,rush_stage_id,score desc,stages_cleared desc,received_at,id) where not hidden and version='smf-v3';
create index smf_challenge_endless_rank on smf_private.scores(version,challenge,stages_cleared desc,score desc,received_at,id) where mode='endless' and not hidden and version='smf-v3';

create function public.smf_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text,p_rush_stage_id text,p_challenge text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not smf_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_run is null or p_version is null or p_version not in ('smf-v1','smf-v2','smf-v3') or p_build is null or p_mode is null or p_mode not in ('rush','festival','endless')
 or (p_version='smf-v3' and (p_challenge is null or p_challenge not in ('first-timer','been-around','seasoned-vet')))
 or (p_version<>'smf-v3' and p_challenge is not null)

 or (p_mode='rush' and (p_rush_stage_id is null or p_rush_stage_id not in ('smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village')))
 or (p_mode<>'rush' and p_rush_stage_id is not null)
 then return jsonb_build_object('code','invalid');end if;
 insert into smf_private.tickets(hash,run_id,mode,version,build,challenge,rush_stage_id)
 values(p_hash,p_run,p_mode,p_version,p_build,p_challenge,p_rush_stage_id)
 on conflict(run_id) do nothing returning expires_at into expiry;
 if expiry is null then return jsonb_build_object('code','conflict');end if;
 return jsonb_build_object('expiresAt',expiry);
end $$;

create or replace function public.smf_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text,p_rush_stage_id text) returns jsonb language sql security definer set search_path='' as $$
 select public.smf_ticket(p_hash,p_run,p_mode,p_version,p_build,p_bucket,p_rush_stage_id,null);
$$;

create or replace function public.smf_submit(p_hash text,p_digest text,p_record jsonb,p_bucket text,p_rush_stage_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t smf_private.tickets; duration_ms integer;begin
 if not smf_private.rate_ok('submit',p_bucket,120) then return jsonb_build_object('code','limited');end if;
 select * into t from smf_private.tickets where hash=p_hash for update;
 if not found then return jsonb_build_object('code','invalid_ticket');end if;
 if jsonb_typeof(p_record) is distinct from 'object'
 or t.run_id::text is distinct from p_record->>'runId'
 or t.mode is distinct from p_record->>'mode'
 or t.version is distinct from p_record->>'scoringVersion'
 or t.build is distinct from p_record->>'buildId'
 or t.challenge is distinct from p_record->>'challenge'
 or (t.version<>'smf-v3' and p_record ? 'challenge') then return jsonb_build_object('code','invalid_ticket');end if;
 if t.version='smf-v3' then
  if jsonb_typeof(p_record->'displayName') is distinct from 'string'
  or char_length(p_record->>'displayName') not between 2 and 16
  or p_record->>'displayName' ~ '[[:cntrl:]<>]'
  or p_record ? 'initials' then return jsonb_build_object('code','invalid_name');end if;
 elsif p_record ? 'displayName' then return jsonb_build_object('code','invalid');end if;

 if t.mode='rush' then
  if p_rush_stage_id is distinct from t.rush_stage_id
  or (p_record ? 'rushStageId' and jsonb_typeof(p_record->'rushStageId') is distinct from 'string')
  or coalesce(p_record->>'rushStageId','smf-pagoda') is distinct from t.rush_stage_id then return jsonb_build_object('code','invalid_ticket');end if;
  duration_ms:=case t.rush_stage_id when 'smf-living-room' then 68571 when 'smf-fractal' then 64000 when 'smf-grove' then 58182 when 'smf-amp' then 54857 when 'smf-pagoda' then 60000 when 'smf-village' then 66977 end;
  if jsonb_typeof(p_record->'stages') is distinct from 'array' then return jsonb_build_object('code','invalid_ticket');end if;
  if jsonb_array_length(p_record->'stages')<>1
  or p_record->'stages'->0->'stageIndex' is distinct from to_jsonb(0)
  or p_record->'stages'->0->>'stageId' is distinct from t.rush_stage_id
  or p_record->'stages'->0->'activeMs' is distinct from to_jsonb(duration_ms) then return jsonb_build_object('code','invalid_ticket');end if;
 elsif p_rush_stage_id is not null or p_record ? 'rushStageId' then
  return jsonb_build_object('code','invalid_ticket');
 end if;

 -- Partition identity is checked before replaying a previously accepted receipt.
 if t.payload_hash is not null then
  if t.payload_hash=p_digest then return jsonb_build_object('accepted',true);else return jsonb_build_object('code','conflict');end if;
 end if;
 if t.expires_at<=now() then return jsonb_build_object('code','expired');end if;
 if jsonb_typeof(p_record->'stages') is distinct from 'array' then return jsonb_build_object('code','invalid_ticket');end if;
 if extract(epoch from now()-t.issued_at)*1000+5000<(select coalesce(sum((s->>'activeMs')::bigint),0) from jsonb_array_elements(p_record->'stages') s) then return jsonb_build_object('code','invalid_ticket');end if;
 insert into smf_private.scores(ticket_hash,initials,display_name,challenge,score,stages_cleared,record,input_type,mode,version,rush_stage_id)
 values(p_hash,p_record->>'initials',p_record->>'displayName',t.challenge,(p_record->>'totalScore')::bigint,(p_record->>'stagesCleared')::integer,p_record,p_record->>'inputType',t.mode,t.version,t.rush_stage_id);
 update smf_private.tickets set payload_hash=p_digest where hash=p_hash;
 return jsonb_build_object('accepted',true);
end $$;

create function public.smf_board(p_mode text,p_version text,p_rush_stage_id text,p_challenge text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(row)||case when p_mode='rush' then jsonb_build_object('rushStageId',p_rush_stage_id) else '{}'::jsonb end),'[]'::jsonb)
 from (
  select 'smf'::text as "editionId",display_name as "displayName",challenge,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
  from smf_private.scores where mode=p_mode and version=p_version and version='smf-v3' and challenge=p_challenge and not hidden
  and ((p_mode='rush' and rush_stage_id=p_rush_stage_id) or (p_mode<>'rush' and p_rush_stage_id is null))
  order by case when p_mode='endless' then stages_cleared end desc,score desc,stages_cleared desc,received_at,id limit 50
 ) row;
$$;


-- Legacy board entry points preserve their original exact response keys.
create or replace function public.smf_board(p_mode text,p_version text,p_rush_stage_id text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(row)||case when p_mode='rush' then jsonb_build_object('rushStageId',p_rush_stage_id) else '{}'::jsonb end),'[]'::jsonb)
 from (
  select 'smf'::text as "editionId",initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
  from smf_private.scores
  where mode=p_mode and version=p_version and version<>'smf-v3' and not hidden
  and ((p_mode='rush' and rush_stage_id=p_rush_stage_id) or (p_mode<>'rush' and p_rush_stage_id is null))
  order by case when p_mode='endless' then stages_cleared end desc,score desc,stages_cleared desc,received_at,id limit 50
 ) row;
$$;



revoke all on function public.smf_ticket(text,uuid,text,text,text,text,text,text),public.smf_board(text,text,text,text),public.smf_ticket(text,uuid,text,text,text,text,text),public.smf_submit(text,text,jsonb,text,text),public.smf_board(text,text,text) from public,anon,authenticated;
grant execute on function public.smf_ticket(text,uuid,text,text,text,text,text,text),public.smf_board(text,text,text,text),public.smf_ticket(text,uuid,text,text,text,text,text),public.smf_submit(text,text,jsonb,text,text),public.smf_board(text,text,text) to service_role;
