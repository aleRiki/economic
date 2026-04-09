"use client"
import { useRef, useState, useCallback } from "react"
import {
  Check,
  Star,
  Users,
  Sparkles,
  Briefcase,
  ShieldCheck,
  Globe,
  Zap,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sun,
  XCircle,
} from "lucide-react"

type Plan = {
  id: string
  category: string
  name: string
  priceMonthly: number
  priceAnnual: number
  sku: string
  features: string[]
  badge?: string
  highlight?: boolean
  icon?: any
}

const PLANS: Plan[] = [
  {
    id: "p1",
    category: "Personal",
    name: "Free Personal",
    priceMonthly: 0,
    priceAnnual: 0,
    sku: "free_personal",
    features: ["Control de ingresos y gastos", "Presupuestos básicos", "1 usuario"],
    icon: Sparkles,
  },
  {
    id: "p2",
    category: "Personal",
    name: "Personal Plus",
    priceMonthly: 3,
    priceAnnual: 30,
    sku: "personal_plus",
    features: ["Reportes avanzados", "Metas y notificaciones", "Soporte básico"],
    icon: Star,
  },
  {
    id: "p3",
    category: "Personal",
    name: "Personal Smart",
    priceMonthly: 7,
    priceAnnual: 70,
    sku: "personal_smart",
    features: ["Alertas inteligentes", "IA recomendaciones", "Export CSV"],
    icon: Zap,
  },
  {
    id: "p4",
    category: "Familiar",
    name: "Family Basic",
    priceMonthly: 5,
    priceAnnual: 50,
    sku: "family_basic",
    features: ["Cuentas compartidas", "Ahorro conjunto", "3 miembros"],
    icon: Users,
  },
  {
    id: "p5",
    category: "Familiar",
    name: "Family Pro",
    priceMonthly: 10,
    priceAnnual: 100,
    sku: "family_pro",
    features: ["Supervisión y control parental", "Educación financiera", "Reportes familiares"],
    icon: ShieldCheck,
    highlight: true,
  },
  {
    id: "p6",
    category: "Emprendimiento",
    name: "Starter Biz",
    priceMonthly: 8,
    priceAnnual: 80,
    sku: "biz_starter",
    features: ["Control ingresos/gastos", "Facturación simple", "Soporte básico"],
    icon: Briefcase,
  },
  {
    id: "p7",
    category: "Emprendimiento",
    name: "Business Growth",
    priceMonthly: 15,
    priceAnnual: 150,
    sku: "biz_growth",
    features: ["Analytics", "Reportes multiusuario", "Integraciones"],
    icon: Globe,
  },
  {
    id: "p8",
    category: "Premium",
    name: "Finance Premium",
    priceMonthly: 25,
    priceAnnual: 250,
    sku: "premium",
    features: ["Asesoría experta", "Monitoreo personalizado", "Prioridad soporte"],
    icon: ShieldCheck,
    badge: "Recomendado",
  },
]

export default function PricingCarousel() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)
  const [isMonthly, setIsMonthly] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const closeCheckoutMessage = () => setCheckoutMessage(null)

  const handleCheckout = async (plan: Plan, price: number, period: "monthly" | "annual") => {
    if (isProcessing || price === 0) return

    closeCheckoutMessage()
    setIsProcessing(true)

    // ✅ CORRECCIÓN CLAVE: Usar la ruta API con /api/
    const apiEndpoint = "/api/pago/create-checkout"
    const productName = `${plan.name} (${period === "monthly" ? "Mensual" : "Anual"})`

    setCheckoutMessage({
      message: `Preparando pago para: ${productName}.`,
      type: "info",
    })

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price * 100, // Enviar en centavos
          currency: "usd",
          name: productName,
        }),
      })

      let data: any = {}

      // Manejo de la respuesta como JSON
      try {
        if (response.headers.get("content-length") !== "0") {
            data = await response.json()
        }
      } catch (e) {
        console.error("Fallo al parsear respuesta a JSON:", e)
        throw new Error(`❌ Error de Ruteo/JSON. Estado: ${response.status}.`)
      }

      // Si la respuesta fue OK (200, 201) y tiene la URL de redirección
      if (response.ok && data?.url) {
        setCheckoutMessage({
          message: "Redireccionando a la pasarela de pago. Por favor, espera...",
          type: "success",
        })
        window.location.href = data.url
      } else if (!response.ok) {
        // Manejar errores del API Route (que a su vez trae errores de NestJS)
        const status = response.status
        const message = data?.details || data?.error || `Error desconocido (${status}) al crear la sesión de pago.`

        setCheckoutMessage({
          message: `Error: ${message}`,
          type: "error",
        })
        console.error("Error del API Route/Backend:", { status, data })

      } else {
          // Éxito, pero falta la URL
          setCheckoutMessage({
              message: "Sesión creada, pero falta la URL de redirección en la respuesta.",
              type: "error",
          })
          console.error("Respuesta exitosa, pero sin URL:", data)
      }
    } catch (error: any) {
      const finalMessage = error.message || "Error de conexión. Verifica la URL del backend o la conexión de red."

      setCheckoutMessage({
        message: finalMessage,
        type: "error",
      })
      console.error("Error completo del Checkout:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const scrollToIndex = useCallback((i: number) => {
    const container = scrollRef.current
    if (!container) return

    const safeIndex = Math.max(0, Math.min(PLANS.length - 1, i))
    const card = container.children[safeIndex] as HTMLElement | undefined
    if (!card) return

    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    setActiveIndex(safeIndex)
  }, [])

  const prev = () => {
    if (activeIndex === null) return scrollToIndex(0)
    scrollToIndex(activeIndex - 1)
  }

  const next = () => {
    if (activeIndex === null) return scrollToIndex(0)
    scrollToIndex(activeIndex + 1)
  }

  const handleCardEnter = (idx: number) => {
    setActiveIndex(idx)
    scrollToIndex(idx)
  }

  return (
    <section className="py-20 bg-white font-sans min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-12">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Precios transparentes y flexibles
            </h2>
            <p className="text-lg text-gray-600 mt-3 max-w-3xl">
              Escoge el plan que mejor se adapte a tu vida o negocio.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-8 lg:mt-0">
            <button
              aria-label="Anterior"
              onClick={prev}
              className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200"
              disabled={activeIndex === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Siguiente"
              onClick={next}
              className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200"
              disabled={activeIndex === PLANS.length - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <div className="flex items-center space-x-1 p-1 rounded-lg bg-gray-100 border border-gray-200">
            <button
              onClick={() => setIsMonthly(true)}
              className={`flex items-center gap-2 py-2 px-6 rounded-md text-sm font-semibold transition-all duration-300 ${
                isMonthly ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar size={16} /> Mensual
            </button>
            <button
              onClick={() => setIsMonthly(false)}
              className={`flex items-center gap-2 py-2 px-6 rounded-md text-sm font-semibold transition-all duration-300 relative ${
                !isMonthly ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Sun size={16} /> Anual
              {!isMonthly && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -17%
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="relative flex gap-6 overflow-x-auto no-scrollbar py-4 px-2 snap-x snap-mandatory"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon || Star
            const isActive = activeIndex === idx
            const price = isMonthly ? plan.priceMonthly : plan.priceAnnual
            const periodText = isMonthly ? "/mes" : "/año"
            const isFree = price === 0
            const isDisabled = isProcessing || isFree

            return (
              <article
                key={plan.id}
                onMouseEnter={() => handleCardEnter(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`snap-center flex-shrink-0 w-full sm:w-[380px] lg:w-[350px] transition-all duration-300 ${isActive ? "z-40" : "z-10"}`}
                style={{ minWidth: "85vw" }}
              >
                <div
                  className={`
                    relative h-full w-full rounded-xl overflow-hidden p-4
                    border border-gray-200
                    bg-white
                    shadow-sm hover:shadow-md
                    transition-all duration-300
                    flex flex-col 
                    min-h-[380px]
                    ${isActive ? "ring-2 ring-blue-500 shadow-md" : ""} 
                  `}
                >
                  <div className="relative flex flex-col h-full">
                    {/* Header with icon and badge */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-lg ${plan.highlight ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Icon size={20} className={plan.highlight ? "text-blue-600" : "text-gray-700"} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                          <span className="text-xs text-gray-500 font-medium">{plan.category}</span>
                        </div>
                      </div>

                      {plan.badge && (
                        <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price section */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{isFree ? "Gratis" : `$${price}`}</span>
                        {!isFree && <span className="text-xs text-gray-600">{periodText}</span>}
                      </div>
                      {!isMonthly && price > 0 && (
                        <p className="mt-1 text-xs text-emerald-700 font-medium">
                          Ahorra ${plan.priceMonthly * 12 - plan.priceAnnual}
                        </p>
                      )}
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 text-xs text-gray-700 flex-grow mb-4">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span
                            className={`p-0.5 rounded-full flex-shrink-0 mt-0 ${plan.highlight ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleCheckout(plan, price, isMonthly ? "monthly" : "annual")}
                      disabled={isDisabled}
                      className={`w-full py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
                        isDisabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : plan.highlight
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {isProcessing && !isFree ? (
                        <svg
                          className="animate-spin h-3 w-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : null}
                      {isFree ? "Comenzar Gratis" : "Seleccionar Plan"}
                    </button>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {isFree ? "Sin tarjeta requerida." : "Pago único, sin recurrencia."}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-12">
          {PLANS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir al plan ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? "bg-gray-900 scale-125" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {checkoutMessage && (
        <div
          className="fixed bottom-4 right-4 w-full max-w-sm p-4 rounded-lg shadow-lg transition-transform duration-500 transform ease-out z-50 bg-white border-l-4"
          style={{
            borderLeftColor:
              checkoutMessage.type === "error" ? "#ef4444" : checkoutMessage.type === "success" ? "#10b981" : "#3b82f6",
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-lg ${checkoutMessage.type === "error" ? "text-red-600" : checkoutMessage.type === "success" ? "text-emerald-600" : "text-blue-600"}`}
              >
                {checkoutMessage.type === "error" ? "✕" : checkoutMessage.type === "success" ? "✓" : "ℹ"}
              </span>
              <p className="text-sm font-medium text-gray-800">
                {checkoutMessage.type === "error"
                  ? "Error"
                  : checkoutMessage.type === "success"
                    ? "Éxito"
                    : "Información"}
              </p>
            </div>
            <button
              onClick={closeCheckoutMessage}
              className="text-gray-400 hover:text-gray-600 p-1 transition duration-150"
            >
              <XCircle size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 ml-8">{checkoutMessage.message}</p>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}