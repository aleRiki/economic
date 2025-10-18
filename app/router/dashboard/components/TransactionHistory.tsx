"use client";
import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAccounts, Account } from "@/lib/auth-service";

// ----------------------------------------------------------------------
// 1. TASAS DE CONVERSIÓN
// ----------------------------------------------------------------------

const CONVERSION_RATES: { [key: string]: number } = {
  USD: 1,
  CUP: 1 / 490,
  EUR: 1 / 0.86,
  Euro: 1 / 0.86,
  Savings: 1,
};

// Conversión a USD
const convertToUSD = (amount: string, type: string): number => {
  const value = parseFloat(amount);
  const rate = CONVERSION_RATES[type] || 0;
  return value * rate;
};

// ----------------------------------------------------------------------
// 2. COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function TransactionHistory() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtención de cuentas
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsData = await getAccounts();
        const sortedAccounts = accountsData.sort(
          (a: any, b: any) =>
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
        );
        setAccounts(sortedAccounts);
      } catch (err: any) {
        const message = err.message || "Error al cargar los datos financieros.";
        if (message.includes("Token de autenticación")) {
          router.push("/auth/login");
          return;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [router]);

  // ----------------------------------------------------------------------
  // 3. CÁLCULOS DE BALANCE GLOBAL
  // ----------------------------------------------------------------------

  const { totalConsolidatedUSD, globalGoalUSD, progressPercentage, donutData } =
    useMemo(() => {
      const accountsTotalUSD = accounts.reduce((sum, account) => {
        return sum + convertToUSD(account.balance, account.type);
      }, 0);

      const totalConsolidatedUSD = accountsTotalUSD;
      const globalGoalUSD = totalConsolidatedUSD * 1.2;
      const progressPercentage = Math.min(
        100,
        Math.round((totalConsolidatedUSD / globalGoalUSD) * 100)
      );
      const progressColor = progressPercentage >= 100 ? "#10b981" : "#2563eb";

      const donutData = [
        { name: "Progreso", value: progressPercentage, fill: progressColor },
        {
          name: "Restante",
          value: Math.max(0, 100 - progressPercentage),
          fill: "#e5e7eb",
        },
      ];

      return {
        totalConsolidatedUSD,
        globalGoalUSD,
        progressPercentage,
        donutData,
      };
    }, [accounts]);

  // ----------------------------------------------------------------------
  // 4. ESTADOS DE CARGA Y ERROR
  // ----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
        <p className="text-lg text-gray-600">Cargando datos de balance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-6 rounded-xl shadow-lg border border-red-400 text-red-700 flex items-center h-60">
        <AlertTriangle className="w-6 h-6 mr-3" />
        <div>
          <h2 className="font-bold">Error de Datos</h2>
          <p className="text-sm">
            No se pudieron cargar los balances para el gráfico. Intenta recargar.
          </p>
          <p className="text-xs mt-1 italic text-red-600">Detalle: {error}</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 5. RENDERIZADO PRINCIPAL
  // ----------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* GRÁFICO CONSOLIDADO */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col items-center h-full">
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Progreso de Meta (Balance Consolidado)
        </h2>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={donutData}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              label={({ cx, cy }) => {
                if (cx == null || cy == null) return null;
                const cxNum = Number(cx);
                const cyNum = Number(cy);
                return (
                  <>
                    <text
                      x={cxNum}
                      y={cyNum - 10}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-sm fill-gray-500"
                    >
                      META (120% USD)
                    </text>
                    <text
                      x={cxNum}
                      y={cyNum + 15}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-3xl font-bold fill-gray-800"
                    >
                      {progressPercentage}%
                    </text>
                  </>
                );
              }}
              labelLine={false}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 w-full text-center">
          <p className="text-sm text-gray-600">
            Balance Total Consolidado (USD):
            <span className="font-bold text-gray-800 ml-1">
              ${totalConsolidatedUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Objetivo (20% Adicional):
            <span className="font-bold text-blue-600 ml-1">
              ${globalGoalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
          {progressPercentage >= 100 && (
            <p className="text-sm font-bold text-green-600 mt-2">¡Meta Lograda! 🎉</p>
          )}
        </div>
      </div>

      {/* TABLA DE CUENTAS */}
      <div className="bg-white p-6 rounded-lg shadow h-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Registro de Cuentas Creadas
        </h2>

        <div className="overflow-x-auto h-[350px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 px-1">Nombre de Cuenta</th>
                <th className="py-2 px-1">Tipo / Moneda</th>
                <th className="py-2 px-1">Balance Original</th>
                <th className="py-2 px-1">Fecha de Creación</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account: any) => (
                  <tr
                    key={account.id}
                    className="border-b text-gray-700 hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-1 font-semibold">{account.name}</td>
                    <td className="py-2 px-1">{account.type}</td>
                    <td className="py-2 px-1 font-mono text-sm">
                      {parseFloat(account.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-1 text-xs">
                      {new Date(account.createAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No se encontraron cuentas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
