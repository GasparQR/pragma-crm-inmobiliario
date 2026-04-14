-- PRAGMA CRM schema (Supabase) — greenfield, RLS por workspace

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.jsonb_get_date(j jsonb, key text)
RETURNS date
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF j ? key AND NULLIF(trim(j->>key), '') IS NOT NULL THEN
    RETURN (j->>key)::date;
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.jsonb_get_bool(j jsonb, key text, default_val boolean DEFAULT false)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  t text;
BEGIN
  IF j ? key THEN
    t := lower(trim(j->>key));
    IF t IN ('true', 't', '1', 'yes') THEN RETURN true; END IF;
    IF t IN ('false', 'f', '0', 'no', '') THEN RETURN false; END IF;
    RETURN (j->>key)::boolean;
  END IF;
  RETURN default_val;
EXCEPTION WHEN OTHERS THEN
  RETURN default_val;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  consulta_follow_up_days int NOT NULL DEFAULT 3,
  postventa_follow_up_days int NOT NULL DEFAULT 7,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mi Workspace',
  owner_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  industry text NOT NULL DEFAULT 'real_estate',
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON public.workspace_members (user_id);
CREATE INDEX idx_workspace_members_ws ON public.workspace_members (workspace_id);

CREATE TABLE public.workspace_pending_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_workspace_pending_invites_ws_email
  ON public.workspace_pending_invites (workspace_id, (lower(email)));

CREATE TABLE public.workspace_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES public.workspaces (id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'America/Argentina/Cordoba',
  consulta_follow_up_days int NOT NULL DEFAULT 10,
  postventa_follow_up_days int NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER workspace_settings_updated_at
  BEFORE UPDATE ON public.workspace_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  orden int NOT NULL DEFAULT 0,
  color text,
  is_won boolean NOT NULL DEFAULT false,
  is_lost boolean NOT NULL DEFAULT false,
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, nombre)
);

CREATE TRIGGER pipeline_stages_updated_at
  BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_pipeline_stages_ws ON public.pipeline_stages (workspace_id, orden);

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'source',
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, name)
);

CREATE INDEX idx_tags_ws ON public.tags (workspace_id);

CREATE TABLE public.custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  entity text NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL,
  options jsonb,
  orden int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, key)
);

CREATE TABLE public.listas_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER listas_whatsapp_updated_at
  BEFORE UPDATE ON public.listas_whatsapp
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_listas_ws ON public.listas_whatsapp (workspace_id);

CREATE TABLE public.plantillas_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER plantillas_whatsapp_updated_at
  BEFORE UPDATE ON public.plantillas_whatsapp
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_plantillas_ws ON public.plantillas_whatsapp (workspace_id);

CREATE TABLE public.variable_plantilla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER variable_plantilla_updated_at
  BEFORE UPDATE ON public.variable_plantilla
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_variable_plantilla_ws ON public.variable_plantilla (workspace_id);

CREATE TABLE public.consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER consultas_updated_at
  BEFORE UPDATE ON public.consultas
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_consultas_ws ON public.consultas (workspace_id, created_at DESC);

CREATE TABLE public.contactos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER contactos_updated_at
  BEFORE UPDATE ON public.contactos
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_contactos_ws ON public.contactos (workspace_id, created_at DESC);

CREATE TABLE public.ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  fecha date GENERATED ALWAYS AS (public.jsonb_get_date(doc, 'fecha')) STORED,
  codigo text GENERATED ALWAYS AS ((doc->>'codigo')) STORED,
  postventa_activa boolean GENERATED ALWAYS AS (public.jsonb_get_bool(doc, 'postventaActiva', false)) STORED,
  proximo_seguimiento_postventa date GENERATED ALWAYS AS (public.jsonb_get_date(doc, 'proximoSeguimientoPostventa')) STORED
);

CREATE TRIGGER ventas_updated_at
  BEFORE UPDATE ON public.ventas
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_ventas_ws_fecha ON public.ventas (workspace_id, fecha DESC NULLS LAST);
CREATE INDEX idx_ventas_ws_created ON public.ventas (workspace_id, created_at DESC);
CREATE INDEX idx_ventas_postventa ON public.ventas (workspace_id, postventa_activa, proximo_seguimiento_postventa NULLS LAST);

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_properties_ws ON public.properties (workspace_id, created_at DESC);

CREATE TABLE public.proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER proveedores_updated_at
  BEFORE UPDATE ON public.proveedores
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_proveedores_ws ON public.proveedores (workspace_id, created_at DESC);

CREATE TABLE public.envios_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_envios_ws ON public.envios_whatsapp (workspace_id, created_at DESC);

CREATE TABLE public.mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mensajes_ws ON public.mensajes (workspace_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Auth trigger: profile + pending workspace invites (after all tables exist)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  SELECT pi.workspace_id, NEW.id, pi.role
  FROM public.workspace_pending_invites pi
  WHERE lower(pi.email) = lower(NEW.email);

  DELETE FROM public.workspace_pending_invites WHERE lower(email) = lower(NEW.email);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_pragma ON auth.users;
CREATE TRIGGER on_auth_user_created_pragma
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_workspace_ids()
RETURNS setof uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid();
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_pending_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listas_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantillas_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_plantilla ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_self ON public.profiles FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY workspaces_select ON public.workspaces FOR SELECT TO authenticated
  USING (id IN (SELECT public.user_workspace_ids()));

CREATE POLICY workspaces_update ON public.workspaces FOR UPDATE TO authenticated
  USING (id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (id IN (SELECT public.user_workspace_ids()));

CREATE POLICY workspace_members_rw ON public.workspace_members FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY workspace_pending_invites_admin ON public.workspace_pending_invites FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT wm.workspace_id FROM public.workspace_members wm
      WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
    )
  );

CREATE POLICY workspace_settings_rw ON public.workspace_settings FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY pipeline_stages_rw ON public.pipeline_stages FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY tags_rw ON public.tags FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY custom_fields_rw ON public.custom_fields FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY listas_rw ON public.listas_whatsapp FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY plantillas_rw ON public.plantillas_whatsapp FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY variable_plantilla_rw ON public.variable_plantilla FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY consultas_rw ON public.consultas FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY contactos_rw ON public.contactos FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY ventas_rw ON public.ventas FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY properties_rw ON public.properties FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY proveedores_rw ON public.proveedores FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

CREATE POLICY envios_rw ON public.envios_whatsapp FOR ALL TO authenticated
  USING (
    workspace_id IS NULL
    OR workspace_id IN (SELECT public.user_workspace_ids())
  )
  WITH CHECK (
    workspace_id IS NULL
    OR workspace_id IN (SELECT public.user_workspace_ids())
  );

CREATE POLICY mensajes_rw ON public.mensajes FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids()));

-- ---------------------------------------------------------------------------
-- Seed template (destructive for listas only when run)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_workspace_template(p_workspace_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s record;
BEGIN
  FOR s IN SELECT * FROM (VALUES
    ('Nuevo lead', 1, 'bg-blue-500', false, false),
    ('Contactado', 2, 'bg-cyan-500', false, false),
    ('Visita agendada', 3, 'bg-violet-500', false, false),
    ('Visita realizada', 4, 'bg-amber-500', false, false),
    ('En negociación', 5, 'bg-orange-500', false, false),
    ('Reserva firmada', 6, 'bg-purple-500', false, false),
    ('Operación cerrada', 7, 'bg-emerald-500', true, false),
    ('No concretado', 8, 'bg-red-500', false, true)
  ) AS t(nombre, orden, color, is_won, is_lost)
  LOOP
    INSERT INTO public.pipeline_stages (workspace_id, nombre, orden, color, is_won, is_lost, activa)
    VALUES (p_workspace_id, s.nombre, s.orden, s.color, s.is_won, s.is_lost, true)
    ON CONFLICT (workspace_id, nombre) DO UPDATE SET
      orden = EXCLUDED.orden, color = EXCLUDED.color, is_won = EXCLUDED.is_won,
      is_lost = EXCLUDED.is_lost, activa = true, updated_at = now();
  END LOOP;

  UPDATE public.pipeline_stages SET activa = false, updated_at = now()
  WHERE workspace_id = p_workspace_id
    AND nombre NOT IN (
      'Nuevo lead','Contactado','Visita agendada','Visita realizada','En negociación',
      'Reserva firmada','Operación cerrada','No concretado'
    );

  INSERT INTO public.tags (workspace_id, name, type) VALUES
    (p_workspace_id, 'Zona Prop', 'source'),
    (p_workspace_id, 'La voz del interior', 'source'),
    (p_workspace_id, 'Facebook', 'source'),
    (p_workspace_id, 'Instagram', 'source'),
    (p_workspace_id, 'Estado WhatsApp', 'source'),
    (p_workspace_id, 'Referido', 'source'),
    (p_workspace_id, 'Argenprop', 'source'),
    (p_workspace_id, 'MercadoLibre', 'source'),
    (p_workspace_id, 'La Voz del Interior', 'source'),
    (p_workspace_id, 'Cartel en propiedad', 'source'),
    (p_workspace_id, 'Vitrina', 'source'),
    (p_workspace_id, 'Base de datos propia', 'source'),
    (p_workspace_id, 'Otro', 'source'),
    (p_workspace_id, 'Venta', 'operation'),
    (p_workspace_id, 'Alquiler', 'operation'),
    (p_workspace_id, 'Alquiler temporal', 'operation'),
    (p_workspace_id, 'Departamento', 'property_type'),
    (p_workspace_id, 'Casa', 'property_type'),
    (p_workspace_id, 'Lote', 'property_type'),
    (p_workspace_id, 'Oficina', 'property_type'),
    (p_workspace_id, 'Local', 'property_type'),
    (p_workspace_id, 'Galpón', 'property_type'),
    (p_workspace_id, 'Nueva Córdoba', 'zone'),
    (p_workspace_id, 'Centro', 'zone'),
    (p_workspace_id, 'General Paz', 'zone'),
    (p_workspace_id, 'Cerro', 'zone'),
    (p_workspace_id, 'Güemes', 'zone'),
    (p_workspace_id, 'Zona Norte', 'zone'),
    (p_workspace_id, 'Alta', 'priority'),
    (p_workspace_id, 'Media', 'priority'),
    (p_workspace_id, 'Baja', 'priority')
  ON CONFLICT (workspace_id, name) DO NOTHING;

  INSERT INTO public.custom_fields (workspace_id, entity, key, label, field_type, options, orden) VALUES
    (p_workspace_id, 'lead', 'operacion', 'Operación', 'select', '["Venta","Alquiler","Alquiler temporal"]'::jsonb, 1),
    (p_workspace_id, 'lead', 'tipo_propiedad', 'Tipo de propiedad', 'select', '["Departamento","Casa","Duplex","Lote","Oficina","Local","Campo"]'::jsonb, 2),
    (p_workspace_id, 'lead', 'zona_preferida', 'Zona preferida', 'multiselect', '["Nueva Córdoba","Centro","General Paz","Cerro","Güemes","Zona Norte"]'::jsonb, 3),
    (p_workspace_id, 'lead', 'presupuesto', 'Presupuesto', 'currency', null, 4),
    (p_workspace_id, 'lead', 'moneda_pres', 'Moneda', 'select', '["USD","ARS"]'::jsonb, 5),
    (p_workspace_id, 'lead', 'ambientes_min', 'Ambientes mín.', 'number', null, 6),
    (p_workspace_id, 'lead', 'dormitorios_min', 'Dormitorios mín.', 'number', null, 7),
    (p_workspace_id, 'lead', 'cochera', '¿Requiere cochera?', 'boolean', null, 8),
    (p_workspace_id, 'lead', 'fecha_mudanza', 'Fecha de mudanza', 'date', null, 9),
    (p_workspace_id, 'lead', 'forma_pago', 'Forma de pago', 'select', '["Efectivo","Hipotecario","Permuta"]'::jsonb, 10),
    (p_workspace_id, 'lead', 'tiene_permuta', '¿Tiene propiedad para permuta?', 'boolean', null, 11),
    (p_workspace_id, 'lead', 'observaciones', 'Observaciones', 'text', null, 12)
  ON CONFLICT (workspace_id, key) DO NOTHING;

  DELETE FROM public.listas_whatsapp WHERE workspace_id = p_workspace_id;

  INSERT INTO public.listas_whatsapp (workspace_id, doc) VALUES
    (p_workspace_id, '{"nombre":"Bienvenida consulta inmobiliaria","categoria":"General","estado":"Publicada","tags":["nuevo","bienvenida"],"texto":"Hola, gracias por contactarnos. Somos una inmobiliaria con experiencia en la zona. Contanos en que podemos ayudarte."}'::jsonb),
    (p_workspace_id, '{"nombre":"Propiedades disponibles en venta","categoria":"Venta","estado":"Publicada","tags":["venta","propiedades"],"texto":"Propiedades en venta actualizadas. Indicanos zona, ambientes, presupuesto y forma de pago para armarte una seleccion."}'::jsonb),
    (p_workspace_id, '{"nombre":"Propiedades disponibles en alquiler","categoria":"Alquiler","estado":"Publicada","tags":["alquiler","propiedades"],"texto":"Propiedades en alquiler. Indicanos zona, ambientes, presupuesto mensual y fecha de ingreso estimada."}'::jsonb),
    (p_workspace_id, '{"nombre":"Confirmacion de visita","categoria":"General","estado":"Publicada","tags":["visita"],"texto":"Te confirmamos la visita. Propiedad: {PROPIEDAD}. Fecha: {FECHA}. Hora: {HORA}. Te atiende: {VENDEDOR}."}'::jsonb),
    (p_workspace_id, '{"nombre":"Seguimiento post-visita","categoria":"General","estado":"Publicada","tags":["seguimiento","visita"],"texto":"Hola, que te parecio la propiedad? Contanos si queres ver otras opciones."}'::jsonb),
    (p_workspace_id, '{"nombre":"Cierre y proximos pasos","categoria":"General","estado":"Publicada","tags":["cierre"],"texto":"Te confirmamos que avanzamos con la operacion. Propiedad: {PROPIEDAD}. Valor: {PRECIO} {MONEDA}. Proximos pasos: reserva, documentacion, escritura."}'::jsonb);

  INSERT INTO public.workspace_settings (workspace_id, currency, timezone, consulta_follow_up_days, postventa_follow_up_days)
  VALUES (p_workspace_id, 'USD', 'America/Argentina/Cordoba', 10, 15)
  ON CONFLICT (workspace_id) DO UPDATE SET
    currency = EXCLUDED.currency,
    timezone = EXCLUDED.timezone,
    consulta_follow_up_days = EXCLUDED.consulta_follow_up_days,
    postventa_follow_up_days = EXCLUDED.postventa_follow_up_days,
    updated_at = now();

  UPDATE public.workspaces SET industry = 'real_estate', onboarding_completed = true, updated_at = now()
  WHERE id = p_workspace_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  wid uuid;
  done boolean;
  uname text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT wm.workspace_id INTO wid
  FROM public.workspace_members wm
  WHERE wm.user_id = uid
  ORDER BY CASE WHEN wm.role = 'admin' THEN 0 ELSE 1 END, wm.created_at
  LIMIT 1;

  IF wid IS NOT NULL THEN
    SELECT onboarding_completed INTO done FROM public.workspaces WHERE id = wid;
    IF NOT COALESCE(done, false) THEN
      PERFORM public.seed_workspace_template(wid);
    END IF;
    RETURN wid;
  END IF;

  SELECT COALESCE(p.full_name, p.email, 'Mi Workspace') INTO uname FROM public.profiles p WHERE p.id = uid;

  INSERT INTO public.workspaces (name, owner_user_id, industry, onboarding_completed)
  VALUES (format('Workspace de %s', uname), uid, 'real_estate', false)
  RETURNING id INTO wid;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (wid, uid, 'admin');

  PERFORM public.seed_workspace_template(wid);

  RETURN wid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_workspace() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_workspace_ids() TO authenticated;
