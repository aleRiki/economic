"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const accounts = [
  { name: "Cuenta EUR", last4: "4821" },
  { name: "Cuenta USD", last4: "9173" },
  { name: "Cuenta CUP", last4: "3019" },
];

export default function IncomeForm() {
  const params = useSearchParams();
  const selectedCard = params.get("card");

  const [cardId, setCardId] = useState(selectedCard || "");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  // Estado para mostrar mensajes de usuario (reemplazando alert())
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previene el envío por defecto del formulario
    setMessage(null); // Limpia mensajes anteriores

    if (!cardId || !amount || !date) {
      setMessage({ type: 'error', text: "Por favor completa todos los campos obligatorios." });
      return;
    }

    // Aquí iría la lógica de envío de datos
    console.log({ cardId, amount, desc, date });
    setMessage({ type: 'success', text: "Ingreso registrado correctamente." });

    // Opcionalmente, puedes limpiar los campos después del éxito si fuera necesario
    // setCardId(""); setAmount(""); setDesc(""); setDate("");
  };

  const messageClasses = message 
    ? message.type === 'error' 
      ? "bg-red-100 border-red-400 text-red-700" 
      : "bg-green-100 border-green-400 text-green-700"
    : "";

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-xl space-y-5 border border-gray-100">
      <h2 className="text-2xl font-extrabold text-blue-700">Registrar Nuevo Ingreso</h2>

      {/* Caja de mensaje para reemplazar el alert() */}
      {message && (
        <div className={`p-3 rounded-lg border text-sm transition-all ${messageClasses}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de tarjeta */}
        <div className="space-y-1">
          <label htmlFor="card-select" className="block text-sm font-medium text-gray-700">
            Seleccionar Cuenta <span className="text-red-500">*</span>
          </label>
          <select
            id="card-select"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
          >
            <option value="">-- Selecciona --</option>
            {accounts.map((acc) => (
              <option key={acc.last4} value={acc.last4}>
                {acc.name} •••• {acc.last4}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <div className="space-y-1">
          <label htmlFor="amount-input" className="block text-sm font-medium text-gray-700">
            Monto <span className="text-red-500">*</span>
          </label>
          <input
            id="amount-input"
            type="number"
            placeholder="Ej. 1500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Descripción */}
        <div className="space-y-1">
          <label htmlFor="desc-input" className="block text-sm font-medium text-gray-700">
            Descripción (Opcional)
          </label>
          <input
            id="desc-input"
            type="text"
            placeholder="Ej. Depósito mensual"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
        </div>

        {/* Fecha */}
        <div className="space-y-1">
          <label htmlFor="date-input" className="block text-sm font-medium text-gray-700">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            required
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-150 shadow-md hover:shadow-lg"
        >
          Guardar Ingreso
        </button>
      </form>
    </div>
  );
}
