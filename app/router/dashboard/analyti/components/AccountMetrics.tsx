"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { getTasasCambio } from "@/lib/tasaCambioService";

// ----------------------------------------------------------------------
// TIPOS DE DATOS
// ----------------------------------------------------------------------

type Currency = string;

interface AccountFromApi {
  id: number;
  name: string;
  type: Currency;
  balance: string;
  createAt: string;
  deletedAt: string | null;
}

interface CardFromApi {
  id: number;
  number: string;
  account: AccountFromApi;
  deletedAt: string | null;
  balance: string;
}

export interface TransactionApi {
  id: number;
  transactionType: "deposit" | "withdrawal";
  amount: string;
  createAt: string;
  description: string;
  card: CardFromApi | null;
}

interface DailyTrendData {
  date: string;
  [currency: string]: number | string;
}

interface TasaCambio {
  currency: string;
  rateToUSD: number;
}

// ----------------------------------------------------------------------
// FUNCIÓN PARA CARGAR TASAS DE CAMBIO
// ----------------------------------------------------------------------

const fetchInitialRates = async (): Promise<Record<string, number>> => {
  try {
    const tasas: TasaCambio[] = await getTasasCambio();
    const ratesObject: Record<string, number> = {};

    tasas.forEach((tasa) => {
      if (tasa.rateToUSD && tasa.rateToUSD > 0) {
        ratesObject[tasa.currency] = tasa.rateToUSD;
      }
    });

    ratesObject["USD"] = 1;
    return ratesObject;
  } catch (error) {
    console.error("Error al obtener tasas dinámicas:", error);
    return {
      USD: 1,
      CUP: 1 / 467,
      EUR: 1 / 0.8,
      Savings: 1 / 250,
    };
  }
};

// ----------------------------------------------------------------------
// FUNCIÓN PARA PROCESAR DATOS DE TENDENCIA
// ----------------------------------------------------------------------

const getTrendData = (
  transactions: TransactionApi[],
  rates: Record<string, number>
): { trend: DailyTrendData[]; growth: Record<string, number> } => {
  const dailyTotals: Record<string, DailyTrendData> = {};

  transactions.forEach((tx) => {
    if (tx.transactionType !== "deposit" || !tx.card?.account) return;

    const dateKey = new Date(tx.createAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const amountNum = parseFloat(tx.amount) || 0;
    const currency = tx.card.account.type;
    const rate = rates[currency] || 0;
    const amountInUSD = amountNum * rate;

    if (!dailyTotals[dateKey]) dailyTotals[dateKey] = { date: dateKey };
    const currentTotal = (dailyTotals[dateKey][currency] as number) || 0;
    dailyTotals[dateKey][currency] = currentTotal + amountInUSD;
  });

  const trend = Object.values(dailyTotals).sort((a, b) => {
    const [d1, m1, y1] = (a.date as string).split("/").map(Number);
    const [d2, m2, y2] = (b.date as string).split("/").map(Number);
    return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
  });

  const growth: Record<string, number> = {};
  const allCurrencies = new Set<string>();

  trend.forEach((item) => {
    Object.keys(item)
      .filter((k) => k !== "date")
      .forEach((currency) => allCurrencies.add(currency));
  });

  allCurrencies.forEach((currency) => {
    const dailyValues = trend.map((d) => (d[currency] as number) || 0).filter((val) => val > 0);
    if (dailyValues.length >= 2) {
      const firstValue = dailyValues[0];
      const lastValue = dailyValues[dailyValues.length - 1];
      growth[currency] = ((lastValue - firstValue) / firstValue) * 100;
    } else {
      growth[currency] = 0;
    }
  });

  return { trend, growth };
};

// ----------------------------------------------------------------------
// LABEL PARA EL GRÁFICO DE DONA
// ----------------------------------------------------------------------

type LabelProps = { cx?: number | string; cy?: number | string; progressPercentage: number };

const RenderGlobalLabel = ({ cx, cy, progressPercentage }: LabelProps) => {
  if (cx === undefined || cy === undefined) return null;
  const numericCy = Number(cy);

  return (
    <>
      <text x={cx} y={numericCy - 10} textAnchor="middle" className="text-sm fill-gray-500">
        META GLOBAL (USD)
      </text>
      <text x={cx} y={numericCy + 15} textAnchor="middle" className="text-3xl font-bold fill-gray-800">
        {progressPercentage}%
      </text>
    </>
  );
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionApi[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utilidad para convertir montos a USD
  const toUSD = useCallback(
    (amount: string | number, currency: string): number => {
      const rate = exchangeRates?.[currency] || 0;
      return (parseFloat(String(amount)) || 0) * rate;
    },
    [exchangeRates]
  );

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

  // ----------------------------------------------------------------------
  // CÁLCULOS Y MÉTRICAS
  // ----------------------------------------------------------------------

  const totalIncomeUSD = useMemo(() => {
    return transactions.reduce<number>((sum, tx) => {
      if (tx.transactionType !== "deposit" || !tx.card?.account) return sum;
      return sum + toUSD(tx.amount, tx.card.account.type);
    }, 0);
  }, [transactions, toUSD]);

  let GLOBAL_GOAL_USD = 50000;

  if (transactions.length > 0) {
    const firstAccount = transactions[0]?.card?.account;
    if (firstAccount) {
      const balanceInUSD = toUSD(firstAccount.balance, firstAccount.type);
      GLOBAL_GOAL_USD = Math.max(balanceInUSD * 0.1, 1);
    }
  }

  const progressPercentage = GLOBAL_GOAL_USD === 0
    ? 100
    : Math.min(100, Math.round((totalIncomeUSD / GLOBAL_GOAL_USD) * 100));

  const progressColor = progressPercentage >= 100 ? "#10b981" : "#2563eb";
  const donutData = [
    { name: "Progreso", value: progressPercentage, fill: progressColor },
    { name: "Restante", value: Math.max(0, 100 - progressPercentage), fill: "#e5e7eb" },
  ];

  // Calcular tendencia y crecimiento solo cuando haya datos o tasas nuevas
  const { trend: trendData, growth: growthRates } = useMemo(() => {
    if (!exchangeRates) return { trend: [], growth: {} };
    return getTrendData(transactions, exchangeRates);
  }, [transactions, exchangeRates]);

  // Selección automática de la moneda más usada
  const chartCurrency =
    Object.keys(growthRates).find((c) => growthRates[c] !== undefined) || "USD";

  const currentTrendData = trendData.filter((d) => (d[chartCurrency] as number) > 0);
  const chartGrowth = growthRates[chartCurrency] ?? 0;
  const hasEnoughTrendData = currentTrendData.length >= 2;

  const growthColorClass = chartGrowth > 0 ? "text-green-600" : "text-red-600";
  const growthSign = chartGrowth > 0 ? "▲" : "▼";

  // ----------------------------------------------------------------------
  // ESTADOS DE RENDERIZADO
  // ----------------------------------------------------------------------

  if (loading || !exchangeRates)
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-lg">
        <p className="text-gray-500">Cargando datos y tasas de cambio...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md border border-red-300">
        <p className="font-semibold text-red-700">Error al cargar el historial:</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );

  if (transactions.length === 0)
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-lg">
        <p className="text-gray-500 text-lg">No hay transacciones registradas.</p>
        <p className="text-gray-400 text-sm">Empieza a depositar para ver tu progreso.</p>
      </div>
    );

  // ----------------------------------------------------------------------
  // RENDER PRINCIPAL
  // ----------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* --- PROGRESO GLOBAL --- */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <h2 className="text-xl font-bold text-blue-700 mb-4">
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
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Label
              content={(props) => RenderGlobalLabel({ ...props, progressPercentage })}
              position="center"
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Ingreso Total (USD):{" "}
            <span className="font-bold text-gray-800 ml-1">
              ${totalIncomeUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Objetivo Global (10% del Balance):{" "}
            <span className="font-bold text-blue-600 ml-1">
              ${GLOBAL_GOAL_USD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
          {progressPercentage >= 100 && (
            <p className="text-sm font-bold text-green-600 mt-2">¡Meta Global Superada! 🎉</p>
          )}
        </div>
      </div>

      {/* --- TENDENCIA DIARIA --- */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tendencia Diaria ({chartCurrency} en USD)
        </h2>

        <div className="flex items-baseline mb-4">
          <span className="text-sm text-gray-500 mr-2">Crecimiento:</span>
          <span className={`text-2xl font-bold ${growthColorClass}`}>
            {hasEnoughTrendData ? `${chartGrowth.toFixed(2)}% ${growthSign}` : "N/A"}
          </span>
        </div>

        {hasEnoughTrendData ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey={chartCurrency} stroke="#8884d8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-[250px] w-full border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-center p-4">
              Se requiere al menos 2 puntos de datos para calcular la tendencia.
            </p>
          </div>
        )}
      </div>

      {/* --- HISTORIAL DE TRANSACCIONES --- */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Historial de Transacciones Recientes
        </h2>

        <div className="overflow-x-auto h-[350px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 px-1">Monto</th>
                <th className="py-2 px-1">Divisa</th>
                <th className="py-2 px-1">Valor USD</th>
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
                  if (!tx.card?.account) return null;
                  const currency = tx.card.account.type;
                  const amountNum = parseFloat(tx.amount) || 0;
                  const amountInUSD = toUSD(tx.amount, currency);

                  return (
                    <tr key={tx.id} className="border-b text-gray-700 hover:bg-gray-50">
                      <td className="py-2 px-1 font-semibold">
                        {amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-1">{currency}</td>
                      <td className="py-2 px-1 text-blue-600 font-medium">
                        ${amountInUSD.toFixed(2)}
                      </td>
                      <td className="py-2 px-1">
                        {new Date(tx.createAt).toLocaleDateString()}
                      </td>
                      <td
                        className={`py-2 px-1 font-medium ${
                          tx.transactionType === "deposit" ? "text-green-600" : "text-red-600"
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
