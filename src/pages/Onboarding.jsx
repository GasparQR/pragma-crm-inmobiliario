import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/components/context/WorkspaceContext";
import { createPageUrl } from "@/utils";
import {
  CheckCircle2, Building2, Smartphone, Loader2,
  ArrowRight, BarChart3, Users, MessageSquare, Zap
} from "lucide-react";
import { toast } from "sonner";

const INDUSTRIES = [
  {
    id: "tech_apple",
    title: "Venta de Tecnología",
    description: "CRM para reventa de productos Apple: iPhone, Mac, iPad, AirPods, Apple Watch y accesorios.",
    icon: Smartphone,
    color: "from-slate-800 to-slate-900",
    features: [
      "Pipeline: Nuevo → Seguimiento → Concretado",
      "Categorías: iPhone, MacBook, iPad, AirPods...",
      "Canales: Instagram, WhatsApp, MercadoLibre, Web",
      "Campos: modelo, capacidad, color, medio de pago",
    ],
  },
  {
    id: "real_estate",
    title: "Inmobiliaria",
    description: "CRM para agencias inmobiliarias: ventas, alquileres y gestión de propiedades.",
    icon: Building2,
    color: "from-blue-700 to-blue-900",
    features: [
      "Pipeline: Nuevo → Seguimiento → Visita → Concretado",
      "Tags por operación, tipo y zona de Córdoba",
      "Campos: presupuesto, ambientes, forma de pago, cochera",
      "Inventario de propiedades con tipos y zonas",
    ],
  },
];

const FEATURES_HIGHLIGHT = [
  { icon: BarChart3,    title: "Pipeline visual",       desc: "Seguí cada lead en tiempo real" },
  { icon: MessageSquare, title: "WhatsApp integrado",   desc: "Plantillas y envíos desde el CRM" },
  { icon: Users,         title: "Multi-usuario",        desc: "Invitá a tu equipo al workspace" },
  { icon: Zap,           title: "Config. automática",   desc: "El CRM se adapta a tu rubro" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
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
      const response = await base44.functions.invoke("initializeWorkspaceTemplate", { industry: selected });
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

  // ── PASO 1: Bienvenida ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-10 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
              <span className="text-white font-bold text-3xl">A</span>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Bienvenido a<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                AltatechCRM
              </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg mx-auto leading-relaxed">
              Tu CRM inteligente para gestionar clientes, seguimientos y ventas.
              Configurado para tu rubro en menos de 1 minuto.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {FEATURES_HIGHLIGHT.map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white font-semibold text-sm">{f.title}</span>
                </div>
                <p className="text-slate-400 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={() => setStep(2)}
              size="lg"
              className="px-12 bg-white text-slate-900 hover:bg-slate-100 gap-2 text-base font-semibold h-12 shadow-lg"
            >
              Configurar mi CRM
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-slate-500 text-sm">Tomará menos de 1 minuto</p>
          </div>
        </div>
      </div>
    );
  }

  // ── PASO 2: Selección de rubro ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-slate-500 hidden sm:block">Bienvenida</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <span className="text-xs text-slate-700 font-medium hidden sm:block">Elegí tu rubro</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">¿Cuál es tu rubro?</h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            El CRM se configurará automáticamente con las etapas, campos y plantillas de tu industria.
          </p>
        </div>

        {/* Industry selector */}
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
                    : "hover:scale-[1.01] hover:border-slate-300"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center shadow-md`}>
                      <industry.icon className="w-7 h-7 text-white" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-6 h-6 text-slate-900" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{industry.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">{industry.description}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {industry.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span>
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
            className="px-12 bg-slate-900 hover:bg-slate-800 gap-2 h-12"
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