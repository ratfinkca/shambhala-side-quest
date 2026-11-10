create schema smf_private;
revoke all on schema smf_private from public,anon,authenticated;
create table smf_private.tickets (
 hash text primary key, run_id uuid not null unique, mode text not null check(mode in ('rush','festival','endless')),
 version text not null, build text not null, issued_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours', payload_hash text
);
create table smf_private.scores (
 id bigint generated always as identity primary key,ticket_hash text unique not null references smf_private.tickets(hash),
 initials text not null check(initials ~ '^[A-Z0-9]{3}$'),score bigint not null check(score>=0),stages_cleared integer not null,
 record jsonb not null, input_type text not null,mode text not null,version text not null,received_at timestamptz not null default now(),hidden boolean not null default false
);
create index smf_rank on smf_private.scores(mode,version,score desc,stages_cleared desc,received_at,id) where not hidden;
create table smf_private.limits (kind text,bucket text,window_start timestamptz,requests integer not null,primary key(kind,bucket,window_start));
alter table smf_private.tickets enable row level security;
alter table smf_private.scores enable row level security;
alter table smf_private.limits enable row level security;
revoke all on all tables in schema smf_private from public,anon,authenticated;
create function smf_private.rate_ok(p_kind text,p_bucket text,p_max integer) returns boolean language plpgsql set search_path='' as $$
declare n integer;begin
 if p_bucket !~ '^[a-f0-9]{64}$' then return false;end if;
 insert into smf_private.limits values(p_kind,p_bucket,date_trunc('hour',now()),1)
 on conflict(kind,bucket,window_start) do update set requests=smf_private.limits.requests+1 returning requests into n;
 return n<=p_max;
end $$;
create function public.smf_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not smf_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash !~ '^[a-f0-9]{64}$' or p_version<>'smf-v1' or p_mode not in ('rush','festival','endless') then return jsonb_build_object('code','invalid');end if;
 insert into smf_private.tickets(hash,run_id,mode,version,build) values(p_hash,p_run,p_mode,p_version,p_build) on conflict(run_id) do nothing returning expires_at into expiry;
 if expiry is null then return jsonb_build_object('code','conflict'); end if;
 return jsonb_build_object('expiresAt',expiry);
end $$;
create function public.smf_submit(p_hash text,p_digest text,p_record jsonb,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t smf_private.tickets;begin
 if not smf_private.rate_ok('submit',p_bucket,120) then return jsonb_build_object('code','limited');end if;
 select * into t from smf_private.tickets where hash=p_hash for update;
 if not found then return jsonb_build_object('code','invalid_ticket');end if;
 if t.payload_hash is not null then
  if t.payload_hash=p_digest then return jsonb_build_object('accepted',true);else return jsonb_build_object('code','conflict');end if;
 end if;
 if t.expires_at<=now() then return jsonb_build_object('code','expired');end if;
 if t.run_id::text<>p_record->>'runId' or t.mode<>p_record->>'mode' or t.version<>p_record->>'scoringVersion' or t.build<>p_record->>'buildId'
 or extract(epoch from now()-t.issued_at)*1000+5000<(select coalesce(sum((s->>'activeMs')::bigint),0) from jsonb_array_elements(p_record->'stages') s) then return jsonb_build_object('code','invalid_ticket');end if;
 insert into smf_private.scores(ticket_hash,initials,score,stages_cleared,record,input_type,mode,version)
 values(p_hash,p_record->>'initials',(p_record->>'totalScore')::bigint,(p_record->>'stagesCleared')::integer,p_record,p_record->>'inputType',t.mode,t.version);
 update smf_private.tickets set payload_hash=p_digest where hash=p_hash;
 return jsonb_build_object('accepted',true);
end $$;
create function public.smf_board(p_mode text,p_version text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(row),'[]'::jsonb) from (select 'smf'::text as "editionId",initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
 from smf_private.scores where mode=p_mode and version=p_version and not hidden order by case when p_mode='endless' then stages_cleared end desc,score desc,stages_cleared desc,received_at,id limit 50) row;
$$;
create function public.maintain_smf() returns void language plpgsql security definer set search_path='' as $$begin
 delete from smf_private.tickets where expires_at<now() and payload_hash is null;
 delete from smf_private.limits where window_start<now()-interval '24 hours';
end $$;
revoke all on all functions in schema smf_private from public,anon,authenticated;
revoke all on function public.smf_ticket(text,uuid,text,text,text,text),public.smf_submit(text,text,jsonb,text),public.smf_board(text,text),public.maintain_smf() from public,anon,authenticated;
grant execute on function public.smf_ticket(text,uuid,text,text,text,text),public.smf_submit(text,text,jsonb,text),public.smf_board(text,text),public.maintain_smf() to service_role;

create table smf_private.events (id uuid primary key, guest uuid not null, received_at timestamptz not null default now(), event jsonb not null);
alter table smf_private.events enable row level security;
revoke all on smf_private.events from public,anon,authenticated;
create function public.smf_ingest(p_events jsonb,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare e jsonb; ids jsonb := '[]'::jsonb; begin
 if not smf_private.rate_ok('events',p_bucket,120) then return jsonb_build_object('code','limited'); end if;
 for e in select value from jsonb_array_elements(p_events) loop
  insert into smf_private.events(id,guest,event) values((e->>'eventId')::uuid,(e->>'guestId')::uuid,e) on conflict(id) do nothing;
  ids := ids || jsonb_build_array(e->>'eventId');
 end loop;
 return jsonb_build_object('accepted',ids);
end $$;
revoke all on function public.smf_ingest(jsonb,text) from public,anon,authenticated;
grant execute on function public.smf_ingest(jsonb,text) to service_role;
create function public.maintain_smf_events() returns void language sql security definer set search_path='' as $$ delete from smf_private.events where received_at < now()-interval '30 days' $$;
revoke all on function public.maintain_smf_events() from public,anon,authenticated;
grant execute on function public.maintain_smf_events() to service_role;
select cron.schedule('smf-maintenance','25 * * * *','select public.maintain_smf(); select public.maintain_smf_events()');
