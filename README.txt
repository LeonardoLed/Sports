RATIO SPORTS v5

Archivos principales:
- index.html: dashboard de consulta.
- partidos.html: módulo independiente para registrar y eliminar partidos.
- logos-config.js: rutas de logos, torneos y fondo.

Datos:
- Se cargaron 105 partidos identificables del archivo RatioSports.xlsx.
- Los datos base se guardan con la clave localStorage ratiosports_matches_v5_excel.

Asociación de títulos:
1. En partidos.html selecciona el equipo y escribe el torneo.
2. Registra una fase "Final" o "Gran Final".
3. Activa "Este partido definió un título" y selecciona ganado/perdido.
4. El partido guarda tournamentId y la tarjeta del torneo obtiene automáticamente rival, fecha, marcador y resultado.

Para abrir localmente, mantén todos los archivos y carpetas juntos y abre index.html.
