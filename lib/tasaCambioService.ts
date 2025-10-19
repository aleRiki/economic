import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Crear nueva tasa
export const createTasaCambio = async (data: { currency: string; rateToUSD: number }) => {
  const response = await axios.post(`${API_BASE_URL}/tasa-cambio`, data);
  return response.data;
};

// Obtener todas
export const getTasasCambio = async () => {
  const response = await axios.get(`${API_BASE_URL}/tasa-cambio`);
  return response.data;
};

// Obtener una por moneda
export const getTasaByCurrency = async (currency: string) => {
  const response = await axios.get(`${API_BASE_URL}/tasa-cambio/${currency}`);
  return response.data;
};

// Actualizar una tasa
export const updateTasaCambio = async (
  id: number,
  data: { rateToUSD: number }
) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/tasa-cambio/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error al actualizar la tasa de cambio:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Error al actualizar la tasa de cambio"
    );
  }
};

// Eliminar tasa
export const deleteTasaCambio = async (id: number) => {
  const response = await axios.delete(`${API_BASE_URL}/tasa-cambio/${id}`);
  return response.data;
};
