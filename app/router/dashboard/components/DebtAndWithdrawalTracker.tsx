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

// 🚨 IMPORTACIÓN REQUERIDA (Asume que la ruta es correcta)
import {
  getTransaction,
  ProcessedUserTransaction,
  TransactionCategoryType,
} from "@/lib/auth-service";

// --- TIPOS ---
type UserTransaction = ProcessedUserTransaction;
// Definimos categorías conocidas para ayudar en la reclasificación
// Aunque tu backend solo usa 'salary', 'transportation', 'entertainment', y 'other_expense',
// incluimos 'other_income' para la corrección lógica.
const KNOWN_INCOME_CATEGORIES: TransactionCategoryType[] = [
    "salary",
    "investment",
    "bonus",
    "refund",
    "other_income", // Usaremos esta para los ingresos mal clasificados
];


// Loader2 (Mantener para el estado de carga)
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


// Paleta de colores moderna (sin cambios)
const CATEGORY_COLORS = [
  "#6366F1", "#06B6D4", "#F59E0B", "#EF4444", "#10B981",
  "#8B5CF6", "#EC4899", "#3B82F6", "#14B8A6", "#F97316",
];
const COLORS = {
  POSITIVE: "#16A34A",
  NEGATIVE: "#DC2626",
};

// --- FUNCIÓN DE PROCESAMIENTO CORREGIDA ---
function processTransactions(data: UserTransaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  const incomeTotals: Record<string, number> = {};
  const expenseTotals: Record<string, number> = {};

  // Función de utilidad para mejorar la presentación de la categoría
  const formatCategoryName = (category: TransactionCategoryType | string): string => {
    // Reemplaza guiones bajos por espacios y capitaliza la primera letra
    return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
    
  data.forEach((t) => {
    // Aseguramos que amount sea number
    const amount = t.amount || 0;
    
    // Estandarizar la clave de la categoría
    const rawCategoryKey = (t.category as string || "other_expense").toLowerCase().trim().replace(/\s/g, '_'); 

    if (t.transactionType === "deposit") {
      totalIncome += amount;
      
      // 🚨 CORRECCIÓN LÓGICA: 
      // Si el backend envía un depósito con una categoría de gasto (como 'other_expense'),
      // lo reclasificamos para el frontend como 'other_income'.
      const finalIncomeCategory = KNOWN_INCOME_CATEGORIES.includes(rawCategoryKey as TransactionCategoryType)
          ? rawCategoryKey
          : "other_income"; 

      incomeTotals[finalIncomeCategory] = (incomeTotals[finalIncomeCategory] || 0) + amount;
      
    } else { // Asumimos que "withdraw" es el otro tipo
      totalExpense += amount;
      
      // Para los gastos, si el backend accidentalmente lo clasifica con una categoría de Ingreso, 
      // lo reclasificamos a 'other_expense'.
      const finalExpenseCategory = !KNOWN_INCOME_CATEGORIES.includes(rawCategoryKey as TransactionCategoryType)
          ? rawCategoryKey
          : "other_expense"; 

      expenseTotals[finalExpenseCategory] = (expenseTotals[finalExpenseCategory] || 0) + amount;
    }
  });

  const netBalance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    incomeData: Object.entries(incomeTotals).map(([name, value], i) => ({
      name: formatCategoryName(name),
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })),
    expenseData: Object.entries(expenseTotals).map(([name, value], i) => ({
      name: formatCategoryName(name),
      value,
      // Usamos un offset para que los gastos tengan colores diferentes a los ingresos
      color: CATEGORY_COLORS[(i + 5) % CATEGORY_COLORS.length], 
    })),
    balanceData: [
      // Incluimos ambos valores incluso si uno es cero, para que el gráfico de Balance General se dibuje.
      { name: "Ingresos", value: totalIncome, color: COLORS.POSITIVE },
      { name: "Gastos", value: totalExpense, color: COLORS.NEGATIVE },
    ],
  };
}

// Etiqueta del gráfico (sin cambios)
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

  // Solo mostrar la etiqueta si el porcentaje es significativo
  if (percentage < 3) return null; 

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
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    getTransaction()
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        // Si el error es una falta de token, mostramos un mensaje específico
        const errorMessage = (err as Error).message.includes("Token") 
            ? "Error: No se encontró el token de sesión. Por favor, inicie sesión."
            : "Error al cargar datos: " + (err as Error).message;
        setError(errorMessage);
        setLoading(false);
      });
  }, []);

  const { totalIncome, totalExpense, netBalance, incomeData, expenseData, balanceData } =
    processTransactions(transactions);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
        <Loader2 className="w-10 h-10 text-indigo-500" />
        <p className="mt-3 text-gray-700 font-medium">Cargando datos financieros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-red-50/70 backdrop-blur-md rounded-2xl shadow-xl border border-red-300 p-8">
        <p className="text-xl font-bold text-red-700">¡Error de API!</p>
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        <p className="mt-4 text-xs text-gray-500">Asegúrate de que el backend esté activo y que el token de autenticación sea válido.</p>
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
          <p className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-md border-l-4 border-red-500 text-center hover:scale-105 transition">
          <h3 className="text-sm text-red-700 uppercase font-semibold">Gastos</h3>
          <p className="text-3xl font-bold text-red-600">${totalExpense.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-md border-l-4 border-blue-500 text-center hover:scale-105 transition">
          <h3 className="text-sm text-blue-700 uppercase font-semibold">Balance Neto</h3>
          <p
            className={`text-3xl font-bold ${
              netBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Mensaje si no hay datos */}
      {(incomeData.length === 0 && expenseData.length === 0) && (
        <div className="text-center py-10 text-gray-500 bg-white/70 rounded-xl mb-8">
          <p className="text-lg font-medium">No hay transacciones registradas para analizar.</p>
          <p className="text-sm mt-1">Realice su primer depósito o retiro para ver los gráficos.</p>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Ingresos */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-gray-100 hover:shadow-lg transition">
          <h4 className="text-center text-indigo-700 font-semibold mb-3">Ingresos por Categoría</h4>
          {incomeData.length > 0 && totalIncome > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={incomeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={CustomPieLabel} fill="#6366F1">
                  {incomeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">Sin datos de Ingresos</div>
          )}
        </div>

        {/* Gastos */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-gray-100 hover:shadow-lg transition">
          <h4 className="text-center text-indigo-700 font-semibold mb-3">Gastos por Categoría</h4>
          {expenseData.length > 0 && totalExpense > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={CustomPieLabel} fill="#EF4444">
                  {expenseData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">Sin datos de Gastos</div>
          )}
        </div>

        {/* Balance */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-gray-100 hover:shadow-lg transition">
          <h4 className="text-center text-indigo-700 font-semibold mb-3">Balance General</h4>
          {balanceData.length > 0 && (totalIncome > 0 || totalExpense > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={balanceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={CustomPieLabel} fill="#3B82F6">
                  {balanceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[250px] flex items-center justify-center text-gray-400">Sin movimientos para Balance</div>
          )}
        </div>
      </div>
    </div>
  );
}