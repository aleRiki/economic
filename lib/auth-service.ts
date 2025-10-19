import axios from "axios";
// Asumo que tienes estos tipos definidos en tu proyecto
import { RegisterDto, LoginDto } from "@/app/auth/types/auth"; // Se asume importación de LoginDto

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- TIPOS DE INTERFAZ DE DATOS ---

// Tipos necesarios para la función getAccounts
export interface Account {
  id: number;
  name: string;
  type: string; // Ejemplo: 'USD', 'EUR', 'CUP'
  balance: string;
  createAt: string;
  deletedAt: string | null;
}

// Tipos para el manejo de Tarjetas y Transacciones
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

// Tipos para respuestas de funciones
export interface LoginResponse {
  token: string;
  email: string;
}

export interface PostResponse {
  message: string;
  // Agrega más campos si tu API retorna algo específico después de un POST
}

export const registerUser = async (data: RegisterDto) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Manejo de errores de Axios
      throw error.response?.data || new Error("Ocurrió un error de red.");
    }
    throw new Error("Error desconocido al registrar.");
  }
};

export const loginUser = async (data: LoginDto): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    const { token, email } = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }

    return { token, email };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error("No se pudo iniciar sesión.");
    }
    throw new Error("Error desconocido al iniciar sesión.");
  }
};


export const getAccounts = async (): Promise<Account[]> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401)
        throw new Error("Token de autenticación expirado o inválido.");
      throw error.response?.data || new Error("Error al obtener las cuentas.");
    }
    throw new Error("Error desconocido al obtener las cuentas.");
  }
};


export const getBank = async (): Promise<Account[]> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401)
        throw new Error("Token de autenticación expirado o inválido.");
      throw (
        error.response?.data ||
        new Error("Error al obtener las cuentas del banco.")
      );
    }
    throw new Error("Error desconocido al obtener las cuentas del banco.");
  }
};

// Obtener Tarjetas (Catch block corregido)
export const getCard = async (): Promise<Card[]> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/card`, {
      headers: { Authorization: `Bearer ${token}` },
    }); // Asumimos que la respuesta es un array de Card
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401)
        throw new Error("Token de autenticación expirado o inválido."); // Se lanza el mensaje de error si existe
      throw (
        error.response?.data?.message ||
        new Error("Error al obtener las tarjetas.")
      );
    }
    throw new Error("Error desconocido al obtener las tarjetas.");
  }
};

// Obtener Transacciones (Tipado a unknown[] y catch block corregido)
export const getTransaction = async (): Promise<unknown[]> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/transaction`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401)
        throw new Error("Token de autenticación expirado o inválido.");
      throw (
        error.response?.data || new Error("Error al obtener las transacciones.")
      );
    }
    throw new Error("Error desconocido al obtener las transacciones.");
  }
};

// Registrar Transacción (Tipado a PostResponse y catch block corregido)
export const postTransaction = async (
  data: TransactionData
): Promise<PostResponse> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado."); // Enviamos los datos en el cuerpo de la solicitud POST

    const response = await axios.post(`${API_BASE_URL}/transaction`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Aseguramos el tipo de contenido
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401)
        throw new Error("Token de autenticación expirado o inválido."); // Devolvemos el mensaje de error del backend
      throw (
        error.response?.data?.message ||
        new Error("Error al registrar la transacción.")
      );
    }
    throw new Error("Error desconocido al registrar la transacción.");
  }
};

// Obtener Tasa de Cambio (Tipado a unknown y catch block corregido)
export const getTazadeCambio = async (): Promise<unknown> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/bank/rates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401)
        throw new Error("Token de autenticación expirado o inválido.");
      throw (
        error.response?.data || new Error("Error al obtener la tasa de cambio.")
      );
    }
    throw new Error("Error desconocido al obtener la tasa de cambio.");
  }
};
export const getTasasCambio = async () => {
  const response = await axios.get(`${API_BASE_URL}/tasa-cambio`);
  return response.data;
};