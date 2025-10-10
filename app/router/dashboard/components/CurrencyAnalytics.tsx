"use client";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    ErrorBar, // Importado pero comentado su uso para evitar complejidad de tipado con Recharts
} from "recharts";

// -----------------------------------------------------------
// TIPOS Y DATOS
// -----------------------------------------------------------

// 1. Definimos el tipo de datos para la estructura de la vela
type CandleData = {
    Semana: number;
    open: number;
    close: number;
    high: number;
    low: number;
};

// 2. Datos de ejemplo para ingresos por semana
// Aplicamos el tipo CandleData[] a la data
const data: CandleData[] = [ 
    // Julio (Semana 27 a 30)
    { Semana: 27, open: 1100, close: 1150, high: 1200, low: 1080 },
    { Semana: 28, open: 1150, close: 1250, high: 1280, low: 1120 },
    { Semana: 29, open: 1250, close: 1200, high: 1260, low: 1180 }, // Leve caída
    { Semana: 30, open: 1200, close: 1300, high: 1350, low: 1190 },
    // Agosto (Semana 31 a 34)
    { Semana: 31, open: 1300, close: 1450, high: 1500, low: 1280 },
    { Semana: 32, open: 1450, close: 1550, high: 1580, low: 1400 },
    { Semana: 33, open: 1550, close: 1650, high: 1700, low: 1520 },
    { Semana: 34, open: 1650, close: 1600, high: 1680, low: 1580 }, // Cierre inferior a la apertura
];

// Tipado explícito para las props del componente de forma de vela
type CandlestickProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    payload: CandleData;
};


// Componente de Forma de Vela Personalizada (tipado corregido)
const CandlestickBar = (props: CandlestickProps) => {
    const { x, y, width, payload } = props;
    // El payload contiene los datos de la fila actual (CandleData)
    const { open, close } = payload; 
    const isGrowing = close >= open;

    // Altura y posición del cuerpo de la vela.
    const bodyHeight = Math.abs(close - open);
    // bodyY original (no usado en la lógica final, mantenido para referencia)
    // const bodyY = isGrowing ? y + (props.height - (close - y) - bodyHeight) : y + (props.height - (open - y)); 

    // Colores (Verde: Subida, Rojo: Bajada)
    const fill = isGrowing ? "#10b981" : "#ef4444";

    return (
        <rect
            x={x}
            // Lógica para posicionar el rectángulo del cuerpo de la vela
            y={Math.min(open, close) - props.y + props.height - bodyHeight} 
            width={width}
            height={bodyHeight}
            fill={fill}
            stroke={fill}
        />
    );
};

// Función de Sugerencia (adaptada a la última semana)
function getSuggestion(data: CandleData[]) {
    const last = data[data.length - 1];
    const growth = last.close - last.open;
    const percent = ((growth / last.open) * 100).toFixed(2);

    if (growth > 0) {
        return `📈 Crecimiento positivo del ${percent}% en la Semana ${last.Semana}. Se recomienda mantener la inversión.`;
    } else if (growth < 0) {
        return `📉 Pérdida del ${Math.abs(parseFloat(percent))}% en la Semana ${last.Semana}. Analiza gastos o fluctuaciones.`;
    } else {
        return `⏸️ Sin cambios significativos. Mantener vigilancia sobre próximos movimientos.`;
    }
}

// 2. Componente Principal
export default function WeeklyIncomeAnalytics() {
    const suggestion = getSuggestion(data);

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
                Evolución de Ingresos por Semana del Año (USD)
            </h2>

            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data} barGap={5}>
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* dataKey apunta a 'Semana' */}
                    <XAxis dataKey="Semana" label={{ value: 'Semana del Año', position: 'bottom', offset: 0 }} />
                    <YAxis
                        domain={["dataMin", "dataMax"]}
                        label={{ value: "Ingresos (USD)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                        // FIX: Tipado explícito de los argumentos del formatter para evitar 'Unexpected any'
                        formatter={(value: number | string, name: string) => {
                            if (["open", "close", "high", "low"].includes(name)) {
                                return [`$${value}`, name.charAt(0).toUpperCase() + name.slice(1)];
                            }
                            // Retorna null, null para ocultar entradas no deseadas en el tooltip.
                            return [null, null]; 
                        }}
                        labelFormatter={(label) => `Semana: ${label}`}
                    />

                    {/* SIMULACIÓN DE MECHAS (WICKS) - Usa el ErrorBar para el rango High/Low */}
                    {/* Bar base invisible para posicionar la ErrorBar. El ErrorBar fue comentado porque
                        su uso directo en ComposedChart puede ser complejo y generar warnings. */}
                    <Bar dataKey="low" fillOpacity={0} stackId="stack" barSize={1} >
                        {/* <ErrorBar dataKey="high" low="low" width={0} strokeWidth={1} stroke="#666" direction="y" /> */}
                    </Bar>

                    {/* CUERPO DE LA VELA - Usa la forma personalizada para Open/Close */}
                    <Bar
                        dataKey="open"
                        fillOpacity={0}
                        barSize={10}
                        
                    />

                </ComposedChart>
            </ResponsiveContainer>

            <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                **Análisis Semanal:** {suggestion}
            </div>
        </div>
    );
}
