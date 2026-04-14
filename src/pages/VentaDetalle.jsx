import { useState } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Phone, Building2, DollarSign, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import OperacionForm from "@/components/ventas/OperacionForm";

const estadoColors = {
  "En gestión": "bg-amber-100 text-amber-700",
  "Boleto firmado": "bg-blue-100 text-blue-700",
  "Escriturada": "bg-emerald-100 text-emerald-700",
  "Entregada": "bg-green-100 text-green-700",
  "Caída": "bg-slate-100 text-slate-600"
};

export default function VentaDetalle() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const ventaId = params.get("id");
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: venta, isLoading } = useQuery({
    queryKey: ['venta', ventaId],
    queryFn: () => api.entities.Venta.filter({ id: ventaId }),
    select: data => data[0],
    enabled: !!ventaId
  });

  const { data: consulta } = useQuery({
    queryKey: ['consulta-op', venta?.consultaId],
    queryFn: () => api.entities.Consulta.filter({ id: venta.consultaId }),
    select: data => data[0],
    enabled: !!venta?.consultaId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Venta.delete(id),
    onSuccess: () => { toast.success("Operación eliminada"); window.location.href = createPageUrl("Operaciones"); }
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }) => api.entities.Venta.update(id, { estado }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['venta', ventaId] }); toast.success("Estado actualizado"); }
  });

  if (isLoading) return <div className="min-h-screen p-6 flex items-center justify-center"><p className="text-slate-500">Cargando...</p></div>;
  if (!venta) return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-slate-500">Operación no encontrada</p>
        <Link to={createPageUrl("Operaciones")}><Button className="mt-4">Volver a Operaciones</Button></Link>
      </div>
    </div>
  );

  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy') : '-';

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link to={createPageUrl("Operaciones")}>
            <Button variant="ghost" className="gap-2 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />Volver a Operaciones
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{venta.codigo}</h1>
                <p className="text-slate-500">Detalle de la operación</p>
              </div>
              <Badge className={estadoColors[venta.estado] || "bg-slate-100 text-slate-600"}>{venta.estado}</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowEditForm(true)} variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />Editar
              </Button>
              {venta.estado !== "Escriturada" && venta.estado !== "Caída" && (
                <Button onClick={() => updateEstadoMutation.mutate({ id: venta.id, estado: "Escriturada" })}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="w-4 h-4" />Marcar Escriturada
                </Button>
              )}
              {venta.estado !== "Caída" && (
                <Button onClick={() => { if (confirm("¿Marcar como caída?")) updateEstadoMutation.mutate({ id: venta.id, estado: "Caída" }); }}
                  variant="outline" className="gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />Caída
                </Button>
              )}
              {currentUser?.role === 'admin' && (
                <Button variant="destructive" size="sm" onClick={() => { if (confirm("¿Eliminar esta operación?")) deleteMutation.mutate(venta.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info propiedad */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Propiedad</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div><p className="text-sm text-slate-600 mb-1">Descripción</p><p className="font-medium">{venta.propiedadDescripcion || '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Tipo</p><p className="font-medium">{venta.tipoPropiedad || '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Dirección</p><p className="font-medium">{venta.direccion || '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Barrio</p><p className="font-medium">{venta.barrio || '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Superficie</p><p className="font-medium">{venta.superficie ? `${venta.superficie} m²` : '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Ambientes</p><p className="font-medium">{venta.ambientes || '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Tipo de operación</p><Badge variant="secondary">{venta.tipoOperacion}</Badge></div>
              <div><p className="text-sm text-slate-600 mb-1">Fecha</p><p className="font-medium">{fmtDate(venta.fecha)}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Partes */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Propietario</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">{venta.propietarioNombre || '-'}</p>
              {venta.propietarioWhatsapp && <p className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{venta.propietarioWhatsapp}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{venta.tipoOperacion === "Alquiler" || venta.tipoOperacion === "Alquiler Temporal" ? "Inquilino" : "Comprador"}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">{venta.nombreSnapshot} {venta.apellidoSnapshot}</p>
              {venta.compradorWhatsapp && <p className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{venta.compradorWhatsapp}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Financiero */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" />Financiero</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><p className="text-sm text-slate-600 mb-1">Precio de operación</p>
                <p className="text-2xl font-bold">{venta.precioOperacion ? `${venta.moneda} ${venta.precioOperacion.toLocaleString('es-AR')}` : '-'}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Honorarios %</p><p className="text-xl font-semibold">{venta.honorariosPct || '-'}%</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Honorarios totales</p>
                <p className="text-2xl font-bold text-emerald-600">{venta.honorariosTotal ? `${venta.moneda} ${venta.honorariosTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}` : '-'}</p></div>
            </div>
            {(venta.agenteCaptor || venta.agenteVendedor) && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div><p className="text-sm text-slate-600 mb-1">Captor ({venta.repartoCaptor}%)</p>
                  <p className="font-medium">{venta.agenteCaptor || '-'}</p>
                  {venta.comisionCaptor != null && <p className="text-emerald-600 font-bold">{venta.moneda} {venta.comisionCaptor.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>}</div>
                <div><p className="text-sm text-slate-600 mb-1">Vendedor ({venta.repartoVendedor}%)</p>
                  <p className="font-medium">{venta.agenteVendedor || '-'}</p>
                  {venta.comisionVendedor != null && <p className="text-emerald-600 font-bold">{venta.moneda} {venta.comisionVendedor.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Hitos de la operación</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div><p className="text-sm text-slate-600 mb-1">Reserva</p><p className="font-medium">{fmtDate(venta.fechaReserva)}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Boleto</p><p className="font-medium">{fmtDate(venta.fechaBoleto)}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Escritura</p><p className="font-medium">{fmtDate(venta.fechaEscritura)}</p></div>
              <div><p className="text-sm text-slate-600 mb-1">Entrega</p><p className="font-medium">{fmtDate(venta.fechaEntrega)}</p></div>
            </div>
            {venta.escribano && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-600 mb-1">Escribano</p>
                <p className="font-medium">{venta.escribano}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consulta original */}
        {consulta && (
          <Card>
            <CardHeader><CardTitle>Lead de origen</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Búsqueda original</p>
                  <p className="font-medium">{consulta.propiedadConsultada || consulta.productoConsultado}</p>
                  <p className="text-sm text-slate-500 mt-1">Etapa: {consulta.etapa}</p>
                </div>
                <Link to={createPageUrl("Consultas")}><Button variant="outline" size="sm">Ver Lead</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}

        {venta.notas && (
          <Card>
            <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
            <CardContent><p className="text-slate-700 whitespace-pre-wrap">{venta.notas}</p></CardContent>
          </Card>
        )}

        <OperacionForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          consulta={null}
          operacionExistente={venta}
          onOperacionCreada={() => queryClient.invalidateQueries({ queryKey: ['venta', ventaId] })}
        />
      </div>
    </div>
  );
}