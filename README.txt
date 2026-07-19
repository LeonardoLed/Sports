RATIO SPORTS — VERSION 2.0

Archivos principales:
- index.html: dashboard y bitácora visual.
- partidos.html: administración independiente de partidos.
- logos-config.js: rutas de logos.
- /logos y /images: recursos gráficos.

Cambios 2.0:
- Bitácora compacta: logo y nombre están en la misma celda; se eliminaron columnas de logo vacías.
- El país/origen solo se muestra en competiciones internacionales.
- La marca LOCAL del origen de datos se interpreta como competición doméstica y no como condición de local/visitante.
- Buscador y filtros por competición, alcance doméstico/internacional, partidos de título y orden.
- Tabla modernizada con hover, marcador destacado y diseño más compacto.
- Estadísticas generales en una sola fila de 12 indicadores, texto negro y tooltips accesibles.
- Microanimaciones en estadísticas, tarjetas, bitácora y navegación.
- Iconos de navegación monocromáticos.
- Se conserva el diseño aprobado de las tarjetas de títulos.


========================================
AGREGAR LOGOS SIN MODIFICAR CÓDIGO
========================================

El proyecto ahora busca automáticamente los logos mediante el nombre normalizado.

1. Guarda el archivo PNG en la carpeta correspondiente:
   - Rivales: logos/rivales/
   - Equipos seguidos: logos/equipos/
   - Torneos: logos/torneos/

2. Nombra el archivo en minúsculas, sin acentos y sustituyendo espacios por guiones bajos.

Ejemplos:
   Manchester City        -> logos/rivales/manchester_city.png
   Atlético de Madrid     -> logos/rivales/atletico_de_madrid.png
   Inter Miami CF         -> logos/rivales/inter_miami_cf.png
   Copa Libertadores      -> logos/torneos/copa_libertadores.png

3. Recarga la página con Ctrl+F5.

EXCEPCIONES:
Si el nombre del archivo no puede coincidir con el nombre mostrado en la bitácora, agrega una sola entrada en logos-config.js dentro de RIVAL_LOGOS, TOURNAMENT_LOGOS o TEAM_LOGOS. Los mapas manuales tienen prioridad sobre la búsqueda automática.
