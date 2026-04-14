# Pragma CRM Inmobiliario

Frontend Vite + React con datos en **Supabase** (Postgres, Auth, RLS).

## Requisitos

1. Clonar el repositorio e instalar dependencias: `npm install`
2. Crear un proyecto en [Supabase](https://supabase.com), aplicar las migraciones del directorio `supabase/migrations/` (CLI o SQL Editor)
3. Copiar `.env.example` a `.env.local` y completar:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

4. Desplegar la Edge Function `invite-workspace-member` con `SUPABASE_SERVICE_ROLE_KEY` en los secretos del proyecto (invitaciones por email)

## Desarrollo

`npm run dev`

## Build

`npm run build`
