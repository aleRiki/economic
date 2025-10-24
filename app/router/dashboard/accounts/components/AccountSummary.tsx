"use client";

import { useState, useEffect, useCallback } from "react";
import { getCard, Card } from "@/lib/auth-service";
import { getTasasCambio } from "@/lib/tasaCambioService";

interface ExchangeRate {
  id?: number; // ✅ Ahora es opcional
  currency: string;
  rateToUSD: string | number;
}

export default function AccountSummary() {
  const [cards, setCards] = useState<Card[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      // getTasasCambio debe devolver Promise<ExchangeRate[]>
      const ratesData: ExchangeRate[] = await getTasasCambio();

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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchRates(), fetchCards()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchRates, fetchCards]);

  // 🚨 INICIO DE LA CORRECCIÓN: LÓGICA DE CÁLCULO DE SALDO 🚨
  const totalBalanceUSD = cards.reduce((sum, card) => {
    // 1. Obtener la cadena del tipo de cuenta (ejemplo: "Cuenta Corriente USD")
    const accountTypeString = card.account?.type?.toUpperCase() || "";

    // 2. Intentar extraer el código de divisa de 3 letras (USD, EUR, MXN)
    // Se usa una RegEx para encontrar las últimas letras mayúsculas al final de la cadena.
    // Ej: "CUENTA CORRIENTE USD" -> "USD"
    const match = accountTypeString.match(/([A-Z]{3})$/);
    const currencyCode = match ? match[1] : "";

    // 3. Obtener el saldo numérico (eliminar comas y convertir a float)
    const balanceNum = parseFloat(String(card.balance).replace(/,/g, "")) || 0;

    // 4. Obtener la tasa de cambio.
    // Si la divisa no está en las tasas (ej. USD), usa 1.0 como tasa predeterminada.
    const rate = exchangeRates[currencyCode] ?? 1.0;

    // 5. Calcular el saldo en USD
    const balanceInUSD = balanceNum * rate;

    // console.log(`Card: ${accountTypeString}, Code: ${currencyCode}, Balance: ${balanceNum}, Rate: ${rate}, USD: ${balanceInUSD}`);

    return sum + balanceInUSD;
  }, 0);
  // 🚨 FIN DE LA CORRECCIÓN 🚨

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
