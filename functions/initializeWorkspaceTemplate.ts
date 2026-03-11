import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PIPELINE = [
  { nombre: "Nuevo",      orden: 1, color: "bg-blue-500",    is_won: false, is_lost: false },
  { nombre: "Visita",     orden: 2, color: "bg-violet-500",  is_won: false, is_lost: false },
  { nombre: "Post Visita",orden: 3, color: "bg-amber-500",   is_won: false, is_lost: false },
  { nombre: "Concretado", orden: 4, color: "bg-emerald-500", is_won: true,  is_lost: false },
  { nombre: "Perdido",    orden: 5, color: "bg-red-500",     is_won: false, is_lost: true  },
];

const TAGS = [
  { name: "Zona Prop",          type: "source" },
  { name: "La voz del interior",type: "source" },
  { name: "Facebook",           type: "source" },
  { name: "Instagram",          type: "source" },
  { name: "Estado WhatsApp",    type: "source" },
  { name: "Referido",           type: "source" },
  { name: "Cartel",             type: "source" },
  { name: "Venta",             type: "operation" },
  { name: "Alquiler",          type: "operation" },
  { name: "Alquiler temporal", type: "operation" },
  { name: "Departamento",      type: "property_type" },
  { name: "Casa",              type: "property_type" },
  { name: "Lote",              type: "property_type" },
  { name: "Oficina",           type: "property_type" },
  { name: "Local",             type: "property_type" },
  { name: "Galpón",            type: "property_type" },
  { name: "Nueva Córdoba",     type: "zone" },
  { name: "Centro",            type: "zone" },
  { name: "General Paz",       type: "zone" },
  { name: "Cerro",             type: "zone" },
  { name: "Güemes",            type: "zone" },
  { name: "Zona Norte",        type: "zone" },
  { name: "Alta",              type: "priority", color: "bg-red-100 text-red-800" },
  { name: "Media",             type: "priority", color: "bg-yellow-100 text-yellow-800" },
  { name: "Baja",              type: "priority", color: "bg-blue-100 text-blue-800" },
];

const CUSTOM_FIELDS = [
  { entity: "lead", key: "operacion",       label: "Operación",                      field_type: "select",      options: ["Venta","Alquiler","Alquiler temporal"], orden: 1 },
  { entity: "lead", key: "tipo_propiedad",  label: "Tipo de propiedad",              field_type: "select",      options: ["Departamento","Casa","Duplex","Lote","Oficina","Local","Campo"], orden: 2 },
  { entity: "lead", key: "zona_preferida",  label: "Zona preferida",                 field_type: "multiselect", options: ["Nueva Córdoba","Centro","General Paz","Cerro","Güemes","Zona Norte"], orden: 3 },
  { entity: "lead", key: "presupuesto",     label: "Presupuesto",                    field_type: "currency",    orden: 4 },
  { entity: "lead", key: "moneda_pres",     label: "Moneda",                         field_type: "select",      options: ["USD","ARS"], orden: 5 },
  { entity: "lead", key: "ambientes_min",   label: "Ambientes mín.",                 field_type: "number",      orden: 6 },
  { entity: "lead", key: "dormitorios_min", label: "Dormitorios mín.",               field_type: "number",      orden: 7 },
  { entity: "lead", key: "cochera",         label: "¿Requiere cochera?",             field_type: "boolean",     orden: 8 },
  { entity: "lead", key: "fecha_mudanza",   label: "Fecha de mudanza",               field_type: "date",        orden: 9 },
  { entity: "lead", key: "forma_pago",      label: "Forma de pago",                  field_type: "select",      options: ["Efectivo","Hipotecario","Permuta"], orden: 10 },
  { entity: "lead", key: "tiene_permuta",   label: "¿Tiene propiedad para permuta?", field_type: "boolean",     orden: 11 },
  { entity: "lead", key: "observaciones",   label: "Observaciones",                  field_type: "text",        orden: 12 },
];

const SETTINGS = {
  currency: "USD",
  timezone: "America/Argentina/Cordoba",
  consulta_follow_up_days: 10,
  postventa_follow_up_days: 15,
};

const LISTAS = [
  {
    nombre: "Bienvenida consulta inmobiliaria",
    categoria: "General",
    estado: "Publicada",
    tags: ["nuevo", "bienvenida"],
    texto: `¡Hola! 👋 Gracias por contactarnos.\n\nSomos una inmobiliaria con amplia experiencia en la zona. ¿En qué te podemos ayudar?\n\n🏠 *¿Qué estás buscando?*\n• Comprar una propiedad\n• Alquilar\n• Información sobre una publicación\n\nContanos y te asesoramos con gusto 🙌`
  },
  {
    nombre: "Propiedades disponibles en venta",
    categoria: "Venta",
    estado: "Publicada",
    tags: ["venta", "propiedades"],
    texto: `🏠 *Propiedades en Venta* — Actualizadas\n\nTenemos opciones disponibles en distintas zonas. Para enviarte las propiedades más acordes a tu búsqueda, necesitamos:\n\n📍 *Zona preferida:*\n🛏 *Ambientes/Dormitorios:*\n💰 *Presupuesto aproximado:*\n💳 *Forma de pago:* (efectivo / hipotecario / permuta)\n\n¡Con esos datos te armamos una selección personalizada! 🎯`
  },
  {
    nombre: "Propiedades disponibles en alquiler",
    categoria: "Alquiler",
    estado: "Publicada",
    tags: ["alquiler", "propiedades"],
    texto: `🔑 *Propiedades en Alquiler* — Actualizadas\n\nContamos con varias opciones disponibles. Para enviarte las más adecuadas, contanos:\n\n📍 *Zona:*\n🛏 *Ambientes/Dormitorios:*\n💰 *Presupuesto mensual:*\n📅 *Fecha de ingreso estimada:*\n\n¡Te enviamos las opciones que se ajusten a tus necesidades! 🙌`
  },
  {
    nombre: "Confirmación de visita",
    categoria: "General",
    estado: "Publicada",
    tags: ["visita"],
    texto: `¡Hola! 👋 Te confirmamos la visita:\n\n📍 *Propiedad:* {PROPIEDAD}\n📅 *Fecha:* {FECHA}\n🕐 *Hora:* {HORA}\n👤 *Te atiende:* {VENDEDOR}\n\n¿Necesitás indicaciones para llegar? 🗺️\n\n¡Nos vemos! 🏠`
  },
  {
    nombre: "Seguimiento post-visita",
    categoria: "General",
    estado: "Publicada",
    tags: ["seguimiento", "visita"],
    texto: `¡Hola! 👋 Qué bueno que pudiste visitar la propiedad.\n\n¿Qué te pareció? ¿Tenés alguna consulta o querés que te mostremos otras opciones?\n\nEstamos para ayudarte en todo el proceso 🙌🏠`
  },
  {
    nombre: "Cierre y próximos pasos",
    categoria: "General",
    estado: "Publicada",
    tags: ["cierre"],
    texto: `¡Excelente noticia! 🎉\n\nTe confirmamos que avanzamos con la operación:\n\n🏠 *Propiedad:* {PROPIEDAD}\n💰 *Valor acordado:* {PRECIO} {MONEDA}\n📋 *Próximos pasos:*\n1. Firma de reserva\n2. Revisión de documentación\n3. Escritura / contrato\n\n¿Alguna duda? Escribinos cuando quieras 📲`
  },
];

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

    const userKey = user.email;

    let members = await base44.asServiceRole.entities.WorkspaceMember.filter({ user_id: userKey }, null, 50);

    let workspace = null;
    if (members?.length) {
      const m = members.find((x) => x.role === "admin") || members[0];
      const ws = await base44.asServiceRole.entities.Workspace.filter({ id: m.workspace_id }, null, 1);
      workspace = ws?.[0] ?? null;
    }

    if (!workspace) {
      workspace = await base44.asServiceRole.entities.Workspace.create({
        name: user.full_name ? `Workspace de ${user.full_name}` : "Mi Workspace",
        owner_user_id: user.email,
        industry: "real_estate",
        onboarding_completed: false,
      });
      await base44.asServiceRole.entities.WorkspaceMember.create({
        workspace_id: workspace.id,
        user_id: userKey,
        role: "admin",
      });
    } else {
      await base44.asServiceRole.entities.Workspace.update(workspace.id, { industry: "real_estate" });
    }

    const workspace_id = workspace.id;

    const pipelineItems = PIPELINE.map((s) => ({ ...s, workspace_id, activa: true }));
    const pipelineResult = await upsertMany(base44, "PipelineStage", pipelineItems, ["workspace_id", "nombre"]);
    const deactivationResult = await deactivateMissingStages(base44, workspace_id, PIPELINE.map((x) => x.nombre));

    const tagsResult = await upsertMany(base44, "Tag", TAGS.map((t) => ({ ...t, workspace_id })), ["workspace_id", "name"]);
    const cfResult = await upsertMany(base44, "CustomField", CUSTOM_FIELDS.map((f) => ({ ...f, workspace_id })), ["workspace_id", "key"]);

    const existingListas = await base44.asServiceRole.entities.ListaWhatsApp.filter({ workspace_id }, null, 500);
    for (const lista of existingListas) {
      await base44.asServiceRole.entities.ListaWhatsApp.delete(lista.id);
    }
    for (const lista of LISTAS) {
      await base44.asServiceRole.entities.ListaWhatsApp.create({ ...lista, workspace_id });
    }

    const existingSettings = await base44.asServiceRole.entities.WorkspaceSettings.filter({ workspace_id }, null, 1);
    if (!existingSettings?.length) {
      await base44.asServiceRole.entities.WorkspaceSettings.create({ ...SETTINGS, workspace_id });
    } else {
      await base44.asServiceRole.entities.WorkspaceSettings.update(existingSettings[0].id, { ...SETTINGS, workspace_id });
    }

    await base44.asServiceRole.entities.Workspace.update(workspace_id, {
      industry: "real_estate",
      onboarding_completed: true,
    });

    return Response.json({
      ok: true,
      workspace_id,
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