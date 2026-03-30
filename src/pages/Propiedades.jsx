import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/components/context/WorkspaceContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Plus, Search, Building2, MapPin, DollarSign,
  Eye, Edit, Trash2, Copy, ExternalLink, Phone, MessageCircle,
  Home, Ruler, BedDouble, Bath, Car, Filter, Grid3X3, List,
  TrendingUp, Tag, Calendar, MoreHorizontal, ChevronDown, X, ImageIcon
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import moment from "moment";

// ── Constantes ──────────────────────────────────────────────
const TIPOS_PROPIEDAD = [
  "Departamento", "Casa", "Duplex", "PH", "Lote",
  "Local Comercial", "Oficina", "Campo", "Cochera", "Galpón", "Otro"
];

const TIPOS_OPERACION = ["Venta", "Alquiler", "Alquiler Temporal", "Venta + Alquiler"];

const ESTADOS_PROPIEDAD = [
  { value: "Disponible", label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  { value: "Reservada", label: "Reservada", color: "bg-amber-100 text-amber-700" },
  { value: "En trámite", label: "En trámite", color: "bg-blue-100 text-blue-700" },
  { value: "Vendida", label: "Vendida", color: "bg-slate-100 text-slate-600" },
  { value: "Alquilada", label: "Alquilada", color: "bg-purple-100 text-purple-700" },
  { value: "Suspendida", label: "Suspendida", color: "bg-red-100 text-red-600" },
  { value: "Borrador", label: "Borrador", color: "bg-slate-50 text-slate-500" },
];

const MONEDAS = ["USD", "ARS"];

const AMENITIES = [
  "Pileta", "Quincho", "SUM", "Gimnasio", "Seguridad 24h",
  "Laundry", "Balcón", "Terraza", "Patio", "Jardín",
  "Ascensor", "Baulera", "Parrilla", "Calefacción central",
  "Aire acondicionado", "Gas natural", "Agua corriente"
];

const ORIENTACIONES = ["Norte", "Sur", "Este", "Oeste", "Noreste", "Noroeste", "Sureste", "Suroeste"];

// ── Formulario de Propiedad ─────────────────────────────────
function PropiedadForm({ open, onOpenChange, propiedad, proveedores, onSave, workspaceId }) {
  const esNuevo = !propiedad;

  const defaultForm = {
    titulo: "",
    tipoPropiedad: "Departamento",
    tipoOperacion: "Venta",
    estado: "Borrador",
    // Ubicación
    direccion: "",
    barrio: "",
    ciudad: "Córdoba",
    provincia: "Córdoba",
    codigoPostal: "",
    pisoDepto: "",
    // Precio
    precioVenta: "",
    precioAlquiler: "",
    moneda: "USD",
    expensas: "",
    // Características
    superficieTotal: "",
    superficieCubierta: "",
    ambientes: "",
    dormitorios: "",
    banos: "",
    cocheras: "",
    antiguedad: "",
    orientacion: "",
    disposicion: "",
    amenities: [],
    // Propietario
    propietarioId: "",
    propietarioNombre: "",
    propietarioWhatsapp: "",
    // Publicación
    descripcion: "",
    descripcionCorta: "",
    codigoInterno: "",
    publicadaPortales: false,
    portales: [],
    fechaCaptacion: new Date().toISOString().split('T')[0],
    fechaPublicacion: "",
    // Notas
    notas: "",
    comisionPactada: "",
    exclusividad: false,
    fechaVencimientoExclusividad: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Reset form when opening
  useState(() => {
    if (open) {
      if (propiedad) {
        setFormData({
          ...defaultForm,
          ...propiedad,
          amenities: propiedad.amenities || [],
          portales: propiedad.portales || [],
        });
      } else {
        setFormData(defaultForm);
      }
      setActiveTab("general");
    }
  }, [open, propiedad]);

  // Fix: useEffect for resetting
  const resetOnOpen = () => {
    if (propiedad) {
      setFormData({
        ...defaultForm,
        ...propiedad,
        amenities: propiedad.amenities || [],
        portales: propiedad.portales || [],
      });
    } else {
      setFormData(defaultForm);
    }
    setActiveTab("general");
  };

  // Call reset when dialog opens
  if (open && formData.titulo === "" && propiedad?.titulo) {
    resetOnOpen();
  }

  const toggleAmenity = (amenity) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!formData.titulo) {
      toast.error("El título es obligatorio");
      return;
    }

    setSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        precioVenta: formData.precioVenta ? Number(formData.precioVenta) : null,
        precioAlquiler: formData.precioAlquiler ? Number(formData.precioAlquiler) : null,
        expensas: formData.expensas ? Number(formData.expensas) : null,
        superficieTotal: formData.superficieTotal ? Number(formData.superficieTotal) : null,
        superficieCubierta: formData.superficieCubierta ? Number(formData.superficieCubierta) : null,
        ambientes: formData.ambientes ? Number(formData.ambientes) : null,
        dormitorios: formData.dormitorios ? Number(formData.dormitorios) : null,
        banos: formData.banos ? Number(formData.banos) : null,
        cocheras: formData.cocheras ? Number(formData.cocheras) : null,
        antiguedad: formData.antiguedad ? Number(formData.antiguedad) : null,
        comisionPactada: formData.comisionPactada ? Number(formData.comisionPactada) : null,
        workspace_id: workspaceId,
      };

      if (propiedad) {
        await base44.entities.Property.update(propiedad.id, dataToSave);
        toast.success("Propiedad actualizada");
      } else {
        // Generar código interno automático
        if (!dataToSave.codigoInterno) {
          const prefix = dataToSave.tipoOperacion === "Alquiler" ? "ALQ" : "VTA";
          const rand = Math.floor(Math.random() * 9000) + 1000;
          dataToSave.codigoInterno = `${prefix}-${rand}`;
        }
        await base44.entities.Property.create(dataToSave);
        toast.success("Propiedad creada");
      }
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {esNuevo ? "Nueva Propiedad" : "Editar Propiedad"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="caracteristicas">Características</TabsTrigger>
            <TabsTrigger value="propietario">Propietario</TabsTrigger>
            <TabsTrigger value="publicacion">Publicación</TabsTrigger>
          </TabsList>

          {/* ── TAB GENERAL ── */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Dpto 2 amb. luminoso en Nueva Córdoba con balcón"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de propiedad</Label>
                <Select value={formData.tipoPropiedad} onValueChange={(v) => setFormData({ ...formData, tipoPropiedad: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_PROPIEDAD.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Operación</Label>
                <Select value={formData.tipoOperacion} onValueChange={(v) => setFormData({ ...formData, tipoOperacion: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_OPERACION.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_PROPIEDAD.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ubicación */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Ubicación
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Dirección</Label>
                  <Input value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} placeholder="Av. Colón 1234" />
                </div>
                <div className="space-y-2">
                  <Label>Piso / Depto</Label>
                  <Input value={formData.pisoDepto} onChange={(e) => setFormData({ ...formData, pisoDepto: e.target.value })} placeholder="4° B" />
                </div>
                <div className="space-y-2">
                  <Label>Barrio / Zona</Label>
                  <Input value={formData.barrio} onChange={(e) => setFormData({ ...formData, barrio: e.target.value })} placeholder="Nueva Córdoba" />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} placeholder="Córdoba" />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input value={formData.provincia} onChange={(e) => setFormData({ ...formData, provincia: e.target.value })} placeholder="Córdoba" />
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="p-4 bg-emerald-50 rounded-xl space-y-4">
              <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Precio
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={formData.moneda} onValueChange={(v) => setFormData({ ...formData, moneda: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONEDAS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(formData.tipoOperacion === "Venta" || formData.tipoOperacion === "Venta + Alquiler") && (
                  <div className="space-y-2">
                    <Label>Precio de Venta</Label>
                    <Input type="number" value={formData.precioVenta} onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })} placeholder="120000" />
                  </div>
                )}
                {(formData.tipoOperacion === "Alquiler" || formData.tipoOperacion === "Alquiler Temporal" || formData.tipoOperacion === "Venta + Alquiler") && (
                  <div className="space-y-2">
                    <Label>Precio de Alquiler</Label>
                    <Input type="number" value={formData.precioAlquiler} onChange={(e) => setFormData({ ...formData, precioAlquiler: e.target.value })} placeholder="450000" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Expensas</Label>
                  <Input type="number" value={formData.expensas} onChange={(e) => setFormData({ ...formData, expensas: e.target.value })} placeholder="50000" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB CARACTERÍSTICAS ── */}
          <TabsContent value="caracteristicas" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Sup. Total (m²)</Label>
                <Input type="number" value={formData.superficieTotal} onChange={(e) => setFormData({ ...formData, superficieTotal: e.target.value })} placeholder="80" />
              </div>
              <div className="space-y-2">
                <Label>Sup. Cubierta (m²)</Label>
                <Input type="number" value={formData.superficieCubierta} onChange={(e) => setFormData({ ...formData, superficieCubierta: e.target.value })} placeholder="65" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Ambientes</Label>
                <Input type="number" value={formData.ambientes} onChange={(e) => setFormData({ ...formData, ambientes: e.target.value })} placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> Dormitorios</Label>
                <Input type="number" value={formData.dormitorios} onChange={(e) => setFormData({ ...formData, dormitorios: e.target.value })} placeholder="2" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> Baños</Label>
                <Input type="number" value={formData.banos} onChange={(e) => setFormData({ ...formData, banos: e.target.value })} placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Cocheras</Label>
                <Input type="number" value={formData.cocheras} onChange={(e) => setFormData({ ...formData, cocheras: e.target.value })} placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label>Antigüedad (años)</Label>
                <Input type="number" value={formData.antiguedad} onChange={(e) => setFormData({ ...formData, antiguedad: e.target.value })} placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label>Orientación</Label>
                <Select value={formData.orientacion} onValueChange={(v) => setFormData({ ...formData, orientacion: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {ORIENTACIONES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disposición</Label>
              <Input value={formData.disposicion} onChange={(e) => setFormData({ ...formData, disposicion: e.target.value })} placeholder="Frente, contrafrente, interno..." />
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(amenity => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities?.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── TAB PROPIETARIO ── */}
          <TabsContent value="propietario" className="space-y-4 mt-4">
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <p className="font-semibold text-slate-700 text-sm">Datos del propietario</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Propietario (seleccionar existente)</Label>
                  <Select value={formData.propietarioId} onValueChange={(v) => {
                    const prov = proveedores.find(p => p.id === v);
                    setFormData({
                      ...formData,
                      propietarioId: v,
                      propietarioNombre: prov ? `${prov.nombre} ${prov.apellido || ""}`.trim() : "",
                      propietarioWhatsapp: prov?.whatsapp || ""
                    });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar propietario" /></SelectTrigger>
                    <SelectContent>
                      {proveedores.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>O escribir nombre</Label>
                  <Input value={formData.propietarioNombre} onChange={(e) => setFormData({ ...formData, propietarioNombre: e.target.value })} placeholder="María González" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp propietario</Label>
                  <Input value={formData.propietarioWhatsapp} onChange={(e) => setFormData({ ...formData, propietarioWhatsapp: e.target.value })} placeholder="+54 9 351 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Comisión pactada (%)</Label>
                  <Input type="number" step="0.1" value={formData.comisionPactada} onChange={(e) => setFormData({ ...formData, comisionPactada: e.target.value })} placeholder="3" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={formData.exclusividad} onCheckedChange={(v) => setFormData({ ...formData, exclusividad: v })} />
                <Label>Exclusividad</Label>
              </div>
              {formData.exclusividad && (
                <div className="space-y-2">
                  <Label>Vencimiento exclusividad</Label>
                  <Input type="date" value={formData.fechaVencimientoExclusividad} onChange={(e) => setFormData({ ...formData, fechaVencimientoExclusividad: e.target.value })} />
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB PUBLICACIÓN ── */}
          <TabsContent value="publicacion" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código interno</Label>
                <Input value={formData.codigoInterno} onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value })} placeholder="VTA-1234 (auto si vacío)" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de captación</Label>
                <Input type="date" value={formData.fechaCaptacion} onChange={(e) => setFormData({ ...formData, fechaCaptacion: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción corta (para listas)</Label>
              <Input value={formData.descripcionCorta} onChange={(e) => setFormData({ ...formData, descripcionCorta: e.target.value })} placeholder="Dpto 2 amb, 65m², cochera, Nueva Córdoba" />
            </div>
            <div className="space-y-2">
              <Label>Descripción completa</Label>
              <Textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={5} placeholder="Descripción detallada para publicación en portales..." />
            </div>
            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={3} placeholder="Notas internas, detalles para el equipo..." />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : esNuevo ? "Crear propiedad" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Card de Propiedad (vista grilla) ────────────────────────
function PropiedadCard({ propiedad, onEdit, onView, onWhatsApp }) {
  const estadoObj = ESTADOS_PROPIEDAD.find(e => e.value === propiedad.estado) || ESTADOS_PROPIEDAD[0];
  const precio = propiedad.precioVenta || propiedad.precioAlquiler;
  const moneda = propiedad.moneda === "USD" ? "US$" : "$";

  return (
    <Card className="hover:shadow-lg transition-all group cursor-pointer" onClick={() => onView?.(propiedad)}>
      {/* Imagen placeholder */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center relative overflow-hidden">
        <Building2 className="w-12 h-12 text-slate-300" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge className={cn("text-xs shadow-sm", estadoObj.color)}>{estadoObj.label}</Badge>
          {propiedad.exclusividad && <Badge className="bg-amber-500 text-white text-xs shadow-sm">Exclusiva</Badge>}
        </div>
        {propiedad.codigoInterno && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs font-mono bg-white/90">{propiedad.codigoInterno}</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Precio */}
        {precio ? (
          <p className="text-xl font-bold text-slate-900">
            {moneda} {precio.toLocaleString('es-AR')}
            {propiedad.tipoOperacion?.includes("Alquiler") && propiedad.precioAlquiler && <span className="text-sm font-normal text-slate-500">/mes</span>}
          </p>
        ) : (
          <p className="text-lg font-medium text-slate-400">Consultar precio</p>
        )}

        {/* Título */}
        <p className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">{propiedad.titulo}</p>

        {/* Ubicación */}
        {(propiedad.barrio || propiedad.direccion) && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {[propiedad.direccion, propiedad.barrio, propiedad.ciudad].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Features */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {propiedad.superficieTotal && (
            <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{propiedad.superficieTotal}m²</span>
          )}
          {propiedad.ambientes && (
            <span className="flex items-center gap-1"><Home className="w-3 h-3" />{propiedad.ambientes} amb</span>
          )}
          {propiedad.dormitorios && (
            <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{propiedad.dormitorios} dorm</span>
          )}
          {propiedad.cocheras > 0 && (
            <span className="flex items-center gap-1"><Car className="w-3 h-3" />{propiedad.cocheras}</span>
          )}
        </div>

        {/* Tipo operación */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Badge variant="outline" className="text-xs">{propiedad.tipoOperacion}</Badge>
          <Badge variant="secondary" className="text-xs">{propiedad.tipoPropiedad}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Detalle de Propiedad (Dialog) ───────────────────────────
function DetallePropiedadDialog({ propiedad, open, onOpenChange, onEdit }) {
  if (!propiedad) return null;

  const estadoObj = ESTADOS_PROPIEDAD.find(e => e.value === propiedad.estado) || ESTADOS_PROPIEDAD[0];
  const precio = propiedad.precioVenta || propiedad.precioAlquiler;
  const moneda = propiedad.moneda === "USD" ? "US$" : "$";

  const formatWA = (phone) => phone?.replace(/[^\d]/g, "") || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span>{propiedad.codigoInterno || "Propiedad"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(estadoObj.color)}>{estadoObj.label}</Badge>
              <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); onEdit?.(propiedad); }}>
                <Edit className="w-4 h-4 mr-1" />Editar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{propiedad.titulo}</h2>
            {propiedad.direccion && (
              <p className="text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {[propiedad.direccion, propiedad.pisoDepto, propiedad.barrio, propiedad.ciudad].filter(Boolean).join(", ")}
              </p>
            )}
            {precio && (
              <p className="text-3xl font-bold text-slate-900 mt-3">
                {moneda} {precio.toLocaleString('es-AR')}
                {propiedad.expensas && <span className="text-sm font-normal text-slate-500 ml-2">+ {moneda} {propiedad.expensas.toLocaleString('es-AR')} expensas</span>}
              </p>
            )}
          </div>

          {/* Características */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Ruler, label: "Superficie", value: propiedad.superficieTotal ? `${propiedad.superficieTotal} m²` : null },
              { icon: Home, label: "Ambientes", value: propiedad.ambientes },
              { icon: BedDouble, label: "Dormitorios", value: propiedad.dormitorios },
              { icon: Bath, label: "Baños", value: propiedad.banos },
              { icon: Car, label: "Cocheras", value: propiedad.cocheras },
              { icon: Calendar, label: "Antigüedad", value: propiedad.antiguedad ? `${propiedad.antiguedad} años` : null },
            ].filter(item => item.value).map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-slate-50 rounded-lg">
                <item.icon className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {propiedad.amenities?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {propiedad.amenities.map(a => <Badge key={a} variant="secondary">{a}</Badge>)}
              </div>
            </div>
          )}

          {/* Descripción */}
          {propiedad.descripcion && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Descripción</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{propiedad.descripcion}</p>
            </div>
          )}

          {/* Propietario */}
          {propiedad.propietarioNombre && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-semibold text-slate-700 mb-2">Propietario</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{propiedad.propietarioNombre}</p>
                  {propiedad.propietarioWhatsapp && <p className="text-sm text-slate-500">{propiedad.propietarioWhatsapp}</p>}
                </div>
                {propiedad.propietarioWhatsapp && (
                  <a href={`https://api.whatsapp.com/send?phone=${formatWA(propiedad.propietarioWhatsapp)}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-[#25D366] hover:bg-[#20bd5a] text-white gap-1">
                      <MessageCircle className="w-4 h-4" />WhatsApp
                    </Button>
                  </a>
                )}
              </div>
              {propiedad.exclusividad && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white">Exclusiva</Badge>
                  {propiedad.fechaVencimientoExclusividad && (
                    <span className="text-xs text-slate-500">
                      Vence: {moment(propiedad.fechaVencimientoExclusividad).format("DD/MM/YYYY")}
                    </span>
                  )}
                </div>
              )}
              {propiedad.comisionPactada && (
                <p className="text-sm text-slate-600 mt-2">Comisión pactada: {propiedad.comisionPactada}%</p>
              )}
            </div>
          )}

          {/* Notas */}
          {propiedad.notas && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Notas internas</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap bg-amber-50 p-3 rounded-lg border border-amber-200">{propiedad.notas}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
            <div>
              <p className="text-slate-500">Fecha captación</p>
              <p className="font-medium">{propiedad.fechaCaptacion ? moment(propiedad.fechaCaptacion).format("DD/MM/YYYY") : "-"}</p>
            </div>
            <div>
              <p className="text-slate-500">Tipo operación</p>
              <Badge variant="outline">{propiedad.tipoOperacion}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ── PÁGINA PRINCIPAL ────────────────────────────────────────
export default function Propiedades() {
  const [showForm, setShowForm] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterOperacion, setFilterOperacion] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterBarrio, setFilterBarrio] = useState("Todos");
  const [vistaMode, setVistaMode] = useState("grid"); // grid | table

  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: propiedades = [], isLoading, refetch } = useQuery({
    queryKey: ['propiedades', workspace?.id],
    queryFn: () => workspace ? base44.entities.Property.filter({ workspace_id: workspace.id }, "-created_date", 500) : [],
    enabled: !!workspace
  });

  const { data: proveedores = [] } = useQuery({
    queryKey: ['propietarios-para-props', workspace?.id],
    queryFn: () => workspace ? base44.entities.Proveedor.filter({ workspace_id: workspace.id }) : [],
    enabled: !!workspace
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Property.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades', workspace?.id] });
      toast.success("Propiedad eliminada");
    }
  });

  // Barrios disponibles para filtrar
  const barrios = useMemo(() => {
    return [...new Set(propiedades.map(p => p.barrio).filter(Boolean))].sort();
  }, [propiedades]);

  // Filtrado
  const filtradas = useMemo(() => {
    return propiedades.filter(p => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !p.titulo?.toLowerCase().includes(s) &&
          !p.direccion?.toLowerCase().includes(s) &&
          !p.barrio?.toLowerCase().includes(s) &&
          !p.codigoInterno?.toLowerCase().includes(s) &&
          !p.propietarioNombre?.toLowerCase().includes(s)
        ) return false;
      }
      if (filterTipo !== "Todos" && p.tipoPropiedad !== filterTipo) return false;
      if (filterOperacion !== "Todos" && p.tipoOperacion !== filterOperacion) return false;
      if (filterEstado !== "Todos" && p.estado !== filterEstado) return false;
      if (filterBarrio !== "Todos" && p.barrio !== filterBarrio) return false;
      return true;
    });
  }, [propiedades, search, filterTipo, filterOperacion, filterEstado, filterBarrio]);

  // KPIs
  const disponibles = propiedades.filter(p => p.estado === "Disponible").length;
  const enVenta = propiedades.filter(p => p.tipoOperacion?.includes("Venta")).length;
  const enAlquiler = propiedades.filter(p => p.tipoOperacion?.includes("Alquiler")).length;
  const exclusivas = propiedades.filter(p => p.exclusividad).length;

  const handleEdit = (prop) => {
    setSelectedProp(prop);
    setShowForm(true);
  };

  const handleView = (prop) => {
    setSelectedProp(prop);
    setShowDetalle(true);
  };

  const handleNew = () => {
    setSelectedProp(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="gap-2 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Propiedades</h1>
              <p className="text-slate-500">{filtradas.length} propiedades</p>
            </div>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Propiedad
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Disponibles</p>
                <p className="text-2xl font-bold text-emerald-600">{disponibles}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">En Venta</p>
                <p className="text-2xl font-bold">{enVenta}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">En Alquiler</p>
                <p className="text-2xl font-bold">{enAlquiler}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Exclusivas</p>
                <p className="text-2xl font-bold">{exclusivas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar por título, dirección, barrio, código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los tipos</SelectItem>
                  {TIPOS_PROPIEDAD.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterOperacion} onValueChange={setFilterOperacion}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas las op.</SelectItem>
                  {TIPOS_OPERACION.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  {ESTADOS_PROPIEDAD.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {barrios.length > 0 && (
                <Select value={filterBarrio} onValueChange={setFilterBarrio}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos los barrios</SelectItem>
                    {barrios.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {/* Toggle vista */}
              <div className="flex items-center border rounded-lg overflow-hidden ml-auto">
                <Button
                  variant={vistaMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none h-9"
                  onClick={() => setVistaMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={vistaMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none h-9"
                  onClick={() => setVistaMode("table")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-slate-200 rounded-t-xl" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-slate-500 mb-4">No hay propiedades que coincidan con los filtros</p>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="w-4 h-4" />Agregar primera propiedad
              </Button>
            </CardContent>
          </Card>
        ) : vistaMode === "grid" ? (
          /* ── Vista Grilla ── */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtradas.map(prop => (
              <PropiedadCard
                key={prop.id}
                propiedad={prop}
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          /* ── Vista Tabla ── */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-semibold">Código</TableHead>
                      <TableHead className="font-semibold">Propiedad</TableHead>
                      <TableHead className="font-semibold">Ubicación</TableHead>
                      <TableHead className="font-semibold">Tipo</TableHead>
                      <TableHead className="font-semibold">Operación</TableHead>
                      <TableHead className="font-semibold text-right">Precio</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Propietario</TableHead>
                      <TableHead className="font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtradas.map(prop => {
                      const estadoObj = ESTADOS_PROPIEDAD.find(e => e.value === prop.estado) || ESTADOS_PROPIEDAD[0];
                      const precio = prop.precioVenta || prop.precioAlquiler;
                      const moneda = prop.moneda === "USD" ? "US$" : "$";

                      return (
                        <TableRow key={prop.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleView(prop)}>
                          <TableCell className="font-mono text-xs">{prop.codigoInterno || "-"}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm line-clamp-1">{prop.titulo}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              {prop.superficieTotal && <span>{prop.superficieTotal}m²</span>}
                              {prop.ambientes && <span>{prop.ambientes} amb</span>}
                              {prop.dormitorios && <span>{prop.dormitorios} dorm</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{prop.barrio || "-"}</p>
                            {prop.direccion && <p className="text-xs text-slate-500">{prop.direccion}</p>}
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{prop.tipoPropiedad}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{prop.tipoOperacion}</Badge></TableCell>
                          <TableCell className="text-right">
                            {precio ? (
                              <p className="font-bold text-sm">{moneda} {precio.toLocaleString('es-AR')}</p>
                            ) : <span className="text-slate-400">-</span>}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", estadoObj.color)}>{estadoObj.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{prop.propietarioNombre || "-"}</p>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(prop)}>
                                  <Eye className="w-4 h-4 mr-2" />Ver detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(prop)}>
                                  <Edit className="w-4 h-4 mr-2" />Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => { if (window.confirm("¿Eliminar esta propiedad?")) deleteMutation.mutate(prop.id); }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <PropiedadForm
        open={showForm}
        onOpenChange={setShowForm}
        propiedad={selectedProp}
        proveedores={proveedores}
        onSave={() => {
          refetch();
          setSelectedProp(null);
        }}
        workspaceId={workspace?.id}
      />

      <DetallePropiedadDialog
        propiedad={selectedProp}
        open={showDetalle}
        onOpenChange={setShowDetalle}
        onEdit={handleEdit}
      />
    </div>
  );
}
