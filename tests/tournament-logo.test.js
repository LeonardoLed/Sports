const fs = require('fs');
const vm = require('vm');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/config/logos.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const resolve = context.window.resolveTournamentLogo;

function assertEqual(actual, expected, label){
  if(actual !== expected){
    console.error(`FAIL ${label}: expected ${expected}, got ${actual}`);
    process.exit(1);
  }
  console.log(`PASS ${label}`);
}

assertEqual(resolve('Leagues Cup 2026'), 'logos/torneos/leagues_cup.png', 'Leagues Cup seasonal logo');
assertEqual(resolve('Saudi Professional League 2026-2027'), 'logos/torneos/saudi_pro_league.png', 'Saudi Pro League seasonal logo');
assertEqual(resolve('Liga BBVA MX Apertura 2026'), 'logos/torneos/liga_mx.png', 'Liga MX seasonal logo via matchTerms');
assertEqual(resolve('UEFA Champions League 2026-2027'), 'logos/torneos/champions_league.png', 'Champions League seasonal logo via matchTerms');
assertEqual(resolve('CONCACAF Champions Cup 2027'), 'logos/torneos/concachampions.png', 'CONCACAF seasonal logo');
