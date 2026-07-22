/* =====================================================================
   MINI-MÓDULO: SEMANAS DEPORTIVAS (alta / edición / borrado manual)
   -----------------------------------------------------------------
   Este archivo SOLO se encarga de la pantalla de administración de
   `weekDefs` (la lista editable que vive en core/state.js). No calcula
   estadísticas ni dibuja el panel de "Seguimiento semanal" — eso lo
   sigue haciendo buildWeeklyData() + renderWeekly() en cada página,
   que ya usan weekDefs automáticamente vía findWeekDef().

   Flujo:
   - renderWeeksAdmin() dibuja la tabla de semanas ya dadas de alta,
     con su rango, cuántos partidos caen ahí y acciones Editar/Borrar.
   - handleSaveWeek() agrega una semana nueva, o guarda los cambios de
     la que se esté editando (según weekEditingId).
   - Antes de guardar avisa (sin bloquear) si el rango se traslapa con
     una semana ya existente, por si fue un error de captura.
   ===================================================================== */

let weekEditingId = null;

function weekMatchCount(def){
  return matches.filter(m=>findWeekDef(m.mes,m.dia)?.id===def.id).length;
}

function renderWeeksAdmin(){
  const body = document.getElementById('weeksAdminTableBody');
  if(!body) return;
  const rows = sortedWeekDefs();
  if(!rows.length){
    body.innerHTML = `<tr class="empty-row"><td colspan="7">Aún no hay semanas dadas de alta.</td></tr>`;
    return;
  }
  body.innerHTML = rows.map(w=>{
    const count = weekMatchCount(w);
    const g = matches.filter(m=>findWeekDef(m.mes,m.dia)?.id===w.id && m.resultado==='Ganado').length;
    const e = matches.filter(m=>findWeekDef(m.mes,m.dia)?.id===w.id && m.resultado==='Empatado').length;
    const p = matches.filter(m=>findWeekDef(m.mes,m.dia)?.id===w.id && m.resultado==='Perdido').length;
    return `<tr>
      <td class="mono">${escapeHtml(w.label)}</td>
      <td>${escapeHtml(weekRangeLabel(w))}</td>
      <td class="mono">${count}</td>
      <td class="mono" style="color:var(--win)">${g}</td>
      <td class="mono" style="color:var(--draw)">${e}</td>
      <td class="mono" style="color:var(--loss)">${p}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost week-edit-btn" data-id="${escapeAttr(w.id)}" type="button">Editar</button>
        <button class="btn btn-ghost week-del-btn" data-id="${escapeAttr(w.id)}" type="button">Borrar</button>
      </td>
    </tr>`;
  }).join('');

  body.querySelectorAll('.week-edit-btn').forEach(btn=>btn.addEventListener('click', ()=>startEditWeek(btn.dataset.id)));
  body.querySelectorAll('.week-del-btn').forEach(btn=>btn.addEventListener('click', async ()=>{
    if(!confirm('¿Borrar esta semana? Los partidos que caían en su rango pasarán a agruparse como "sin definir" hasta que definas otra semana que los cubra.')) return;
    await deleteWeekDef(btn.dataset.id);
    if(weekEditingId===btn.dataset.id) cancelEditWeek();
    renderAll();
    toast('Semana eliminada');
  }));
}

function readWeekForm(){
  return {
    label: document.getElementById('wk_label').value.trim(),
    startDay: document.getElementById('wk_diaIni').value,
    startMonth: document.getElementById('wk_mesIni').value,
    endDay: document.getElementById('wk_diaFin').value,
    endMonth: document.getElementById('wk_mesFin').value,
  };
}

function clearWeekForm(){
  document.getElementById('wk_label').value='';
  document.getElementById('wk_diaIni').value='';
  document.getElementById('wk_diaFin').value='';
  document.getElementById('wk_mesIni').value='1';
  document.getElementById('wk_mesFin').value='1';
}

function startEditWeek(id){
  const w = weekDefs.find(x=>x.id===id);
  if(!w) return;
  weekEditingId = id;
  document.getElementById('wk_label').value = w.label;
  document.getElementById('wk_diaIni').value = w.startDay;
  document.getElementById('wk_mesIni').value = w.startMonth;
  document.getElementById('wk_diaFin').value = w.endDay;
  document.getElementById('wk_mesFin').value = w.endMonth;
  document.getElementById('weekSaveBtn').textContent = 'Guardar cambios';
  document.getElementById('weekCancelBtn').classList.remove('hidden');
  document.getElementById('weeksAdminPanel').scrollIntoView({behavior:'smooth', block:'center'});
}

function cancelEditWeek(){
  weekEditingId = null;
  clearWeekForm();
  document.getElementById('weekSaveBtn').textContent = 'Agregar semana';
  document.getElementById('weekCancelBtn').classList.add('hidden');
}

async function handleSaveWeek(){
  const f = readWeekForm();
  if(!f.label || f.startDay==='' || f.endDay===''){ toast('Falta el nombre o las fechas de la semana'); return; }
  const def = {label:f.label, startDay:Number(f.startDay), startMonth:Number(f.startMonth), endDay:Number(f.endDay), endMonth:Number(f.endMonth)};
  if(dayOfYear(def.endMonth,def.endDay) < dayOfYear(def.startMonth,def.startDay)){
    toast('La fecha final no puede ser antes que la fecha inicial'); return;
  }
  const overlaps = overlappingWeekDefs(def, weekEditingId);
  if(overlaps.length && !confirm(`Este rango se traslapa con "${overlaps.map(w=>w.label).join(', ')}". ¿Guardar de todas formas?`)) return;

  if(weekEditingId){
    await updateWeekDef(weekEditingId, def);
    toast('Semana actualizada ✓');
  } else {
    await addWeekDef(def);
    toast('Semana agregada ✓');
  }
  cancelEditWeek();
  renderAll();
}

async function handleResetWeeks(){
  if(!confirm('Esto reemplaza TODAS tus semanas actuales por las 22 originales del Excel. ¿Continuar?')) return;
  await resetWeekDefsToDefault();
  cancelEditWeek();
  renderAll();
  toast('Semanas restauradas a los valores originales');
}

function initWeeksAdmin(){
  document.getElementById('weekSaveBtn').addEventListener('click', handleSaveWeek);
  document.getElementById('weekCancelBtn').addEventListener('click', cancelEditWeek);
  document.getElementById('weekResetBtn').addEventListener('click', handleResetWeeks);
  clearWeekForm();
}
