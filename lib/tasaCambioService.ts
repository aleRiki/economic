import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface TasaCambio {
  id?: number;
  currency: string;
  rateToUSD: number;
}

// Crear nueva tasa
export const createTasaCambio = async (data: TasaCambio) => {
  const response = await axios.post(`${API_BASE_URL}/tasa-cambio`, data);
  return response.data;
};

// Obtener todas las tasas
export const getTasasCambio = async (): Promise<TasaCambio[]> => {
  const response = await axios.get(`${API_BASE_URL}/tasa-cambio`);
  return response.data;
};

// Obtener una por moneda
export const getTasaByCurrency = async (currency: string): Promise<TasaCambio> => {
  const response = await axios.get(`${API_BASE_URL}/tasa-cambio/${currency}`);
  return response.data;
};

// Actualizar una tasa
export const updateTasaCambio = async (id: number, data: { rateToUSD: number }) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/tasa-cambio/${id}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("❌ Error al actualizar la tasa de cambio:", axiosError.response?.data || axiosError.message);
    throw new Error(
      axiosError.response?.data?.message || "Error al actualizar la tasa de cambio"
    );
  }
};

// Eliminar tasa
export const deleteTasaCambio = async (id: number) => {
  const response = await axios.delete(`${API_BASE_URL}/tasa-cambio/${id}`);
  return response.data;
};
