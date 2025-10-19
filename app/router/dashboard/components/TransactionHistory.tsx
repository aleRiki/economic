"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DollarSign, AlertTriangle, Loader2 } from "lucide-react";
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
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ... (Funciones fetchExchangeRates, fetchAccounts y useEffect loadData sin cambios en su lógica) ...

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

  const convertToUSD = useCallback(
    (amount: string, currencyType: string): number => {
      const value = parseFloat(amount);
      if (isNaN(value)) {
        console.warn(
          `Advertencia: Saldo no numérico encontrado para la cuenta: ${amount}`
        );
        return 0;
      }
      const rate = exchangeRates[currencyType] ?? 0;
      if (isNaN(rate)) {
        return 0;
      }
      return value * rate;
    },
    [exchangeRates]
  );

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
      const progressColor = progress >= 100 ? "#10b981" : "#2563eb";

      return {
        totalConsolidatedUSD: totalUSD,
        globalGoalUSD: goalUSD,
        progressPercentage: progress,
        donutData: [
          { name: "Progreso", value: progress, fill: progressColor },
          {
            name: "Restante",
            value: Math.max(0, 100 - progress),
            fill: "#e5e7eb",
          },
        ],
      };
    }, [accounts, convertToUSD, exchangeRates, loading]);

  // ----------------------------------------------------------------------
  // 6️⃣ ESTADOS DE CARGA Y ERROR (ESPACIOS CORREGIDOS)
  // ----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center h-96">
        {/* ✅ Líneas juntas, sin espacios intermedios */}
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
        <p className="text-lg text-gray-600">Cargando datos financieros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-6 rounded-xl shadow-lg border border-red-400 text-red-700 flex items-center h-60">
        {/* ✅ Líneas juntas */}
        <AlertTriangle className="w-6 h-6 mr-3" />
        <div>
          <h2 className="font-bold">Error de Datos</h2>
          <p className="text-sm mb-1">
            No se pudieron cargar las cuentas o tasas de cambio.
          </p>
          <p className="text-xs italic">{error}</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 7️⃣ RENDER PRINCIPAL (ESPACIOS CORREGIDOS)
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
                if (typeof cx !== "number" || typeof cy !== "number")
                  return null;

                return (
                  <>
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-sm fill-gray-500"
                    >
                      META (120% USD)
                    </text>
                    <text
                      x={cx}
                      y={cy + 15}
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

        <div className="mt-4 w-full text-center">
          <p className="text-sm text-gray-600">
            Balance Total Consolidado (USD):{" "}
            <span className="font-bold text-gray-800 ml-1">
              $
              {totalConsolidatedUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Objetivo (20% adicional):{" "}
            <span className="font-bold text-blue-600 ml-1">
              $
              {globalGoalUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          {progressPercentage >= 100 && (
            <p className="text-sm font-bold text-green-600 mt-2">
              ¡Meta lograda! 🎉
            </p>
          )}
        </div>
      </div>

      {/* TABLA DE CUENTAS (ESPACIOS CORREGIDOS) */}
      <div className="bg-white p-6 rounded-lg shadow h-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Registro de Cuentas Creadas
        </h2>

        <div className="overflow-x-auto h-[350px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                {/* ✅ THs juntos en la misma línea o sin indentación excesiva */}
                <th className="py-2 px-1">Nombre</th>
                <th className="py-2 px-1">Moneda</th>
                <th className="py-2 px-1">Balance</th>
                <th className="py-2 px-1">Creada</th>
              </tr>
            </thead>
            {/* ✅ TBODY va inmediatamente después de THEAD, y el contenido (condicional) va inmediatamente después del <tbody> */}
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b text-gray-700 hover:bg-gray-50 transition"
                  >
                    {/* ✅ TDs sin indentación interna excesiva */}
                    <td className="py-2 px-1 font-semibold">{a.name}</td>
                    <td className="py-2 px-1">{a.type}</td>
                    <td className="py-2 px-1 font-mono text-sm">
                      {parseFloat(a.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-1 text-xs">
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
