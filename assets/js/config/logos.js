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
    {name:'La Liga',              logo:'logos/torneos/la_liga.png',             status:'perdido'},
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
  // Cruz Azul
  'Cruz Azul': 'logos/rivales/cruz_azul.png',
  cruz_azul: 'logos/rivales/cruz_azul.png',

  // Bayern
  'FC Bayern München': 'logos/rivales/fc_bayern_munich.png',
  'Bayern Munich': 'logos/rivales/fc_bayern_munich.png',
  'Bayern Múnich': 'logos/rivales/fc_bayern_munich.png',
  fc_bayern_munchen: 'logos/rivales/fc_bayern_munich.png',
  bayern_munich: 'logos/rivales/fc_bayern_munich.png',

  // Damac
  Damac: 'logos/rivales/damac.png',
  damac: 'logos/rivales/damac.png',

// Sevilla
'Sevilla': 'logos/rivales/sevilla.png',
'Sevilla FC': 'logos/rivales/sevilla.png',
sevilla: 'logos/rivales/sevilla.png',
sevilla_fc: 'logos/rivales/sevilla.png',

// Espanyol
'Espanyol': 'logos/rivales/espanyol.png',
'RCD Espanyol': 'logos/rivales/espanyol.png',
'RCD Espanyol de Barcelona': 'logos/rivales/espanyol.png',
espanyol: 'logos/rivales/espanyol.png',
rcd_espanyol: 'logos/rivales/espanyol.png',

// Atlético de Madrid
'Atlético de Madrid': 'logos/rivales/atmadrid.png',
'Atletico de Madrid': 'logos/rivales/atmadrid.png',
'Atlético Madrid': 'logos/rivales/atmadrid.png',
'Atletico Madrid': 'logos/rivales/atmadrid.png',
'at_madrid': 'logos/rivales/atmadrid.png',
atletico_de_madrid: 'logos/rivales/atmadrid.png',
atletico_madrid: 'logos/rivales/atmadrid.png',

// Real Oviedo
'Real Oviedo': 'logos/rivales/oviedo.png',
'Oviedo': 'logos/rivales/oviedo.png',
real_oviedo: 'logos/rivales/oviedo.png',
oviedo: 'logos/rivales/oviedo.png',

// Athletic Club
'Athletic Club': 'logos/rivales/abilbao.png',
'Athletic Bilbao': 'logos/rivales/abilbao.png',
'Athletic de Bilbao': 'logos/rivales/abilbao.png',
  'Athletic Club Bilbao':  'logos/rivales/abilbao.png',
'Bilbao': 'logos/rivales/abilbao.png',
athletic_club: 'logos/rivales/abilbao.png',
athletic_bilbao: 'logos/rivales/abilbao.png',
athletic_de_bilbao: 'logos/rivales/abilbao.png',
bilbao: 'logos/rivales/abilbao.png',

// FC Barcelona
'FC Barcelona': 'logos/rivales/fcbarcelona.png',
'Barcelona': 'logos/rivales/fcbarcelona.png',
'Barça': 'logos/rivales/fcbarcelona.png',
'Barca': 'logos/rivales/fcbarcelona.png',
fc_barcelona: 'logos/rivales/fcbarcelona.png',
barcelona: 'logos/rivales/fcbarcelona.png',
barca: 'logos/rivales/fcbarcelona.png',

  "Albacete": "logos/rivales/albacete.png",
  "Albacete Balompié": "logos/rivales/albacete.png",

  "Real Betis": "logos/rivales/real_betis.png",
  "Betis": "logos/rivales/real_betis.png",
  "Real Betis Balompié": "logos/rivales/real_betis.png",

  "Alavés": "logos/rivales/alaves.png",
  "Deportivo Alavés": "logos/rivales/alaves.png",

  "Girona": "logos/rivales/girona.png",
  "Girona FC": "logos/rivales/girona.png",

  "Elche": "logos/rivales/elche.png",
  "Elche CF": "logos/rivales/elche.png",

  "Mallorca": "logos/rivales/mallorca.png",
  "RCD Mallorca": "logos/rivales/mallorca.png",
  "Real Mallorca": "logos/rivales/mallorca.png",

  "Celta": "logos/rivales/celta_vigo.png",
  "Celta de Vigo": "logos/rivales/celta_vigo.png",
  "RC Celta": "logos/rivales/celta_vigo.png",
  "RC Celta de Vigo": "logos/rivales/celta_vigo.png",

  "Getafe": "logos/rivales/getafe.png",
  "Getafe CF": "logos/rivales/getafe.png",

  "Osasuna": "logos/rivales/osasuna.png",
  "CA Osasuna": "logos/rivales/osasuna.png",

  "Real Sociedad": "logos/rivales/real_sociedad.png",
  "Real Sociedad de Fútbol": "logos/rivales/real_sociedad.png",

  "Valencia": "logos/rivales/valencia.png",
  "Valencia CF": "logos/rivales/valencia.png",

  "Villarreal": "logos/rivales/villareal.png",
  "Villarreal CF": "logos/rivales/villareal.png",

  "Rayo Vallecano": "logos/rivales/rayo_vallecano.png",
  "Rayo Vallecano de Madrid": "logos/rivales/rayo_vallecano.png",
  "Rayo": "logos/rivales/rayo_vallecano.png",

  "Levante": "logos/rivales/levante.png",
  "Levante UD": "logos/rivales/levante.png",

  // ===== LIGA MX =====
"América": "logos/rivales/america.png",
"Club América": "logos/rivales/america.png",

"Atlas": "logos/rivales/atlas.png",
"Atlas FC": "logos/rivales/atlas.png",

"Guadalajara": "logos/rivales/guadalajara.png",
"Chivas": "logos/rivales/guadalajara.png",
"Chivas Guadalajara": "logos/rivales/guadalajara.png",
"CD Guadalajara": "logos/rivales/guadalajara.png",
"Club Deportivo Guadalajara": "logos/rivales/guadalajara.png",

"FC Juárez": "logos/rivales/juarez.png",
"Juárez": "logos/rivales/juarez.png",
"Juarez": "logos/rivales/juarez.png",
"Bravos": "logos/rivales/juarez.png",

"León": "logos/rivales/leon.png",
"Leon": "logos/rivales/leon.png",
"Club León": "logos/rivales/leon.png",

"Mazatlán": "logos/rivales/mazatlan.png",
"Mazatlan": "logos/rivales/mazatlan.png",
"Mazatlán FC": "logos/rivales/mazatlan.png",

"Monterrey": "logos/rivales/monterrey.png",
"CF Monterrey": "logos/rivales/monterrey.png",
"Rayados": "logos/rivales/monterrey.png",
"Rayados de Monterrey": "logos/rivales/monterrey.png",

"Necaxa": "logos/rivales/necaxa.png",
"Club Necaxa": "logos/rivales/necaxa.png",

"Pachuca": "logos/rivales/pachuca.png",
"CF Pachuca": "logos/rivales/pachuca.png",
"Tuzos": "logos/rivales/pachuca.png",

"Puebla": "logos/rivales/puebla.png",
"Club Puebla": "logos/rivales/puebla.png",

"Querétaro": "logos/rivales/qro.png",
"Queretaro": "logos/rivales/qro.png",
"Querétaro FC": "logos/rivales/qro.png",
"Queretaro FC": "logos/rivales/qro.png",
"Gallos Blancos": "logos/rivales/qro.png",

"Atlético San Luis": "logos/rivales/san_luis.png",
"Atletico San Luis": "logos/rivales/san_luis.png",
"San Luis": "logos/rivales/san_luis.png",
"Atl. San Luis": "logos/rivales/san_luis.png",

"Santos Laguna": "logos/rivales/santos_laguna.png",
"Santos": "logos/rivales/santos_laguna.png",
"Club Santos Laguna": "logos/rivales/santos_laguna.png",

"Toluca": "logos/rivales/toluca.png",
"Deportivo Toluca": "logos/rivales/toluca.png",
"Deportivo Toluca FC": "logos/rivales/toluca.png",
"Toluca FC": "logos/rivales/toluca.png",

  "Tigres": "logos/rivales/tigres.png",
"Tigres UANL": "logos/rivales/tigres.png",
"UANL": "logos/rivales/tigres.png",

"Tijuana": "logos/rivales/tijuana.png",
"Club Tijuana": "logos/rivales/tijuana.png",
"Xolos": "logos/rivales/tijuana.png",
"Xolos de Tijuana": "logos/rivales/tijuana.png",
"Club Tijuana Xoloitzcuintles": "logos/rivales/tijuana.png",

// ===== NFL (rivales de Dallas Cowboys) =====
"49ers": "logos/rivales/49ers.png",
"San Francisco 49ers": "logos/rivales/49ers.png",

"Buccaneers": "logos/rivales/buccaneers.png",
"Tampa Bay Buccaneers": "logos/rivales/buccaneers.png",

"Cardinals": "logos/rivales/cardinals.png",
"Arizona Cardinals": "logos/rivales/cardinals.png",

"Colts": "logos/rivales/colts.png",
"Indianapolis Colts": "logos/rivales/colts.png",

"Commanders": "logos/rivales/commanders.png",
"Washington Commanders": "logos/rivales/commanders.png",

"Eagles": "logos/rivales/eagles.png",
"Philadelphia Eagles": "logos/rivales/eagles.png",

"Giants": "logos/rivales/giants.png",
"New York Giants": "logos/rivales/giants.png",

"Jaguars": "logos/rivales/jaguars.png",
"Jacksonville Jaguars": "logos/rivales/jaguars.png",

"Rams": "logos/rivales/la_rams.png",
"LA Rams": "logos/rivales/la_rams.png",
"Los Angeles Rams": "logos/rivales/la_rams.png",

"Packers": "logos/rivales/packers.png",
"Green Bay Packers": "logos/rivales/packers.png",

"Ravens": "logos/rivales/ravens.png",
"Baltimore Ravens": "logos/rivales/ravens.png",

"Seahawks": "logos/rivales/seahawks.png",
"Seattle Seahawks": "logos/rivales/seahawks.png",

"Texans": "logos/rivales/texans.png",
"Houston Texans": "logos/rivales/texans.png",

"Titans": "logos/rivales/titans.png",
"Tennessee Titans": "logos/rivales/titans.png",

// ===== LaLiga (equipos que faltaban) =====
"Málaga": "logos/rivales/malaga.png",
"Malaga": "logos/rivales/malaga.png",
"Málaga CF": "logos/rivales/malaga.png",

"Racing de Santander": "logos/rivales/racing_santander.png",
"Racing Santander": "logos/rivales/racing_santander.png",
"Real Racing Club": "logos/rivales/racing_santander.png",

"Deportivo de La Coruña": "logos/rivales/deportivo_cor.png",
"Deportivo La Coruña": "logos/rivales/deportivo_cor.png",
"RC Deportivo": "logos/rivales/deportivo_cor.png",
"Deportivo": "logos/rivales/deportivo_cor.png",

// ===== MLS =====
"Charlotte FC": "logos/rivales/charlotte.png",
"Charlotte": "logos/rivales/charlotte.png",

"FC Cincinnati": "logos/rivales/cincinnati.png",
"Cincinnati": "logos/rivales/cincinnati.png",

"Columbus Crew": "logos/rivales/columbus_crew.png",
"Crew": "logos/rivales/columbus_crew.png",

"San Diego FC": "logos/rivales/san_diego.png",
"San Diego": "logos/rivales/san_diego.png",

// ===== AFC (Asia) =====
"Al Ahli Doha": "logos/rivales/al_ahli_ddoha.png",
"Al Ahli SC Doha": "logos/rivales/al_ahli_ddoha.png",
"Al Ahli Qatar": "logos/rivales/al_ahli_ddoha.png",

"Al Wasl": "logos/rivales/al_wasl.png",
"Al Wasl FC": "logos/rivales/al_wasl.png",

"Arkadag": "logos/rivales/arkadag.png",
"Arkadag FK": "logos/rivales/arkadag.png",

"Gamba Osaka": "logos/rivales/gamba_osaka.png",

// ===== Saudi Pro League (rivales de Al Nassr) =====
"NEOM": "logos/rivales/NEOM.png",
"NEOM SC": "logos/rivales/NEOM.png",

"Al Ahli": "logos/rivales/al_ahli_saudi.png",
"Al Ahli Saudi": "logos/rivales/al_ahli_saudi.png",
"Al-Ahli": "logos/rivales/al_ahli_saudi.png",
"Al Ahli SFC": "logos/rivales/al_ahli_saudi.png",

"Al Ettifaq": "logos/rivales/al_ettifaq.png",
"Al-Ettifaq": "logos/rivales/al_ettifaq.png",

"Al Faiha": "logos/rivales/al_faiha.png",
"Al-Faiha": "logos/rivales/al_faiha.png",

"Al Fateh": "logos/rivales/al_fateh.png",
"Al-Fateh": "logos/rivales/al_fateh.png",

"Al Hazem": "logos/rivales/al_hazem.png",
"Al-Hazem": "logos/rivales/al_hazem.png",

"Al Hilal": "logos/rivales/al_hilal.png",
"Al-Hilal": "logos/rivales/al_hilal.png",

"Al Ittihad": "logos/rivales/al_ittihad.png",
"Al-Ittihad": "logos/rivales/al_ittihad.png",

"Al Khaleej": "logos/rivales/al_khaleej.png",
"Al-Khaleej": "logos/rivales/al_khaleej.png",

"Al Najma": "logos/rivales/al_najma.png",
"Al-Najma": "logos/rivales/al_najma.png",

"Al Okhdood": "logos/rivales/al_okhdood.png",
"Al-Okhdood": "logos/rivales/al_okhdood.png",

"Al Qadisiyah": "logos/rivales/al_qadisiyah.png",
"Al-Qadisiyah": "logos/rivales/al_qadisiyah.png",

"Al Shabab": "logos/rivales/al_shabab.png",
"Al-Shabab": "logos/rivales/al_shabab.png",

// ===== Champions League (rivales de Real Madrid) =====
"AS Monaco": "logos/rivales/as_monaco.png",
"Mónaco": "logos/rivales/as_monaco.png",
"Monaco": "logos/rivales/as_monaco.png",

"Atalanta": "logos/rivales/atalanta.png",
"Atalanta BC": "logos/rivales/atalanta.png",

"Benfica": "logos/rivales/benfica.png",
"SL Benfica": "logos/rivales/benfica.png",

"Manchester City": "logos/rivales/manchester_city.png",
"Man City": "logos/rivales/manchester_city.png",

// ===== Selecciones — Copa Mundial FIFA 2026 (rivales de Sel. México / Sel. Portugal) =====
"Australia": "logos/rivales/australia.png",

"Bélgica": "logos/rivales/belgica.png",
"Belgica": "logos/rivales/belgica.png",

"Bolivia": "logos/rivales/bolivia.png",

"Chile": "logos/rivales/chile.png",

"Colombia": "logos/rivales/colombia.png",

"Corea del Sur": "logos/rivales/corea_sur.png",
"Corea Del Sur": "logos/rivales/corea_sur.png",

"Croacia": "logos/rivales/croacia.png",

"Ecuador": "logos/rivales/ecuador.png",

"Inglaterra": "logos/rivales/england.png",
"England": "logos/rivales/england.png",

"España": "logos/rivales/espana.png",

"Ghana": "logos/rivales/ghana.png",

"Islandia": "logos/rivales/islandia.png",

"Nigeria": "logos/rivales/nigeria.png",

"Panamá": "logos/rivales/panama.png",
"Panama": "logos/rivales/panama.png",

"RD Congo": "logos/rivales/rdcongo.png",
"República Democrática del Congo": "logos/rivales/rdcongo.png",

"República Checa": "logos/rivales/rep_checa.png",
"Chequia": "logos/rivales/rep_checa.png",

"Serbia": "logos/rivales/serbia.png",

"Sudáfrica": "logos/rivales/sudafrica.png",
"Sudafrica": "logos/rivales/sudafrica.png",

"Estados Unidos": "logos/rivales/usa.png",
"USA": "logos/rivales/usa.png",

"Uzbekistán": "logos/rivales/uzbekistan.png",
"Uzbekistan": "logos/rivales/uzbekistan.png"

};

/* =====================================================================
   RESOLUCIÓN AUTOMÁTICA DE LOGOS

   Convención de nombres:
   - Rival:   logos/rivales/<nombre_normalizado>.png
   - Torneo:  logos/torneos/<nombre_normalizado>.png
   - Equipo:  logos/equipos/<nombre_normalizado>.png

   Ejemplos:
   "Manchester City"       -> logos/rivales/manchester_city.png
   "Atlético de Madrid"    -> logos/rivales/atletico_de_madrid.png
   "Copa Libertadores"     -> logos/torneos/copa_libertadores.png

   Los mapas manuales de arriba siguen funcionando como EXCEPCIONES y
   tienen prioridad. Así puedes resolver abreviaturas o nombres que no
   coincidan con el archivo sin modificar el HTML.
   ===================================================================== */
window.logoSlug = function(value){
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

window.resolveRivalLogo = function(name){
  const slug = window.logoSlug(name);
  return window.RIVAL_LOGOS[name] || window.RIVAL_LOGOS[slug] ||
         `logos/rivales/${slug}.png`;
};

window.resolveTournamentLogo = function(name){
  const slug = window.logoSlug(name);
  return window.TOURNAMENT_LOGOS[name] || window.TOURNAMENT_LOGOS[slug] ||
         `logos/torneos/${slug}.png`;
};

window.resolveTeamLogo = function(id, displayName){
  const slug = window.logoSlug(displayName || id);
  return window.TEAM_LOGOS[id] || window.TEAM_LOGOS[slug] ||
         `logos/equipos/${slug}.png`;
};
