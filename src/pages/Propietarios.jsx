import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Search, Eye, Phone, Users, Building2 } from "lucide-react";
import { useWorkspace } from "@/components/context/WorkspaceContext";
import { format } from "date-fns";

export default function Propietarios() {
  const [search, setSearch] = useState("");
  const { workspace } = useWorkspace();

  const { data: propietarios = [], isLoading } = useQuery({
    queryKey: ['propietarios', workspace?.id],
    queryFn: () => workspace ? base44.entities.Proveedor.filter({ workspace_id: workspace.id }, "-created_date") : [],
    enabled: !!workspace
  });

  const { data: operaciones = [] } = useQuery({
    queryKey: ['operaciones-propietarios', workspace?.id],
    queryFn: () => workspace ? base44.entities.Venta.filter({ workspace_id: workspace.id }) : [],
    enabled: !!workspace
  });

  const calcularOperaciones = (propietarioId) => {
    return operaciones.filter(op => op.propietarioId === propietarioId).length;
  };

  const filtrados = propietarios.filter(p => {
    if (!search) return true;
    return (
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.apellido?.toLowerCase().includes(search.toLowerCase()) ||
      p.whatsapp?.includes(search) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

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
              <h1 className="text-2xl font-bold text-slate-900">Propietarios</h1>
              <p className="text-slate-500">{filtrados.length} propietarios</p>
            </div>
            <Link to={createPageUrl("PropietarioDetalle?id=nuevo")}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Propietario
              </Button>
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600">Total Propietarios</p>
              <p className="text-2xl font-bold">{propietarios.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {propietarios.filter(p => p.activo !== false).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600">Con propiedades captadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {propietarios.filter(p => p.propiedadesCaptadas?.length > 0).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Buscador */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar propietario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
                    <TableHead>Propietario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Propiedades captadas</TableHead>
                    <TableHead>Último contacto</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Cargando...</TableCell></TableRow>
                  ) : filtrados.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No hay propietarios registrados</TableCell></TableRow>
                  ) : filtrados.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{p.nombre} {p.apellido}</p>
                        {p.ciudad && <p className="text-xs text-slate-500">{p.ciudad}</p>}
                        {p.activo === false && <Badge variant="outline" className="text-xs mt-1">Inactivo</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5">
                          {p.whatsapp && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />{p.whatsapp}
                            </p>
                          )}
                          {p.email && <p className="text-slate-500">{p.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">{p.propiedadesCaptadas?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.fechaUltimoContacto ? (
                          <span className="text-sm">{format(new Date(p.fechaUltimoContacto), 'dd/MM/yyyy')}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to={createPageUrl(`PropietarioDetalle?id=${p.id}`)}>
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
      </div>
    </div>
  );
}