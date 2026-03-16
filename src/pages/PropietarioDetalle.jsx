import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2, MessageCircle, Phone, Mail, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useWorkspace } from "@/components/context/WorkspaceContext";

export default function PropietarioDetalle() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const propietarioId = params.get("id");
  const esNuevo = propietarioId === "nuevo";
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [nuevaPropiedad, setNuevaPropiedad] = useState("");

  const [formData, setFormData] = useState({
    nombre: "", apellido: "", whatsapp: "", telefono: "", email: "",
    dni: "", ciudad: "", propiedadesCaptadas: [], notas: "",
    fechaUltimoContacto: "", activo: true
  });

  const { data: propietario, isLoading } = useQuery({
    queryKey: ['propietario', propietarioId],
    queryFn: () => base44.entities.Proveedor.filter({ id: propietarioId }),
    select: data => data[0],
    enabled: !esNuevo
  });

  const { data: operaciones = [] } = useQuery({
    queryKey: ['operaciones-propietario', propietarioId],
    queryFn: () => base44.entities.Venta.filter({ propietarioId }),
    enabled: !esNuevo
  });

  useEffect(() => {
    if (propietario) setFormData({ ...propietario, propiedadesCaptadas: propietario.propiedadesCaptadas || [] });
  }, [propietario]);

  const saveMutation = useMutation({
    mutationFn: (data) => esNuevo
      ? base44.entities.Proveedor.create({ ...data, workspace_id: workspace?.id })
      : base44.entities.Proveedor.update(propietarioId, data),
    onSuccess: (data) => {
      toast.success(esNuevo ? "Propietario creado" : "Propietario actualizado");
      queryClient.invalidateQueries({ queryKey: ['propietarios'] });
      if (esNuevo) window.location.href = createPageUrl(`PropietarioDetalle?id=${data.id}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Proveedor.delete(propietarioId),
    onSuccess: () => {
      toast.success("Propietario eliminado");
      window.location.href = createPageUrl("Propietarios");
    }
  });

  const handleSubmit = () => {
    if (!formData.nombre) { toast.error("El nombre es obligatorio"); return; }
    saveMutation.mutate(formData);
  };

  const agregarPropiedad = () => {
    if (!nuevaPropiedad.trim()) return;
    setFormData({ ...formData, propiedadesCaptadas: [...(formData.propiedadesCaptadas || []), nuevaPropiedad.trim()] });
    setNuevaPropiedad("");
  };

  const quitarPropiedad = (idx) => {
    const arr = [...(formData.propiedadesCaptadas || [])];
    arr.splice(idx, 1);
    setFormData({ ...formData, propiedadesCaptadas: arr });
  };

  const formatWA = (phone) => phone?.replace(/[^\d]/g, "") || "";

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link to={createPageUrl("Propietarios")}>
            <Button variant="ghost" className="gap-2 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Propietarios
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              {esNuevo ? "Nuevo Propietario" : `${formData.nombre} ${formData.apellido}`}
            </h1>
            <div className="flex gap-2">
              {!esNuevo && formData.whatsapp && (
                <a href={`https://api.whatsapp.com/send?phone=${formatWA(formData.whatsapp)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a]">
                    <MessageCircle className="w-4 h-4" />WhatsApp
                  </Button>
                </a>
              )}
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />Guardar
              </Button>
              {!esNuevo && (
                <Button variant="destructive" onClick={() => { if (confirm("¿Eliminar propietario?")) deleteMutation.mutate(); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Datos personales */}
        <Card>
          <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="María" />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} placeholder="González" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />WhatsApp</Label>
                <Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="+54 9 351 123-4567" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} placeholder="351 123-4567" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="maria@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>DNI</Label>
                <Input value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} placeholder="12.345.678" />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} placeholder="Córdoba" />
              </div>
              <div className="space-y-2">
                <Label>Último contacto</Label>
                <Input type="date" value={formData.fechaUltimoContacto} onChange={(e) => setFormData({ ...formData, fechaUltimoContacto: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Propiedades captadas */}
        <Card>
          <CardHeader><CardTitle>Propiedades captadas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={nuevaPropiedad}
                onChange={(e) => setNuevaPropiedad(e.target.value)}
                placeholder="Dpto 2 amb. en Nueva Córdoba, Av. Colón 1234"
                onKeyDown={(e) => e.key === 'Enter' && agregarPropiedad()}
              />
              <Button type="button" onClick={agregarPropiedad} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.propiedadesCaptadas || []).map((prop, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-sm">{prop}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => quitarPropiedad(idx)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {(formData.propiedadesCaptadas || []).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No hay propiedades registradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado y notas */}
        <Card>
          <CardHeader><CardTitle>Estado y notas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activo</Label>
                <p className="text-sm text-slate-500">Desmarca para ocultar de listados</p>
              </div>
              <Switch checked={formData.activo !== false} onCheckedChange={(v) => setFormData({ ...formData, activo: v })} />
            </div>
            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} placeholder="Observaciones, historial, preferencias..." rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Operaciones asociadas */}
        {!esNuevo && operaciones.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Operaciones asociadas ({operaciones.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {operaciones.slice(0, 10).map(op => (
                  <div key={op.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{op.codigo} — {op.propiedadDescripcion}</p>
                      <p className="text-xs text-slate-500">{op.tipoOperacion} · {op.estado}</p>
                    </div>
                    {op.honorariosTotal && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {op.moneda} {op.honorariosTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}