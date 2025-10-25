"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DollarSign, AlertTriangle, Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAccounts, Account } from "@/lib/auth-service";
import { getTasasCambio } from "@/lib/tasaCambioService";

interface ExchangeRate {
  currency: string;
  rateToUSD: number | string;
}

export default function TransactionHistory() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Obtener tasas de cambio ---
  const fetchExchangeRates = useCallback(async () => {
    try {
      const data: ExchangeRate[] = await getTasasCambio();
      const formattedRates: Record<string, number> = {};
      data.forEach((item) => {
        formattedRates[item.currency] =
          parseFloat(item.rateToUSD.toString()) || 0;
      });
      formattedRates["USD"] = 1;
      setExchangeRates(formattedRates);
    } catch (err: unknown) {
      console.error("Error al obtener tasas de cambio:", err);
      setError("No se pudieron cargar las tasas de cambio del servidor.");
    }
  }, []);

  // --- Obtener cuentas ---
  const fetchAccounts = useCallback(async () => {
    try {
      const accountsData = await getAccounts();
      const sorted = accountsData.sort(
        (a: Account, b: Account) =>
          new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
      );
      setAccounts(sorted);
    } catch (err: unknown) {
      console.error("Error al obtener cuentas:", err);
      const message =
        err instanceof Error ? err.message : "Error al cargar las cuentas.";
      if (message.includes("Token")) router.push("/auth/login");
      setError(message);
    }
  }, [router]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchExchangeRates(), fetchAccounts()]);
      setLoading(false);
    };
    loadData();
  }, [fetchExchangeRates, fetchAccounts]);

  // --- Conversión de moneda ---
  const convertToUSD = useCallback(
    (amount: string, currencyType: string): number => {
      const value = parseFloat(amount);
      if (isNaN(value)) return 0;
      const rate = exchangeRates[currencyType] ?? 0;
      return value * rate;
    },
    [exchangeRates]
  );

  // --- Cálculos principales ---
  const { totalConsolidatedUSD, globalGoalUSD, progressPercentage, donutData } =
    useMemo(() => {
      const hasRates = Object.keys(exchangeRates).length > 0;
      if (!hasRates && !loading) {
        return {
          totalConsolidatedUSD: 0,
          globalGoalUSD: 0,
          progressPercentage: 0,
          donutData: [
            { name: "Progreso", value: 0, fill: "#e5e7eb" },
            { name: "Restante", value: 100, fill: "#e5e7eb" },
          ],
        };
      }

      const totalUSD = accounts.reduce(
        (sum, acc) => sum + convertToUSD(acc.balance, acc.type),
        0
      );

      const goalUSD = totalUSD * 1.2;
      const progress = Math.min(100, Math.round((totalUSD / goalUSD) * 100));
      const progressColor = progress >= 100 ? "#16a34a" : "#2563eb";

      return {
        totalConsolidatedUSD: totalUSD,
        globalGoalUSD: goalUSD,
        progressPercentage: progress,
        donutData: [
          { name: "Progreso", value: progress, fill: progressColor },
          {
            name: "Restante",
            value: Math.max(0, 100 - progress),
            fill: "#f3f4f6",
          },
        ],
      };
    }, [accounts, convertToUSD, exchangeRates, loading]);

  // --- Loading ---
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
        <p className="text-base text-gray-600 font-medium">
          Cargando datos financieros...
        </p>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-2xl p-6 flex items-start space-x-3 shadow-lg">
        <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-red-700">
            Error de Datos Financieros
          </h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // --- UI principal ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* GRÁFICO PRINCIPAL */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <DollarSign className="text-blue-600 w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Balance Consolidado
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={donutData}
              innerRadius={80}
              outerRadius={110}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              label={({ cx, cy }) => {
                if (typeof cx !== "number" || typeof cy !== "number")
                  return null;

                return (
                  <>
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-xs fill-gray-400"
                    >
                      META (120%)
                    </text>
                    <text
                      x={cx}
                      y={cy + 10}
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
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-5 text-center space-y-1">
          <p className="text-gray-600 text-sm">
            Total Consolidado:
            <span className="font-semibold text-gray-900 ml-1">
              $
              {totalConsolidatedUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          <p className="text-gray-600 text-sm">
            Objetivo (20% más):
            <span className="font-semibold text-blue-600 ml-1">
              $
              {globalGoalUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          {progressPercentage >= 100 && (
            <div className="flex items-center justify-center text-green-600 text-sm font-bold mt-2 animate-pulse">
              <TrendingUp className="w-4 h-4 mr-1" />
              ¡Meta alcanzada!
            </div>
          )}
        </div>
      </div>

      {/* TABLA DE CUENTAS */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Cuentas Registradas
        </h2>

        <div className="overflow-x-auto max-h-[360px] rounded-lg border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-gray-600 border-b">
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Moneda</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Creada</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="py-2 px-4 font-medium text-gray-700">
                      {a.name}
                    </td>
                    <td className="py-2 px-4 text-gray-600">{a.type}</td>
                    <td className="py-2 px-4 font-mono text-gray-800">
                      {parseFloat(a.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-4 text-gray-500 text-xs">
                      {new Date(a.createAt).toLocaleDateString("es-ES", {
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
                    No hay cuentas disponibles.
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
