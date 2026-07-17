RATIO SPORTS — RECONSTRUCCIÓN v12

Archivos principales:
- index.html: dashboard y bitácora completa.
- partidos.html: gestión independiente de partidos.
- logos-config.js: rutas de escudos, fondo y logos de torneos.

Cambios principales:
- 106 registros reales tomados de RatioSports(1).xlsx.
- Bitácora con equipo seguido, fecha, local, origen, marcador, visitante, sede, torneo/fase y estado.
- Soporte para marcador global, penales y tiempo extra.
- Tarjetas de títulos derivadas de la bitácora; no existe una segunda lista independiente.
- 1 título ganado y 3 subcampeonatos según las reglas acordadas.
- México y Portugal comparten el mismo torneo Copa Mundial FIFA USA-MEX-CAN 2026.
- Forma reciente con G, E y P.
- Títulos y subcampeonatos en tarjetas de equipo.
- El logo de UEFA Champions League solo se usa en UEFA Champions League.
- El botón de modo oscuro permanece en la barra lateral.

LOGOS DE TORNEOS
Coloca los archivos en logos/torneos/ usando los nombres indicados en
logos/torneos/README.txt. Después revisa las rutas en logos-config.js.

NOTA SOBRE DATOS GUARDADOS
La reconstrucción usa una nueva clave de almacenamiento local para cargar
los datos corregidos. Los partidos nuevos agregados desde partidos.html se
comparten con index.html en el mismo navegador.
