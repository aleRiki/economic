"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, ReferenceLine } from "recharts";
import { useState, useEffect, useCallback } from 'react';
import { getTransaction } from "@/lib/auth-service"; 
import { BarChart2 } from 'lucide-react'; // Iconos para estilo

// ----------------------------------------------------------------------
// TIPOS Y UTILIDADES
// ----------------------------------------------------------------------

interface ChartData {
  currency: string;
  value: number; 
  num_tx: number; 
  color: string; 
  shadowColor: string; 
}

interface MinimalTransaction {
  amount: number; 
  card: {
    account: {
      type: string; 
    };
  } | null | undefined;
}


// Función para mapear el tipo de moneda a un color (Esquema CLARO y Futurista)
const getCurrencyColor = (currency: string) => {
  switch (currency.toUpperCase()) {
    case "USD":
      // Colores vibrantes que resaltan sobre fondo claro
      return { main: "#2563EB", shadow: "rgba(37, 99, 235, 0.2)" }; // Azul más oscuro para contraste
    case "EUR":
    case "EURO": 
      return { main: "#059669", shadow: "rgba(5, 150, 105, 0.2)" }; // Verde Teal oscuro
    case "CUP":
      return { main: "#F59E0B", shadow: "rgba(245, 158, 11, 0.2)" }; // Ámbar vibrante
    default:
      return { main: "#9CA3AF", shadow: "rgba(156, 163, 175, 0.1)" }; // Gris suave
  }
};

/**
 * Procesa la lista de transacciones (misma lógica)
 */
const aggregateTransactionData = (transactions: MinimalTransaction[]): ChartData[] => {
  const aggregated = transactions.reduce((acc, transaction) => {
    
    const currency = transaction.card?.account?.type;
    const amount = transaction.amount; 

    if (currency && typeof amount === 'number' && !isNaN(amount)) {
      const { main, shadow } = getCurrencyColor(currency);
      
      if (!acc[currency]) {
        acc[currency] = {
          currency,
          value: 0,
          num_tx: 0,
          color: main,
          shadowColor: shadow,
        };
      }

      acc[currency].value += amount;
      acc[currency].num_tx += 1;
    }

    return acc;
  }, {} as Record<string, ChartData>);

  
  return Object.values(aggregated);
};


// ----------------------------------------------------------------------
// CUSTOM TOOLTIP (Adaptado a tema claro)
// ----------------------------------------------------------------------
// Tipos locales para el tooltip (evitan `any` explícito y coinciden con lo que
// Recharts provee en `payload` en la práctica).
type TooltipItem = {
  dataKey?: string | number;
  color?: string;
  name?: string;
  value?: number | string | null;
  payload?: unknown;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[] | null;
  label?: string | number | undefined;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = (payload[0].payload ?? {}) as ChartData;

    const valueItem = payload.find((p: TooltipItem) => p.dataKey === 'value');
    const freqItem = payload.find((p: TooltipItem) => p.dataKey === 'num_tx');
    
    return (
      <div className="p-4 bg-white text-gray-800 border border-gray-200 shadow-xl rounded-lg text-sm backdrop-blur-sm bg-opacity-90">
        <p className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">{label}</p>
        
        {valueItem && (
            <p style={{ color: valueItem.color }} className="flex justify-between items-center my-1">
                <span className="font-semibold">Valor Total:</span> 
                <span className="text-right ml-4">{Number(valueItem.value ?? 0).toLocaleString()} {data.currency}</span>
            </p>
        )}
        
        {freqItem && (
            <p style={{ color: freqItem.color || '#F59E0B' }} className="flex justify-between items-center my-1">
                <span className="font-semibold">Frecuencia:</span> 
                <span className="text-right ml-4">{Number(freqItem.value ?? 0).toLocaleString()} Transacciones</span>
            </p>
        )}
      </div>
    );
  }
  return null;
};


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function CurrencyDistribution() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const transactions = await getTransaction(); 
      const processedData = aggregateTransactionData(transactions as unknown as MinimalTransaction[]);
      setChartData(processedData);
    } catch (err: unknown) {
      console.error("Error al obtener las transacciones:", err);
      const errorMessage = (err instanceof Error) 
          ? err.message 
          : "No se pudieron cargar los datos de las transacciones.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-600">
        Cargando datos de transacciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-xl shadow-lg text-center text-red-600 border border-red-300">
        ❌ Error: {error}
      </div>
    );
  }

  if (chartData.length === 0) {
      return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-600">
        No hay transacciones para mostrar.
      </div>
    );
  }
  
  // Usamos el color de la frecuencia para el segundo Eje Y (Ámbar para el tema claro)
  const freqColorMain = getCurrencyColor("CUP").main; // Usamos el main color del CUP para la frecuencia


  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 text-gray-800 border border-gray-100">
     <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 border-b border-gray-200 pb-3">
        <BarChart2 className="w-6 h-6 text-gray-700" />
        Análisis de Capital por Divisa (Dual-Axis)
      </h2>

      {/* Indicadores de Frecuencia */}
      <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4">
        {chartData.map(item => (
            <div key={item.currency} className="text-center p-3 border-r border-gray-200 last:border-r-0">
              <span className="text-xs text-gray-500 block font-medium">Frecuencia ({item.currency})</span>
              <p style={{ color: item.color }} className="text-2xl font-extrabold mt-1 drop-shadow-md">
                  {item.num_tx.toLocaleString()}
              </p>
            </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          barCategoryGap="30%" 
        >
          {/* Rejilla de fondo discreta para tema claro */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E7ED" />
          
          {/* Eje X (Moneda) */}
          <XAxis 
            dataKey="currency" 
            stroke="#6B7280" // Texto más oscuro para contraste
            tickLine={false} 
            axisLine={{ stroke: '#D1D5DB' }}
            style={{ fontSize: '14px', fontWeight: 'bold' }}
          />
          
          {/* Eje Y Izquierdo (Valor Acumulado) */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#2563EB" // Color USD principal
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${(value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            style={{ fontSize: '12px' }}
          />
          
          {/* Eje Y Derecho (Frecuencia) */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke={freqColorMain} 
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']} 
            allowDecimals={false} 
            style={{ fontSize: '12px' }}
          />
          
          {/* Tooltip personalizado y moderno */}
          <Tooltip 
            content={<CustomTooltip />}
            cursor={false} 
          />
          
          {/* Línea de referencia en cero para claridad (opcional en BarChart) */}
          <ReferenceLine y={0} stroke="#D1D5DB" strokeDasharray="3 3" yAxisId="left" />
          
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }} 
            iconType="square" 
            formatter={(value, entry) => <span style={{ color: entry.color || '#6B7280' }}>{value}</span>} // Ajuste de color para leyenda
          />
          
          {/* 1. Bar: Valor Acumulado (Barra principal, estilo NEON CLARO) */}
          <Bar 
            yAxisId="left" 
            dataKey="value" 
            name="Valor Acumulado"
            radius={[6, 6, 0, 0]} 
            minPointSize={5}
          >
            {chartData.map((item) => (
              <Cell 
                key={`val-${item.currency}`} 
                fill={item.color} 
                // Estilo 'Glow' usando filter drop-shadow
                style={{ filter: `drop-shadow(0px 0px 6px ${item.shadowColor})` }} // Sombra más sutil para tema claro
              />
            ))}
          </Bar>

          {/* 2. Bar: Frecuencia (Barra secundaria, color contrastante) */}
          <Bar 
            yAxisId="right" 
            dataKey="num_tx" 
            name="N° Transacciones" 
            fill={freqColorMain} // Usa el color principal del CUP
            radius={[6, 6, 0, 0]} 
            opacity={0.7} // Ligeramente más transparente
            minPointSize={5}
          />
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}