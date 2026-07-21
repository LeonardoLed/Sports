# Arquitectura

## Capas

1. **Configuración:** rutas de logos, fondo y torneos.
2. **Datos:** equipos y partidos históricos extraídos de la fuente original.
3. **Core:** estado mutable, persistencia versionada, migración, estadísticas puras y sanitización.
4. **Servicios:** fachadas estables para partidos, estadísticas y logos.
5. **UI compartida:** tema, insignias, fallbacks y tarjetas reutilizables.
6. **Páginas:** eventos y renderizado específico de `index.html` y `partidos.html`.

## Integridad de datos

`loadMatches()` crea un mapa de `SEED_MATCHES`, conserva siempre todos los históricos y agrega únicamente registros manuales que no formen parte del seed. Por eso limpiar `localStorage` no elimina la bitácora original.

## Seguridad

`escapeHtml()` y `escapeAttribute()` deben aplicarse a cualquier valor que llegue a plantillas HTML. Cuando sea posible, se utiliza `textContent`. Los fallbacks de imágenes existen previamente en el DOM y no escriben HTML desde `onerror`.

## Títulos

La única regla válida es `Boolean(match.titleDecision)`. No existen prefijos de IDs ni inferencias ocultas para decidir si un partido corresponde a un título.
