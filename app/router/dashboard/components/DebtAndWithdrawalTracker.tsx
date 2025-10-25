"use client";
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
} from "recharts";

// Tipos y datos de ejemplo
interface Transaction {
  id: string;
  amount: number | string;
  category: string;
  transactionType: "deposit" | "withdraw";
  description: string;
  date: string;
}

type UserTransaction = Transaction;

const mockTransactions: UserTransaction[] = [
  { id: "t1", amount: 3500, category: "Salario", transactionType: "deposit", description: "Nómina mensual", date: "2025-10-01" },
  { id: "t2", amount: 1200, category: "Alquiler", transactionType: "withdraw", description: "Renta mensual", date: "2025-10-05" },
  { id: "t3", amount: 800, category: "Comida", transactionType: "withdraw", description: "Supermercado", date: "2025-10-09" },
  { id: "t4", amount: 400, category: "Inversiones", transactionType: "deposit", description: "Dividendos", date: "2025-10-10" },
  { id: "t5", amount: 250, category: "Transporte", transactionType: "withdraw", description: "Gasolina", date: "2025-10-14" },
  { id: "t6", amount: 100, category: "Entretenimiento", transactionType: "withdraw", description: "Spotify / Netflix", date: "2025-10-17" },
];

const getTransaction = (): Promise<UserTransaction[]> =>
  new Promise((resolve) => setTimeout(() => resolve(mockTransactions), 1200));

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={`${className} animate-spin`}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// Paleta de colores moderna
const CATEGORY_COLORS = [
  "#6366F1", "#06B6D4", "#F59E0B", "#EF4444", "#10B981",
  "#8B5CF6", "#EC4899", "#3B82F6", "#14B8A6", "#F97316",
];
const COLORS = {
  POSITIVE: "#16A34A",
  NEGATIVE: "#DC2626",
};

// Procesamiento de transacciones
function processTransactions(data: UserTransaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  const incomeTotals: Record<string, number> = {};
  const expenseTotals: Record<string, number> = {};

  data.forEach((t) => {
    const amount = parseFloat(String(t.amount)) || 0;
    if (t.transactionType === "deposit") {
      totalIncome += amount;
      incomeTotals[t.category] = (incomeTotals[t.category] || 0) + amount;
    } else {
      totalExpense += amount;
      expenseTotals[t.category] = (expenseTotals[t.category] || 0) + amount;
    }
  });

  const netBalance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    incomeData: Object.entries(incomeTotals).map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })),
    expenseData: Object.entries(expenseTotals).map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[(i + 5) % CATEGORY_COLORS.length],
    })),
    balanceData: [
      { name: "Ingresos", value: totalIncome, color: COLORS.POSITIVE },
      { name: "Gastos", value: totalExpense, color: COLORS.NEGATIVE },
    ],
  };
}

// Etiqueta del gráfico
const CustomPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  const r = Number(outerRadius ?? 0) * 0.7;
  const x = Number(cx ?? 0) + r * Math.cos(-Number(midAngle ?? 0) * (Math.PI / 180));
  const y = Number(cy ?? 0) + r * Math.sin(-Number(midAngle ?? 0) * (Math.PI / 180));
  const percentage = Number(percent ?? 0) * 100;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {percentage.toFixed(0)}%
    </text>
  );
};

// Componente principal
export default function FinancialCompositionAnalysis() {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransaction().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const { totalIncome, totalExpense, netBalance, incomeData, expenseData, balanceData } =
    processTransactions(transactions);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl shadow-md border border-gray-100">
        <Loader2 className="w-10 h-10 text-indigo-500" />
        <p className="mt-3 text-gray-600 font-medium">Cargando datos financieros...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 p-6 md:p-10 rounded-3xl shadow-2xl border border-indigo-100">
      <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">📊 Análisis Financiero Personal</h2>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-md border-l-4 border-green-500 text-center hover:scale-105 transition">
          <h3 className="text-sm text-green-700 uppercase font-semibold">Ingresos</h3>
          <p className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-md border-l-4 border-red-500 text-center hover:scale-105 transition">
          <h3 className="text-sm text-red-700 uppercase font-semibold">Gastos</h3>
          <p className="text-3xl font-bold text-red-600">${totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-md border-l-4 border-blue-500 text-center hover:scale-105 transition">
          <h3 className="text-sm text-blue-700 uppercase font-semibold">Balance Neto</h3>
          <p
            className={`text-3xl font-bold ${
              netBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ingresos */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-gray-100 hover:shadow-lg transition">
          <h4 className="text-center text-indigo-700 font-semibold mb-3">Ingresos por Categoría</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={incomeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={CustomPieLabel}>
                {incomeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gastos */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-gray-100 hover:shadow-lg transition">
          <h4 className="text-center text-indigo-700 font-semibold mb-3">Gastos por Categoría</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={CustomPieLabel}>
                {expenseData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Balance */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-gray-100 hover:shadow-lg transition">
          <h4 className="text-center text-indigo-700 font-semibold mb-3">Balance General</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={balanceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={CustomPieLabel}>
                {balanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
