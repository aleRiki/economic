"use client";

import { useState, useEffect, useCallback } from "react";
import { getCard, Card } from "@/lib/auth-service";
import { getTasasCambio } from "@/lib/tasaCambioService";

interface ExchangeRate {
  id: number;
  currency: string;
  rateToUSD: string | number;
}

export default function AccountSummary() {
  const [cards, setCards] = useState<Card[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------
  // 🔹 Cargar tasas de cambio desde el backend
  // -------------------------------------------------------
  const fetchRates = useCallback(async () => {
    try {
      const ratesData: ExchangeRate[] = await getTasasCambio();

      // Convertimos el arreglo a un objeto tipo { EUR: 0.8, CUP: 0.0022, ... }
      const formattedRates: Record<string, number> = {};
      ratesData.forEach((r) => {
        formattedRates[r.currency.toUpperCase()] = parseFloat(
          String(r.rateToUSD)
        );
      });

      setExchangeRates(formattedRates);
    } catch (err: unknown) {
      console.error("❌ Error al obtener tasas de cambio:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar las tasas de cambio.";
      setError(errorMessage);
    }
  }, []);

  // -------------------------------------------------------
  // 🔹 Cargar tarjetas del usuario
  // -------------------------------------------------------
  const fetchCards = useCallback(async () => {
    try {
      const data = await getCard();
      setCards(data);
    } catch (err: unknown) {
      console.error("❌ Error al obtener las tarjetas:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar las tarjetas.";
      setError(errorMessage);
    }
  }, []);

  // -------------------------------------------------------
  // 🔹 Cargar tasas y tarjetas en paralelo al iniciar
  // -------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchRates(), fetchCards()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchRates, fetchCards]);

  // -------------------------------------------------------
  // 🔹 Cálculo total en USD usando tasas dinámicas
  // -------------------------------------------------------
  const totalBalanceUSD = cards.reduce((sum, card) => {
    const currencyType = card.account.type.toUpperCase();
    const balanceNum = parseFloat(card.balance) || 0;

    // Buscar la tasa desde el backend, o asumir 1 si no existe
    const rate = exchangeRates[currencyType] ?? 1;
    const balanceInUSD = balanceNum * rate;

    return sum + balanceInUSD;
  }, 0);

  // -------------------------------------------------------
  // 🔹 Renderizado
  // -------------------------------------------------------
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse">
        <h2 className="text-lg font-semibold text-gray-400 mb-2">
          Total acumulado
        </h2>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl shadow-lg border border-red-300">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          Error de Carga
        </h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Total acumulado
        </h2>
        <p className="text-lg text-gray-500">No hay cuentas registradas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Total Consolidado (USD)
      </h2>
      <p className="text-3xl font-bold text-blue-700">
        $
        {totalBalanceUSD.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-1">Tasas de cambio activas:</h3>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(exchangeRates).map(([key, value]) => (
            <li key={key} className="flex justify-between border-b py-1">
              <span>{key}</span>
              <span className="font-medium">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
