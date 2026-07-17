/* =====================================================================
   LOGOS-CONFIG.JS
   Archivo separado SOLO con rutas de imágenes (logos de equipos, logos
   de torneos y foto de fondo). No toca datos de partidos ni lógica.

   CÓMO USARLO:
   1) Crea una carpeta junto a este archivo y al .html, por ejemplo:
        /logos/equipos/real_madrid.png
        /logos/torneos/la_liga.png
        /images/cristiano-fondo.jpg
   2) Reemplaza las rutas de abajo con el nombre real de tus archivos.
   3) Guarda este archivo y el .html en la MISMA carpeta al descargarlos,
      y abre el .html directamente en tu navegador.
   4) Si una imagen no existe o la ruta está mal, el dashboard usa
      automáticamente el escudo con inicial de color como respaldo
      (no se rompe nada mientras vas subiendo tus logos).
   5) El color de cada logo de torneo (dorado si ganado, rojo si
      perdido) sale del campo "status" de cada torneo en TOURNAMENTS
      de abajo, o de lo que marques desde el formulario "Registrar
      marcador" al capturar una final.

   NOTA: dentro de la vista previa del chat de Claude estas imágenes no
   se van a ver (el chat solo puede mostrar el .html suelto). Se verán
   correctamente cuando abras el .html ya descargado junto con esta
   carpeta de imágenes en tu computadora.
   ===================================================================== */

// Logo de cada equipo (una imagen por equipo)
window.TEAM_LOGOS = {
  real_madrid: 'logos/equipos/real_madrid.png',
  pumas:       'logos/equipos/pumas.png',
  al_nassr:    'logos/equipos/al_nassr.png',
  sel_mex:     'logos/equipos/seleccion_mexico.png',
  sel_por:     'logos/equipos/seleccion_portugal.png',
  cowboys:     'logos/equipos/dallas_cowboys.png',
};

// Torneos en los que compite cada equipo. Cada uno tiene nombre, ruta de
// logo, y "status": 'ganado' | 'perdido' | 'en_curso'. El status por default
// se puede editar aquí a mano, o se actualiza solo desde el formulario de
// "Registrar marcador" cuando marcas que un partido definió un título
// (esos cambios se guardan aparte, en el navegador, y no modifican este
// archivo — así que si editas esto después, tus cambios desde el
// formulario siguen intactos).
window.TOURNAMENTS = {
  real_madrid: [
    {name:'La Liga',              logo:'logos/torneos/la_liga.png',             status:'en_curso'},
    {name:'Champions League',     logo:'logos/torneos/champions_league.png',    status:'en_curso', matchTerms:['UEFA Champions League']},
    {name:'Copa del Rey',         logo:'logos/torneos/copa_del_rey.png',        status:'en_curso'},
    {name:'Supercopa de España',  logo:'logos/torneos/supercopa_espana.png',    status:'en_curso'},
  ],
  pumas: [
    {name:'Liga MX',              logo:'logos/torneos/liga_mx.png',             status:'en_curso', matchTerms:['Liga BBVA MX']},
    {name:'Concachampions',       logo:'logos/torneos/concachampions.png',      status:'en_curso', matchTerms:['CONCACAF Champions Cup']},
  ],
  al_nassr: [
    {name:'Saudi Pro League',           logo:'logos/torneos/saudi_pro_league.png',        status:'ganado'},
    {name:'AFC Champions League Two',   logo:'logos/torneos/afc_champions_league_2.png',  status:'en_curso'},
  ],
  sel_mex: [
    {name:'Fecha FIFA',           logo:'logos/torneos/fecha_fifa.png',          status:'en_curso'},
  ],
  sel_por: [
    {name:'Copa Mundial 2026',    logo:'logos/torneos/copa_mundial_2026.png',   status:'en_curso'},
  ],
  cowboys: [],
};


// Mapa directo para las tarjetas derivadas de la bitácora. Agrega aquí
// los PNG/SVG que coloques dentro de logos/torneos/. Un torneo sin archivo
// simplemente no muestra marca de agua; nunca reutiliza el logo de otro.
window.TOURNAMENT_LOGOS = {
  'Supercopa de España': 'logos/torneos/supercopa_espana.png',
  'Copa del Rey': 'logos/torneos/copa_del_rey.png',
  'CONCACAF Champions Cup': 'logos/torneos/concachampions.png',
  'UEFA Champions League 2025-2026': 'logos/torneos/champions_league.png',
  'La Liga': 'logos/torneos/la_liga.png',
  'AFC Champions League Two': 'logos/torneos/afc_champions_league_2.png',
  'Saudi Professional League': 'logos/torneos/saudi_pro_league.png',
  'Liga BBVA MX Clausura 2026': 'logos/torneos/liga_mx.png',
  'Copa Mundial FIFA USA-MEX-CAN 2026': 'logos/torneos/copa_mundial_2026.png',
};

// Foto de fondo para toda la página (tu foto de Cristiano Ronaldo).
// Ya está apuntando al archivo que subiste: colócalo en una carpeta
// "images/" junto al .html y a este archivo para que cargue.
window.BACKGROUND_IMAGE = 'images/cristiano-fondo.jpg';

// Logos de rivales. La llave puede ser el nombre exacto o una versión
// normalizada (minúsculas, sin acentos y con guiones bajos). El dashboard
// coloca este logo circular pegado al nombre del rival; si no existe,
// muestra automáticamente sus iniciales.
window.RIVAL_LOGOS = {
  'Cruz Azul': 'logos/rivales/cruz_azul.png',
  cruz_azul: 'logos/rivales/cruz_azul.png',
  'FC Bayern München': 'logos/rivales/fc_bayern_munich.png',
  'Bayern Munich': 'logos/rivales/fc_bayern_munich.png',
  'Bayern Múnich': 'logos/rivales/fc_bayern_munich.png',
  fc_bayern_munchen: 'logos/rivales/fc_bayern_munich.png',
  bayern_munich: 'logos/rivales/fc_bayern_munich.png',
  'Damac': 'logos/rivales/damac.png',
  damac: 'logos/rivales/damac.png',
  // fc_barcelona: 'logos/rivales/fc_barcelona.png',
  // atletico_de_madrid: 'logos/rivales/atletico_de_madrid.png',
  // manchester_city: 'logos/rivales/manchester_city.png',
  // cruz_azul: 'logos/rivales/cruz_azul.png',
  // al_hilal: 'logos/rivales/al_hilal.png',
};
