"use client";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// -------------------------------
// 1️⃣ Tipos
// -------------------------------
type CandleData = {
  Semana: number;
  open: number;
  close: number;
  high: number;
  low: number;
};

// -------------------------------
// 2️⃣ Datos de ejemplo
// -------------------------------
const data: CandleData[] = [
  { Semana: 27, open: 1100, close: 1150, high: 1200, low: 1080 },
  { Semana: 28, open: 1150, close: 1250, high: 1280, low: 1120 },
  { Semana: 29, open: 1250, close: 1200, high: 1260, low: 1180 },
  { Semana: 30, open: 1200, close: 1300, high: 1350, low: 1190 },
  { Semana: 31, open: 1300, close: 1450, high: 1500, low: 1280 },
  { Semana: 32, open: 1450, close: 1550, high: 1580, low: 1400 },
  { Semana: 33, open: 1550, close: 1650, high: 1700, low: 1520 },
  { Semana: 34, open: 1650, close: 1600, high: 1680, low: 1580 },
];

// -------------------------------
// 3️⃣ Función de sugerencia semanal
// -------------------------------
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

// -------------------------------
// 4️⃣ Componente Principal
// -------------------------------
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
          <XAxis
            dataKey="Semana"
            label={{ value: "Semana del Año", position: "bottom", offset: 0 }}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            label={{
              value: "Ingresos (USD)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value: number | string, name: string) => {
              if (["open", "close", "high", "low"].includes(name)) {
                return [
                  `$${value}`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ];
              }
              return [null, null];
            }}
            labelFormatter={(label) => `Semana: ${label}`}
          />

          {/* Cuerpo de vela: representamos open y close como barras apiladas */}
          <Bar dataKey="open" fill="#ef4444" barSize={20} />
          <Bar dataKey="close" fill="#10b981" barSize={20} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <strong>Análisis Semanal:</strong> {suggestion}
      </div>
    </div>
  );
}
