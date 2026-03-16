import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye, Search, DollarSign, TrendingUp, Building2, Plus, Download } from "lucide-react";
import { useWorkspace } from "@/components/context/WorkspaceContext";
import { format } from "date-fns";
import OperacionForm from "@/components/ventas/OperacionForm";
import { Link as RouterLink } from "react-router-dom";

const TIPOS_OPERACION = ["Venta", "Alquiler", "Alquiler Temporal", "Tasación"];
const ESTADOS = ["En gestión", "Boleto firmado", "Escriturada", "Entregada", "Caída"];

const estadoColors = {
  "En gestión": "bg-amber-100 text-amber-700",
  "Boleto firmado": "bg-blue-100 text-blue-700",
  "Escriturada": "bg-emerald-100 text-emerald-700",
  "Entregada": "bg-green-100 text-green-700",
  "Caída": "bg-slate-100 text-slate-600"
};

export default function Operaciones() {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: operaciones = [], isLoading } = useQuery({
    queryKey: ['operaciones', workspace?.id],
    queryFn: () => workspace ? base44.entities.Venta.filter({ workspace_id: workspace.id }, "-fecha") : [],
    enabled: !!workspace
  });

  const filtradas = operaciones.filter(op => {
    const matchSearch = !search ||
      op.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      op.nombreSnapshot?.toLowerCase().includes(search.toLowerCase()) ||
      op.propiedadDescripcion?.toLowerCase().includes(search.toLowerCase()) ||
      op.barrio?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "Todos" || op.tipoOperacion === filterTipo;
    const matchEstado = filterEstado === "Todos" || op.estado === filterEstado;
    const matchDesde = !fechaDesde || new Date(op.fecha) >= new Date(fechaDesde);
    const matchHasta = !fechaHasta || new Date(op.fecha) <= new Date(fechaHasta);
    return matchSearch && matchTipo && matchEstado && matchDesde && matchHasta;
  });

  const hoy = new Date();
  const opsMes = operaciones.filter(op => {
    if (!op.fecha || op.estado === "Caída") return false;
    const f = new Date(op.fecha);
    return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
  });
  const honorariosMes = opsMes.reduce((acc, op) => acc + (op.honorariosTotal || 0), 0);
  const cerradasMes = operaciones.filter(op => {
    if (!["Escriturada", "Boleto firmado"].includes(op.estado)) return false;
    const f = op.fechaBoleto || op.fechaEscritura || op.fecha;
    if (!f) return false;
    const fd = new Date(f);
    return fd.getMonth() === hoy.getMonth() && fd.getFullYear() === hoy.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="gap-2 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Operaciones</h1>
              <p className="text-slate-500">{filtradas.length} operaciones registradas</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Operación
              </Button>
              <Link to={createPageUrl("ExportarVentas")}>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total operaciones</p>
                <p className="text-2xl font-bold">{filtradas.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Honorarios del mes</p>
                <p className="text-2xl font-bold text-emerald-600">
                  USD {honorariosMes.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-slate-500">{opsMes.length} operaciones</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Cerradas este mes</p>
                <p className="text-2xl font-bold">{cerradasMes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar por cliente, propiedad, barrio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los tipos</SelectItem>
                  {TIPOS_OPERACION.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" placeholder="Desde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Propiedad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Honorarios</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-500">Cargando...</TableCell></TableRow>
                  ) : filtradas.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-500">No hay operaciones registradas</TableCell></TableRow>
                  ) : filtradas.map(op => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.codigo}</TableCell>
                      <TableCell>
                        <Badge className={estadoColors[op.estado] || ""}>{op.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{op.tipoOperacion}</Badge>
                      </TableCell>
                      <TableCell>{op.fecha ? format(new Date(op.fecha), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>
                        <p className="font-medium">{op.nombreSnapshot} {op.apellidoSnapshot}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{op.propiedadDescripcion}</p>
                        {op.barrio && <p className="text-xs text-slate-500">{op.barrio}</p>}
                      </TableCell>
                      <TableCell className="text-right">
                        {op.precioOperacion ? `${op.moneda} ${op.precioOperacion.toLocaleString('es-AR')}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {op.honorariosTotal ? (
                          <span className="text-emerald-600 font-semibold">
                            {op.moneda} {op.honorariosTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Link to={createPageUrl(`VentaDetalle?id=${op.id}`)}>
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <OperacionForm
          open={showForm}
          onOpenChange={setShowForm}
          consulta={null}
          onOperacionCreada={() => queryClient.invalidateQueries({ queryKey: ['operaciones', workspace?.id] })}
        />
      </div>
    </div>
  );
}