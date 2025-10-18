"use client";
import { useState, useEffect, useCallback } from "react";
// Asumiendo que getCard ya tiene sus tipos definidos en tu archivo de servicio
import { getCard, Card } from "@/lib/auth-service";
// Importamos la función de la API de tasas (debes implementarla)
// import { getExchangeRates } from "@/lib/exchange-service"; 

// ----------------------------------------------------------------------
// TASAS DE CAMBIO POR DEFECTO Y SIMULACIÓN DE CARGA
// ----------------------------------------------------------------------

// Simulación de una función de API para obtener las tasas
const fetchInitialRates = async (): Promise<Record<string, number>> => {
    // Aquí es donde harías un axios.get('/api/rates')
    // Por ahora, devolvemos la constante inicial:
    return {
        USD: 1,
        CUP: 1 / 467,
        EUR: 1 / 0.80,
        Savings: 1 / 250, 
        Euro: 1 / 0.80, 
    };
};


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: AccountSummary
// ----------------------------------------------------------------------

export default function AccountSummary() {
    const [cards, setCards] = useState<Card[]>([]);
    // 💥 NUEVO ESTADO: Almacena las tasas de cambio cargadas
    const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ----------------------------------------------------------------------
    // 1. FUNCIONES DE CARGA (Rates y Cards)
    // ----------------------------------------------------------------------

    const fetchRates = useCallback(async () => {
        try {
            const ratesData = await fetchInitialRates(); // Reemplazar con getExchangeRates() real
            setExchangeRates(ratesData);
        } catch (err: any) {
            console.error("Error al obtener las tasas de cambio:", err);
            setError("Error al cargar las tasas de cambio.");
        }
    }, []);

    const fetchCards = useCallback(async () => {
        try {
            const data = await getCard();
            setCards(data);
        } catch (err: any) {
            console.error("Error al obtener las tarjetas:", err);
            setError(
                err.message || "Error desconocido al cargar el resumen de cuentas."
            );
        }
    }, []);

    // ----------------------------------------------------------------------
    // 2. EJECUTAR CARGA
    // ----------------------------------------------------------------------
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            
            // Cargar tasas y tarjetas en paralelo
            await Promise.all([fetchRates(), fetchCards()]);
            
            setIsLoading(false);
        };
        loadData();
    }, [fetchRates, fetchCards]);


    // ----------------------------------------------------------------------
    // 3. CÁLCULO DINÁMICO del total consolidado en USD
    // ----------------------------------------------------------------------
    const totalBalanceUSD = cards.reduce((sum, card) => {
        // Si las tasas no se han cargado, o hay un error, el cálculo es 0.
        if (!exchangeRates) return sum; 
        
        const cardBalanceStr = card.balance; 
        
        // Obtenemos el tipo de divisa (que es la clave en exchangeRates)
        const currencyType = card.account.type; 
        
        const balanceNum = parseFloat(cardBalanceStr) || 0;

        // 💥 USAMOS EL ESTADO DE exchangeRates EN LUGAR DE LA CONSTANTE FIJA
        const rate = exchangeRates[currencyType]; 
        
        // Si no existe la tasa, asumimos que es USD (rate = 1) o la ignoramos (rate = 0), 
        // dependiendo de la lógica de negocio. Aquí usamos el valor de la tasa, o 1 si no se encuentra.
        const effectiveRate = rate !== undefined ? rate : 1;
        
        const balanceInUSD = balanceNum * effectiveRate;

        return sum + balanceInUSD;
    }, 0);

    // ----------------------------------------------------------------------
    // RENDERIZADO (Se mantiene igual)
    // ----------------------------------------------------------------------

    if (isLoading || !exchangeRates) {
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
    
    if (cards.length === 0 && totalBalanceUSD === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Total acumulado
                </h2>
                <p className="text-lg text-gray-500">
                    No hay cuentas registradas.
                </p>
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
        </div>
    );
}