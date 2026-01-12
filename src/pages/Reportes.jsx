import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import moment from "moment";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Reportes() {
  const [periodo, setPeriodo] = useState("30");

  const { data: consultas = [] } = useQuery({
    queryKey: ['consultas-reportes'],
    queryFn: () => base44.entities.Consulta.list("-created_date", 1000)
  });

  const { data: contactos = [] } = useQuery({
    queryKey: ['contactos-reportes'],
    queryFn: () => base44.entities.Contacto.list()
  });

  const dias = parseInt(periodo);
  const fechaCorte = moment().subtract(dias, 'days');
  const consultasPeriodo = consultas.filter(c => moment(c.created_date).isAfter(fechaCorte));

  // Métricas
  const totalConsultas = consultasPeriodo.length;
  const concretados = consultasPeriodo.filter(c => c.etapa === "Concretado").length;
  const perdidos = consultasPeriodo.filter(c => c.etapa === "Perdido").length;
  const tasaConversion = totalConsultas > 0 ? ((concretados / totalConsultas) * 100).toFixed(1) : 0;
  const ticketPromedio = concretados > 0 ? 
    consultasPeriodo
      .filter(c => c.etapa === "Concretado" && c.precioCotizado)
      .reduce((sum, c) => sum + c.precioCotizado, 0) / concretados : 0;

  // Por canal
  const porCanal = {};
  consultasPeriodo.forEach(c => {
    const canal = c.canalOrigen || "Sin definir";
    if (!porCanal[canal]) porCanal[canal] = { total: 0, concretados: 0 };
    porCanal[canal].total++;
    if (c.etapa === "Concretado") porCanal[canal].concretados++;
  });
  const canalData = Object.entries(porCanal).map(([name, data]) => ({
    name,
    total: data.total,
    concretados: data.concretados,
    conversion: data.total > 0 ? ((data.concretados / data.total) * 100).toFixed(0) : 0
  }));

  // Por producto
  const porProducto = {};
  consultasPeriodo.forEach(c => {
    const prod = c.categoriaProducto || "Otro";
    porProducto[prod] = (porProducto[prod] || 0) + 1;
  });
  const productoData = Object.entries(porProducto)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Por etapa
  const porEtapa = {};
  consultasPeriodo.forEach(c => {
    porEtapa[c.etapa] = (porEtapa[c.etapa] || 0) + 1;
  });
  const etapaData = Object.entries(porEtapa).map(([name, value]) => ({ name, value }));

  // Timeline (últimos 7 días)
  const timeline = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = moment().subtract(i, 'days');
    const dia = fecha.format("DD/MM");
    const count = consultas.filter(c => 
      moment(c.created_date).isSame(fecha, 'day')
    ).length;
    timeline.push({ dia, consultas: count });
  }

  // Motivos de pérdida
  const motivos = {};
  consultasPeriodo.filter(c => c.etapa === "Perdido" && c.motivoPerdida).forEach(c => {
    motivos[c.motivoPerdida] = (motivos[c.motivoPerdida] || 0) + 1;
  });
  const motivosData = Object.entries(motivos).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" className="gap-2 mb-2 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Reportes & Analytics</h1>
          </div>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalConsultas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Conversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{tasaConversion}%</p>
              <p className="text-xs text-slate-400">{concretados} concretados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Ticket Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">US$ {Math.round(ticketPromedio)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contactos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{contactos.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consultas por día (últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeline}>
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="consultas" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Por canal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance por canal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={canalData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concretados" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Por producto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Productos más consultados</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={productoData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productoData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Etapas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribución por etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={etapaData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Motivos de pérdida */}
          {motivosData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Motivos de pérdida</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={motivosData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}