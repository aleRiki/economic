"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link"; 

// ----------------------------------------------------------------------
// TIPOS Y CONSTANTE DE API
// ----------------------------------------------------------------------

type ExchangeRate = {
    currency: string;
    rateToUSD: number;
    lastUpdated: string;
};

// TIPOS PARA LA RESPUESTA DIRECTA DE LA API
type ExternalRatesResponse = {
    valid: boolean;
    updated: number; // Unix timestamp
    base: string;
    rates: Record<string, number>;
};


const API_URL = "https://currencyapi.net/api/v1/rates?base=USD&output=json&key=3cace054aff655baf4721222b00e08225b30";


const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
    try {
        // 1. Llama a la API externa directamente
        //  const response = await getTazadeCambio();
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener la data de tasas.`);
        }
        
        const externalData: ExternalRatesResponse = await response.json();
        
        if (!externalData.valid) {
             throw new Error("La respuesta de la API de moneda no es válida.");
        }

        const timestamp = externalData.updated;
        // Convierte el timestamp Unix a una hora local legible
        const lastUpdatedDate = new Date(timestamp * 1000).toLocaleTimeString("es-ES", {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        
        const transformedRates: ExchangeRate[] = [];

        // 2. TRANSFORMAR LA DATA al formato ExchangeRate[]
        Object.entries(externalData.rates).forEach(([currency, rate]) => {
            if (typeof rate === 'number' && rate !== 0 && rate !== null) {
                transformedRates.push({
                    currency: currency.toUpperCase(), // Ej: CUP, EUR
                    rateToUSD: rate, // 1 USD = X unidades de esta moneda
                    lastUpdated: lastUpdatedDate,
                });
            }
        });

        // 3. Añadir tasas personalizadas (ej: 'Savings') si es necesario
        // Esto mantiene la compatibilidad con monedas internas que no son estándar
        const customRateForSavings = {
             currency: "SAVINGS",
             rateToUSD: 1 / 250, // Ejemplo de tasa manual
             lastUpdated: lastUpdatedDate,
        };
        if (!transformedRates.find(r => r.currency === "SAVINGS")) {
            transformedRates.push(customRateForSavings);
        }
        
        // 4. Filtrar para mostrar solo algunas monedas si la lista es muy larga
        const relevantCurrencies = ["USD", "CUP", "EUR", "GBP", "MXN", "SAVINGS"];
        const filteredRates = transformedRates.filter(r => relevantCurrencies.includes(r.currency));
        
        // Si la moneda base (USD) no está en la lista filtrada, la añadimos.
        if (!filteredRates.find(r => r.currency === "USD")) {
             filteredRates.unshift({ currency: "USD", rateToUSD: 1, lastUpdated: lastUpdatedDate });
        }
        
        return filteredRates;

    } catch (error) {
        console.error("Error al obtener tasas:", error);
        // Si falla, retornamos un error o datos por defecto si los tuvieras
        throw new Error("Fallo al cargar las tasas de cambio en el frontend.");
    }
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function ExchangeRatePage() {
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchExchangeRates();
            setRates(data);
        } catch (err) {
            console.error("Error fetching rates:", err);
            setError(err instanceof Error ? err.message : "No se pudieron cargar las tasas de cambio.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    // ... (El resto del código del JSX del componente se mantiene igual) ...

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
            <header className="mb-6 flex items-center justify-between border-b pb-4">
                {/* Enlace de regreso al dashboard */}
                <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 transition">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span className="text-lg font-medium">Volver al Panel</span>
                </Link>
                <div className="flex items-center text-gray-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Última actualización: {rates.length > 0 ? rates[0].lastUpdated : 'N/A'}
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <DollarSign className="w-8 h-8 mr-3 text-green-600" />
                    Gestión de Tasas de Cambio
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Tarjeta 1: USD Base */}
                    <RateCard 
                        title="Moneda Base"
                        value="1 USD"
                        description="Todas las conversiones se realizan con el dólar como base."
                        icon={<DollarSign className="w-6 h-6 text-green-500" />}
                    />
                    {/* Tarjeta 2: Frecuencia de Actualización */}
                    <RateCard 
                        title="Frecuencia"
                        value="Tiempo Real/Cache"
                        description="Tasas obtenidas directamente de la API externa."
                        icon={<RefreshCw className="w-6 h-6 text-indigo-500" />}
                    />
                    {/* Tarjeta 3: Meta Global */}
                    <RateCard 
                        title="Impacto Global"
                        value="Metas Dinámicas"
                        description="Cambiar tasas afecta directamente el Progreso Global."
                        icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
                    />
                </div>


                <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Tasas de Conversión Actuales (1 USD = X Moneda)</h2>
                        <button
                            onClick={loadRates}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Actualizando...' : 'Actualizar Tasas'}
                        </button>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center h-48">
                            <p className="text-gray-500">Cargando tasas...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 p-4 rounded-lg text-red-700 border border-red-300">
                            {error}
                        </div>
                    )}

                    {!loading && rates.length > 0 && (
                        <RateTable rates={rates} />
                    )}

                    {!loading && rates.length === 0 && !error && (
                        <div className="flex justify-center items-center h-48 border border-dashed rounded-lg">
                            <p className="text-gray-500">No se encontraron tasas de cambio definidas.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE: TARJETA DE RESUMEN (Sin cambios)
// ----------------------------------------------------------------------
type RateCardProps = {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

const RateCard = ({ title, value, description, icon }: RateCardProps) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center mb-3">
            <div className="mr-3">{icon}</div>
            <h3 className="text-md font-semibold text-gray-600">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
    </div>
);


// ----------------------------------------------------------------------
// COMPONENTE: TABLA DE TASAS (Sin cambios)
// ----------------------------------------------------------------------

const RateTable = ({ rates }: { rates: ExchangeRate[] }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moneda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasa (1 USD = X Moneda)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor de 1 Moneda en USD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Actualización
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {rates.map((rate) => {
                    // La API te da cuántas unidades de la moneda son 1 USD (rateToUSD).
                    // Para saber cuánto vale 1 unidad de la moneda en USD, se usa el inverso (1 / rateToUSD).
                    const valueInUSD = 1 / rate.rateToUSD;

                    return (
                        <tr key={rate.currency} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {rate.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {rate.rateToUSD.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                ${valueInUSD.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {rate.lastUpdated}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);