import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/components/context/WorkspaceContext";
import { createPageUrl } from "@/utils";
import { CheckCircle2, Building2, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

const INDUSTRIES = [
  {
    id: "tech_apple",
    title: "Tecnología (Apple)",
    description: "CRM para reventa de productos Apple: iPhone, Mac, iPad, AirPods, Apple Watch y accesorios.",
    icon: Smartphone,
    color: "from-slate-800 to-slate-900",
    features: ["Pipeline: Nuevo → Cotizado → Negociación → Concretado", "Categorías Apple", "Canales: Instagram, WhatsApp, MercadoLibre", "Seguimiento con plantillas WhatsApp"],
  },
  {
    id: "real_estate",
    title: "Inmobiliaria",
    description: "CRM para agencias inmobiliarias: ventas, alquileres y gestión de propiedades.",
    icon: Building2,
    color: "from-blue-700 to-blue-900",
    features: ["10 etapas: desde Nuevo Cliente hasta Escritura", "Tags por operación, tipo y zona", "Campos: presupuesto, ambientes, forma de pago", "Inventario de propiedades"],
  },
];

export default function Onboarding() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { refetchWorkspace } = useWorkspace();

  const handleConfirm = async () => {
    if (!selected) {
      toast.error("Por favor seleccioná un rubro");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('initializeWorkspaceTemplate', { industry: selected });
      if (response.data?.ok) {
        toast.success("¡Workspace configurado correctamente!");
        await refetchWorkspace();
        window.location.href = createPageUrl("Home");
      } else {
        throw new Error(response.data?.error || "Error desconocido");
      }
    } catch (err) {
      toast.error("Error al configurar el workspace: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">¡Bienvenido a AltatechCRM!</h1>
          <p className="text-slate-500 text-lg">
            Elegí el rubro de tu negocio para configurar el CRM con las etapas, categorías y campos adecuados.
          </p>
        </div>

        {/* Selector de industria */}
        <div className="grid md:grid-cols-2 gap-4">
          {INDUSTRIES.map((industry) => {
            const isSelected = selected === industry.id;
            return (
              <Card
                key={industry.id}
                onClick={() => setSelected(industry.id)}
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  isSelected
                    ? "ring-2 ring-slate-900 shadow-xl scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center`}>
                      <industry.icon className="w-7 h-7 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-slate-900" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{industry.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">{industry.description}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {industry.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={!selected || loading}
            size="lg"
            className="px-12 bg-slate-900 hover:bg-slate-800 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Configurando workspace...
              </>
            ) : (
              "Comenzar →"
            )}
          </Button>
          <p className="text-xs text-slate-400">
            Podés cambiar la configuración después desde Ajustes
          </p>
        </div>
      </div>
    </div>
  );
}