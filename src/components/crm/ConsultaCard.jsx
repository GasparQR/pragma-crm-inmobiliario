import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, Phone, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

const prioridadColors = {
  Alta: "bg-red-50 text-red-700 border-red-200",
  Media: "bg-amber-50 text-amber-700 border-amber-200",
  Baja: "bg-slate-50 text-slate-600 border-slate-200"
};

const etapaColors = {
  Nuevo: "bg-blue-500",
  Respondido: "bg-cyan-500",
  Seguimiento1: "bg-amber-500",
  Seguimiento2: "bg-orange-500",
  Negociacion: "bg-purple-500",
  Concretado: "bg-emerald-500",
  Perdido: "bg-slate-400"
};

export default function ConsultaCard({ consulta, onWhatsApp, onEdit, isDragging }) {
  const seguimientoVencido = consulta.proximoSeguimiento && 
    moment(consulta.proximoSeguimiento).isBefore(moment(), 'day');
  const seguimientoHoy = consulta.proximoSeguimiento && 
    moment(consulta.proximoSeguimiento).isSame(moment(), 'day');

  return (
    <div className={cn(
      "bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
      isDragging && "shadow-xl rotate-2 scale-105",
      seguimientoVencido && "ring-2 ring-red-200"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", etapaColors[consulta.etapa])} />
          <span className="font-semibold text-slate-900 text-sm">
            {consulta.contactoNombre || "Sin nombre"}
          </span>
        </div>
        <Badge variant="outline" className={cn("text-xs", prioridadColors[consulta.prioridad])}>
          {consulta.prioridad}
        </Badge>
      </div>

      {/* Producto */}
      <p className="text-sm text-slate-600 mb-2 line-clamp-1">
        {consulta.productoConsultado}
        {consulta.variante && <span className="text-slate-400"> · {consulta.variante}</span>}
      </p>

      {/* Precio */}
      {consulta.precioCotizado && (
        <p className="text-lg font-bold text-slate-900 mb-3">
          {consulta.moneda === "USD" ? "US$" : "$"} {consulta.precioCotizado.toLocaleString()}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {consulta.canalOrigen && (
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
            {consulta.canalOrigen}
          </Badge>
        )}
        {consulta.categoriaProducto && (
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
            {consulta.categoriaProducto}
          </Badge>
        )}
      </div>

      {/* Seguimiento */}
      {consulta.proximoSeguimiento && (
        <div className={cn(
          "flex items-center gap-1.5 text-xs mb-3 px-2 py-1 rounded-lg w-fit",
          seguimientoVencido ? "bg-red-50 text-red-600" :
          seguimientoHoy ? "bg-amber-50 text-amber-600" :
          "bg-slate-50 text-slate-500"
        )}>
          <Calendar className="w-3 h-3" />
          {seguimientoVencido ? "Vencido: " : seguimientoHoy ? "Hoy" : ""}
          {!seguimientoHoy && moment(consulta.proximoSeguimiento).format("DD/MM")}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onWhatsApp?.(consulta); }}
          className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white gap-1.5 h-8"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); onEdit?.(consulta); }}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </Button>
      </div>
    </div>
  );
}