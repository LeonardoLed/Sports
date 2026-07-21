# Ratio Sports Dashboard

Dashboard estático para consultar y administrar la bitácora deportiva de los equipos seguidos. El proyecto funciona en GitHub Pages y conserva los partidos históricos incluidos en `SEED_MATCHES`.

## Arquitectura

```text
Datos iniciales (sports-data.js)
          │
          ▼
 Estado y persistencia (core/state.js)
          │
          ├── MatchService
          ├── StatisticsService
          └── LogoService
          │
          ▼
 Helpers visuales seguros (core/ui.js)
          │
          ▼
 Controladores de página (pages/)
```

## Estructura

```text
assets/js/
├── config/logos.js
├── data/sports-data.js
├── core/
│   ├── state.js
│   ├── ui.js
│   └── backup.js
├── services/
│   ├── match-service.js
│   ├── statistics-service.js
│   └── logo-service.js
└── pages/
    ├── dashboard.js
    └── partidos.js
```

## Fuente de verdad

- Los partidos históricos viven en `assets/js/data/sports-data.js` como `SEED_MATCHES`.
- Los partidos capturados por el usuario se guardan en `localStorage`.
- Al iniciar, el sistema siempre carga los partidos históricos y después agrega los registros manuales.
- El seguimiento semanal se calcula dinámicamente desde `matches`; no existe un arreglo semanal independiente.

## Finales y títulos

Un partido se considera decisivo únicamente cuando contiene:

```js
titleDecision: true
```

No se usan prefijos ni listas de IDs hardcodeadas. El resultado del torneo puede indicarse con `titleStatus: "ganado" | "perdido" | "eliminado"`.

## Seguridad de la vista

Los valores dinámicos procedentes de la bitácora se insertan usando `escapeHtml()` o `textContent`. Los helpers de logos ya no reemplazan `innerHTML` desde eventos `onerror`; muestran un fallback ya presente en el DOM.

## Respaldo

La exportación genera un JSON con `schemaVersion`, fecha, partidos y estados de torneos. La importación valida los registros antes de persistirlos. Esto evita depender exclusivamente del navegador actual.

## Ejecutar

Para evitar restricciones de `file://`, abre el proyecto mediante un servidor local:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Publicar en GitHub Pages

1. Sube el contenido a la rama publicada.
2. En **Settings → Pages**, selecciona la rama y la carpeta raíz.
3. Verifica que las rutas de logos respeten mayúsculas y minúsculas.

## Verificación rápida

```bash
node --check assets/js/core/state.js
node --check assets/js/core/ui.js
node --check assets/js/pages/dashboard.js
node --check assets/js/pages/partidos.js
```
