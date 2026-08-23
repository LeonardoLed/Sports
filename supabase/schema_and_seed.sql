-- Ratio Sports · PostgreSQL / Supabase
-- Fuente dinámica: SOLO partidos y semanas deportivas.
-- Equipos, logos y torneos permanecen como catálogos estáticos en el frontend.
-- Ejecutar completo en Supabase > SQL Editor.

create table if not exists public.matches (
  id text primary key,
  tracked_team_id text not null,
  match_date date not null,
  rival text not null,
  rival_country text,
  competition text not null default 'Sin competición',
  phase text,
  stadium text,
  city text,
  venue_side text not null default 'home' check (venue_side in ('home','away')),
  goals_for integer not null check (goals_for >= 0),
  goals_against integer not null check (goals_against >= 0),
  result text not null check (result in ('Ganado','Empatado','Perdido')),
  local_name text not null,
  visitor_name text not null,
  local_origin text,
  visitor_origin text,
  local_score integer not null check (local_score >= 0),
  visitor_score integer not null check (visitor_score >= 0),
  score_annotation text,
  aggregate_local integer check (aggregate_local is null or aggregate_local >= 0),
  aggregate_visitor integer check (aggregate_visitor is null or aggregate_visitor >= 0),
  penalty_local integer check (penalty_local is null or penalty_local >= 0),
  penalty_visitor integer check (penalty_visitor is null or penalty_visitor >= 0),
  extra_time boolean not null default false,
  international boolean not null default false,
  title_decision boolean not null default false,
  title_status text check (title_status is null or title_status in ('ganado','perdido','eliminado','en_curso')),
  title_won boolean not null default false,
  tournament_id text,
  user_added boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_score_consistency check (
    (venue_side='home' and local_score=goals_for and visitor_score=goals_against)
    or
    (venue_side='away' and local_score=goals_against and visitor_score=goals_for)
  )
);

-- Migración desde la versión anterior: el catálogo de equipos ya no vive en Supabase.
alter table public.matches drop constraint if exists matches_tracked_team_id_fkey;
drop table if exists public.tracked_teams;

create table if not exists public.sports_weeks (
  id text primary key,
  label text not null,
  start_month integer not null check (start_month between 1 and 12),
  start_day integer not null check (start_day between 1 and 31),
  end_month integer not null check (end_month between 1 and 12),
  end_day integer not null check (end_day between 1 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matches_date on public.matches(match_date desc);
create index if not exists idx_matches_team_date on public.matches(tracked_team_id, match_date desc);
create index if not exists idx_matches_competition on public.matches(competition);
create index if not exists idx_matches_title on public.matches(title_decision) where title_decision = true;
create index if not exists idx_sports_weeks_start on public.sports_weeks(start_month,start_day);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists sports_weeks_set_updated_at on public.sports_weeks;
create trigger sports_weeks_set_updated_at before update on public.sports_weeks
for each row execute function public.set_updated_at();

alter table public.matches enable row level security;
alter table public.sports_weeks enable row level security;

drop policy if exists "public read matches" on public.matches;
create policy "public read matches" on public.matches for select using (true);

drop policy if exists "public read sports weeks" on public.sports_weeks;
create policy "public read sports weeks" on public.sports_weeks for select using (true);

drop policy if exists "authenticated insert matches" on public.matches;
create policy "authenticated insert matches" on public.matches for insert to authenticated with check (true);
drop policy if exists "authenticated update matches" on public.matches;
create policy "authenticated update matches" on public.matches for update to authenticated using (true) with check (true);
drop policy if exists "authenticated delete matches" on public.matches;
create policy "authenticated delete matches" on public.matches for delete to authenticated using (true);

drop policy if exists "authenticated insert sports weeks" on public.sports_weeks;
create policy "authenticated insert sports weeks" on public.sports_weeks for insert to authenticated with check (true);
drop policy if exists "authenticated update sports weeks" on public.sports_weeks;
create policy "authenticated update sports weeks" on public.sports_weeks for update to authenticated using (true) with check (true);
drop policy if exists "authenticated delete sports weeks" on public.sports_weeks;
create policy "authenticated delete sports weeks" on public.sports_weeks for delete to authenticated using (true);

insert into public.sports_weeks (id,label,start_month,start_day,end_month,end_day) values
  ('w1','Semana 1',1,1,1,11),
  ('w2','Semana 2',1,12,1,18),
  ('w3','Semana 3',1,19,1,31),
  ('w4','Semana 4',2,1,2,8),
  ('w5','Semana 5',2,9,2,15),
  ('w6','Semana 6',2,16,2,22),
  ('w7','Semana 7',2,23,2,28),
  ('w8','Semana 8',3,1,3,8),
  ('w9','Semana 9',3,9,3,15),
  ('w10','Semana 10',3,16,3,22),
  ('w11','Semana 11',3,23,3,31),
  ('w12','Semana 12',4,1,4,12),
  ('w13','Semana 13',4,13,4,19),
  ('w14','Semana 14',4,20,4,30),
  ('w15','Semana 15',5,1,5,10),
  ('w16','Semana 16',5,11,5,17),
  ('w17','Semana 17',5,18,5,31),
  ('w18','Semana 18',6,1,6,14),
  ('w19','Semana 19',6,15,6,21),
  ('w20','Semana 20',6,22,6,31),
  ('w21','Semana 21',7,1,7,19),
  ('w22','Semana 22',7,20,7,31)
on conflict (id) do update set
  label=excluded.label,
  start_month=excluded.start_month,
  start_day=excluded.start_day,
  end_month=excluded.end_month,
  end_day=excluded.end_day;

insert into public.matches (id,tracked_team_id,match_date,rival,rival_country,competition,phase,stadium,city,venue_side,goals_for,goals_against,result,local_name,visitor_name,local_origin,visitor_origin,local_score,visitor_score,score_annotation,aggregate_local,aggregate_visitor,penalty_local,penalty_visitor,extra_time,international,title_decision,title_status,title_won,tournament_id,user_added) values
  ('m1_al_nassr','al_nassr','2026-01-02','Al-Ahli',NULL,'Saudi Professional League','Jornada 12','','','away',2,3,'Perdido','Al-Ahli','Al Nassr','Arabia Saudita','Arabia Saudita',3,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m2_real_madrid','real_madrid','2026-01-04','Real Betis',NULL,'La Liga','Jornada 19','','','home',5,1,'Ganado','Real Madrid','Real Betis','España','España',5,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m3_cowboys','cowboys','2026-01-04','New York Giants',NULL,'NFL Temporada','Week 18','','','away',17,34,'Perdido','New York Giants','Dallas Cowboys','NFC Este','NFC Este',34,17,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m4_al_nassr','al_nassr','2026-01-08','Al Qadisiyah',NULL,'Saudi Professional League','Jornada 13','','','home',1,2,'Perdido','Al Nassr','Al Qadisiyah','Arabia Saudita','Arabia Saudita',1,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m5_real_madrid','real_madrid','2026-01-08','Atlético de Madrid',NULL,'Supercopa de España','Semifinales','','','away',2,1,'Ganado','Atlético de Madrid','Real Madrid','España','España',1,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m6_pumas','pumas','2026-01-11','Querétaro',NULL,'Liga BBVA MX Clausura 2026','Jornada 1','','','home',1,1,'Empatado','Pumas UNAM','Querétaro','México','México',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m7_real_madrid','real_madrid','2026-01-11','FC Barcelona',NULL,'Supercopa de España','Gran Final','','','away',2,3,'Perdido','FC Barcelona','Real Madrid','España','España',3,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'perdido',FALSE,'supercopa_de_espana',FALSE),
  ('m8_al_nassr','al_nassr','2026-01-12','Al Hilal',NULL,'Saudi Professional League','Jornada 14','','','away',1,3,'Perdido','Al Hilal','Al Nassr','Arabia Saudita','Arabia Saudita',3,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m9_real_madrid','real_madrid','2026-01-14','Albacete',NULL,'Copa del Rey','Octavos de Final','','','away',2,3,'Perdido','Albacete','Real Madrid','España','España',3,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'eliminado',FALSE,'copa_del_rey',FALSE),
  ('m10_pumas','pumas','2026-01-14','Tigres UANL',NULL,'Liga BBVA MX Clausura 2026','Jornada 2','','','away',1,0,'Ganado','Tigres UANL','Pumas UNAM','México','México',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m11_real_madrid','real_madrid','2026-01-17','Levante',NULL,'La Liga','Jornada 20','','','home',2,0,'Ganado','Real Madrid','Levante','España','España',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m12_al_nassr','al_nassr','2026-01-17','Al Shabab',NULL,'Saudi Professional League','Jornada 15','','','home',3,2,'Ganado','Al Nassr','Al Shabab','Arabia Saudita','Arabia Saudita',3,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m13_pumas','pumas','2026-01-18','León',NULL,'Liga BBVA MX Clausura 2026','Jornada 3','','','home',1,1,'Empatado','Pumas UNAM','León','México','México',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m14_real_madrid','real_madrid','2026-01-20','AS Mónaco',NULL,'UEFA Champions League 2025-2026','Fase de Liga J7','','','home',6,1,'Ganado','Real Madrid','AS Mónaco','España','Francia',6,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m15_al_nassr','al_nassr','2026-01-21','Damac',NULL,'Saudi Professional League','Jornada 16','','','away',2,1,'Ganado','Damac','Al Nassr','Arabia Saudita','Arabia Saudita',1,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m16_sel_mex','sel_mex','2026-01-22','Panamá',NULL,'Partido de Preparación','Partido Amistoso','','','away',1,0,'Ganado','Panamá','México','América Central','América del Norte',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m17_real_madrid','real_madrid','2026-01-24','Villareal',NULL,'La Liga','Jornada 21','','','away',2,0,'Ganado','Villareal','Real Madrid','España','España',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m18_sel_mex','sel_mex','2026-01-25','Bolivia',NULL,'Partido de Preparación','Partido Amistoso','','','away',1,0,'Ganado','Bolivia','México','América del Sur','América del Norte',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m19_al_nassr','al_nassr','2026-01-26','Al-Taawoun',NULL,'Saudi Professional League','Jornada 17','','','home',1,0,'Ganado','Al Nassr','Al-Taawoun','Arabia Saudita','Arabia Saudita',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m20_real_madrid','real_madrid','2026-01-28','Benfica',NULL,'UEFA Champions League 2025-2026','Fase de Liga J8','','','away',2,4,'Perdido','Benfica','Real Madrid','Portugal','España',4,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m21_al_nassr','al_nassr','2026-01-30','Al Kholood',NULL,'Saudi Professional League','Jornada 18','','','away',3,0,'Ganado','Al Kholood','Al Nassr','Arabia Saudita','Arabia Saudita',0,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m22_pumas','pumas','2026-01-30','Santos Laguna',NULL,'Liga BBVA MX Clausura 2026','Jornada 4','','','home',4,0,'Ganado','Pumas UNAM','Santos Laguna','México','México',4,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m23_real_madrid','real_madrid','2026-02-01','Rayo Vallecano',NULL,'La Liga','Jornada 22','','','home',2,1,'Ganado','Real Madrid','Rayo Vallecano','España','España',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m24_al_nassr','al_nassr','2026-02-02','Al-Riyadh',NULL,'Saudi Professional League','Jornada 19','','','away',1,0,'Ganado','Al-Riyadh','Al Nassr','Arabia Saudita','Arabia Saudita',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m25_pumas','pumas','2026-02-03','San Diego',NULL,'CONCACAF Champions Cup','Primera Ronda Ida','','','away',1,4,'Perdido','San Diego','Pumas UNAM','Estados Unidos','México',4,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m26_al_nassr','al_nassr','2026-02-06','Al-Ittihad Jeddah',NULL,'Saudi Professional League','Jornada 20','','','home',2,0,'Ganado','Al Nassr','Al-Ittihad Jeddah','Arabia Saudita','Arabia Saudita',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m27_pumas','pumas','2026-02-07','Atlas',NULL,'Liga BBVA MX Clausura 2026','Jornada 5','','','away',2,2,'Empatado','Atlas','Pumas UNAM','México','México',2,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m28_real_madrid','real_madrid','2026-02-08','Valencia',NULL,'La Liga','Jornada 23','','','away',2,0,'Ganado','Valencia','Real Madrid','España','España',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m29_pumas','pumas','2026-02-28','San Diego',NULL,'CONCACAF Champions Cup','Primera Ronda','','','home',1,0,'Perdido','Pumas UNAM','San Diego FC','México','Estados Unidos',1,0,'(2-4)',2,4,NULL,NULL,FALSE,FALSE,TRUE,'eliminado',FALSE,'concacaf_champions_cup',FALSE),
  ('m30_al_nassr','al_nassr','2026-02-11','Arkadag',NULL,'AFC Champions League Two','Octavos de Final Ida','','','away',1,0,'Ganado','Arkadag','Al Nassr','Turkemenistán','Arabia Saudita',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m31_pumas','pumas','2026-02-13','Puebla',NULL,'Liga BBVA MX Clausura 2026','Jornada 6','','','away',3,2,'Ganado','Puebla','Pumas UNAM','México','México',2,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m32_al_nassr','al_nassr','2026-02-14','Al Fateh SC',NULL,'Saudi Professional League','Jornada 21','','','away',2,0,'Ganado','Al Fateh SC','Al Nassr','Arabia Saudita','Arabia Saudita',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m33_real_madrid','real_madrid','2026-02-14','Real Sociedad',NULL,'La Liga','Jornada 24','','','home',4,1,'Ganado','Real Madrid','Real Sociedad','España','España',4,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m34_real_madrid','real_madrid','2026-02-17','Benfica',NULL,'UEFA Champions League 2025-2026','Knockout Playoff Ida','','','away',1,0,'Ganado','Benfica','Real Madrid','Portugal','España',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m35_al_nassr','al_nassr','2026-02-18','Arkadag',NULL,'AFC Champions League Two','Octavos de Final Vuelta','','','home',1,0,'Ganado','Al Nassr','Arkadag','Arabia Saudita','Turkemenistán',1,0,'(2-0)',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m36_real_madrid','real_madrid','2026-02-21','Osasuna',NULL,'La Liga','Jornada 25','','','away',1,2,'Perdido','Osasuna','Real Madrid','España','España',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m37_al_nassr','al_nassr','2026-02-21','Al-Hazem',NULL,'Saudi Professional League','Jornada 22','','','home',4,0,'Ganado','Al Nassr','Al-Hazem','Arabia Saudita','Arabia Saudita',4,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m38_pumas','pumas','2026-02-22','Monterrey',NULL,'Liga BBVA MX Clausura 2026','Jornada 7','','','home',2,0,'Ganado','Pumas UNAM','Monterrey','México','México',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m39_al_nassr','al_nassr','2026-02-25','Al-Najma',NULL,'Saudi Professional League','Jornada 23','','','away',5,0,'Ganado','Al-Najma','Al Nassr','Arabia Saudita','Arabia Saudita',0,5,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m40_real_madrid','real_madrid','2026-02-25','Benfica',NULL,'UEFA Champions League 2025-2026','Knockout Playoff Vuelta','','','home',2,1,'Ganado','Real Madrid','Benfica','España','Portugal',2,1,'(3-1)',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m41_sel_mex','sel_mex','2026-02-25','Islandia',NULL,'Partido de Preparación','Partido Amistoso','','','home',4,0,'Ganado','México','Islandia','América del Norte','Europa',4,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m42_pumas','pumas','2026-02-27','Tijuana',NULL,'Liga BBVA MX Clausura 2026','Jornada 8','','','away',1,1,'Empatado','Tijuana','Pumas UNAM','México','México',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m43_al_nassr','al_nassr','2026-02-28','Al Faiha',NULL,'Saudi Professional League','Jornada 24','','','away',3,1,'Ganado','Al Faiha','Al Nassr','Arabia Saudita','Arabia Saudita',1,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m44_real_madrid','real_madrid','2026-03-02','Getafe',NULL,'La Liga','Jornada  26','','','home',0,1,'Perdido','Real Madrid','Getafe','España','España',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m45_pumas','pumas','2026-03-03','Toluca',NULL,'Liga BBVA MX Clausura 2026','Jornada 9','','','home',2,3,'Perdido','Pumas UNAM','Toluca','México','México',2,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m46_real_madrid','real_madrid','2026-03-06','Celta de Vigo',NULL,'La Liga','Jornada 27','','','away',2,1,'Ganado','Celta de Vigo','Real Madrid','España','España',1,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m47_pumas','pumas','2026-03-06','Necaxa',NULL,'Liga BBVA MX Clausura 2026','Jornada 10','','','away',1,0,'Ganado','Necaxa','Pumas UNAM','México','México',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m48_al_nassr','al_nassr','2026-03-07','NEOM',NULL,'Saudi Professional League','Jornada 25','','','home',1,0,'Ganado','Al Nassr','NEOM','Arabia Saudita','Arabia Saudita',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m49_real_madrid','real_madrid','2026-03-11','Manchester City',NULL,'UEFA Champions League 2025-2026','Octavos de Final Ida','','','home',3,0,'Ganado','Real Madrid','Manchester City','España','Inglaterra',3,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m50_al_nassr','al_nassr','2026-03-14','Al Khaleej',NULL,'Saudi Professional League','Jornada 26','','','away',5,0,'Ganado','Al Khaleej','Al Nassr','Arabia Saudita','Arabia Saudita',0,5,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m51_real_madrid','real_madrid','2026-03-14','Elche',NULL,'La Liga','Jornada 28','','','home',4,1,'Ganado','Real Madrid','Elche','España','España',4,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m52_pumas','pumas','2026-03-14','Cruz Azul',NULL,'Liga BBVA MX Clausura 2026','Jornada 11','','','home',2,2,'Empatado','Pumas UNAM','Cruz Azul','México','México',2,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m53_real_madrid','real_madrid','2026-03-17','Manchester City',NULL,'UEFA Champions League 2025-2026','Octavos de Final Vuelta','','','away',2,1,'Ganado','Manchester City','Real Madrid','Inglaterra','España',1,2,'(5-1)',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m54_pumas','pumas','2026-03-21','América',NULL,'Liga BBVA MX Clausura 2026','Jornada 12','','','home',1,0,'Ganado','Pumas UNAM','América','México','México',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m55_real_madrid','real_madrid','2026-03-22','Atlético de Madrid',NULL,'La Liga','Jornada 29','','','home',3,2,'Ganado','Real Madrid','Atlético de Madrid','España','España',3,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m56_sel_mex','sel_mex','2026-03-28','Portugal',NULL,'Fecha FIFA','Partido Amistoso','','','home',0,0,'Empatado','México','Portugal','América del Norte','Europa',0,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m56_sel_por','sel_por','2026-03-28','México',NULL,'Fecha FIFA','Partido Amistoso','','','away',0,0,'Empatado','México','Portugal','América del Norte','Europa',0,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m57_sel_por','sel_por','2026-03-31','Estados Unidos',NULL,'Fecha FIFA','Partido Amistoso','','','away',2,0,'Ganado','Estados Unidos','Portugal','América del Norte','Europa',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m58_sel_mex','sel_mex','2026-03-31','Bélgica',NULL,'Fecha FIFA','Partido Amistoso','','','home',1,1,'Empatado','México','Bélgica','América del Norte','Europa',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m59_al_nassr','al_nassr','2026-04-03','Al-Najma',NULL,'Saudi Professional League','Jornada 27','','','home',5,2,'Ganado','Al Nassr','Al-Najma','Arabia Saudita','Arabia Saudita',5,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m60_real_madrid','real_madrid','2026-04-04','Mallorca',NULL,'La Liga','Jornada 30','','','away',1,2,'Perdido','Mallorca','Real Madrid','España','España',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m61_pumas','pumas','2026-04-05','Guadalajara',NULL,'Liga BBVA MX Clausura 2026','Jornada 13','','','away',2,2,'Empatado','Guadalajara','Pumas UNAM','México','México',2,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m62_real_madrid','real_madrid','2026-04-07','Bayer Munich',NULL,'UEFA Champions League 2025-2026','Cuartos de Final Ida','','','home',1,2,'Perdido','Real Madrid','Bayer Munich','España','Aleamania',1,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m63_real_madrid','real_madrid','2026-04-10','Girona',NULL,'La Liga','Jornada 31','','','home',1,1,'Empatado','Real Madrid','Girona','España','España',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m64_al_nassr','al_nassr','2026-04-11','Al-Okhdood',NULL,'Saudi Professional League','Jornada 29','','','away',2,0,'Ganado','Al-Okhdood','Al Nassr','Arabia Saudita','Arabia Saudita',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m65_pumas','pumas','2026-04-12','Mazatlán',NULL,'Liga BBVA MX Clausura 2026','Jornada 14','','','home',3,1,'Ganado','Pumas UNAM','Mazatlán','México','México',3,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m66_al_nassr','al_nassr','2026-04-15','Al-Ettifaq',NULL,'Saudi Professional League','Jornada 28','','','home',1,0,'Ganado','Al Nassr','Al-Ettifaq','Arabia Saudita','Arabia Saudita',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m67_real_madrid','real_madrid','2026-04-15','Bayer Munich',NULL,'UEFA Champions League 2025-2026','Cuartos de Final','','','away',3,4,'Perdido','Bayern Munich','Real Madrid','Alemania','España',4,3,'(6-4)',6,4,NULL,NULL,FALSE,FALSE,TRUE,'eliminado',FALSE,'uefa_champions_league_2025_2026',FALSE),
  ('m68_pumas','pumas','2026-04-17','Atlético de San Luis',NULL,'Liga BBVA MX Clausura 2026','Jornada 15','','','away',2,0,'Ganado','Atlético de San Luis','Pumas UNAM','México','México',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m69_al_nassr','al_nassr','2026-04-19','Al-Wasl',NULL,'AFC Champions League Two','Cuartos de Final','','','away',4,0,'Ganado','Al-Wasl','Al Nassr','Emiratos Árabes Unidos','Arabia Saudita',0,4,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m70_real_madrid','real_madrid','2026-04-21','Alavés',NULL,'La Liga','Jornada 32','','','home',2,1,'Ganado','Real Madrid','Alavés','España','España',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m71_pumas','pumas','2026-04-21','FC Juarez',NULL,'Liga BBVA MX Clausura 2026','Jornada 16','','','home',4,2,'Ganado','Pumas UNAM','FC Juarez','México','México',4,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m72_al_nassr','al_nassr','2026-04-22','Al Ahli Doha SC',NULL,'AFC Champions League Two','Semifinales','','','home',5,1,'Ganado','Al Nassr','Al Ahli Doha SC','Arabia Saudita','Qatar',5,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m73_real_madrid','real_madrid','2026-04-24','Real Betis',NULL,'La Liga','Jornada 33','','','away',1,1,'Empatado','Real Betis','Real Madrid','España','España',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m74_pumas','pumas','2026-04-25','Pachuca',NULL,'Liga BBVA MX Clausura 2026','Jornada 17','','','away',2,0,'Ganado','Pachuca','Pumas UNAM','México','México',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m75_al_nassr','al_nassr','2026-04-29','Al-Ahli',NULL,'Saudi Professional League','Jornada 30','','','home',2,0,'Ganado','Al Nassr','Al-Ahli','Arabia Saudita','Arabia Saudita',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m76_al_nassr','al_nassr','2026-05-03','Al Qadisiyah',NULL,'Saudi Professional League','Jornada 31','','','away',1,3,'Perdido','Al Qadisiyah','Al Nassr','Arabia Saudita','Arabia Saudita',3,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m77_real_madrid','real_madrid','2026-05-03','RCD Espanyol',NULL,'La Liga','Jornada 34','','','away',2,0,'Ganado','RCD Espanyol','Real Madrid','España','España',0,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m78_pumas','pumas','2026-05-03','América',NULL,'Liga BBVA MX Clausura 2026','Cuartos de Final Ida','','','away',3,3,'Empatado','América','Pumas UNAM','México','México',3,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m79_al_nassr','al_nassr','2026-05-07','Al Shabab KSA',NULL,'Saudi Professional League','Jornada 32','','','away',4,2,'Ganado','Al Shabab KSA','Al Nassr','Arabia Saudita','Arabia Saudita',2,4,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m80_real_madrid','real_madrid','2026-05-10','FC Barcelona',NULL,'La Liga','Jornada 35','','','away',0,2,'Perdido','FC Barcelona','Real Madrid','España','España',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'eliminado',FALSE,'la_liga',FALSE),
  ('m81_pumas','pumas','2026-05-10','América',NULL,'Liga BBVA MX Clausura 2026','Cuartos de Final Vuelta','','','home',3,3,'Empatado','Pumas UNAM','América','México','México',3,3,'(6-6)',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m82_al_nassr','al_nassr','2026-05-12','Al Hilal',NULL,'Saudi Professional League','Jornada 33','','','home',1,1,'Empatado','Al Nassr','Al Hilal','Arabia Saudita','Arabia Saudita',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m83_real_madrid','real_madrid','2026-05-14','Real Oviedo',NULL,'La Liga','Jornada 36','','','home',2,0,'Ganado','Real Madrid','Real Oviedo','España','España',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m84_pumas','pumas','2026-05-14','Pachuca',NULL,'Liga BBVA MX Clausura 2026','Semifinales Ida','','','away',0,1,'Perdido','Pachuca','Pumas UNAM','México','México',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m85_al_nassr','al_nassr','2026-05-16','Gamba Osaka',NULL,'AFC Champions League Two','Gran Final','','','home',0,1,'Perdido','Al Nassr','Gamba Osaka','Arabia Saudita','Japón',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'perdido',FALSE,'afc_champions_league_two',FALSE),
  ('m87_pumas','pumas','2026-05-17','Pachuca',NULL,'Liga BBVA MX Clausura 2026','Semifinales Vuelta','','','home',1,0,'Ganado','Pumas UNAM','Pachuca','México','México',1,0,'(1-1)',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m88_al_nassr','al_nassr','2026-05-21','Damac',NULL,'Saudi Professional League','Jornada 34','','','home',4,1,'Ganado','Al Nassr','Damac','Arabia Saudita','Arabia Saudita',4,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'ganado',TRUE,'saudi_professional_league',FALSE),
  ('m89_pumas','pumas','2026-05-21','Cruz Azul',NULL,'Liga BBVA MX Clausura 2026','Gran Final Ida','','','away',0,0,'Empatado','Cruz Azul','Pumas UNAM','México','México',0,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m90_sel_mex','sel_mex','2026-05-22','Ghana',NULL,'Partido de Preparación','Partido Amistoso','','','home',2,0,'Ganado','México','Ghana','América del Norte','África',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m91_real_madrid','real_madrid','2026-05-23','Athletic Club Bilbao',NULL,'La Liga','Jornada 38','','','home',4,2,'Ganado','Real Madrid','Athletic Club Bilbao','España','España',4,2,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m92_pumas','pumas','2026-05-24','Cruz Azul',NULL,'Liga BBVA MX Clausura 2026','Gran Final','','','home',1,2,'Perdido','Pumas UNAM','Cruz Azul','México','México',1,2,'(1-2)',1,2,NULL,NULL,FALSE,FALSE,TRUE,'perdido',FALSE,'liga_bbva_mx_clausura_2026',FALSE),
  ('m93_sel_mex','sel_mex','2026-05-30','Australia',NULL,'Partido de Preparación','Partido Amistoso','','','home',1,0,'Ganado','México','Australia','América del Norte','Oceanía',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m94_sel_mex','sel_mex','2026-06-04','Serbia',NULL,'Partido de Preparación','Partido Amistoso','','','home',5,1,'Ganado','México','Serbia','América del Norte','Europa',5,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m95_sel_por','sel_por','2026-06-06','Chile',NULL,'Partido de Preparación','Partido Amistoso','','','home',2,1,'Ganado','Portugal','Chile','Europa','América del Sur',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m96_sel_por','sel_por','2026-06-10','Nigeria',NULL,'Partido de Preparación','Partido Amistoso','','','home',2,1,'Ganado','Portugal','Nigeria','Europa','África',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m97_sel_mex','sel_mex','2026-06-11','Sudáfrica',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Fase de Grupos J1','','','home',2,0,'Ganado','México','Sudáfrica','CONCACAF','CAF',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m98_sel_por','sel_por','2026-06-17','RD Congo',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Fase de Grupos J1','','','home',1,1,'Empatado','Portugal','RD Congo','UEFA','CAF',1,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m99_sel_mex','sel_mex','2026-06-18','Corea del Sur',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Fase de Grupos J2','','','home',1,0,'Ganado','México','Corea del Sur','CONCACAF','AFC',1,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m100_sel_por','sel_por','2026-06-23','Uzbekistán',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Fase de Grupos J2','','','home',5,0,'Ganado','Portugal','Uzbekistán','UEFA','AFC',5,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m101_sel_mex','sel_mex','2026-06-24','República Checa',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Fase de Grupos J3','','','away',3,0,'Ganado','República Checa','México','UEFA','CONCACAF',0,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m102_sel_por','sel_por','2026-06-27','Colombia',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Fase de Grupos J3','','','away',0,0,'Empatado','Colombia','Portugal','CONMEBOL','UEFA',0,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m103_sel_mex','sel_mex','2026-06-30','Ecuador',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Diecisievos de Final','','','home',2,0,'Ganado','México','Ecuador','CONCACAF','CONMEBOL',2,0,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m104_sel_por','sel_por','2026-07-02','Croacia',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Diecisievos de Final','','','home',2,1,'Ganado','Portugal','Croacia','UEFA','UEFA',2,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,FALSE,NULL,FALSE,NULL,FALSE),
  ('m105_sel_mex','sel_mex','2026-07-05','Inglaterra',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Octavos de Final','','','home',2,3,'Perdido','México','Inglaterra','Norteamérica','Europa',2,3,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'eliminado',FALSE,'copa_mundial_fifa_usa_mex_can_2026',FALSE),
  ('m106_sel_por','sel_por','2026-07-06','España',NULL,'Copa Mundial FIFA USA-MEX-CAN 2026','Octavos de Final','','','home',0,1,'Perdido','Portugal','España','Europa','Europa',0,1,'-',NULL,NULL,NULL,NULL,FALSE,FALSE,TRUE,'eliminado',FALSE,'copa_mundial_fifa_usa_mex_can_2026',FALSE)
on conflict (id) do update set
  tracked_team_id=excluded.tracked_team_id, match_date=excluded.match_date, rival=excluded.rival,
  rival_country=excluded.rival_country, competition=excluded.competition, phase=excluded.phase,
  stadium=excluded.stadium, city=excluded.city, venue_side=excluded.venue_side,
  goals_for=excluded.goals_for, goals_against=excluded.goals_against, result=excluded.result,
  local_name=excluded.local_name, visitor_name=excluded.visitor_name,
  local_origin=excluded.local_origin, visitor_origin=excluded.visitor_origin,
  local_score=excluded.local_score, visitor_score=excluded.visitor_score,
  score_annotation=excluded.score_annotation, aggregate_local=excluded.aggregate_local,
  aggregate_visitor=excluded.aggregate_visitor, penalty_local=excluded.penalty_local,
  penalty_visitor=excluded.penalty_visitor, extra_time=excluded.extra_time,
  international=excluded.international, title_decision=excluded.title_decision,
  title_status=excluded.title_status, title_won=excluded.title_won,
  tournament_id=excluded.tournament_id, user_added=excluded.user_added;
