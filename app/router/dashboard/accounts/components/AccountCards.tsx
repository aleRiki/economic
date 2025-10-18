"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios"; // 👈 Importamos AxiosError
// Importamos Trash2 para el icono de eliminar
import { Plus, CreditCard, Trash2, Loader2 } from "lucide-react";

// -----------------------------------------------------------
// CONFIGURACIÓN Y TIPOS (Mantenidos)
// -----------------------------------------------------------

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

type CardData = {
  id: number;
  number: string;
  account: {
    id: number;
    name: string;
    type: string;
    currency: string;
    balance: string;
    bank?: string;
    createAt?: string;
    deletedAt?: null;
  };
  deletedAt?: null;
};

// -----------------------------------------------------------
// FUNCIONES API
// -----------------------------------------------------------

export const getCard = async (): Promise<CardData[]> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      throw new Error("Token de autenticación no encontrado.");
    }

    const response = await axios.get(`${API_BASE_URL}/card`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    // 👈 CORRECCIÓN 1 (Línea 53:37)
    // Se usa 'unknown' y se verifica si es un AxiosError
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Token de autenticación expirado o inválido.");
      }

      // Lanzamos el mensaje del backend o un error genérico de la petición
      throw (
        error.response?.data?.message ||
        new Error("Error al obtener las tarjetas.")
      );
    }

    // Si no es un AxiosError, lanzamos el error original o uno genérico.
    throw error instanceof Error
      ? error
      : new Error("Error desconocido al obtener las tarjetas.");
  }
};

// 💥 NUEVA FUNCIÓN: deleteCard
export const deleteCard = async (cardId: number): Promise<void> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Token de autenticación no encontrado.");
    }

    await axios.delete(`${API_BASE_URL}/card/${cardId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: unknown) {
    // 👈 CORRECCIÓN 2 (Línea 82:33)

    let errorMessage = `Error al eliminar la tarjeta con ID ${cardId}.`;

    if (axios.isAxiosError(error)) {
      // Lanzamos el mensaje del backend o el mensaje de Axios
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// -----------------------------------------------------------
// LÓGICA DE ESTILOS Y AUXILIARES (Mantenidos)
// -----------------------------------------------------------
const cardStylesByType: Record<string, string> = {
  // ... (código existente de estilos)
  Euro: "bg-gradient-to-br from-yellow-500 to-amber-700 text-white",
  USD: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900",
  CUP: "bg-gradient-to-br from-orange-800 to-red-900 text-white",
  DEFAULT: "bg-gradient-to-br from-blue-400 to-indigo-700 text-white",
  Savings: "bg-gradient-to-br from-green-400 to-green-700 text-white",
};

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "CUP":
      return "₱";
    default:
      return currency;
  }
};

const CardChip = () => (
  <svg /* ... (código SVG) ... */
    className="w-10 h-7 text-yellow-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="3"
      fill="#FFC72C"
      stroke="#374151"
      strokeWidth="1.5"
    />
    <path
      d="M7 10.5C7 9.11929 8.11929 8 9.5 8H14.5C15.8807 8 17 9.11929 17 10.5V13.5C17 14.8807 15.8807 16 14.5 16H9.5C8.11929 16 7 14.8807 7 13.5V10.5Z"
      fill="#FBBF24"
      stroke="#D97706"
      strokeWidth="1"
    />
    <rect x="10" y="11" width="4" height="2" fill="#374151" rx="0.5" />
  </svg>
);

// -----------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------

export default function AccountCards() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para manejar qué tarjeta se está eliminando (para deshabilitar el botón)
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCard();
      setCards(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar las tarjetas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // 💥 FUNCIÓN PARA MANEJAR LA ELIMINACIÓN
  const handleDelete = async (cardId: number) => {
    // Opcional: Confirmación con el usuario antes de eliminar
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setDeletingId(cardId);
    setError(null);

    try {
      await deleteCard(cardId);

      // 1. Actualizar el estado local (filtrar la tarjeta eliminada)
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

      // 2. Mostrar notificación de éxito (usa 'toast' si está implementado)
      // toast({ title: "Tarjeta Eliminada", description: "La tarjeta fue eliminada correctamente.", variant: "default" });
    } catch (err: unknown) {
      // 👈 CORRECCIÓN 3 (Línea 178:19)
      console.error("Error al eliminar:", err);

      let errorMessage = "Error al eliminar la tarjeta.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      // Mostrar notificación de error
      // toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // --- Estados de Presentación (Mantenidos) ---
  if (loading) {
    /* ... (código de loading) ... */
    return (
      // ... (código de loading) ...
      <div className="text-center p-8 text-gray-500 min-h-[300px] flex items-center justify-center">
        <div
          className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-500 rounded-full"
          role="status"
        >
          <span className="sr-only">Cargando...</span>
        </div>
        <p className="ml-3">Cargando tarjetas...</p>
      </div>
    );
  }

  if (error) {
    /* ... (código de error) ... */
    return (
      // ... (código de error) ...
      <div
        className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        role="alert"
      >
        <p className="font-bold">Error de Carga:</p>
        <p>{error}</p>
      </div>
    );
  }

  // --- Renderizado de Tarjetas y Botones ---
  return (
    <div className="relative p-4 md:p-6 bg-white rounded-xl shadow-lg min-h-[400px]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Mis Cuentas y Tarjetas
      </h1>

      {cards.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg font-semibold text-gray-700">
            No hay tarjetas registradas.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Usa el botón de abajo para vincular una nueva tarjeta.
          </p>
        </div>
      ) : (
        // Renderizado del GRID de Tarjetas
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => {
            const last4 = card.number.slice(-4);
            const account = card.account;
            const cardType = account.type;
            const style =
              cardStylesByType[cardType] || cardStylesByType.DEFAULT;
            const balanceValue = parseFloat(account.balance) || 0;
            const textColor =
              cardType === "USD" ? "text-gray-900" : "text-white";
            const isDeleting = deletingId === card.id;

            return (
              <div
                key={card.id}
                className={`relative rounded-xl p-6 shadow-xl overflow-hidden 
                                 transform hover:scale-[1.03] transition duration-300 ${style} 
                                 flex flex-col justify-between h-64`}
              >
                <div className="absolute inset-0 opacity-10 bg-repeat bg-[url('/path/to/subtle-pattern.svg')]"></div>

                {/* 1. Contenedor Superior: Nombre y Chip + Botón de Eliminar */}
                <div className="flex justify-between items-start w-full relative z-10">
                  <h2
                    className={`text-base uppercase font-bold tracking-wider ${textColor} drop-shadow-md`}
                  >
                    {account.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* 💥 BOTÓN DE ELIMINAR */}
                    <Button
                      onClick={() => handleDelete(card.id)}
                      variant="ghost"
                      size="icon"
                      // Asegura que el color del icono sea visible sobre el fondo de la tarjeta
                      className={`h-8 w-8 rounded-full ${textColor} hover:bg-white/20 p-0`}
                      disabled={isDeleting || deletingId !== null}
                      title="Eliminar Tarjeta"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <CardChip />
                  </div>
                </div>

                {/* 2. Información centralizada: Balance principal */}
                <div className="text-center py-4 relative z-10">
                  {/* ... (código de balance) ... */}
                  <p
                    className={`text-sm font-light ${textColor} opacity-80 mb-1`}
                  >
                    Balance Total
                  </p>
                  <p
                    className={`text-5xl font-extrabold tracking-tight ${textColor} drop-shadow-lg`}
                  >
                    {getCurrencySymbol(account.currency)}
                    {balanceValue.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* 3. Contenedor Inferior: Tipo, Número y Banco (Mantenido) */}
                <div className="flex justify-between items-end w-full relative z-10">
                  <div className="flex flex-col items-start">
                    <div
                      className={`text-xs font-medium uppercase opacity-70 ${textColor}`}
                    >
                      {cardType} Account
                    </div>
                    {account.bank && (
                      <div
                        className={`text-xs font-semibold opacity-70 mt-1 ${textColor}`}
                      >
                        {account.bank}
                      </div>
                    )}
                  </div>

                  <div
                    className={`text-lg tracking-widest font-mono ${textColor} drop-shadow-sm`}
                  >
                    ••• {last4}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTENEDOR DE BOTONES FLOTANTES EN LA ESQUINA DERECHA INFERIOR (Mantenido) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3">
        <Link href={`/router/dashboard/accounts/card/`} passHref>
          <Button
            className="shadow-xl bg-green-600 hover:bg-green-700 text-white p-4 rounded-full w-12 h-12 transition-all duration-300 hover:w-40 group"
            title="Crear Nueva Tarjeta"
          >
            <CreditCard className="w-5 h-5 transition-transform duration-300" />
            <span className="hidden group-hover:inline ml-2 text-sm font-semibold">
              Nueva Tarjeta
            </span>
          </Button>
        </Link>

        <Link href={`/router/dashboard/accounts/income`} passHref>
          <Button
            className="shadow-xl bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full w-12 h-12 transition-all duration-300 hover:w-36 group"
            title="Registrar Transacción"
          >
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="hidden group-hover:inline ml-2 text-sm font-semibold">
              Registrar
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
