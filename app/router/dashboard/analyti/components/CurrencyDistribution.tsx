"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect, useCallback } from 'react';
import { getTransaction } from "@/lib/auth-service";  


// ----------------------------------------------------------------------
// TIPOS Y UTILIDADES
// ----------------------------------------------------------------------

interface ChartData {
  currency: string;
  value: number; 
  num_tx: number; 
  color: string; 
}

// Interfaz mínima para el tipo de datos que esperamos de la API de transacciones
interface MinimalTransaction {
  amount: string; // Para parsear el monto
  card: {
    account: {
      type: string; // Para agrupar por moneda
    };
  } | null | undefined;
}


// Función para mapear el tipo de moneda a un color
const getCurrencyColor = (currency: string) => {
  switch (currency.toUpperCase()) {
    case "USD":
      return "#2563eb"; // Azul
    case "EUR":
    case "EURO": // Agrego un caso extra por si la API varía el nombre
      return "#10b981"; // Verde
    case "CUP":
      return "#ef4444"; // Rojo
    default:
      return "#6b7280"; // Gris por defecto
  }
};

/**
 * Procesa la lista de transacciones para agruparlas por tipo de moneda 
 * (currency type) y calcular la suma total del valor ('value') y el conteo 
 * de transacciones ('num_tx').
 * @param transactions Array de transacciones obtenidas de la API (MinimalTransaction[]).
 * @returns
 */
const aggregateTransactionData = (transactions: MinimalTransaction[]): ChartData[] => {
  const aggregated = transactions.reduce((acc, transaction) => {
    
    // Acceso seguro a las propiedades anidadas
    const currency = transaction.card?.account?.type;
    // Aseguramos que amount sea una cadena antes de intentar parsear
    const amount = parseFloat(String(transaction.amount));

    if (currency && !isNaN(amount)) {
      if (!acc[currency]) {
        acc[currency] = {
          currency,
          value: 0,
          num_tx: 0,
          color: getCurrencyColor(currency),
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
      
      // SOLUCIÓN: Afirmamos que el resultado de getTransaction() es MinimalTransaction[]
      const processedData = aggregateTransactionData(transactions as MinimalTransaction[]);
      
      setChartData(processedData);
      
    } catch (err: unknown) { // Uso de 'unknown' para tipado seguro
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
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
        Cargando datos de transacciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow text-center text-red-600 border border-red-300">
        ❌ Error: {error}
      </div>
    );
  }

  if (chartData.length === 0) {
      return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
        No hay transacciones para mostrar.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Distribución por Moneda y Frecuencia de Transacciones</h2>

      
      <div className="flex justify-around text-center p-3 border-b">
        {chartData.map(item => (
            <div key={item.currency}>
                <span className="text-xs text-gray-500 block">Transacciones {item.currency}</span>
                
                <p className="text-xl font-bold text-gray-800">{item.num_tx}</p>
            </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 20 }}>
          <XAxis dataKey="currency" />
          
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#6366f1" 
            label={{ value: 'Valor (Unidades)', angle: -90, position: 'insideLeft' }} 
            
            tickFormatter={(value) => value.toLocaleString()}
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#f97316" 
            label={{ value: 'Frecuencia (N° TX)', angle: 90, position: 'insideRight' }}
            domain={['dataMin', 'dataMax']} 
            allowDecimals={false} 
          />
          
          <Tooltip 
            formatter={(value, name) => {
              if (name === "value") return [parseFloat(value as string).toLocaleString(), "Valor Acumulado"];
              if (name === "num_tx") return [value, "Frecuencia (N° TX)"];
              return [value, name];
            }}
          />
          <Legend />
          
        
          {/* Mapping individual Bar components by currency (for value) */}
          {chartData.map(item => (
            <Bar 
              key={`value-${item.currency}`}
              yAxisId="left" 
              dataKey="value" 
              name={`Valor Acumulado (${item.currency})`} 
              fill={item.color}
            />
          ))}


          <Bar 
            yAxisId="right" 
            dataKey="num_tx" 
            name="Frecuencia (N° TX)" 
            fill="#f97316" 
            opacity={0.7} 
          />
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}