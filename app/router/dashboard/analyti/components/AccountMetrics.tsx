"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
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
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart2,
  RefreshCw, // Usado para el estado de carga
} from "lucide-react";

// ----------------------------------------------------------------------
// TIPOS DE DATOS (Optimizados y sin PieChart)
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
  category: string;
  amount: string;
  createAt: string;
  description: string;
  card: CardFromApi | null;
}

interface TasaCambio {
  currency: string;
  rateToUSD: number;
}

interface DailyTrendData {
  date: string; // Formato YYYY-MM-DD
  Ingresos: number;
  Gastos: number;
  Balance: number;
}

// ----------------------------------------------------------------------
// UTILIDADES (Sin cambios)
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
  } catch {
    // Valores de fallback por si falla la API de tasas
    return { USD: 1, CUP: 0.002, EUR: 1.07, Savings: 0.004 }; 
  }
};

const translateTransactionType = (type: "deposit" | "withdrawal"): string =>
  type === "deposit" ? "Ingreso" : "Gasto";

const formatCategory = (category: string): string => {
  if (!category) return "Sin Categoría";
  const translations: Record<string, string> = {
    salary: "Salario",
    investment: "Inversión",
    bonus: "Bono",
    rent: "Alquiler",
    food_groceries: "Comestibles",
    entertainment: "Entretenimiento",
    transportation: "Transporte",
    shopping: "Compras",
    utilities: "Servicios",
    health: "Salud",
    education: "Educación",
  };
  return (
    translations[category.toLowerCase()] ||
    category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const formatCurrencyUSD = (amount: number | string): string => {
  const num = parseFloat(String(amount)) || 0;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ----------------------------------------------------------------------
// COMPONENTES DE VISUALIZACIÓN
// ----------------------------------------------------------------------

// Componente para la tabla de transacciones (sin cambios funcionales)
const TransactionTable = ({ transactions, toUSD }: { transactions: TransactionApi[], toUSD: (amount: string | number, currency: string) => number }) => {
    const recentTransactions = useMemo(
        () =>
          transactions
              .filter((tx) => tx.card?.account)
              .sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime())
              .slice(0, 20),
        [transactions]
    );

    return (
        <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3 border-b pb-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Transacciones Recientes
            </h2>

            <div className="overflow-x-auto h-[350px] custom-scrollbar">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            <th className="py-3 px-4">Tipo</th>
                            <th className="py-3 px-4">Categoría</th>
                            <th className="py-3 px-4 text-right">Monto Original</th>
                            <th className="py-3 px-4 text-right">Equivalente USD</th>
                            <th className="py-3 px-4">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentTransactions.map((tx) => {
                            if (!tx.card?.account) return null;
                            const currency = tx.card.account.type;
                            const amount = parseFloat(tx.amount) || 0;
                            const amountInUSD = toUSD(tx.amount, currency);
                            const isDeposit = tx.transactionType === "deposit";

                            return (
                                <tr key={tx.id} className="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                isDeposit
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {isDeposit ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                            {translateTransactionType(tx.transactionType)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700 font-medium">
                                        {formatCategory(tx.category)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-gray-600">
                                        {amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })} {currency}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                                        {formatCurrencyUSD(amountInUSD)}
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">
                                        {new Date(tx.createAt).toLocaleDateString("es-ES", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {recentTransactions.length === 0 && (
                     <div className="flex justify-center items-center py-10 text-gray-500">
                         No hay transacciones recientes para mostrar.
                     </div>
                )}
            </div>
        </>
    );
};

// Componente para el gráfico de tendencias (Eje X CORREGIDO)
const DailyTrendChart = ({ data }: { data: DailyTrendData[] }) => {
    const colors = {
        Ingresos: "#10B981", // green-500
        Gastos: "#EF4444", // red-500
        Balance: "#4F46E5", // indigo-600
    };

    // CORRECCIÓN: Tipado de CustomTooltip para eliminar 'any'
    interface TooltipPayload {
      name: string;
      value: number;
      color: string;
    }
    
    interface CustomTooltipProps {
      active?: boolean;
      payload?: TooltipPayload[];
      label?: string; // Corresponde al dataKey="date" (string)
    }

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length && label) {
            const dateObj = new Date(label);
            const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

            return (
                <div className="p-3 bg-white border border-gray-200 shadow-xl rounded-lg text-sm">
                    <p className="font-bold text-gray-700 mb-1">{formattedDate}</p>
                    {payload.map((p) => (
                        <p key={p.name} className="text-xs" style={{ color: p.color }}>
                            {p.name}: <span className="font-semibold">{formatCurrencyUSD(p.value)}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3 border-b pb-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Tendencia Diaria (USD)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#6b7280" 
                        angle={-20} 
                        textAnchor="end" 
                        height={50}
                        tickFormatter={(isoDate) => {
                            const dateObj = new Date(isoDate); 
                            return dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                        }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tickFormatter={(value: number) => `$${value.toFixed(0)}`}
                        domain={['auto', 'auto']}
                    />
                    {/* CORRECCIÓN: Pasa el componente CustomTooltip directamente */}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="Ingresos"
                        stroke={colors.Ingresos}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Gastos"
                        stroke={colors.Gastos}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Balance"
                        stroke={colors.Balance}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            {data.length === 0 && (
                <div className="flex justify-center items-center py-10 text-gray-500">
                    No hay suficientes datos históricos para la tendencia diaria.
                </div>
            )}
        </>
    );
};


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionApi[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>();
  const [isLoading, setIsLoading] = useState(true); // Renombrado a isLoading
  const [fetchError, setFetchError] = useState<string | null>(null); // Renombrado a fetchError

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rates, data] = await Promise.all([
        fetchInitialRates(),
        getTransaction(),
      ]);
      setExchangeRates(rates);
      setTransactions(data as unknown as TransactionApi[]);
    } catch (err) {
      console.error(err);
      setFetchError("Error al cargar datos financieros. Intente recargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toUSD = useCallback(
    (amount: string | number, currency: string): number => {
      const rate = exchangeRates?.[currency] || 0;
      return (parseFloat(String(amount)) || 0) * rate;
    },
    [exchangeRates]
  );


  // ----------------------------------------------------------------------
  // CÁLCULOS PRINCIPALES CON useMemo (sin cambios)
  // ----------------------------------------------------------------------

  const totalIncomeUSD = useMemo(
    () =>
      transactions.reduce(
        (sum, tx) =>
          tx.transactionType === "deposit" && tx.card?.account
            ? sum + toUSD(tx.amount, tx.card.account.type)
            : sum,
        0
      ),
    [transactions, toUSD]
  );

  const GLOBAL_GOAL_USD = totalIncomeUSD * 1.5 || 50000;
  const progressPercentage = Math.min(
    100,
    Math.round((totalIncomeUSD / GLOBAL_GOAL_USD) * 100)
  );

  const dailyTrendData = useMemo(() => {
    const dailyMap = new Map<string, { Ingresos: number; Gastos: number; Balance: number }>();

    transactions.forEach(tx => {
      if (!tx.card?.account) return;
      const currency = tx.card.account.type;
      
      const rawDate = new Date(tx.createAt);
      const dateKey = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`;
      
      const amountUSD = toUSD(tx.amount, currency);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { Ingresos: 0, Gastos: 0, Balance: 0 });
      }

      const dailyTotals = dailyMap.get(dateKey)!;

      if (tx.transactionType === "deposit") {
        dailyTotals.Ingresos += amountUSD;
        dailyTotals.Balance += amountUSD;
      } else {
        dailyTotals.Gastos += amountUSD;
        dailyTotals.Balance -= amountUSD;
      }
    });

    const sortedDates = Array.from(dailyMap.keys()).sort();

    return sortedDates.map(date => ({
      date: date, 
      ...dailyMap.get(date)!
    }));
  }, [transactions, toUSD]);


  // ----------------------------------------------------------------------
  // RENDERIZADO DE ESTADOS (Carga/Error)
  // ----------------------------------------------------------------------

  if (isLoading) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 flex items-center justify-center h-96">
            <RefreshCw className="animate-spin w-8 h-8 text-indigo-500 mr-3" />
            <p className="text-xl font-medium text-gray-700">Cargando datos financieros...</p>
        </div>
    );
  }

  if (fetchError) {
    return (
        <div className="bg-red-50 p-8 rounded-xl shadow-xl border border-red-300 text-center">
            <p className="text-xl font-semibold text-red-700">❌ Error de Conexión</p>
            <p className="text-sm text-red-600 mt-2">{fetchError}</p>
        </div>
    );
  }


  // ----------------------------------------------------------------------
  // RENDER PRINCIPAL
  // ----------------------------------------------------------------------

  return (
    <div className="p-4 lg:p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
        Dashboard Financiero 📊
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL 1: PROGRESO GLOBAL */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3 border-b pb-2">
                    <DollarSign className="w-5 h-5 text-indigo-500" />
                    Progreso de Meta Global
                </h2>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
                {/* Indicador Central de Porcentaje */}
                <div className="relative w-full text-center mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">PROGRESO ALCANZADO</p>
                    <span className="text-6xl font-extrabold text-indigo-600 drop-shadow-lg">
                        {progressPercentage}%
                    </span>
                    <p className="text-lg font-medium text-gray-600 mt-2">
                        {formatCurrencyUSD(totalIncomeUSD)}
                    </p>
                </div>
                
                {/* Barra de Progreso Lineal Estilizada */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className="mt-6 text-center space-y-2 border-t pt-4">
                <p className="text-base font-semibold text-gray-700">
                    Objetivo:{" "}
                    <span className="font-bold text-indigo-700 text-xl">
                        {formatCurrencyUSD(GLOBAL_GOAL_USD)}
                    </span>
                </p>
                {progressPercentage >= 100 && (
                    <p className="text-green-600 font-extrabold text-lg mt-3 bg-green-50 p-2 rounded-lg animate-pulse">
                        ¡Meta Alcanzada! 🎉 Sigue así.
                    </p>
                )}
                <p className="text-xs text-gray-400 mt-4">
                    Faltante: {formatCurrencyUSD(Math.max(0, GLOBAL_GOAL_USD - totalIncomeUSD))}
                </p>
            </div>
        </div>

        {/* PANEL 2: TENDENCIA DIARIA (Line Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <DailyTrendChart data={dailyTrendData} />
        </div>

      </div>

      {/* PANEL 3: HISTORIAL DE TRANSACCIONES (Tabla) */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <TransactionTable transactions={transactions} toUSD={toUSD} />
      </div>
    </div>
  );
}