"use client";

import React, { useEffect, useState } from "react";
import {
  createTasaCambio,
  getTasasCambio,
  deleteTasaCambio,
  updateTasaCambio,
} from "@/lib/tasaCambioService";
import { Edit, Trash2, Check, X } from "lucide-react";

interface Tasa {
  id: number;
  currency: string;
  rateToUSD: number;
}

export default function ExchangeRates() {
  const [tasas, setTasas] = useState<Tasa[]>([]);
  const [currency, setCurrency] = useState("");
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState<string>("");

  const loadTasas = async () => {
    try {
      setLoading(true);
      const data = await getTasasCambio();
      setTasas(data);
    } catch {
      setError("Error al cargar las tasas de cambio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasas();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!currency || !rate) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      await createTasaCambio({
        currency: currency.toUpperCase(),
        rateToUSD: parseFloat(rate),
      });
      setMessage(`Tasa de ${currency.toUpperCase()} creada correctamente`);
      setCurrency("");
      setRate("");
      await loadTasas();
    } catch {
      setError("Error al crear la tasa. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta tasa?")) return;
    try {
      setLoading(true);
      await deleteTasaCambio(id);
      await loadTasas();
    } catch {
      setError("Error al eliminar la tasa");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tasa: Tasa) => {
    setEditId(tasa.id);
    setEditRate(String(tasa.rateToUSD));
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditRate("");
  };

  const handleUpdate = async (id: number) => {
    if (!editRate) {
      setError("La tasa no puede estar vacía.");
      return;
    }

    try {
      setLoading(true);
      await updateTasaCambio(id, { rateToUSD: parseFloat(editRate) });
      setMessage("Tasa de cambio actualizada correctamente");
      setEditId(null);
      await loadTasas();
    } catch {
      setError("Error al actualizar la tasa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        💱 Gestión de Tasas de Cambio
      </h2>

      {/* Mensajes */}
      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
          {message}
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Moneda (Ej: EUR)"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Valor en USD"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-500 text-center">Cargando tasas...</p>
      ) : tasas.length === 0 ? (
        <p className="text-gray-500 text-center">
          No hay tasas de cambio registradas.
        </p>
      ) : (
        <table className="w-full border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Moneda</th>
              <th className="p-3 border-b">Tasa en USD</th>
              <th className="p-3 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasas.map((tasa) => (
              <tr
                key={tasa.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="p-3 border-b font-medium text-gray-800">
                  {tasa.currency}
                </td>

                {/* Si está en modo edición */}
                <td className="p-3 border-b text-gray-700">
                  {editId === tasa.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-24 text-center focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  ) : (
                    tasa.rateToUSD
                  )}
                </td>

                <td className="p-3 border-b text-center space-x-2">
                  {editId === tasa.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(tasa.id)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
                      >
                        <Check size={16} />
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-gray-500 hover:bg-gray-600"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(tasa)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:ring-2 focus:ring-amber-400"
                      >
                        <Edit size={16} />
                        Cambiar
                      </button>

                      <button
                        onClick={() => handleDelete(tasa.id)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
