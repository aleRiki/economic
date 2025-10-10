"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { DollarSign } from "lucide-react";

// ----------------------------------------------------------------------
// 1. TASAS DE CONVERSIÓN Y DATOS
// ----------------------------------------------------------------------

// Definimos las tasas de conversión
const CONVERSION_RATES = {
    USD: 1,        // 1 USD = 1 USD
    CUP: 1 / 490,  // 1 CUP = 0.00204 USD (1/490)
    EUR: 1 / 0.86, // 1 EUR = 1.1628 USD (1/0.86)
};

// 1.1. Definimos el tipo de divisa basado en las claves de CONVERSION_RATES.
// Esto restringe 'Currency' a ser solo 'USD' | 'CUP' | 'EUR', resolviendo el error de tipado.
type Currency = keyof typeof CONVERSION_RATES;

// 1.2. Definimos el tipo para la transacción, asegurando que 'currency' sea uno de los tipos válidos.
type Transaction = {
    amount: number;
    account: string;
    date: string;
    currency: Currency;
};

// Datos de transacciones (Manteniendo el valor de la moneda original)
// Aplicamos el nuevo tipo Transaction[]
const transactions: Transaction[] = [
    { amount: 350, account: "Cuenta USD", date: "2023-10-24", currency: "USD" },
    { amount: 420, account: "Cuenta USD", date: "2023-09-20", currency: "USD" },
    { amount: 500, account: "Cuenta EUR", date: "2023-10-25", currency: "EUR" },
    { amount: 35000, account: "Cuenta CUP", date: "2023-10-26", currency: "CUP" },
    // Agregamos más datos para hacer la gráfica más interesante
    { amount: 120, account: "Cuenta EUR", date: "2023-10-01", currency: "EUR" },
    { amount: 75000, account: "Cuenta CUP", date: "2023-09-15", currency: "CUP" },
];

// Objetivo Global: La meta es el total que queremos alcanzar en USD
const GLOBAL_GOAL_USD = 50000;

// ----------------------------------------------------------------------
// 2. CÁLCULO DE MÉTRICAS CONSOLIDADAS
// ----------------------------------------------------------------------

// 2.1. Calcular el total de ingresos convertidos a USD
// FIX: Se añade el tipo genérico <number> al reduce para evitar el error de Unexpected any.
const totalIncomeUSD = transactions.reduce<number>((sum, tx) => {
    // CORRECCIÓN: Gracias a 'type Transaction', TypeScript ahora sabe que tx.currency es una clave válida.
    const rate = CONVERSION_RATES[tx.currency]; 
    
    // Convierte el monto a USD y lo suma al total
    const amountInUSD = tx.amount * rate; 
    return sum + amountInUSD;
}, 0);


const calculateProgress = (current: number, goal: number) => {
    return Math.min(100, Math.round((current / goal) * 100));
};

const progressPercentage = calculateProgress(totalIncomeUSD, GLOBAL_GOAL_USD);
const progressColor = progressPercentage >= 100 ? "#10b981" : "#2563eb"; // Verde si superó, Azul si no
const donutData = [
    { name: 'Progreso', value: progressPercentage, fill: progressColor },
    { name: 'Restante', value: Math.max(0, 100 - progressPercentage), fill: '#e5e7eb' }
];

// ----------------------------------------------------------------------
// 3. COMPONENTE PARA EL GRÁFICO CONSOLIDADO
// ----------------------------------------------------------------------

// FIX: Definimos un tipo que acepte string | number para cx y cy, 
// ya que Recharts puede pasarlos como strings, resolviendo el Type error.
type LabelProps = { cx?: number | string; cy?: number | string; };

// Componente para el centro del gráfico (Muestra el % y la moneda consolidada)
const RenderGlobalLabel = ({ cx, cy }: LabelProps) => {
    
    // Si las coordenadas no están disponibles, no renderizamos para evitar errores.
    if (cx === undefined || cy === undefined) return null; 

    // FIX: Convertimos cy a número para realizar operaciones aritméticas seguras.
    const numericCy = Number(cy);

    return (
        <>
            {/* Texto de la meta consolidada */}
            <text x={cx} y={numericCy - 10} textAnchor="middle" dominantBaseline="central" className="text-sm fill-gray-500">
                META GLOBAL (USD)
            </text>
            {/* Texto del progreso en % */}
            <text x={cx} y={numericCy + 15} textAnchor="middle" dominantBaseline="central" className={`text-3xl font-bold fill-gray-800`}>
                {progressPercentage}%
            </text>
        </>
    );
};

export default function TransactionHistory() {
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GRÁFICO CONSOLIDADO DE META GLOBAL */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col items-center h-full">
                <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Progreso Consolidado Hacia Meta Global
                </h2>

                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={donutData}
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                        >
                            {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        {/* Se pasa la referencia de la función RenderGlobalLabel. */}
                        <Label content={RenderGlobalLabel} position="center" />
                    </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 w-full text-center">
                    <p className="text-sm text-gray-600">
                        Ingreso Total (Equivalente USD): 
                        <span className="font-bold text-gray-800 ml-1">
                            ${totalIncomeUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Objetivo Global: 
                        <span className="font-bold text-blue-600 ml-1">
                            ${GLOBAL_GOAL_USD.toLocaleString()}
                        </span>
                    </p>
                    {progressPercentage >= 100 && (
                        <p className="text-sm font-bold text-green-600 mt-2">¡Meta Global Superada! 🎉</p>
                    )}
                </div>
            </div>

            {/* Historial de Transacciones (Mantenemos la tabla) */}
            <div className="bg-white p-6 rounded-lg shadow h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Transacciones Recientes</h2>
                
                <div className="overflow-x-auto h-[350px]"> {/* Altura fija para alineación visual */}
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2 px-1">Monto (Original)</th>
                                <th className="py-2 px-1">Cuenta asociada</th>
                                <th className="py-2 px-1">Valor en USD</th>
                                <th className="py-2 px-1">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, idx) => {
                                // El acceso a CONVERSION_RATES[tx.currency] ahora es seguro gracias a los tipos definidos
                                const rate = CONVERSION_RATES[tx.currency];
                                const amountInUSD = tx.amount * rate;
                                return (
                                    <tr key={idx} className="border-b text-gray-700 hover:bg-gray-50 transition">
                                        <td className="py-2 px-1 font-semibold">
                                            {tx.amount.toLocaleString('en-US', { style: 'currency', currency: tx.currency })}
                                        </td>
                                        <td className="py-2 px-1">{tx.account}</td>
                                        <td className="py-2 px-1 text-xs text-blue-600 font-medium">
                                            ${amountInUSD.toFixed(2)}
                                        </td>
                                        <td className="py-2 px-1">{tx.date}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
