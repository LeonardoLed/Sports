# Ratio Sports — Centro de seguimiento deportivo

Dashboard estático para GitHub Pages que centraliza equipos, torneos y una bitácora editable de partidos.

## Arquitectura

```text
assets/js/
├── config/logos.js          # rutas, alias y estado de torneos
├── data/sports-data.js      # catálogo y partidos semilla
├── core/
│   ├── state.js             # modelo, almacenamiento versionado y estadísticas
│   ├── ui.js                # tema, logos, banderas y helpers compartidos
│   └── backup.js            # importar/exportar JSON
└── pages/
    ├── dashboard.js         # controlador exclusivo del resumen
    └── partidos.js          # controlador exclusivo de la bitácora
```

```mermaid
flowchart LR
  D[sports-data.js] --> S[state.js]
  C[logos.js] --> U[ui.js]
  S --> A[dashboard.js]
  S --> B[partidos.js]
  U --> A
  U --> B
  A --> LS[(localStorage v2)]
  B --> LS
  LS --> J[Exportar / importar JSON]
```

## Mejoras de esta versión

- La lógica compartida ya no está duplicada entre páginas.
- El seguimiento semanal se calcula desde `matches`; no existe `EXCEL_WEEKS` hardcodeado.
- Almacenamiento con `schemaVersion: 2` y migración de claves anteriores.
- Botones de **Exportar JSON** e **Importar JSON** para respaldar la bitácora.
- Función central `escapeHtml()` para valores dinámicos.
- CSS común en `base.css`; cada página conserva únicamente sus ajustes específicos.
- Un solo `<!DOCTYPE html>` por página.

## Flujo de datos

1. `sports-data.js` proporciona los partidos iniciales.
2. `state.js` carga esos datos y combina altas manuales guardadas.
3. Las estadísticas generales y semanales se recalculan desde la bitácora actual.
4. Al agregar o eliminar un partido se actualiza `localStorage`.
5. Exportar JSON genera un respaldo con partidos, estados de torneos y versión del esquema.

## Respaldo

Use **Exportar JSON** antes de limpiar el navegador o cambiar de dispositivo. Para restaurar, pulse **Importar JSON** y seleccione ese archivo.

## Logos y alias

Los nombres de la bitácora se normalizan con minúsculas, sin acentos y guiones bajos. Los alias manuales en `assets/js/config/logos.js` tienen prioridad; si no hay alias se intenta automáticamente:

```text
logos/rivales/<nombre_normalizado>.png
```

Ejemplo: `Atlético de Madrid` → `logos/rivales/atletico_de_madrid.png`.

## GitHub Pages

1. Suba todo el contenido a la rama publicada.
2. Abra **Settings → Pages**.
3. Seleccione **Deploy from a branch** y la carpeta raíz `/`.
4. No abra los HTML con `file://`; use GitHub Pages o un servidor local.

Servidor local opcional:

```bash
python -m http.server 8000
```

## Validación rápida

```bash
node --check assets/js/core/state.js
node --check assets/js/core/ui.js
node --check assets/js/pages/dashboard.js
node --check assets/js/pages/partidos.js
```


## Seguridad de renderizado

Los valores dinámicos capturados en la bitácora (rival, torneo, fase, sede y nombres visibles) se procesan con `SportsCore.escapeHtml()` antes de insertarse mediante plantillas HTML. Los fallbacks de imágenes ya no escriben HTML dinámico desde `onerror`; muestran elementos hermanos pre-renderizados.

## Detección de partidos por título

La detección ya no depende de prefijos de identificadores hardcodeados. Un partido se considera decisivo para un título únicamente mediante el campo explícito `titleDecision: true`, evitando tener que actualizar una lista cada vez que se agregan nuevas finales.

## Restauración de datos y correcciones finales

Esta entrega conserva la estructura refactorizada y recupera exclusivamente los datos históricos desde `Sports-main(1).zip`, utilizado como fuente de verdad.

- 106 partidos históricos restaurados.
- 10 registros de definición de título mediante `titleDecision`.
- Sin listas de IDs como `TITLE_MATCH_PREFIXES`.
- Los partidos históricos siempre se reconstruyen desde `SEED_MATCHES`; `localStorage` conserva únicamente altas manuales adicionales.
- `escapeHtml()` y `escapeAttr()` se aplican en las plantillas dinámicas de equipos, rivales, torneos, fases, sedes y atributos.
- Los fallbacks de imágenes ya no reemplazan contenido mediante `innerHTML` dentro de `onerror`.

La función `normalizedMatch()` centraliza la reconstrucción LOCAL–VISITANTE y evita que la bitácora quede vacía al iniciar.
