"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react'; // ✅ Eliminado Euro
import { getTransaction } from "@/lib/auth-service";
// No usamos aquí el tipo TooltipProps directamente porque en algunas
// versiones de los tipos de 'recharts' las propiedades (payload/label)
// no coinciden con lo que necesitamos; definimos tipos locales más
// explícitos para evitar errores de TS sobre propiedades inexistentes
// o 'implicit any'.

// --- Tipos ---
const CURRENCIES = ["USD", "EUR", "CUP"] as const;
type Currency = (typeof CURRENCIES)[number];

interface MinimalTransaction {
  createAt: string;
  amount: string;
  card:
    | {
        account: {
          type: Currency;
        };
      }
    | null
    | undefined;
}

const CURRENCY_COLORS: Record<Currency, string> = {
  USD: "#4F46E5",
  EUR: "#10B981",
  CUP: "#F59E0B",
};

type TrendData = {
  day: string;
} & {
  [key in Currency]?: number;
};

// --- Procesamiento de datos ---
const aggregateTrendData = (transactions: MinimalTransaction[]): TrendData[] => {
  const dailyData: Record<string, Record<Currency, number>> = {};

  transactions.forEach((tx) => {
    if (!tx.createAt) return;

    const date = new Date(tx.createAt);
    const dayKey = date.toISOString().split("T")[0];
    const currency = tx.card?.account?.type;
    const amount = parseFloat(tx.amount);

    if (currency && CURRENCIES.includes(currency) && !isNaN(amount)) {
      if (!dailyData[dayKey]) dailyData[dayKey] = {} as Record<Currency, number>;
      dailyData[dayKey][currency] =
        (dailyData[dayKey][currency] || 0) + amount;
    }
  });

  const sortedDayKeys = Object.keys(dailyData).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return sortedDayKeys
    .map((dayKey) => {
      const date = new Date(dayKey);
      const displayDay = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
      const dataPoint: TrendData = { day: displayDay };
      CURRENCIES.forEach((currency) => {
        dataPoint[currency] = dailyData[dayKey][currency] || 0;
      });
      return dataPoint;
    })
    .filter((d) => CURRENCIES.some((c) => Number(d[c] || 0) > 0));
};

// --- Cálculo de crecimiento ---
function calculateGrowth(data: TrendData[], key: Currency): string {
  if (data.length < 2) return "N/A";
  const lastValue = data[data.length - 1][key] || 0;
  const firstValue = data[0][key] || 0;
  if (firstValue === 0) return lastValue > 0 ? "Nuevo" : "N/A";
  const growth = ((lastValue - firstValue) / firstValue) * 100;
  return growth.toFixed(2);
}

// --- Tooltip tipado correctamente ---
// Tipado local para los elementos que vienen en `payload`.
type TooltipItem = {
  dataKey?: string | number;
  color?: string;
  name?: string;
  value?: number | string | null;
};

type CustomTooltipProps = {
  active?: boolean;
  // usamos any más controlado: un array de TooltipItem o undefined
  payload?: TooltipItem[] | null;
  label?: string | number | undefined;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="p-3 bg-white border border-gray-300 shadow-2xl rounded-lg text-sm transition duration-300 backdrop-blur-sm bg-opacity-90">
      <p className="font-bold text-gray-700 mb-1">{label} (Día)</p>
      {payload.map((p: TooltipItem, index: number) => {
        const color = p.color ?? "#000";
        const name = p.name ?? `Moneda ${index + 1}`;
        const value = typeof p.value === "number" ? p.value : Number(p.value ?? 0);

        return (
          <p
            key={String(p.dataKey ?? name ?? index)}
            className="text-xs flex justify-between"
            style={{ color }}
          >
            <span className="font-medium mr-4">{name}:</span>
            <span className="font-semibold">
              {`$${value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`}
            </span>
          </p>
        );
      })}
    </div>
  );
};


// --- Componente principal ---
export default function AccountTrends() {
  const [transactions, setTransactions] = useState<MinimalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const txs = (await getTransaction()) as unknown as MinimalTransaction[];
      setTransactions(txs);
    } catch (err: unknown) {
      console.error("Error al obtener las transacciones:", err);
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos de la tendencia.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = useMemo(() => aggregateTrendData(transactions), [transactions]);
  const growthCalculations: Record<Currency, string> = useMemo(
    () => ({
      USD: calculateGrowth(chartData, "USD"),
      EUR: calculateGrowth(chartData, "EUR"),
      CUP: calculateGrowth(chartData, "CUP"),
    }),
    [chartData]
  );

  // --- Renderizado ---
  if (isLoading)
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center flex items-center justify-center h-80">
        <RefreshCw className="animate-spin text-indigo-500 w-6 h-6 mr-3" />
        <span className="text-gray-700 font-medium">
          Cargando tendencia de transacciones...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 p-8 rounded-xl shadow-lg text-center text-red-700 border border-red-400">
        ❌ Error crítico al cargar los datos:{" "}
        <span className="font-medium">{error}</span>
      </div>
    );

  if (chartData.length === 0)
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500 flex items-center justify-center h-80">
        <p className="text-xl">
          No hay transacciones registradas para calcular la tendencia.
        </p>
      </div>
    );

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 border border-gray-100 transition-all duration-300 hover:shadow-3xl">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        Evolución de Transacciones por Moneda
      </h2>

      {/* Indicadores de Crecimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        {CURRENCIES.map((currency) => {
          const growth = growthCalculations[currency];
          let growthColor = "text-gray-500";
          let growthIcon = null;
          let growthText = growth;

          if (chartData.length >= 2) {
            const numGrowth = parseFloat(growth);
            if (numGrowth > 0) {
              growthColor = "text-green-600 bg-green-50";
              growthIcon = <TrendingUp className="w-5 h-5" />;
              growthText = `+${growth}%`;
            } else if (numGrowth < 0) {
              growthColor = "text-red-600 bg-red-50";
              growthIcon = <TrendingDown className="w-5 h-5" />;
              growthText = `${growth}%`;
            } else if (numGrowth === 0) {
              growthColor = "text-gray-600 bg-gray-50";
              growthText = "0.00%";
            }
          } else if (growth === "Nuevo") {
            growthColor = "text-blue-600 bg-blue-50";
            growthText = "Nueva Moneda";
            growthIcon = <DollarSign className="w-5 h-5" />;
          }

          const hasTransactions = chartData.some(
            (d) => Number(d[currency] || 0) > 0
          );
          if (!hasTransactions) return null;

          return (
            <div
              key={currency}
              className={`p-4 rounded-lg shadow-md border ${growthColor} flex items-center justify-between transition-transform duration-300 hover:scale-[1.02]`}
            >
              <div>
                <span className="text-sm text-gray-700 block font-medium">
                  Evolución {currency}
                </span>
                <p className={`text-2xl font-extrabold flex items-center mt-1`}>
                  {growthText}
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${growthColor.split(" ")[1]} ${
                  growthColor.split(" ")[0]
                }`}
              >
                {growthIcon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
            <XAxis dataKey="day" stroke="#a0a0a0" tickLine={false} axisLine={{ stroke: '#cccccc' }} />
            <YAxis
              stroke="#a0a0a0"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `$${(value as number).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            {CURRENCIES.map((currency) => {
              const hasData = chartData.some((d) => Number(d[currency] || 0) > 0);
              return hasData ? (
                <Line
                  key={currency}
                  type="monotone"
                  dataKey={currency}
                  name={`Valor Total ${currency}`}
                  stroke={CURRENCY_COLORS[currency]}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                  activeDot={{ r: 7, strokeWidth: 3, fill: CURRENCY_COLORS[currency] }}
                />
              ) : null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
