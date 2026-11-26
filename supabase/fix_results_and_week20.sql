-- Ratio Sports: correcciones de datos detectadas en la auditoría.
-- Ejecutar UNA vez en Supabase > SQL Editor. Es seguro repetirlo.

-- 1) El resultado de cada PARTIDO debe salir de su marcador.
--    Antes, Pumas 1-0 San Diego (CONCACAF, vuelta) estaba como 'Perdido'
--    porque la serie se perdió 2-4 en el global. La serie perdida ya se
--    representa con title_status = 'eliminado'.
update public.matches
set result = case
  when goals_for > goals_against then 'Ganado'
  when goals_for < goals_against then 'Perdido'
  else 'Empatado'
end
where result is distinct from case
  when goals_for > goals_against then 'Ganado'
  when goals_for < goals_against then 'Perdido'
  else 'Empatado'
end;

-- 2) Semana 20 terminaba el "31 de junio" (no existe) y se traslapaba con la 21.
update public.sports_weeks
set end_day = 30
where id = 'w20' and end_month = 6 and end_day = 31;
