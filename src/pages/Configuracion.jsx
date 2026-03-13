import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Database, Loader2, Calendar, FileDown, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/components/context/WorkspaceContext";

export default function Configuracion() {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const [consultaDays, setConsultaDays] = useState(3);
  const [postventaDays, setPostventaDays] = useState(7);
  const [savingDays, setSavingDays] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setConsultaDays(currentUser.consulta_follow_up_days ?? 3);
      setPostventaDays(currentUser.postventa_follow_up_days ?? 7);
    }
  }, [currentUser]);

  const handleSaveDays = async () => {
    setSavingDays(true);
    try {
      await base44.auth.updateMe({
        consulta_follow_up_days: Number(consultaDays),
        postventa_follow_up_days: Number(postventaDays)
      });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success("Días hábiles guardados");
    } finally {
      setSavingDays(false);
    }
  };

  const fetchAllData = async () => {
    const wsId = workspace?.id;
    const [consultas, contactos, ventas, propiedades] = await Promise.all([
      base44.entities.Consulta.filter({ workspace_id: wsId }),
      base44.entities.Contacto.filter({ workspace_id: wsId }),
      base44.entities.Venta.filter({ workspace_id: wsId }),
      base44.entities.Property.filter({ workspace_id: wsId }),
    ]);
    return { consultas, contactos, ventas, propiedades };
  };

  const flattenToCSV = (label, rows) => {
    if (!rows || rows.length === 0) return `${label}\nSin datos\n\n`;
    const keys = Object.keys(rows[0]);
    const header = keys.join(",");
    const body = rows.map(row =>
      keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return "";
        const str = Array.isArray(val) ? val.join(";") : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    return `${label}\n${header}\n${body}\n\n`;
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const { consultas, contactos, ventas, propiedades } = await fetchAllData();
      let content = "";
      content += flattenToCSV("=== CONSULTAS ===", consultas);
      content += flattenToCSV("=== CONTACTOS ===", contactos);
      content += flattenToCSV("=== VENTAS ===", ventas);
      content += flattenToCSV("=== PROPIEDADES ===", propiedades);

      const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pragma-crm-export-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportación CSV completada");
    } catch (e) {
      toast.error("Error al exportar");
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const { consultas, contactos, ventas, propiedades } = await fetchAllData();

      // Build HTML table-based Excel (works in all browsers without extra libraries)
      const buildTable = (label, rows) => {
        if (!rows || rows.length === 0) return `<tr><td colspan="1"><b>${label} - Sin datos</b></td></tr>`;
        const keys = Object.keys(rows[0]);
        const header = `<tr style="background:#1e293b;color:white;">${keys.map(k => `<th>${k}</th>`).join("")}</tr>`;
        const body = rows.map(row =>
          `<tr>${keys.map(k => {
            const val = row[k];
            const str = val === null || val === undefined ? "" : Array.isArray(val) ? val.join("; ") : String(val);
            return `<td>${str}</td>`;
          }).join("")}</tr>`
        ).join("");
        return `<tr><td colspan="${keys.length}" style="background:#0f172a;color:white;font-weight:bold;font-size:14px;padding:8px;">${label}</td></tr>${header}${body}<tr><td colspan="${keys.length}"></td></tr>`;
      };

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"/></head>
        <body>
          <table border="1">
            ${buildTable("CONSULTAS", consultas)}
            ${buildTable("CONTACTOS", contactos)}
            ${buildTable("VENTAS", ventas)}
            ${buildTable("PROPIEDADES", propiedades)}
          </table>
        </body></html>
      `;

      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pragma-crm-export-${new Date().toISOString().slice(0,10)}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportación Excel completada");
    } catch (e) {
      toast.error("Error al exportar");
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link to={createPageUrl("Ajustes")}>
            <Button variant="ghost" className="gap-2 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Ajustes
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-500 mt-1">Gestión de usuarios y preferencias</p>
        </div>

        
  
        

        {/* Días hábiles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Días hábiles de seguimiento
            </CardTitle>
            <CardDescription>Configura los días hábiles predeterminados para cada tipo de seguimiento automático</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seguimiento de consultas (días hábiles)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={consultaDays}
                  onChange={(e) => setConsultaDays(e.target.value)}
                />
                <p className="text-xs text-slate-400">Días que se agregan automáticamente al agendar un seguimiento de consulta</p>
              </div>
              <div className="space-y-2">
                <Label>Seguimiento de postventa (días hábiles)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={postventaDays}
                  onChange={(e) => setPostventaDays(e.target.value)}
                />
                <p className="text-xs text-slate-400">Días que se agregan al completar el primer contacto de postventa</p>
              </div>
            </div>
            <Button onClick={handleSaveDays} disabled={savingDays} className="gap-2">
              {savingDays && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar días hábiles
            </Button>
          </CardContent>
        </Card>

        {/* Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gestión de datos
            </CardTitle>
            <CardDescription>Exportá todos tus datos: consultas, contactos, ventas y propiedades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExportCSV}
              disabled={exportingCSV}
            >
              {exportingCSV ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Exportar todos los datos (CSV)
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExportExcel}
              disabled={exportingExcel}
            >
              {exportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Exportar todos los datos (Excel)
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-400 py-4">
          PRAGMA CRM - Rubro Inmobiliario
        </div>
      </div>
    </div>
  );
}