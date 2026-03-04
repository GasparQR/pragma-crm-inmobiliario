import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ── PLANTILLAS (las tuyas) ────────────────────────────────────────────────────
const TECH_APPLE_PIPELINE = [
  { nombre: "Nuevo", orden: 1, color: "bg-blue-500", is_won: false, is_lost: false },
  { nombre: "Cotizado", orden: 2, color: "bg-cyan-500", is_won: false, is_lost: false },
  { nombre: "Negociacion", orden: 3, color: "bg-amber-500", is_won: false, is_lost: false },
  { nombre: "Concretado", orden: 4, color: "bg-emerald-500", is_won: true, is_lost: false },
  { nombre: "Perdido", orden: 5, color: "bg-red-500", is_won: false, is_lost: true },
];

const TECH_APPLE_TAGS = [
  { name: "Instagram", type: "source" },
  { name: "WhatsApp", type: "source" },
  { name: "MercadoLibre", type: "source" },
  { name: "Referido", type: "source" },
  { name: "Local", type: "source" },
  { name: "iPhone", type: "category" },
  { name: "Mac", type: "category" },
  { name: "iPad", type: "category" },
  { name: "AirPods", type: "category" },
  { name: "Apple Watch", type: "category" },
  { name: "Accesorios", type: "category" },
  { name: "Alta", type: "priority", color: "bg-red-100 text-red-800" },
  { name: "Media", type: "priority", color: "bg-yellow-100 text-yellow-800" },
  { name: "Baja", type: "priority", color: "bg-blue-100 text-blue-800" },
];

const REAL_ESTATE_PIPELINE = [
  { nombre: "Nuevo Cliente", orden: 1, color: "bg-blue-500", is_won: false, is_lost: false },
  { nombre: "Calificado", orden: 2, color: "bg-cyan-500", is_won: false, is_lost: false },
  { nombre: "Propiedades sugeridas", orden: 3, color: "bg-violet-500", is_won: false, is_lost: false },
  { nombre: "Visita agendada", orden: 4, color: "bg-amber-500", is_won: false, is_lost: false },
  { nombre: "Visita realizada", orden: 5, color: "bg-orange-500", is_won: false, is_lost: false },
  { nombre: "Oferta realizada", orden: 6, color: "bg-pink-500", is_won: false, is_lost: false },
  { nombre: "Negociación", orden: 7, color: "bg-purple-500", is_won: false, is_lost: false },
  { nombre: "Reserva / Seña", orden: 8, color: "bg-indigo-500", is_won: false, is_lost: false },
  { nombre: "Boleto / Escritura", orden: 9, color: "bg-emerald-500", is_won: true, is_lost: false },
  { nombre: "Perdido", orden: 10, color: "bg-red-500", is_won: false, is_lost: true },
];

const REAL_ESTATE_TAGS = [
  { name: "Portales", type: "source" },
  { name: "Instagram", type: "source" },
  { name: "WhatsApp", type: "source" },
  { name: "Referido", type: "source" },
  { name: "Cartel", type: "source" },
  { name: "Web", type: "source" },
  { name: "Venta", type: "operation" },
  { name: "Alquiler", type: "operation" },
  { name: "Alquiler temporal", type: "operation" },
  { name: "Departamento", type: "property_type" },
  { name: "Casa", type: "property_type" },
  { name: "Lote", type: "property_type" },
  { name: "Oficina", type: "property_type" },
  { name: "Local", type: "property_type" },
  { name: "Galpón", type: "property_type" },
  { name: "Nueva Córdoba", type: "zone" },
  { name: "Centro", type: "zone" },
  { name: "General Paz", type: "zone" },
  { name: "Cerro", type: "zone" },
  { name: "Güemes", type: "zone" },
  { name: "Zona Norte", type: "zone" },
  { name: "Alta", type: "priority" },
  { name: "Media", type: "priority" },
  { name: "Baja", type: "priority" },
];

const REAL_ESTATE_CUSTOM_FIELDS = [
  { entity: "lead", key: "operacion", label: "Operación", field_type: "select", options: ["Venta", "Alquiler", "Alquiler temporal"], orden: 1 },
  { entity: "lead", key: "tipo_propiedad", label: "Tipo de propiedad", field_type: "select", options: ["Departamento", "Casa", "Lote", "Oficina", "Local", "Galpón"], orden: 2 },
  { entity: "lead", key: "zona_preferida", label: "Zona preferida", field_type: "multiselect", options: ["Nueva Córdoba", "Centro", "General Paz", "Cerro", "Güemes", "Zona Norte"], orden: 3 },
  { entity: "lead", key: "presupuesto", label: "Presupuesto", field_type: "currency", orden: 4 },
  { entity: "lead", key: "moneda_presupuesto", label: "Moneda", field_type: "select", options: ["USD", "ARS"], orden: 5 },
  { entity: "lead", key: "ambientes_min", label: "Ambientes mín.", field_type: "number", orden: 6 },
  { entity: "lead", key: "dormitorios_min", label: "Dormitorios mín.", field_type: "number", orden: 7 },
  { entity: "lead", key: "cochera", label: "¿Requiere cochera?", field_type: "boolean", orden: 8 },
  { entity: "lead", key: "fecha_mudanza", label: "Fecha de mudanza", field_type: "date", orden: 9 },
  { entity: "lead", key: "forma_pago", label: "Forma de pago", field_type: "select", options: ["Efectivo", "Hipotecario", "Permuta"], orden: 10 },
  { entity: "lead", key: "tiene_permuta", label: "¿Tiene propiedad para permuta?", field_type: "boolean", orden: 11 },
  { entity: "lead", key: "observaciones", label: "Observaciones", field_type: "text", orden: 12 },
];

const TECH_APPLE_SETTINGS = {
  currency: "USD",
  timezone: "America/Argentina/Cordoba",
  consulta_follow_up_days: 3,
  postventa_follow_up_days: 7,
};

const REAL_ESTATE_SETTINGS = {
  currency: "USD",
  timezone: "America/Argentina/Cordoba",
  consulta_follow_up_days: 2,
  postventa_follow_up_days: 5,
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

// “upsert” real: si existe -> update; si no -> create
async function upsertManyUpdate(base44: any, entityName: string, items: any[], uniqueKeys: string[]) {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const filter: any = {};
    for (const k of uniqueKeys) filter[k] = item[k];

    // Nota: filter devuelve array
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

// Desactivar etapas viejas que no están en la plantilla actual
async function deactivateMissingPipelineStages(base44: any, workspace_id: string, allowedNames: string[]) {
  const all = await base44.asServiceRole.entities.PipelineStage.filter({ workspace_id }, null, 5000);
  let deactivated = 0;

  for (const st of all) {
    if (!allowedNames.includes(st.nombre) && st.activa !== false) {
      await base44.asServiceRole.entities.PipelineStage.update(st.id, { activa: false });
      deactivated++;
    }
  }
  return { deactivated };
}

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

    // Usar user.id como clave real; fallback a email si no existiera
    const userKey = user.id ?? user.email;

    // 1) Obtener workspace del usuario (por membresía)
    const members =
      (await base44.asServiceRole.entities.WorkspaceMember.filter({ user_id: userKey }, null, 50)) ||
      (await base44.asServiceRole.entities.WorkspaceMember.filter({ user_id: user.email }, null, 50));

    let workspace = null;

    if (members?.length) {
      const m = members.find((x: any) => x.role === "admin") || members[0];
      // mejor: buscar por id real
      const ws = await base44.asServiceRole.entities.Workspace.filter({ id: m.workspace_id }, null, 1);
      workspace = ws?.[0] ?? null;
    }

    // 2) Crear workspace si no existe
    if (!workspace) {
      workspace = await base44.asServiceRole.entities.Workspace.create({
        name: user.full_name ? `Workspace de ${user.full_name}` : "Mi Workspace",
        owner_user_id: userKey,
        industry,
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

    // 3) Selección de plantilla
    const pipeline = industry === "tech_apple" ? TECH_APPLE_PIPELINE : REAL_ESTATE_PIPELINE;
    const tags = industry === "tech_apple" ? TECH_APPLE_TAGS : REAL_ESTATE_TAGS;
    const customFields = industry === "tech_apple" ? [] : REAL_ESTATE_CUSTOM_FIELDS;
    const settings = industry === "tech_apple" ? TECH_APPLE_SETTINGS : REAL_ESTATE_SETTINGS;

    // 4) Pipeline: upsert con update + desactivar lo que sobra
    const pipelineItems = pipeline.map((s) => ({ ...s, workspace_id, activa: true }));
    const pipelineResult = await upsertManyUpdate(base44, "PipelineStage", pipelineItems, ["workspace_id", "nombre"]);
    const deactivationResult = await deactivateMissingPipelineStages(base44, workspace_id, pipeline.map((x) => x.nombre));

    // 5) Tags: upsert con update (así si cambias color/type, se actualiza)
    const tagItems = tags.map((t) => ({ ...t, workspace_id }));
    const tagsResult = await upsertManyUpdate(base44, "Tag", tagItems, ["workspace_id", "name"]);

    // 6) Custom Fields: upsert con update
    const cfItems = customFields.map((f) => ({ ...f, workspace_id }));
    const cfResult = await upsertManyUpdate(base44, "CustomField", cfItems, ["workspace_id", "key"]);

    // 7) Settings: create o update
    const existingSettings = await base44.asServiceRole.entities.WorkspaceSettings.filter({ workspace_id }, null, 1);

    if (!existingSettings || existingSettings.length === 0) {
      await base44.asServiceRole.entities.WorkspaceSettings.create({ ...settings, workspace_id });
    } else {
      await base44.asServiceRole.entities.WorkspaceSettings.update(existingSettings[0].id, { ...settings, workspace_id });
    }

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
      },
    });
  } catch (error) {
    return Response.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
});