import axios from "axios";
import { RegisterDto, LoginDto } from "@/app/auth/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- TIPOS DE INTERFAZ DE DATOS ---

export interface Account {
  id: number;
  name: string;
  type: string;
  balance: string;
  createAt: string;
  deletedAt: string | null;
}

export interface Card {
  id: number;
  number: string;
  balance: string;
  account: {
    name: string;
    type: string;
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

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
}

export interface PostResponse {
  message: string;
}

// --- FUNCIÓN DE UTILIDAD PARA LANZAR ERRORES ---
const throwApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      throw new Error("Token de autenticación expirado o inválido. Por favor, inicie sesión de nuevo.");
    }

    const apiMessage =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : null) ||
      error.message;

    throw new Error(apiMessage || defaultMessage);
  }

  throw new Error(defaultMessage);
};

// ----------------------------------------------------------------------
// 1. AUTENTICACIÓN
// ----------------------------------------------------------------------

export const registerUser = async (data: RegisterDto): Promise<PostResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    throwApiError(error, "Error desconocido al registrar.");
    return { message: "Error al registrar usuario." }; // Para satisfacer el compilador
  }
};

export const loginUser = async (data: LoginDto): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    const { token, email, name } = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("email", email);
      localStorage.setItem("name", name);
    }

    return { token, email, name };
  } catch (error) {
    throwApiError(error, "No se pudo iniciar sesión.");
    return { token: "", email: "", name: "" }; // Para satisfacer el compilador
  }
};

export const getInitialAndName = () => {
  if (typeof window === "undefined") {
    return { initial: "?", name: "Cargando..." };
  }

  const userName = localStorage.getItem("name");
  const userEmail = localStorage.getItem("email");
  const display = userName || userEmail;

  if (display) {
    const initial = display.charAt(0).toUpperCase();
    return { initial, name: display };
  }

  return { initial: "U", name: "Usuario" };
};

// ----------------------------------------------------------------------
// 2. CUENTAS Y BANCO
// ----------------------------------------------------------------------
export const getAccounts = async (): Promise<Account[]> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener las cuentas.");
    return []; 
  }
};


export const getBank = async (): Promise<Account[]> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener la información del banco.");
     return [];
  }
};

export const getCard = async (): Promise<Card[]> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/card`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener las tarjetas.");
     return [];
  }
};

// ----------------------------------------------------------------------
// 3. TRANSACCIONES
// ----------------------------------------------------------------------

export const getTransaction = async (): Promise<unknown[]> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/transaction`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener las transacciones.");
     return [];
  }
};

export const postTransaction = async (data: TransactionData): Promise<PostResponse> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.post(`${API_BASE_URL}/transaction`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throwApiError(error, "Error al registrar la transacción.");
    return { message: "Error al registrar transacción." };
  }
};

// ----------------------------------------------------------------------
// 4. TASAS DE CAMBIO
// ----------------------------------------------------------------------

export const getTasaDeCambio = async (): Promise<unknown> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado.");

    const response = await axios.get(`${API_BASE_URL}/bank/rates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener la tasa de cambio.");
  }
};

export const getTasasCambio = async (): Promise<unknown> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasa-cambio`);
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener las tasas de cambio.");
  }
};