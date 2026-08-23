# Ratio Sports — Base de datos PostgreSQL con Supabase

Esta versión reemplaza `localStorage` como fuente principal de partidos por una base PostgreSQL alojada en Supabase. `localStorage` se conserva solo como respaldo/fallback.

## 1. Crear el proyecto

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**.
3. Ejecuta completo `supabase/schema_and_seed.sql`.

El script crea:

- `matches`: bitácora completa y validada de partidos.
- `sports_weeks`: rangos dinámicos usados por el seguimiento semanal.
- índices para fecha, equipo, competición y títulos.
- restricciones de integridad para marcadores y estados.
- RLS: lectura pública y escritura solo para usuarios autenticados.
- los 106 partidos históricos que ya existían en el proyecto.
- las 22 semanas deportivas actuales como carga inicial.

El script es idempotente para los IDs existentes: usa `ON CONFLICT ... DO UPDATE`, por lo que puede volver a ejecutarse sin duplicar partidos.

## 2. Crear el administrador

En Supabase abre **Authentication > Users** y crea el usuario que administrará Ratio Sports. Para un sitio personal se recomienda desactivar el registro público de nuevos usuarios.

La primera vez que agregues, edites o elimines un partido o una semana deportiva, el navegador pedirá el correo y la contraseña del administrador. Supabase conservará la sesión de manera segura en el navegador.

## 3. Conectar el frontend

En Supabase abre **Project Settings / API** y copia:

- Project URL
- Publishable key / anon key

Edita `assets/js/config/database.js`:

```js
window.RATIO_SPORTS_DB = {
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU_CLAVE_PUBLICA'
};
```

No uses nunca la `service_role key` en GitHub Pages ni en ningún JavaScript público.

## 4. Flujo resultante

- Dashboard y Gestión cargan los partidos desde `public.matches`.
- Seguimiento y Gestión de semanas cargan sus rangos desde `public.sports_weeks`.
- Agregar marcador -> autenticación si hace falta -> `UPSERT` en PostgreSQL -> refresco del estado local.
- Eliminar marcador -> autenticación si hace falta -> `DELETE` en PostgreSQL -> refresco del estado local.
- Si Supabase no está configurado o una lectura falla, la aplicación usa la última copia disponible en `localStorage` como fallback.
- Cuando Supabase está configurado, una escritura fallida no se guarda solo localmente; así se evita desincronizar la base.

## Modelo de partido

La tabla contempla lo que actualmente usa el módulo de Gestión:

- equipo seguido y rival
- fecha
- país del rival e indicador internacional
- torneo/competición y fase/jornada
- estadio y ciudad
- local/visitante
- goles a favor/en contra y resultado
- nombres/orígenes local y visitante
- marcador local/visitante
- anotación del marcador
- global de eliminatoria
- penales
- tiempo extra
- partido decisivo de título, estado y torneo asociado
- indicador de registro agregado por el usuario
- timestamps de creación y actualización

## Archivos principales añadidos/cambiados

- `supabase/schema_and_seed.sql`
- `assets/js/config/database.js`
- `assets/js/services/database-service.js`
- `assets/js/services/match-service.js`
- `assets/js/core/state.js`
- `assets/js/pages/partidos.js`
- `assets/js/pages/dashboard.js`
- `partidos.html`
- `index.html`


## Datos dinámicos
Supabase almacena únicamente `matches` y `sports_weeks`. Los catálogos de equipos, torneos y logos permanecen estáticos en el frontend. `localStorage` conserva una copia espejo de ambos datasets y solo se usa como fallback de lectura cuando Supabase no está disponible.
