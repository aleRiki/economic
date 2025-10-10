// ./components/CurrencyDistribution.jsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Datos simulados: Ahora incluimos la frecuencia (num_tx) y el valor
const data = [
  { currency: "USD", value: 14200, num_tx: 55, color: "#2563eb" },
  { currency: "EUR", value: 10850, num_tx: 30, color: "#10b981" },
  { currency: "CUP", value: 250000, num_tx: 90, color: "#ef4444" },
];

export default function CurrencyDistribution() {
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Distribución por Moneda y Frecuencia de Transacciones</h2>

      {/* Indicadores de Frecuencia */}
      <div className="flex justify-around text-center p-3 border-b">
        {data.map(item => (
            <div key={item.currency}>
                <span className="text-xs text-gray-500 block">Transacciones {item.currency}</span>
                <p className="text-xl font-bold text-gray-800">{item.num_tx}</p>
            </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20 }}>
          <XAxis dataKey="currency" />
          {/* El YAxis principal para el Valor */}
          <YAxis yAxisId="left" orientation="left" stroke="#6366f1" label={{ value: 'Valor (Unidades)', angle: -90, position: 'insideLeft' }} />
          {/* Un segundo YAxis para la Frecuencia */}
          <YAxis yAxisId="right" orientation="right" stroke="#f97316" label={{ value: 'Frecuencia (N° TX)', angle: 90, position: 'insideRight' }} />
          
          <Tooltip 
            formatter={(value, name) => {
              if (name === "value") return [value.toLocaleString(), "Valor Acumulado"];
              if (name === "num_tx") return [value, "Frecuencia (N° TX)"];
              return [value, name];
            }}
          />
          <Legend />
          
          {/* Barra para el Valor Acumulado */}
          <Bar yAxisId="left" dataKey="value" name="Valor Acumulado" fill="#2563eb" />
          
          {/* Usamos una línea sobre las barras para la Frecuencia (concurrencia) */}
          <Bar yAxisId="right" dataKey="num_tx" name="Frecuencia (N° TX)" fill="#f97316" opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}