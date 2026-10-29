-- Add Endless without changing existing scores, ticket lifetimes or RPC grants.
alter table arcade_private.tickets drop constraint tickets_mode_check;
alter table arcade_private.tickets add constraint tickets_mode_check check(mode in ('rush','festival','endless'));
create index arcade_endless_rank on arcade_private.scores(version,stages_cleared desc,score desc,received_at,id) where mode='endless' and not hidden;
create or replace function public.arcade_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not arcade_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash !~ '^[a-f0-9]{64}$' or p_version<>'arcade-v1' or p_mode not in ('rush','festival','endless') then return jsonb_build_object('code','invalid');end if;
 insert into arcade_private.tickets(hash,run_id,mode,version,build) values(p_hash,p_run,p_mode,p_version,p_build) returning expires_at into expiry;
 return jsonb_build_object('expiresAt',expiry);
end $$;
create or replace function public.arcade_board(p_mode text,p_version text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_mode='endless' then
  return (select coalesce(jsonb_agg(row),'[]'::jsonb) from (
   select initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
   from arcade_private.scores where mode='endless' and version=p_version and not hidden
   order by stages_cleared desc,score desc,received_at,id limit 50) row);
 end if;
 return (select coalesce(jsonb_agg(row),'[]'::jsonb) from (
  select initials,score,stages_cleared as "stagesCleared",input_type as "inputType",mode,version as "scoringVersion",received_at as "receivedAt"
  from arcade_private.scores where mode=p_mode and version=p_version and not hidden
  order by score desc,stages_cleared desc,received_at,id limit 50) row);
end $$;
