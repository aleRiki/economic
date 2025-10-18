"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Asumiendo que instalaste la tabla de Shadcn
import { RefreshCw, Save, Plus, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Asumiendo que instalaste la card de Shadcn

// ----------------------------------------------------------------------
// TASAS DE CAMBIO INICIALES (Simulando la carga de datos)
// ----------------------------------------------------------------------
const INITIAL_RATES: Record<string, number> = {
  USD: 1,
  CUP: 1 / 467,
  EUR: 1 / 0.80,
  Savings: 1 / 250, 
  Euro: 1 / 0.80, 
};

// ----------------------------------------------------------------------
// FUNCIÓN PARA FORMATEAR (Solo para presentación en el input)
// ----------------------------------------------------------------------

// Transforma el valor fraccionario (1/X) en el valor decimal para el Input.
const formatRateToDisplay = (value: number): string => {
  // Mostramos el valor con una buena precisión, pero evitamos fracciones grandes.
  return value.toFixed(6);
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function ExchangeRateForm() {
  const [rates, setRates] = useState<Record<string, number>>(INITIAL_RATES);
  const [newCurrency, setNewCurrency] = useState('');
  const [newRateValue, setNewRateValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  // ----------------------------------
  // MANEJADORES DE ESTADO
  // ----------------------------------

  // Maneja el cambio de una tasa existente
  const handleRateChange = (currency: string, value: string) => {
    // Solo permitimos números (decimales)
    const numValue = parseFloat(value);
    
    setRates(prevRates => ({
      ...prevRates,
      [currency]: isNaN(numValue) ? 0 : numValue,
    }));
    setStatusMessage({ message: '', type: null });
  };
  
  // Maneja la adición de una nueva divisa
  const handleAddRate = () => {
    const currencyKey = newCurrency.trim().toUpperCase();
    const rateNum = parseFloat(newRateValue);

    if (!currencyKey || isNaN(rateNum) || rateNum <= 0) {
      setStatusMessage({ message: 'El nombre y la tasa deben ser válidos.', type: 'error' });
      return;
    }
    if (rates.hasOwnProperty(currencyKey)) {
        setStatusMessage({ message: `La divisa '${currencyKey}' ya existe.`, type: 'error' });
        return;
    }

    setRates(prevRates => ({
      ...prevRates,
      [currencyKey]: rateNum,
    }));
    setNewCurrency('');
    setNewRateValue('');
    setStatusMessage({ message: `Tasa para ${currencyKey} agregada. ¡No olvides guardar!`, type: 'success' });
  };

  // Maneja la eliminación de una divisa
  const handleDeleteRate = (currency: string) => {
    if (currency === 'USD') {
        setStatusMessage({ message: 'La divisa base (USD) no puede ser eliminada.', type: 'error' });
        return;
    }
    
    setRates(prevRates => {
      const { [currency]: _, ...rest } = prevRates;
      return rest;
    });
    setStatusMessage({ message: `Tasa para ${currency} eliminada. ¡No olvides guardar!`, type: 'success' });
  };

  // ----------------------------------
  // MANEJADOR DE ENVÍO (Simulación de guardar en API/BD)
  // ----------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ message: '', type: null });

    // 1. Aquí se enviaría el objeto 'rates' a tu backend.
    // Ejemplo de cómo se vería el objeto rates: 
    // { USD: 1, CUP: 0.002141, EUR: 1.25, Savings: 0.004, ... }
    console.log("Guardando las siguientes tasas de cambio:", rates);

    // 2. Simulación de llamada a API
    setTimeout(() => {
      setSaving(false);
      // Aquí se validaría si la API devolvió éxito o error
      setStatusMessage({ 
        message: "¡Tasas de cambio guardadas exitosamente!", 
        type: 'success' 
      });
      // En un caso real, podrías recargar las tasas aquí si la API lo requiriera.
    }, 1500); 
  };
  
  // ----------------------------------
  // RENDERIZADO
  // ----------------------------------

  const rateEntries = Object.entries(rates);
  
  return (
    <Card className="max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
            <RefreshCw className="w-6 h-6 mr-3 text-blue-600" />
            Gestión de Tasas de Cambio
        </CardTitle>
        <p className="text-sm text-gray-500">
            Define la tasa de conversión para cada divisa **respecto al USD** (ej: si 1 EUR = 1.10 USD, ingresa 1.10).
        </p>
      </CardHeader>
      
      <CardContent>
        {/* Mensajes de Estado */}
        {statusMessage.message && (
          <div 
            className={`flex items-center p-3 mb-4 text-sm rounded-lg ${
                statusMessage.type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`} 
            role="alert"
          >
            {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
            {statusMessage.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TABLA DE TASAS EXISTENTES */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[150px]">Divisa / Tipo</TableHead>
                  <TableHead>Tasa (Valor por 1 USD)</TableHead>
                  <TableHead className="text-right w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateEntries.map(([currency, value]) => (
                  <TableRow key={currency}>
                    <TableCell className="font-medium text-gray-800">{currency}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={formatRateToDisplay(value)}
                        onChange={(e) => handleRateChange(currency, e.target.value)}
                        required
                        disabled={saving || currency === 'USD'} // Deshabilita USD base
                        className="max-w-[200px]"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {currency !== 'USD' && (
                        <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleDeleteRate(currency)}
                            disabled={saving}
                            title={`Eliminar ${currency}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* SECCIÓN AÑADIR NUEVA TASA */}
          <div className="p-4 border rounded-lg bg-gray-50 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[120px]">
              <Label htmlFor="newCurrency">Nueva Divisa/Tipo (ej: JPY)</Label>
              <Input
                id="newCurrency"
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                placeholder="Nombre"
                disabled={saving}
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <Label htmlFor="newRateValue">Tasa (ej: 0.0076)</Label>
              <Input
                id="newRateValue"
                type="number"
                step="any"
                value={newRateValue}
                onChange={(e) => setNewRateValue(e.target.value)}
                placeholder="Tasa a 1 USD"
                disabled={saving}
                className="mt-1"
              />
            </div>
            <Button 
                type="button" 
                onClick={handleAddRate} 
                disabled={saving || !newCurrency || !newRateValue}
                className="bg-purple-600 hover:bg-purple-700 transition"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir
            </Button>
          </div>
          
          {/* BOTÓN DE GUARDAR */}
          <Button
            type="submit"
            className="w-full py-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-150"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          
        </form>
      </CardContent>
    </Card>
  );
}