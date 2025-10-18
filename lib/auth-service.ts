import axios, { AxiosError } from "axios";
// Asumo que tienes este tipo definido en tu proyecto
import { RegisterDto } from "@/app/auth/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TAST = 'https://currencyapi.net/api/v1/rates?base=USD&output=json&key=3cace054aff655baf4721222b00e08225b30';

// Tipos necesarios para la función getAccounts
export interface Account {
  id: number;
  name: string;
  type: string; // Ejemplo: 'USD', 'EUR', 'CUP'
  balance: string;
  createAt: string; 
  deletedAt: string | null;
}

// ✨ NUEVOS TIPOS para el manejo de Tarjetas y Transacciones
export interface Card {
  id: number;
  number: string;
  balance: string;
  account: {
    name: string;
    type: string; // Ej: 'USD'
    balance: string;
  };
  deletedAt: string | null;
}

export interface TransactionData {
    transactionType: "deposit" | "withdrawal";
    amount: number;
    description: string;
    cardId: number;
}


// -------------------------------------------------------------
// FUNCIONES DE AUTENTICACIÓN Y OBTENCIÓN DE DATOS (Existentes)
// -------------------------------------------------------------

// 1. Función de Registro (Sin cambios)
export const registerUser = async (data: RegisterDto) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    throw axiosError.response?.data || new Error("Ocurrió un error de red.");
  }
};

// 2. Función de Login (Sin cambios)
export const loginUser = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    const { token, email } = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }

    return { token, email };
  } catch (error) {
    const axiosError = error as any;
    throw axiosError.response?.data || new Error("No se pudo iniciar sesión.");
  }
};

// 3. Obtener la lista de cuentas (Sin cambios)
export const getAccounts = async (): Promise<Account[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 401) throw new Error("Token de autenticación expirado o inválido.");
    throw axiosError.response?.data || new Error("Error al obtener las cuentas.");
  }
};

// 4. Obtener el Banco (Sin cambios)
export const getBank = async (): Promise<Account[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 401) throw new Error("Token de autenticación expirado o inválido.");
    throw axiosError.response?.data || new Error("Error al obtener las cuentas.");
  }
};

// 5. Obtener Tarjetas (Aseguramos el tipo de retorno Card[])
export const getCard = async (): Promise<Card[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/card`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Asumimos que la respuesta es un array de Card
    return response.data as Card[]; 
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 401) throw new Error("Token de autenticación expirado o inválido.");
    throw axiosError.response?.data?.message || new Error("Error al obtener las tarjetas.");
  }
};

// 6. Obtener Transacciones (Sin cambios)
export const getTransaction = async (): Promise<any[]> => { // Usamos any[] ya que el tipo completo es complejo
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/transaction`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 401) throw new Error("Token de autenticación expirado o inválido.");
    throw axiosError.response?.data || new Error("Error al obtener las transacciones.");
  }
};


// -------------------------------------------------------------
// ✨ FUNCIÓN MODIFICADA: Registrar Transacción
// -------------------------------------------------------------
export const postTransaction = async (data: TransactionData): Promise<any> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    // Enviamos los datos en el cuerpo de la solicitud POST
    const response = await axios.post(`${API_BASE_URL}/transaction`, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', // Aseguramos el tipo de contenido
      },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 401) throw new Error("Token de autenticación expirado o inválido.");
    
    // Devolvemos el mensaje de error del backend
    throw (
      axiosError.response?.data?.message || new Error("Error al registrar la transacción.")
    );
  }
};
export const getTazadeCambio = async (): Promise<any[]> => { // Usamos any[] ya que el tipo completo es complejo
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/bank/rates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 401) throw new Error("Token de autenticación expirado o inválido.");
    throw axiosError.response?.data || new Error("Error al obtener las transacciones.");
  }
};