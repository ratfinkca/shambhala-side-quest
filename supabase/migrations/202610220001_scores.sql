create schema arcade_private;
revoke all on schema arcade_private from public,anon,authenticated;
create table arcade_private.tickets (
 hash text primary key, run_id uuid not null, mode text not null check(mode in ('rush','festival')),
 version text not null, build text not null, issued_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours', payload_hash text
);
create table arcade_private.scores (
 id bigint generated always as identity primary key,ticket_hash text unique not null references arcade_private.tickets(hash),
 initials text not null check(initials ~ '^[A-Z0-9]{3}$'),score bigint not null check(score>=0),stages_cleared integer not null,
 record jsonb not null, input_type text not null,mode text not null,version text not null,received_at timestamptz not null default now(),hidden boolean not null default false
);
create index arcade_rank on arcade_private.scores(mode,version,score desc,stages_cleared desc,received_at,id) where not hidden;
create table arcade_private.limits (kind text,bucket text,window_start timestamptz,requests integer not null,primary key(kind,bucket,window_start));
alter table arcade_private.tickets enable row level security;
alter table arcade_private.scores enable row level security;
alter table arcade_private.limits enable row level security;
revoke all on all tables in schema arcade_private from public,anon,authenticated;
create function arcade_private.rate_ok(p_kind text,p_bucket text,p_max integer) returns boolean language plpgsql set search_path='' as $$
declare n integer;begin
 if p_bucket !~ '^[a-f0-9]{64}$' then return false;end if;
 insert into arcade_private.limits values(p_kind,p_bucket,date_trunc('hour',now()),1)
 on conflict(kind,bucket,window_start) do update set requests=arcade_private.limits.requests+1 returning requests into n;
 return n<=p_max;
end $$;
create function public.arcade_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not arcade_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash !~ '^[a-f0-9]{64}$' or p_version<>'arcade-v1' or p_mode not in ('rush','festival') then return jsonb_build_object('code','invalid');end if;
 insert into arcade_private.tickets(hash,run_id,mode,version,build) values(p_hash,p_run,p_mode,p_version,p_build) returning expires_at into expiry;
 return jsonb_build_object('expiresAt',expiry);
end $$;
create function public.arcade_submit(p_hash text,p_digest text,p_record jsonb,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t arcade_private.tickets;begin
 if not arcade_private.rate_ok('submit',p_bucket,120) then return jsonb_build_object('code','limited');end if;
 select * into t from arcade_private.tickets where hash=p_hash for update;
 if not found then return jsonb_build_object('code','invalid_ticket');end if;
 if t.payload_hash is not null then
  if t.payload_hash=p_digest then return jsonb_build_object('accepted',true);else return jsonb_build_object('code','conflict');end if;
 end if;
 if t.expires_at<=now() then return jsonb_build_object('code','expired');end if;
 if t.run_id::text<>p_record->>'runId' or t.mode<>p_record->>'mode' or t.version<>p_record->>'scoringVersion' or t.build<>p_record->>'buildId'
 or extract(epoch from now()-t.issued_at)*1000+5000<jsonb_array_length(p_record->'stages')*60000 then return jsonb_build_object('code','invalid_ticket');end if;
 insert into arcade_private.scores(ticket_hash,initials,score,stages_cleared,record,input_type,mode,version)
 values(p_hash,p_record->>'initials',(p_record->>'totalScore')::bigint,(p_record->>'stagesCleared')::integer,p_record,p_record->>'inputType',t.mode,t.version);
 update arcade_private.tickets set payload_hash=p_digest where hash=p_hash;
 return jsonb_build_object('accepted',true);
end $$;
create function public.arcade_board(p_mode text,p_version text) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(row),'[]'::jsonb) from (select initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
 from arcade_private.scores where mode=p_mode and version=p_version and not hidden order by score desc,stages_cleared desc,received_at,id limit 50) row;
$$;
create function public.maintain_arcade() returns void language plpgsql security definer set search_path='' as $$begin
 delete from arcade_private.tickets where expires_at<now() and payload_hash is null;
 delete from arcade_private.limits where window_start<now()-interval '24 hours';
end $$;
revoke all on all functions in schema arcade_private from public,anon,authenticated;
revoke all on function public.arcade_ticket(text,uuid,text,text,text,text),public.arcade_submit(text,text,jsonb,text),public.arcade_board(text,text),public.maintain_arcade() from public,anon,authenticated;
grant execute on function public.arcade_ticket(text,uuid,text,text,text,text),public.arcade_submit(text,text,jsonb,text),public.arcade_board(text,text),public.maintain_arcade() to service_role;
