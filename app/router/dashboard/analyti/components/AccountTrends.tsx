"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// -----------------------------------------------------------
// TIPOS Y DATOS
// -----------------------------------------------------------

// 1. Definimos el tipo de datos para los valores del gráfico
type TrendData = {
    month: string;
    USD: number;
    EUR: number;
};

const data: TrendData[] = [ // Aplicamos el tipo aquí
    { month: "Jul", USD: 1200, EUR: 1100 },
    { month: "Ago", USD: 1400, EUR: 1250 },
    { month: "Sep", USD: 1600, EUR: 1300 },
    { month: "Oct", USD: 1800, EUR: 1350 },
];

// Función para calcular el crecimiento porcentual
// *** SOLUCIÓN: Tipamos 'data' como TrendData[] y 'key' como una clave válida del objeto ***
function calculateGrowth(data: TrendData[], key: 'USD' | 'EUR') {
    // Encuentra el último y el primer valor
    const lastValue = data[data.length - 1][key];
    const firstValue = data[0][key];
    
    if (firstValue === 0) return "N/A";
    
    const growth = ((lastValue - firstValue) / firstValue) * 100;
    return growth.toFixed(2);
}

// -----------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------

export default function AccountTrends() {
    const usdGrowth = calculateGrowth(data, 'USD');
    const eurGrowth = calculateGrowth(data, 'EUR');

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Tendencia y Crecimiento Mensual</h2>
            
            {/* Indicadores de Crecimiento */}
            <div className="flex justify-around border-b pb-3">
                <div className="text-center">
                    <span className="text-xs text-gray-500 block">Crecimiento Total USD</span>
                    {/* Usamos parseFloat para la condición de crecimiento */}
                    <p className={`text-xl font-bold ${parseFloat(usdGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {usdGrowth}%
                    </p>
                </div>
                <div className="text-center">
                    <span className="text-xs text-gray-500 block">Crecimiento Total EUR</span>
                    {/* Usamos parseFloat para la condición de crecimiento */}
                    <p className={`text-xl font-bold ${parseFloat(eurGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {eurGrowth}%
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                        formatter={(value, name) => [`$${(value as number).toFixed(2)}`, name]}
                    />
                    <Line type="monotone" dataKey="USD" stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="EUR" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
