"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState, useEffect, useCallback } from "react";
// Asumo que getTransaction proviene de tu servicio
import { getTransaction } from "@/lib/auth-service";

// -----------------------------------------------------------
// TIPOS Y UTILIDADES
// -----------------------------------------------------------

// 1. Declaramos las monedas como tupla literal para tipado fuerte
const CURRENCIES = ["USD", "EUR", "CUP"] as const;
type Currency = (typeof CURRENCIES)[number];

// Interfaz mínima para el tipo de datos que esperamos de la API de transacciones
interface MinimalTransaction {
  createAt: string; // Para agrupar por día
  amount: string; // Para parsear el monto
  card:
    | {
        account: {
          type: Currency; // Para agrupar por moneda
        };
      }
    | null
    | undefined;
}

// Colores asignados a cada moneda
const CURRENCY_COLORS: Record<Currency, string> = {
  USD: "#2563eb", // Azul
  EUR: "#10b981", // Verde
  CUP: "#ef4444", // Rojo
};

// Tipo para los datos de cada punto del gráfico
type TrendData = {
  day: string;
} & {
  [key in Currency]?: number;
};

/**
 * Procesa la lista de transacciones para agrupar el valor total por DÍA y moneda.
 * @param transactions - Array de transacciones obtenidas de la API.
 */
const aggregateTrendData = (
  transactions: MinimalTransaction[]
): TrendData[] => {
  const dailyData: Record<string, Record<Currency, number>> = {} as Record<
    string,
    Record<Currency, number>
  >;

  transactions.forEach((tx) => {
    const date = new Date(tx.createAt);
    const dayKey = date.toISOString().split("T")[0]; // Ej. "2025-10-16"
    // Acceso seguro a las propiedades anidadas
    const currency = tx.card?.account?.type;
    const amount = parseFloat(tx.amount);

    if (currency && CURRENCIES.includes(currency) && !isNaN(amount)) {
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {} as Record<Currency, number>;
      }
      dailyData[dayKey][currency] = (dailyData[dayKey][currency] || 0) + amount;
    }
  });

  // Ordenamos cronológicamente los días
  const sortedDayKeys = Object.keys(dailyData).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Formateamos para Recharts
  const chartData: TrendData[] = sortedDayKeys.map((dayKey) => {
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
  });

  // Filtramos días sin actividad
  return chartData.filter((d) => CURRENCIES.some((c) => Number(d[c] || 0) > 0));
};

/**
 * Calcula el crecimiento porcentual del primer al último punto de datos.
 */
function calculateGrowth(data: TrendData[], key: Currency): string {
  if (data.length < 2) return "N/A";

  // Uso seguro de optional chaining en la desestructuración de TrendData
  const lastValue = data[data.length - 1][key] || 0;
  const firstValue = data[0][key] || 0;

  if (firstValue === 0) {
    return lastValue > 0 ? "Nuevo" : "N/A";
  }

  const growth = ((lastValue - firstValue) / firstValue) * 100;
  return growth.toFixed(2);
}

// -----------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------

export default function AccountTrends() {
  const [chartData, setChartData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // CORRECCIÓN DE TIPADO: Forzamos el tipado
      const transactions = (await getTransaction()) as MinimalTransaction[];
      const processedData = aggregateTrendData(transactions);
      setChartData(processedData);
    } catch (err: unknown) {
      console.error("Error al obtener las transacciones:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos de la tendencia.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcular crecimiento con los datos reales
  const growthCalculations: Record<Currency, string> = {
    USD: calculateGrowth(chartData, "USD"),
    EUR: calculateGrowth(chartData, "EUR"),
    CUP: calculateGrowth(chartData, "CUP"),
  };

  // -----------------------------------------------------------
  // RENDERIZADO
  // -----------------------------------------------------------

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
        Cargando tendencia de transacciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow text-center text-red-600 border border-red-300">
        ❌ Error al cargar los datos: {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
        No hay transacciones registradas para calcular la tendencia.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Tendencia Diaria de Valor de Transacciones por Moneda
      </h2>

      {/* Indicadores de Crecimiento */}
      <div className="flex justify-around border-b pb-3 flex-wrap">
        {CURRENCIES.map((currency) => {
          const growth = growthCalculations[currency];
          let growthColor = "text-gray-500";
          let growthText = growth;

          if (chartData.length < 2) {
            growthText = "N/A";
            growthColor = "text-gray-500";
          } else if (growth === "Nuevo") {
            growthColor = "text-blue-600";
            growthText = "Nuevo";
          } else if (parseFloat(growth) > 0) {
            growthColor = "text-green-600";
            growthText = `${growth}% ↑`;
          } else if (parseFloat(growth) < 0) {
            growthColor = "text-red-600";
            growthText = `${growth}% ↓`;
          } else if (growth === "N/A") {
            growthText = "N/A";
          }

          const hasTransactions = chartData.some(
            (d) => Number(d[currency] || 0) > 0
          );
          if (!hasTransactions) return null;

          return (
            <div key={currency} className="text-center p-2">
              <span className="text-xs text-gray-500 block">
                Crecimiento {currency}
              </span>
              <p className={`text-xl font-bold ${growthColor}`}>
                {growthText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="day" />
          <YAxis
            tickFormatter={(value) =>
              `$${(value as number).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}`
            }
          />
          <Tooltip
            formatter={(value, name) => [
              `$${(value as number).toLocaleString()}`,
              name,
            ]}
          />
          <Legend />

          {CURRENCIES.map((currency) => {
            const hasData = chartData.some(
              (d) => Number(d[currency] || 0) > 0
            );
            return hasData ? (
              <Line
                key={currency}
                type="monotone"
                dataKey={currency}
                name={`Valor Total ${currency}`}
                stroke={CURRENCY_COLORS[currency]}
                strokeWidth={2}
                dot={true}
              />
            ) : null;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}