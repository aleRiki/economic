"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, CheckCircle, XCircle, Wallet } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Tipos ---
type Account = {
  id: number;
  name: string;
  type: string;
  balance: number | string;
  typeAccount: string;
  bank?: { name: string };
};

type FormData = {
  number: string;
  account: number;
};

// --- API: Crear tarjeta ---
const createCard = async (data: FormData) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) throw new Error("Token de autenticación no encontrado.");

  const response = await axios.post(`${API_BASE_URL}/card`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// --- API: Obtener cuentas ---
const fetchAccounts = async (): Promise<Account[]> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) throw new Error("Token de autenticación no encontrado.");

  const response = await axios.get(`${API_BASE_URL}/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------
export default function NewCardForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    number: "",
    account: 0,
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchAccounts();
        setAccounts(data);
      } catch (err) {
        console.error("Error al obtener cuentas:", err);
        setError("Error al cargar las cuentas. Intenta nuevamente.");
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: id === "account" ? parseInt(value) : value,
    });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.number.length < 10 || formData.account <= 0) {
      setError("Por favor, verifica el número de tarjeta (mín. 10 dígitos) y selecciona una cuenta válida.");
      setLoading(false);
      return;
    }

    try {
      await createCard(formData);
      setSuccess("¡Tarjeta creada exitosamente! Redirigiendo...");
      setTimeout(() => {
        router.push("/router/dashboard/accounts");
      }, 1500);
    } catch (err) {
      console.error("Error al crear tarjeta:", err);
      let errorMessage = "Error al conectar con el servidor o desconocido.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
        <CreditCard className="w-6 h-6 mr-3 text-blue-600" /> Registrar Nueva Tarjeta
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Vincula un nuevo número de tarjeta a una cuenta existente.
      </p>

      {success && (
        <div className="flex items-center p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Número de tarjeta */}
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
          <p className="text-xs text-gray-400 mt-1">Mínimo 10 dígitos. Solo números.</p>
        </div>

        {/* Seleccionar cuenta */}
        <div>
          <Label htmlFor="account" className="text-sm font-medium text-gray-700">
            Seleccionar Cuenta
          </Label>
          {loadingAccounts ? (
            <p className="text-sm text-gray-500">Cargando cuentas...</p>
          ) : (
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                id="account"
                value={formData.account}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              >
                <option value={0}>-- Selecciona una cuenta --</option>
                {accounts.map((acc) => {
                  const balanceNum = Number(acc.balance);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} • {acc.typeAccount} • {acc.type} (${isNaN(balanceNum) ? "0.00" : balanceNum.toFixed(2)})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">Selecciona la cuenta a la que deseas vincular esta tarjeta.</p>
        </div>

        {/* Botón enviar */}
        <Button
          type="submit"
          className="w-full py-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-150"
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
          {loading ? "Creando Tarjeta..." : "Crear Tarjeta"}
        </Button>
      </form>
    </div>
  );
}