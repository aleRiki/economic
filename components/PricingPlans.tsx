"use client";
import { useState } from "react";
import { Check, Calendar, Sun, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "p1",
    name: "Plan Free",
    priceMonthly: 0,
    priceAnnual: 0,
    sku: "free_plan",
    features: ["Acceso básico", "1 Usuario"],
    buttonText: "Comenzar Gratis",
  },
  {
    id: "p2",
    name: "Plan Familiar",
    priceMonthly: 5,
    priceAnnual: 50,
    sku: "familiar_plan",
    features: ["Cuentas compartidas", "3 Usuarios"],
    highlight: true,
    badge: "Popular",
    buttonText: "Elegir Plan",
  },
  {
    id: "p3",
    name: "Plan Avanzado",
    priceMonthly: 10,
    priceAnnual: 100,
    sku: "avanzado_plan",
    features: ["Reportes avanzados", "5 Usuarios"],
    buttonText: "Elegir Plan",
  },
  {
    id: "p4",
    name: "Plan Premium",
    priceMonthly: 25,
    priceAnnual: 250,
    sku: "premium_plan",
    features: ["Asesoramiento completo", "Usuarios ilimitados"],
    badge: "Recomendado",
    buttonText: "Obtener Premium",
  },
];

export default function PricingPlans() {
  const [isMonthly, setIsMonthly] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (
    planName: string,
    sku: string,
    price: number,
    period: "monthly" | "annual"
  ) => {
    if (price === 0) {
      alert("Plan Gratuito: Ya tienes acceso al plan gratuito");
      return;
    }

    setLoading(sku);
    try {
     const response = await fetch("http://localhost:3001/api/v1/pago/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price * 100,
          currency: "usd",
          name: planName,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const html = await response.text();
        console.error("[FE] HTML recibido en lugar de JSON:", html);
        throw new Error("Respuesta inesperada del servidor. Verifica la conexión con el backend.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.details || data?.error || "Error al crear sesión de pago.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Sesión de pago creada. Falta la URL de redirección.");
      }
    } catch (error) {
      alert(
        "Error: " +
          (error instanceof Error ? error.message : "No pudimos procesar tu solicitud")
      );
      console.error("[FE] Full checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Planes y <span className="text-blue-600">Precios</span>
        </h2>
        <p className="text-gray-600 mb-8">
          Elige el plan perfecto para tu familia
        </p>

        <div className="flex justify-center mb-10">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setIsMonthly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isMonthly
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="inline mr-2" size={16} />
              Mensual
            </button>
            <button
              onClick={() => setIsMonthly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                !isMonthly
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Sun className="inline mr-2" size={16} />
              Anual
              {!isMonthly && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  -17%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = isMonthly ? plan.priceMonthly : plan.priceAnnual;
            const isFree = price === 0;

            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-5 flex flex-col ${
                  plan.highlight
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } transition-all`}
              >
                {plan.badge && (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded w-fit mb-2">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 text-left">
                  {plan.name}
                </h3>
                <p className="text-3xl font-bold text-blue-600 mt-2 text-left">
                  {isFree ? "Gratis" : `$${price}`}
                  {!isFree && (
                    <span className="text-xs text-gray-600 font-normal">
                      {isMonthly ? "/mes" : "/año"}
                    </span>
                  )}
                </p>
                <ul className="text-left mt-4 space-y-2 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Check
                        size={16}
                        className="text-green-500 flex-shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    handleCheckout(
                      plan.name,
                      plan.sku,
                      price,
                      isMonthly ? "monthly" : "annual"
                    )
                  }
                  disabled={isFree || loading === plan.sku}
                  className={`mt-4 w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                    isFree
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-green-500 text-white hover:bg-green-600"
                  } ${loading === plan.sku ? "opacity-70" : ""}`}
                >
                  {loading === plan.sku ? (
                    <>
                      <Loader2 className="inline mr-2 animate-spin" size={16} />
                      Procesando...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}