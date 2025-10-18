"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";   
import { Label } from "@/components/ui/label";   
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";
import { AxiosError } from "axios"; // 👈 Importamos AxiosError para un mejor tipado

// URL base de la API (Asegúrate de que esta constante sea accesible)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// --- TIPOS ---
type FormData = {
  number: string;
  account: string; 
};

// --- API: Función para crear la tarjeta ---
const createCard = async (data: { number: string; account: number }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) throw new Error("Token de autenticación no encontrado.");

  const response = await axios.post(`${API_BASE_URL}/card`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function NewCardForm() {
  // 💥 Inicializamos el router
  const router = useRouter(); 
  
  const [formData, setFormData] = useState<FormData>({
    number: "",
    account: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const accountNumber = parseInt(formData.account);

    if (formData.number.length < 10 || isNaN(accountNumber) || accountNumber <= 0) {
      setError("Por favor, verifica el número de tarjeta (mín. 10 dígitos) y el ID de cuenta.");
      setLoading(false);
      return;
    }

    try {
      // 1. Llamada a la API
      await createCard({
        number: formData.number,
        account: accountNumber,
      });

      setSuccess("¡Tarjeta creada exitosamente! Redirigiendo...");
      
      // 2. 💥 Redirección después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        // Redirige a la ruta deseada, por ejemplo, el listado de tarjetas
        router.push("/router/dashboard/accounts"); 
      }, 1500); // 1.5 segundos de retraso
      
    } catch (err) { // 👈 CORRECCIÓN 1: Dejamos el tipo inferido o usamos 'unknown'
      console.error("Error al crear tarjeta:", err);
      
      let errorMessage = "Error al conectar con el servidor o desconocido.";

      // 85:19 ERROR CORREGIDO: Usamos la función de AxiosError para manejar el tipado de la respuesta
      if (axios.isAxiosError(err)) {
        // El error tiene una propiedad 'response' con la data del backend
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        // Es un Error estándar
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      // Solo desactivamos loading si hubo un error o si el éxito fue manejado por el setTimeout.
      // Aquí el `if` original está bien: el loading sigue si el success ya está seteado (para la redirección).
      if (!success) {
          setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
        <CreditCard className="w-6 h-6 mr-3 text-blue-600" /> 
        Registrar Nueva Tarjeta
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Vincula un nuevo número de tarjeta a una cuenta existente.
      </p>

      {/* --- Mensajes de Estado --- */}
      {success && (
        <div className="flex items-center p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      {/* --- Formulario --- */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Campo Número de Tarjeta */}
        <div>
          <Label htmlFor="number" className="text-sm font-medium text-gray-700">
            Número de Tarjeta
          </Label>
          <Input
            id="number"
            type="text"
            placeholder="Ej: 1234567890123456"
            value={formData.number}
            onChange={handleChange}
            required
            pattern="\d{10,19}" 
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-1">
            Mínimo 10 dígitos. Solo números.
          </p>
        </div>

        {/* Campo ID de Cuenta (Account ID) */}
        <div>
          <Label htmlFor="account" className="text-sm font-medium text-gray-700">
            ID de Cuenta Asociada (Account ID)
          </Label>
          <Input
            id="account"
            type="number"
            placeholder="Ej: 6"
            value={formData.account}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-1">
            Este debe ser el ID de una cuenta existente en el sistema.
          </p>
        </div>

        {/* Botón de Enviar */}
        <Button
          type="submit"
          className="w-full py-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-150"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-5 w-5" />
          )}
          {loading ? "Creando Tarjeta..." : "Crear Tarjeta"}
        </Button>
        
      </form>
    </div>
  );
}