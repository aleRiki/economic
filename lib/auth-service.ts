import axios from "axios";
// Asumiendo que estos tipos están definidos en tu frontend
import { RegisterDto, LoginDto } from "@/app/auth/types/auth";

// URL base de tu API, usa un fallback por seguridad
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

// --- TIPOS DE INTERFAZ DE DATOS ---

export interface Account {
  id: number;
  name: string;
  type: string;
  // Usamos string para balance, ya que es la forma común de manejar dinero desde una API para evitar errores de coma flotante.
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

// 🚨 TIPO CORREGIDO: "withdraw" coincide con el enum de NestJS
export type TransactionType = "deposit" | "withdraw";

export interface TransactionData {
  transactionType: TransactionType;
  amount: number;
  description: string;
  cardId: number; // ID de la tarjeta usada para la transacción
}

export type TransactionCategoryType =
  | "salary"
  | "investment"
  | "bonus"
  | "refund"
  | "other_income"
  | "rent"
  | "food_groceries"
  | "entertainment"
  | "transportation"
  | "utilities_electricity"
  | "utilities_phone"
  | "utilities_internet"
  | "debt_payment"
  | "health_care"
  | "shopping"
  | "other_expense";

// NUEVA INTERFAZ: Usada para tipar los datos brutos recibidos de la API (amount es string)
export interface RawUserTransaction {
  id: number;
  transactionType: TransactionType;
  category: TransactionCategoryType;
  amount: string; // <-- Viene como string de la API
  description: string;
  createdAt: string;
  card: {
    id: number;
    number: string;
    account: {
      id: number;
      name: string;
    };
    balance: string; // <-- Asumiendo que también puede ser string aquí
  };
}

// 🚨 INTERFAZ PARA EL DASHBOARD (Datos ya procesados con amount como number)
export interface ProcessedUserTransaction {
  id: number;
  transactionType: TransactionType;
  category: TransactionCategoryType;
  amount: number; // <-- Convertido a number en el frontend
  description: string;
  createdAt: string;
  card: {
    id: number;
    number: string;
    account: {
      id: number;
      name: string;
    };
    balance: number; // <-- Convertido a number en el frontend
  };
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
/**
 * Maneja errores de Axios y lanza un error con un mensaje más amigable o detallado.
 */
const throwApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Error común de token expirado
      throw new Error(
        "Token de autenticación expirado o inválido. Por favor, inicie sesión de nuevo."
      );
    }

    // Intenta obtener el mensaje de error de la respuesta del API (típico de NestJS)
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

export const registerUser = async (
  data: RegisterDto
): Promise<PostResponse> => {
  try {
    // Endpoint: POST /auth/register
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    throwApiError(error, "Error desconocido al registrar.");
    return { message: "Error desconocido" };
  }
};

export const loginUser = async (data: LoginDto): Promise<LoginResponse> => {
  try {
    // Endpoint: POST /auth/login
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    const { token, email, name } = response.data;

    // Guardar token y datos del usuario en el navegador
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("email", email);
      localStorage.setItem("name", name);
    }

    return { token, email, name };
  } catch (error) {
    throwApiError(
      error,
      "No se pudo iniciar sesión. Verifique sus credenciales."
    );
    return { token: "", email: "", name: "" };
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
// 2. CUENTAS Y TARJETAS
// ----------------------------------------------------------------------

// 🚨 FUNCIÓN DE UTILIDAD para obtener el token antes de cada solicitud segura
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token)
    throw new Error("Token de autenticación no encontrado. Inicie sesión.");
  return { Authorization: `Bearer ${token}` };
};

export const getAccounts = async (): Promise<Account[]> => {
  try {
    // Endpoint: GET /accounts
    const response = await axios.get(`${API_BASE_URL}/accounts`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener las cuentas.");
    return [];
  }
};

export const getBank = async (): Promise<Account[]> => {
  try {
    // Endpoint: GET /bank
    const response = await axios.get(`${API_BASE_URL}/bank`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener la información del banco.");
    return [];
  }
};

export const getCard = async (): Promise<Card[]> => {
  try {
    // Endpoint: GET /card
    const response = await axios.get(`${API_BASE_URL}/card`, {
      headers: getAuthHeaders(),
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

/**
 * Obtiene todas las transacciones del usuario logueado.
 * El backend filtra automáticamente por el token JWT.
 */
export const getTransaction = async (): Promise<ProcessedUserTransaction[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transaction`, {
      headers: getAuthHeaders(),
    });

    // Tipado seguro: Los datos vienen como RawUserTransaction[] (amount es string)
    const rawData: RawUserTransaction[] = response.data;

    return rawData.map((t) => ({
      ...t,
      // Aseguramos que amount sea numérico
      amount: parseFloat(t.amount),
      card: {
        ...t.card,
        // Si card.balance también es string, es bueno convertirlo
        // Usamos el fallback a 0 si es necesario
        balance: parseFloat(t.card.balance) || 0,
      },
    })) as ProcessedUserTransaction[];
  } catch (error) {
    throwApiError(error, "Error al obtener las transacciones del usuario.");
    return [];
  }
};

/**
 * Registra una nueva transacción (depósito o retiro).
 */
export const postTransaction = async (
  data: TransactionData
): Promise<PostResponse> => {
  try {
    // Endpoint: POST /transaction
    const response = await axios.post(`${API_BASE_URL}/transaction`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throwApiError(
      error,
      "Error al registrar la transacción. Verifique el saldo o la tarjeta."
    );
    return { message: "Error desconocido" };
  }
};

// ----------------------------------------------------------------------
// 4. TASAS DE CAMBIO
// ----------------------------------------------------------------------

export const getTasaDeCambio = async (): Promise<unknown> => {
  try {
    // Endpoint: GET /bank/rates
    const response = await axios.get(`${API_BASE_URL}/bank/rates`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener la tasa de cambio.");
  }
};

export const getTasasCambio = async (): Promise<unknown> => {
  try {
    // Endpoint: GET /tasa-cambio (asumiendo que es público o no necesita auth)
    const response = await axios.get(`${API_BASE_URL}/tasa-cambio`);
    return response.data;
  } catch (error) {
    throwApiError(error, "Error al obtener las tasas de cambio.");
  }
};
