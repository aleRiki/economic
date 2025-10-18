"use client";
import { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { getTransaction } from "@/lib/auth-service";

// ----------------------------------------------------------------------
// TIPOS DE DATOS
// ----------------------------------------------------------------------

type Currency = string;

// Definiciones de tipos de la API (Asegúrate de que coincidan con tu archivo auth-service)
type AccountFromApi = {
  id: number;
  name: string;
  type: Currency;
  balance: string;
  createAt: string;
  deletedAt: string | null;
};
type CardFromApi = {
  id: number;
  number: string;
  account: AccountFromApi;
  deletedAt: string | null;
  balance: string;
};
export type TransactionApi = {
  id: number;
  transactionType: "deposit" | "withdrawal" | string;
  amount: string;
  createAt: string;
  description: string;
  card: CardFromApi | null; // Se agregó | null para seguridad
};

// Tipo para los datos del gráfico de tendencia
type DailyTrendData = {
  date: string;
  [currency: string]: number | string;
};

// ----------------------------------------------------------------------
// TASAS DE CAMBIO POR DEFECTO Y FUNCIÓN DE CARGA (SIMULADA)
// ----------------------------------------------------------------------

const fetchInitialRates = async (): Promise<Record<string, number>> => {
  return {
    USD: 1,
    CUP: 1 / 467,
    EUR: 1 / 0.8,
    Savings: 1 / 250,
    Euro: 1 / 0.8,
  };
};

// ----------------------------------------------------------------------
// FUNCIÓN DE PROCESAMIENTO DE DATOS PARA TENDENCIA
// ----------------------------------------------------------------------

const getTrendData = (
  transactions: TransactionApi[],
  rates: Record<string, number>
): { trend: DailyTrendData[]; growth: Record<string, number> } => {
  const dailyTotals: Record<string, DailyTrendData> = {};

  // Guardamos un historial de valores diarios CONSOLIDADOS para el cálculo de crecimiento
  const dailyConsolidatedValues: Record<string, number> = {}; // ⚠️ Advertencia de variable no usada (la mantengo, pero es buena idea eliminarla si no la usas)

  transactions.forEach((tx) => {
    if (tx.transactionType !== "deposit" || !tx.card || !tx.card.account) {
      return;
    }

    // Usamos toLocaleDateString para agrupar por día (formato DD/MM/AAAA)
    const dateKey = new Date(tx.createAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const amountNum = parseFloat(tx.amount) || 0;
    const currency = tx.card.account.type;
    const rate = rates[currency] || 0;

    const amountInUSD = amountNum * rate;

    // 1. Acumulación Diaria por Moneda
    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = { date: dateKey };
    }
    const currentTotal = (dailyTotals[dateKey][currency] as number) || 0;
    dailyTotals[dateKey][currency] = currentTotal + amountInUSD;
  });

  // Convertir a Array y Ordenar por Fecha
  const trend = Object.values(dailyTotals);
  // Ordenar correctamente las fechas (necesario si la API no devuelve en orden)
  trend.sort((a, b) => {
    const [d1, m1, y1] = (a.date as string).split("/").map(Number);
    const [d2, m2, y2] = (b.date as string).split("/").map(Number);
    return (
      new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()
    );
  });

  // 2. Cálculo de Crecimiento (Growth)
  const growth: Record<string, number> = {};

  // Identificar todas las monedas presentes en la data de tendencia
  const allCurrencies = new Set<string>();
  trend.forEach((item) => {
    Object.keys(item)
      .filter((k) => k !== "date")
      .forEach((currency) => allCurrencies.add(currency));
  });

  allCurrencies.forEach((currency) => {
    const dailyValues = trend
      .map((d) => (d[currency] as number) || 0)
      .filter((val) => val > 0); // Solo días con depósitos

    if (dailyValues.length >= 2) {
      const firstValue = dailyValues[0];
      const lastValue = dailyValues[dailyValues.length - 1];

      if (firstValue > 0) {
        growth[currency] = ((lastValue - firstValue) / firstValue) * 100;
      } else {
        growth[currency] = 0;
      }
    } else {
      growth[currency] = 0; // No hay suficientes puntos
    }
  });

  return { trend, growth };
};

type LabelProps = { cx?: number | string; cy?: number | string };

const RenderGlobalLabel = ({
  cx,
  cy,
  progressPercentage,
}: LabelProps & { progressPercentage: number }) => {
  if (cx === undefined || cy === undefined) return null;

  const numericCy = Number(cy);

  return (
    <>
      <text
        x={cx}
        y={numericCy - 10}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm fill-gray-500"
      >
        META GLOBAL (USD)
      </text>
      <text
        x={cx}
        y={numericCy + 15}
        textAnchor="middle"
        dominantBaseline="central"
        className={`text-3xl font-bold fill-gray-800`}
      >
        {progressPercentage}%
      </text>
    </>
  );
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionApi[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<
    string,
    number
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const ratesData = await fetchInitialRates();
      setExchangeRates(ratesData);
    } catch (err) {
      console.error("Error fetching rates:", err);
      setError("Error al cargar las tasas de cambio.");
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getTransaction();
      // LA CORRECCIÓN ESTÁ AQUÍ
      setTransactions(data as TransactionApi[]); 
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchRates(), fetchTransactions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchRates, fetchTransactions]);

  const CONVERSION_RATES = exchangeRates || {};

  // --- CÁLCULO DE MÉTRICAS ---

  // 1. Cálculo de Ingresos Totales
  const totalIncomeUSD = transactions.reduce<number>((sum, tx) => {
    if (tx.transactionType !== "deposit" || !tx.card || !tx.card.account) {
      return sum;
    }
    const amountNum = parseFloat(tx.amount) || 0;
    const currency = tx.card.account.type;

    if (currency && CONVERSION_RATES[currency]) {
      const rate = CONVERSION_RATES[currency];
      const amountInUSD = amountNum * rate;
      return sum + amountInUSD;
    }
    return sum;
  }, 0);

  // 2. Cálculo del Objetivo Global
  let GLOBAL_GOAL_USD = 50000;

  if (transactions.length > 0) {
    const firstTransactionCard = transactions[0]?.card;
    if (firstTransactionCard && firstTransactionCard.account) {
      const firstAccount = firstTransactionCard.account;
      const accountBalance = parseFloat(firstAccount.balance) || 0;
      const accountCurrency = firstAccount.type;
      const rate = CONVERSION_RATES[accountCurrency] || 0;

      const balanceInUSD = accountBalance * rate;
      GLOBAL_GOAL_USD = balanceInUSD * 0.1;

      if (GLOBAL_GOAL_USD < 1) {
        GLOBAL_GOAL_USD = 1;
      }
    }
  }

  // 3. Cálculo de Progreso
  const calculateProgress = (current: number, goal: number) => {
    if (goal === 0) return 100;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  const progressPercentage = calculateProgress(totalIncomeUSD, GLOBAL_GOAL_USD);
  const progressColor = progressPercentage >= 100 ? "#10b981" : "#2563eb";

  const donutData = [
    { name: "Progreso", value: progressPercentage, fill: progressColor },
    {
      name: "Restante",
      value: Math.max(0, 100 - progressPercentage),
      fill: "#e5e7eb",
    },
  ];

  // 4. Cálculo de Tendencia (Gráfico Nuevo)
  const { trend: trendData, growth: growthRates } = getTrendData(
    transactions,
    CONVERSION_RATES
  );

  // Seleccionar la moneda a graficar (ej: la más frecuente o la que tiene data)
  const chartCurrency = "CUP"; // Puedes cambiar esto a 'EUR' o 'Savings'
  const currentTrendData = trendData.filter(
    (d) => (d[chartCurrency] as number) > 0
  );
  const chartGrowth = growthRates[chartCurrency];

  const hasEnoughTrendData = currentTrendData.length >= 2;
  const growthColorClass = chartGrowth > 0 ? "text-green-600" : "text-red-600";
  const growthSign = chartGrowth > 0 ? "▲" : "▼";

  // --- ESTADOS DE RENDERIZADO ---
  if (loading || !exchangeRates) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-lg">
        <p className="text-gray-500">Cargando datos y tasas de cambio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md border border-red-300">
        <p className="font-semibold text-red-700">
          Error al cargar el historial:
        </p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-lg">
        <p className="text-gray-500 text-lg">
          No hay transacciones registradas.
        </p>
        <p className="text-gray-400 text-sm">
          Empieza a depositar para ver tu progreso.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col items-center h-full">
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
          Progreso Consolidado Hacia Meta Global
        </h2>

        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={donutData}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>

            <Label
              content={(props) =>
                RenderGlobalLabel({ ...props, progressPercentage })
              }
              position="center"
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 w-full text-center">
          <p className="text-sm text-gray-600">
            Ingreso Total (Equivalente USD):
            <span className="font-bold text-gray-800 ml-1">
              $
              {totalIncomeUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Objetivo Global (10% del Balance):
            <span className="font-bold text-blue-600 ml-1">
              $
              {GLOBAL_GOAL_USD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          {progressPercentage >= 100 && (
            <p className="text-sm font-bold text-green-600 mt-2">
              ¡Meta Global Superada! 🎉
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col items-center h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tendencia Diaria de Valor de Transacciones por Moneda ({chartCurrency}{" "}
          en USD)
        </h2>

        <div className="flex items-baseline mb-4">
          <span className="text-sm text-gray-500 mr-2">
            Crecimiento {chartCurrency}:
          </span>
          <span className={`text-2xl font-bold ${growthColorClass}`}>
            {hasEnoughTrendData ? `${chartGrowth.toFixed(2)}%` : "N/A"}
            <span className="ml-1">{hasEnoughTrendData ? growthSign : ""}</span>
          </span>
        </div>

        {/* Renderizado Condicional del Gráfico */}
        {hasEnoughTrendData ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name,
                ]}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Legend />

              {/* Graficamos la moneda seleccionada */}
              <Line
                type="monotone"
                dataKey={chartCurrency}
                stroke="#8884d8"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-[250px] w-full border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-center p-4">
              Se requiere al menos 2 puntos de datos para calcular el
              crecimiento y la tendencia.
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Historial de Transacciones Recientes
        </h2>

        <div className="overflow-x-auto h-[350px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 px-1">Monto (Original)</th>
                <th className="py-2 px-1">Divisa</th>
                <th className="py-2 px-1">Valor en USD</th>
                <th className="py-2 px-1">Fecha</th>
                <th className="py-2 px-1">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .slice()
                .reverse()
                .slice(0, 30)
                .map((tx) => {
                  if (!tx.card || !tx.card.account) {
                    return null;
                  }

                  const currency = tx.card.account.type;
                  const rate = CONVERSION_RATES[currency] || 0;
                  const amountNum = parseFloat(tx.amount) || 0;
                  const amountInUSD = amountNum * rate;

                  return (
                    <tr
                      key={tx.id}
                      className="border-b text-gray-700 hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-1 font-semibold">
                        {amountNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2 px-1">{currency}</td>
                      <td className="py-2 px-1 text-xs text-blue-600 font-medium">
                        ${amountInUSD.toFixed(2)}
                      </td>
                      <td className="py-2 px-1">
                        {new Date(tx.createAt).toLocaleDateString()}
                      </td>
                      <td
                        className={`py-2 px-1 font-medium ${
                          tx.transactionType === "deposit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.transactionType.toUpperCase()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}