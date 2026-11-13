-- Accept the collision/friendship season without changing historical scores,
-- receipts, ticket identity, RPC signatures, or existing versioned board queries.
create or replace function public.arcade_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not arcade_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash !~ '^[a-f0-9]{64}$' or p_version is null or p_version not in ('arcade-v1','arcade-v2') or p_mode not in ('rush','festival','endless') then return jsonb_build_object('code','invalid');end if;
 insert into arcade_private.tickets(hash,run_id,mode,version,build) values(p_hash,p_run,p_mode,p_version,p_build) returning expires_at into expiry;
 return jsonb_build_object('expiresAt',expiry);
end $$;

create or replace function public.smf_ticket(p_hash text,p_run uuid,p_mode text,p_version text,p_build text,p_bucket text,p_rush_stage_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expiry timestamptz;begin
 if not smf_private.rate_ok('ticket',p_bucket,60) then return jsonb_build_object('code','limited');end if;
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_run is null or p_version is null or p_version not in ('smf-v1','smf-v2') or p_build is null or p_mode is null or p_mode not in ('rush','festival','endless')
 or (p_mode='rush' and (p_rush_stage_id is null or p_rush_stage_id not in ('smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village')))
 or (p_mode<>'rush' and p_rush_stage_id is not null) then return jsonb_build_object('code','invalid');end if;
 insert into smf_private.tickets(hash,run_id,mode,version,build,rush_stage_id)
 values(p_hash,p_run,p_mode,p_version,p_build,p_rush_stage_id)
 on conflict(run_id) do nothing returning expires_at into expiry;
 if expiry is null then return jsonb_build_object('code','conflict');end if;
 return jsonb_build_object('expiresAt',expiry);
end $$;

-- Keep both changed functions private, including on projects with different
-- default privileges. Legacy SMF wrappers continue to invoke this overload.
revoke all on function public.arcade_ticket(text,uuid,text,text,text,text),public.smf_ticket(text,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.arcade_ticket(text,uuid,text,text,text,text),public.smf_ticket(text,uuid,text,text,text,text,text) to service_role;
