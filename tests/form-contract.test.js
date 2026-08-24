const fs=require('fs'), assert=require('assert');
const pages=[
  ['index.html','assets/js/pages/dashboard.js'],
  ['partidos.html','assets/js/pages/partidos.js']
];
const required=['f_team','f_rival','f_rivalCountry','f_venueSide','f_dia','f_mes','f_torneo','f_fase','f_estadio','f_ciudad','f_gf','f_gc','f_internacional','f_esTitulo','f_tituloResultado','f_aggLocal','f_aggVisit','f_penLocal','f_penVisit','f_extraTime'];
let failed=false;
for(const [htmlFile,jsFile] of pages){
 const html=fs.readFileSync(new URL('../'+htmlFile,'file://'+__filename).pathname,'utf8');
 const js=fs.readFileSync(new URL('../'+jsFile,'file://'+__filename).pathname,'utf8');
 for(const id of required){
   try{assert(html.includes(`id="${id}"`),`${htmlFile} missing ${id}`); assert(js.includes(`'${id}'`)||js.includes(`"${id}"`),`${jsFile} does not consume ${id}`)}
   catch(e){failed=true;console.error('FAIL',e.message)}
 }
 console.log('PASS form contract',htmlFile);
}
if(failed) process.exit(1);
