import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SelectorListasWhatsApp from "./SelectorListasWhatsApp";
import HistorialEnvios from "./HistorialEnvios";
import moment from "moment";
import { X } from "lucide-react";

export default function DetalleConsultaDialog({ consulta, open, onOpenChange, onSave }) {
  const [contacto, setContacto] = useState(null);

  useEffect(() => {
    if (open && consulta?.contactoId) {
      base44.entities.Contacto.filter({ id: consulta.contactoId })
        .then(res => setContacto(res[0] || null))
        .catch(() => setContacto(null));
    } else {
      setContacto(null);
    }
  }, [open, consulta?.contactoId]);

  if (!consulta) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{consulta.contactoNombre}</span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Datos del cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Nombre</Label>
                    <p className="text-sm mt-1 font-medium">{consulta.contactoNombre}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">WhatsApp</Label>
                    <p className="text-sm mt-1">
                      <a href={`https://wa.me/${consulta.contactoWhatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                        {consulta.contactoWhatsapp}
                      </a>
                    </p>
                  </div>
                  {contacto?.apellido && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Apellido</Label>
                      <p className="text-sm mt-1">{contacto.apellido}</p>
                    </div>
                  )}
                  {contacto?.email && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Email</Label>
                      <p className="text-sm mt-1">{contacto.email}</p>
                    </div>
                  )}
                  {contacto?.ciudad && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Ciudad</Label>
                      <p className="text-sm mt-1">{contacto.ciudad}</p>
                    </div>
                  )}
                  {contacto?.canalOrigen && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Canal de origen (contacto)</Label>
                      <p className="text-sm mt-1">{contacto.canalOrigen}</p>
                    </div>
                  )}
                  {contacto?.notas && (
                    <div className="col-span-2">
                      <Label className="text-xs font-semibold text-slate-500">Notas del contacto</Label>
                      <p className="text-sm mt-1 text-slate-600">{contacto.notas}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Búsqueda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold text-slate-500">Descripción</Label>
                    <p className="text-sm mt-1">{consulta.propiedadConsultada || consulta.productoConsultado || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Tipo de propiedad</Label>
                    <p className="text-sm mt-1">{consulta.tipoPropiedad || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Operación</Label>
                    <p className="text-sm mt-1">{consulta.operacionBuscada || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Barrio / Zona</Label>
                    <p className="text-sm mt-1">{consulta.barrio || '-'}</p>
                  </div>
                  {consulta.presupuestoMax && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Presupuesto máximo</Label>
                      <p className="text-sm mt-1 font-medium">{consulta.moneda === 'USD' ? 'US$' : '$'} {Number(consulta.presupuestoMax).toLocaleString()}</p>
                    </div>
                  )}
                  {Array.isArray(consulta.caracteristicas) && consulta.caracteristicas.length > 0 && (
                    <div className="col-span-2">
                      <Label className="text-xs font-semibold text-slate-500">Características buscadas</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {consulta.caracteristicas.map(c => (
                          <span key={c} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seguimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seguimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Etapa</Label>
                    <Badge className="mt-1 block w-fit">{consulta.etapa}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Prioridad</Label>
                    <Badge variant="outline" className="mt-1 block w-fit">{consulta.prioridad}</Badge>
                  </div>
                  {consulta.canalOrigen && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Canal de origen</Label>
                      <p className="text-sm mt-1">{consulta.canalOrigen}</p>
                    </div>
                  )}
                  {consulta.proximoSeguimiento && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Próximo seguimiento</Label>
                      <p className="text-sm mt-1">{moment(consulta.proximoSeguimiento).format('DD/MM/YYYY')}</p>
                    </div>
                  )}
                  {consulta.precioCotizado && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Precio cotizado</Label>
                      <p className="text-sm mt-1 font-bold">{consulta.moneda === 'USD' ? 'US$' : '$'} {consulta.precioCotizado.toLocaleString()}</p>
                    </div>
                  )}
                  {consulta.motivoPerdida && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Motivo pérdida</Label>
                      <p className="text-sm mt-1 text-red-600">{consulta.motivoPerdida}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp">
            <SelectorListasWhatsApp
              contactoId={consulta.contactoId}
              contactoWhatsapp={consulta.contactoWhatsapp}
              consultaId={consulta.id}
              onMessageSent={onSave}
            />
          </TabsContent>

          <TabsContent value="historial">
            <HistorialEnvios
              contactoId={consulta.contactoId}
              consultaId={consulta.id}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}