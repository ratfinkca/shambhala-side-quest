-- Rush scores use the authored clock of one selected main venue. Keep smf-v1:
-- existing Pagoda scores remain comparable, and other venues have their own boards.
alter table smf_private.tickets add column rush_stage_id text;
alter table smf_private.scores add column rush_stage_id text;
update smf_private.tickets set rush_stage_id='smf-pagoda' where mode='rush';
update smf_private.scores set rush_stage_id='smf-pagoda' where mode='rush';

alter table smf_private.tickets add constraint smf_ticket_rush_venue check (
 (mode='rush' and rush_stage_id is not null and rush_stage_id in ('smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village'))
 or (mode<>'rush' and rush_stage_id is null)
);
alter table smf_private.scores add constraint smf_score_rush_venue check (
 (mode='rush' and rush_stage_id is not null and rush_stage_id in ('smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village'))
 or (mode<>'rush' and rush_stage_id is null)
);
create index smf_rush_rank on smf_private.scores(version,rush_stage_id,score desc,stages_cleared desc,received_at,id) where mode='rush' and not hidden;

create function public.smf_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text,p_rush_stage_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not smf_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_run is null or p_version is distinct from 'smf-v1' or p_build is null or p_mode is null or p_mode not in ('rush','festival','endless')
 or (p_mode='rush' and (p_rush_stage_id is null or p_rush_stage_id not in ('smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village')))
 or (p_mode<>'rush' and p_rush_stage_id is not null) then return jsonb_build_object('code','invalid');end if;
 insert into smf_private.tickets(hash,run_id,mode,version,build,rush_stage_id)
 values(p_hash,p_run,p_mode,p_version,p_build,p_rush_stage_id)
 on conflict(run_id) do nothing returning expires_at into expiry;
 if expiry is null then return jsonb_build_object('code','conflict');end if;
 return jsonb_build_object('expiresAt',expiry);
end $$;

-- Old clients keep their original RPC signatures and implicitly select Pagoda.
create or replace function public.smf_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text) returns jsonb language sql security definer set search_path='' as $$
 select public.smf_ticket(p_hash,p_run,p_mode,p_version,p_build,p_bucket,case when p_mode='rush' then 'smf-pagoda' end);
$$;

create function public.smf_submit(p_hash text,p_digest text,p_record jsonb,p_bucket text,p_rush_stage_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t smf_private.tickets; duration_ms integer;begin
 if not smf_private.rate_ok('submit',p_bucket,120) then return jsonb_build_object('code','limited');end if;
 select * into t from smf_private.tickets where hash=p_hash for update;
 if not found then return jsonb_build_object('code','invalid_ticket');end if;
 if jsonb_typeof(p_record) is distinct from 'object'
 or t.run_id::text is distinct from p_record->>'runId'
 or t.mode is distinct from p_record->>'mode'
 or t.version is distinct from p_record->>'scoringVersion'
 or t.build is distinct from p_record->>'buildId' then return jsonb_build_object('code','invalid_ticket');end if;
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
 -- Check the selected venue even for retries. A consumed ticket cannot be
 -- replayed into another partition using its original digest.
 if t.payload_hash is not null then
  if t.payload_hash=p_digest then return jsonb_build_object('accepted',true);else return jsonb_build_object('code','conflict');end if;
 end if;
 if t.expires_at<=now() then return jsonb_build_object('code','expired');end if;
 if extract(epoch from now()-t.issued_at)*1000+5000<(select coalesce(sum((s->>'activeMs')::bigint),0) from jsonb_array_elements(p_record->'stages') s) then return jsonb_build_object('code','invalid_ticket');end if;
 insert into smf_private.scores(ticket_hash,initials,score,stages_cleared,record,input_type,mode,version,rush_stage_id)
 values(p_hash,p_record->>'initials',(p_record->>'totalScore')::bigint,(p_record->>'stagesCleared')::integer,p_record,p_record->>'inputType',t.mode,t.version,t.rush_stage_id);
 update smf_private.tickets set payload_hash=p_digest where hash=p_hash;
 return jsonb_build_object('accepted',true);
end $$;

create or replace function public.smf_submit(p_hash text,p_digest text,p_record jsonb,p_bucket text) returns jsonb language sql security definer set search_path='' as $$
 select public.smf_submit(p_hash,p_digest,p_record,p_bucket,case when p_record->>'mode'='rush' then 'smf-pagoda' end);
$$;

create function public.smf_board(p_mode text,p_version text,p_rush_stage_id text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(row)||case when p_mode='rush' then jsonb_build_object('rushStageId',p_rush_stage_id) else '{}'::jsonb end),'[]'::jsonb)
 from (
  select 'smf'::text as "editionId",initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
  from smf_private.scores
  where mode=p_mode and version=p_version and not hidden
  and ((p_mode='rush' and rush_stage_id=p_rush_stage_id) or (p_mode<>'rush' and p_rush_stage_id is null))
  order by case when p_mode='endless' then stages_cleared end desc,score desc,stages_cleared desc,received_at,id limit 50
 ) row;
$$;

create or replace function public.smf_board(p_mode text,p_version text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(value-'rushStageId'),'[]'::jsonb)
 from jsonb_array_elements(public.smf_board(p_mode,p_version,case when p_mode='rush' then 'smf-pagoda' end));
$$;

-- New overloads otherwise inherit PostgreSQL's default PUBLIC execute grant.
revoke all on function public.smf_ticket(text,uuid,text,text,text,text,text),public.smf_submit(text,text,jsonb,text,text),public.smf_board(text,text,text) from public,anon,authenticated;
grant execute on function public.smf_ticket(text,uuid,text,text,text,text,text),public.smf_submit(text,text,jsonb,text,text),public.smf_board(text,text,text) to service_role;
revoke all on function public.smf_ticket(text,uuid,text,text,text,text),public.smf_submit(text,text,jsonb,text),public.smf_board(text,text) from public,anon,authenticated;
grant execute on function public.smf_ticket(text,uuid,text,text,text,text),public.smf_submit(text,text,jsonb,text),public.smf_board(text,text) to service_role;
