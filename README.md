# Ratio Sports — Centro de seguimiento deportivo

Dashboard estático para GitHub Pages que centraliza equipos, torneos y una bitácora editable de partidos.

## Arquitectura

```text
assets/css/app.css           # sistema de diseño único con 3 temas: Noche (CR7 oscuro), Gris (claro) y Color
assets/js/
├── config/logos.js          # rutas, alias de logos y catálogo de torneos
├── data/sports-data.js      # equipos y partidos semilla
├── core/
│   ├── state.js             # modelo, estadísticas, torneos y semanas (lógica pura)
│   ├── ui.js                # tema, logos, tarjeta de equipo, formato de marcador
│   └── backup.js            # importar/exportar JSON (solo en Gestión)
├── services/                # Supabase, partidos y estado de torneos
└── pages/
    ├── dashboard.js         # página pública, solo lectura
    ├── partidos.js          # Gestión: torneos, nuevo marcador, últimos partidos
    ├── weeks-admin.js       # Gestión: semanas deportivas
    └── admin-auth.js        # inicio de sesión del administrador
```

## Reglas de estadísticas

- **Cuentan todos los deportes** (fútbol y NFL): partidos jugados, ganados, empatados, perdidos, % de victorias, semanas, títulos y torneos.
- **Solo fútbol**: goles a favor/en contra, diferencia, goles por partido, porterías a cero y partidos sin marcar.
- El resultado de **cada partido** (G/E/P) sale siempre de su marcador. La serie perdida en un global se refleja en el estado del torneo, no en el partido.

## Estado de los torneos

Un torneo es la pareja (equipo, nombre de torneo). Su estado se deduce del partido que lo cerró:

| Estado | Significado | `title_status` |
| --- | --- | --- |
| Campeón | ganó el torneo | `ganado` |
| Subcampeón | perdió la final | `perdido` |
| Eliminado / torneo perdido | quedó fuera antes de la final, o liga ya perdida | `eliminado` |
| En curso | ningún partido lo cerró | — |

No requiere cambios de esquema. Se marca desde **Gestión → Estado de los torneos** (sin necesidad de una final) o al capturar un marcador con "Este partido cerró el torneo".

## Correcciones de datos

Ejecuta `supabase/fix_results_and_week20.sql` una vez en el SQL Editor de Supabase.

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
