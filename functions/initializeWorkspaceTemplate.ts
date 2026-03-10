import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ── TECH_APPLE TEMPLATE ─────────────────────────────────────────────────────
const TECH_APPLE_PIPELINE = [
  { nombre: "Nuevo",       orden: 1, color: "bg-blue-500",    is_won: false, is_lost: false },
  { nombre: "Seguimiento", orden: 2, color: "bg-amber-500",   is_won: false, is_lost: false },
  { nombre: "Concretado",  orden: 3, color: "bg-emerald-500", is_won: true,  is_lost: false },
  { nombre: "Perdido",     orden: 4, color: "bg-red-500",     is_won: false, is_lost: true  },
];

const TECH_APPLE_TAGS = [
  // Fuentes (sin prioridad para tech)
  { name: "WhatsApp",      type: "source" },
  { name: "Instagram",     type: "source" },
  { name: "MercadoLibre",  type: "source" },
  { name: "Referido",      type: "source" },
  { name: "Web",           type: "source" },
  { name: "Local",         type: "source" },
  // Categorías de producto
  { name: "iPhone",        type: "category" },
  { name: "MacBook",       type: "category" },
  { name: "iPad",          type: "category" },
  { name: "AirPods",       type: "category" },
  { name: "Apple Watch",   type: "category" },
  { name: "Accesorios",    type: "category" },
  { name: "Otros",         type: "category" },
];

const TECH_APPLE_CUSTOM_FIELDS = [
  { entity: "lead", key: "producto_interes", label: "Producto de interés", field_type: "text",   orden: 1 },
  { entity: "lead", key: "modelo",           label: "Modelo",              field_type: "text",   orden: 2 },
  { entity: "lead", key: "capacidad",        label: "Capacidad",           field_type: "select", options: ["64GB","128GB","256GB","512GB","1TB"], orden: 3 },
  { entity: "lead", key: "color",            label: "Color",               field_type: "text",   orden: 4 },
  { entity: "lead", key: "presupuesto",      label: "Presupuesto",         field_type: "currency", orden: 5 },
  { entity: "lead", key: "medio_pago",       label: "Medio de pago",       field_type: "select", options: ["Efectivo USD","Efectivo ARS","Transferencia","Tarjeta","USDT","Canje"], orden: 6 },
];

const TECH_APPLE_SETTINGS = {
  currency: "USD",
  timezone: "America/Argentina/Cordoba",
  consulta_follow_up_days: 3,
  postventa_follow_up_days: 7,
};

// ── REAL_ESTATE TEMPLATE ────────────────────────────────────────────────────
const REAL_ESTATE_PIPELINE = [
  { nombre: "Nuevo",       orden: 1, color: "bg-blue-500",    is_won: false, is_lost: false },
  { nombre: "Seguimiento", orden: 2, color: "bg-amber-500",   is_won: false, is_lost: false },
  { nombre: "Visita",      orden: 3, color: "bg-violet-500",  is_won: false, is_lost: false },
  { nombre: "Concretado",  orden: 4, color: "bg-emerald-500", is_won: true,  is_lost: false },
  { nombre: "Perdido",     orden: 5, color: "bg-red-500",     is_won: false, is_lost: true  },
];

const REAL_ESTATE_TAGS = [
  // Fuentes
  { name: "Portales",          type: "source" },
  { name: "Instagram",         type: "source" },
  { name: "WhatsApp",          type: "source" },
  { name: "Referido",          type: "source" },
  { name: "Cartel",            type: "source" },
  { name: "Web",               type: "source" },
  // Operaciones
  { name: "Venta",             type: "operation" },
  { name: "Alquiler",          type: "operation" },
  { name: "Alquiler temporal", type: "operation" },
  // Tipos de propiedad
  { name: "Departamento",      type: "property_type" },
  { name: "Casa",              type: "property_type" },
  { name: "Lote",              type: "property_type" },
  { name: "Oficina",           type: "property_type" },
  { name: "Local",             type: "property_type" },
  { name: "Galpón",            type: "property_type" },
  // Zonas
  { name: "Nueva Córdoba",     type: "zone" },
  { name: "Centro",            type: "zone" },
  { name: "General Paz",       type: "zone" },
  { name: "Cerro",             type: "zone" },
  { name: "Güemes",            type: "zone" },
  { name: "Zona Norte",        type: "zone" },
  // Prioridad (solo para inmobiliaria)
  { name: "Alta",              type: "priority", color: "bg-red-100 text-red-800" },
  { name: "Media",             type: "priority", color: "bg-yellow-100 text-yellow-800" },
  { name: "Baja",              type: "priority", color: "bg-blue-100 text-blue-800" },
];

const REAL_ESTATE_CUSTOM_FIELDS = [
  { entity: "lead", key: "operacion",       label: "Operación",                        field_type: "select",      options: ["Venta","Alquiler","Alquiler temporal"], orden: 1 },
  { entity: "lead", key: "tipo_propiedad",  label: "Tipo de propiedad",                field_type: "select",      options: ["Departamento","Casa","Lote","Oficina","Local","Galpón"], orden: 2 },
  { entity: "lead", key: "zona_preferida",  label: "Zona preferida",                   field_type: "multiselect", options: ["Nueva Córdoba","Centro","General Paz","Cerro","Güemes","Zona Norte"], orden: 3 },
  { entity: "lead", key: "presupuesto",     label: "Presupuesto",                      field_type: "currency",    orden: 4 },
  { entity: "lead", key: "moneda_pres",     label: "Moneda",                           field_type: "select",      options: ["USD","ARS"], orden: 5 },
  { entity: "lead", key: "ambientes_min",   label: "Ambientes mín.",                   field_type: "number",      orden: 6 },
  { entity: "lead", key: "dormitorios_min", label: "Dormitorios mín.",                 field_type: "number",      orden: 7 },
  { entity: "lead", key: "cochera",         label: "¿Requiere cochera?",               field_type: "boolean",     orden: 8 },
  { entity: "lead", key: "fecha_mudanza",   label: "Fecha de mudanza",                 field_type: "date",        orden: 9 },
  { entity: "lead", key: "forma_pago",      label: "Forma de pago",                    field_type: "select",      options: ["Efectivo","Hipotecario","Permuta"], orden: 10 },
  { entity: "lead", key: "tiene_permuta",   label: "¿Tiene propiedad para permuta?",   field_type: "boolean",     orden: 11 },
  { entity: "lead", key: "observaciones",   label: "Observaciones",                    field_type: "text",        orden: 12 },
];

const REAL_ESTATE_SETTINGS = {
  currency: "USD",
  timezone: "America/Argentina/Cordoba",
  consulta_follow_up_days: 10,
  postventa_follow_up_days: 15,
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
async function upsertMany(base44, entityName, items, uniqueKeys) {
  let created = 0;
  let updated = 0;
  for (const item of items) {
    const filter = {};
    for (const k of uniqueKeys) filter[k] = item[k];
    const existing = await base44.asServiceRole.entities[entityName].filter(filter, null, 1);
    if (!existing || existing.length === 0) {
      await base44.asServiceRole.entities[entityName].create(item);
      created++;
    } else {
      await base44.asServiceRole.entities[entityName].update(existing[0].id, item);
      updated++;
    }
  }
  return { created, updated };
}

async function deactivateMissingStages(base44, workspace_id, allowedNames) {
  const all = await base44.asServiceRole.entities.PipelineStage.filter({ workspace_id }, null, 500);
  let deactivated = 0;
  for (const st of all) {
    if (!allowedNames.includes(st.nombre) && st.activa !== false) {
      await base44.asServiceRole.entities.PipelineStage.update(st.id, { activa: false });
      deactivated++;
    }
  }
  return { deactivated };
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const industry = body?.industry;
    if (!["tech_apple", "real_estate"].includes(industry)) {
      return Response.json({ error: "Industria inválida. Usar tech_apple o real_estate" }, { status: 400 });
    }

    const userKey = user.id ?? user.email;

    // 1) Buscar workspace del usuario
    let members = await base44.asServiceRole.entities.WorkspaceMember.filter({ user_id: userKey }, null, 50);
    if (!members?.length && userKey !== user.email) {
      members = await base44.asServiceRole.entities.WorkspaceMember.filter({ user_id: user.email }, null, 50);
    }

    let workspace = null;
    if (members?.length) {
      const m = members.find((x) => x.role === "admin") || members[0];
      const ws = await base44.asServiceRole.entities.Workspace.filter({ id: m.workspace_id }, null, 1);
      workspace = ws?.[0] ?? null;
    }

    // 2) Crear workspace si no existe
    if (!workspace) {
      workspace = await base44.asServiceRole.entities.Workspace.create({
        name: user.full_name ? `Workspace de ${user.full_name}` : "Mi Workspace",
        owner_user_id: userKey,
        industry,
        onboarding_completed: false,
      });
      await base44.asServiceRole.entities.WorkspaceMember.create({
        workspace_id: workspace.id,
        user_id: userKey,
        role: "admin",
      });
    } else {
      await base44.asServiceRole.entities.Workspace.update(workspace.id, { industry });
    }

    const workspace_id = workspace.id;

    // 3) Seleccionar plantilla
    const pipeline     = industry === "tech_apple" ? TECH_APPLE_PIPELINE      : REAL_ESTATE_PIPELINE;
    const tags         = industry === "tech_apple" ? TECH_APPLE_TAGS           : REAL_ESTATE_TAGS;
    const customFields = industry === "tech_apple" ? TECH_APPLE_CUSTOM_FIELDS  : REAL_ESTATE_CUSTOM_FIELDS;
    const settings     = industry === "tech_apple" ? TECH_APPLE_SETTINGS       : REAL_ESTATE_SETTINGS;

    // 4) Pipeline
    const pipelineItems = pipeline.map((s) => ({ ...s, workspace_id, activa: true }));
    const pipelineResult = await upsertMany(base44, "PipelineStage", pipelineItems, ["workspace_id", "nombre"]);
    const deactivationResult = await deactivateMissingStages(base44, workspace_id, pipeline.map((x) => x.nombre));

    // 5) Tags
    const tagsResult = await upsertMany(base44, "Tag", tags.map((t) => ({ ...t, workspace_id })), ["workspace_id", "name"]);

    // 6) Custom Fields
    const cfResult = await upsertMany(base44, "CustomField", customFields.map((f) => ({ ...f, workspace_id })), ["workspace_id", "key"]);

    // 7) Settings
    const existingSettings = await base44.asServiceRole.entities.WorkspaceSettings.filter({ workspace_id }, null, 1);
    if (!existingSettings?.length) {
      await base44.asServiceRole.entities.WorkspaceSettings.create({ ...settings, workspace_id });
    } else {
      await base44.asServiceRole.entities.WorkspaceSettings.update(existingSettings[0].id, { ...settings, workspace_id });
    }

    // 8) Marcar onboarding completado
    await base44.asServiceRole.entities.Workspace.update(workspace_id, {
      industry,
      onboarding_completed: true,
    });

    return Response.json({
      ok: true,
      workspace_id,
      industry,
      summary: {
        pipeline: pipelineResult,
        pipeline_deactivated: deactivationResult,
        tags: tagsResult,
        custom_fields: cfResult,
        settings_updated: true,
        onboarding_completed: true,
      },
    });
  } catch (error) {
    return Response.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
});