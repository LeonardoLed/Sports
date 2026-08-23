-- Ratio Sports: backfill de países/orígenes en partidos gestionados.
-- Ejecutar UNA vez como rol postgres en Supabase SQL Editor.
-- Solo toca filas que tienen rival_country y algún origen vacío/—/-.

with derived as (
  select
    id,
    venue_side,
    nullif(trim(rival_country), '') as rival_country,
    case tracked_team_id
      when 'real_madrid' then 'España'
      when 'pumas' then 'México'
      when 'al_nassr' then 'Arabia Saudita'
      when 'sel_mex' then 'México'
      when 'sel_por' then 'Portugal'
      when 'cowboys' then 'USA'
      else null
    end as followed_country
  from public.matches
)
update public.matches m
set
  local_origin = case
    when d.venue_side = 'away' then d.rival_country
    else d.followed_country
  end,
  visitor_origin = case
    when d.venue_side = 'away' then d.followed_country
    else d.rival_country
  end,
  updated_at = now()
from derived d
where m.id = d.id
  and d.rival_country is not null
  and d.followed_country is not null
  and (
    coalesce(nullif(trim(m.local_origin), ''), '—') in ('—','-')
    or coalesce(nullif(trim(m.visitor_origin), ''), '—') in ('—','-')
  );

-- Verificación: estas filas deberían quedar con países reales.
select id, tracked_team_id, rival, rival_country, venue_side,
       local_name, local_origin, visitor_name, visitor_origin
from public.matches
where rival_country is not null
order by match_date desc, id desc;
