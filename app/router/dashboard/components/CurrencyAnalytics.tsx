"use client";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area, // Usamos Area para el balance neto
} from "recharts";

// -------------------------------
// 1️⃣ Tipos: Adaptados para Ingresos y Gastos
// -------------------------------
type FinanceData = {
  Semana: number;
  Ingresos: number;
  Gastos: number;
  BalanceNeto: number; // Ingresos - Gastos
};

// -------------------------------
// 2️⃣ Datos de ejemplo: Datos realistas de finanzas
// -------------------------------
const data: FinanceData[] = [
  { Semana: 27, Ingresos: 3500, Gastos: 2100, BalanceNeto: 1400 },
  { Semana: 28, Ingresos: 3800, Gastos: 2500, BalanceNeto: 1300 },
  { Semana: 29, Ingresos: 3200, Gastos: 2000, BalanceNeto: 1200 },
  { Semana: 30, Ingresos: 4100, Gastos: 2900, BalanceNeto: 1200 },
  { Semana: 31, Ingresos: 4500, Gastos: 3200, BalanceNeto: 1300 },
  { Semana: 32, Ingresos: 4800, Gastos: 3000, BalanceNeto: 1800 },
  { Semana: 33, Ingresos: 4200, Gastos: 2700, BalanceNeto: 1500 },
  { Semana: 34, Ingresos: 5000, Gastos: 3500, BalanceNeto: 1500 },
];

// -------------------------------
// 3️⃣ Función de Análisis y Sugerencia
// -------------------------------
function getSuggestion(data: FinanceData[]) {
  const last = data[data.length - 1];
  const previous = data[data.length - 2];
  
  if (!previous) {
      return `📊 Análisis inicial. Los ingresos son $${last.Ingresos.toLocaleString()} y los gastos $${last.Gastos.toLocaleString()} en la Semana ${last.Semana}.`;
  }
  
  const balanceGrowth = last.BalanceNeto - previous.BalanceNeto;
  
  if (balanceGrowth > 0) {
    return `✅ ¡Balance neto mejoró! Aumentó en $${balanceGrowth.toLocaleString()} respecto a la semana anterior. Mantén el enfoque en la diferencia.`;
  } else if (balanceGrowth < 0) {
    return `⚠️ El balance neto se redujo en $${Math.abs(balanceGrowth).toLocaleString()}. Revisa si fue por un aumento en gastos o una caída en ingresos.`;
  } else {
    return `⏸️ El balance neto se mantuvo estable. Es un buen momento para buscar nuevas oportunidades de ingreso.`;
  }
}

// -------------------------------
// 4️⃣ Componente Principal
// -------------------------------
export default function WeeklyFinanceAnalytics() {
  const suggestion = getSuggestion(data);

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Análisis Semanal de Flujo de Efectivo (USD)
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} barGap={10}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis
            dataKey="Semana"
            label={{ value: "Semana del Año", position: "bottom", offset: 0 }}
          />
          
          <YAxis
            yAxisId="left" // Eje Y para Barras (Ingresos/Gastos)
            label={{
              value: "Monto (USD)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          
          <YAxis
            yAxisId="right" // Eje Y para Área (Balance Neto)
            orientation="right"
            stroke="#1d4ed8" // Azul
            domain={["dataMin", "dataMax"]}
            tick={false} // No mostrar ticks, solo usar para el dominio
          />
          
          <Tooltip
            labelFormatter={(label) => `Semana: ${label}`}
            formatter={(value: number, name: string) => {
              return [`$${value.toLocaleString()}`, name];
            }}
          />

          {/* Área para el Balance Neto (usando el eje derecho) */}
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="BalanceNeto" 
            stroke="#1d4ed8" 
            fillOpacity={0.1} 
            fill="#1d4ed8" 
            name="Balance Neto"
          />

          {/* Barras: Ingresos y Gastos */}
          <Bar 
            yAxisId="left"
            dataKey="Ingresos" 
            fill="#10b981" // Verde para Ingresos
            name="Ingresos" 
          />
          <Bar 
            yAxisId="left"
            dataKey="Gastos" 
            fill="#ef4444" // Rojo para Gastos
            name="Gastos"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <strong>Análisis:</strong> {suggestion}
      </div>
    </div>
  );
}