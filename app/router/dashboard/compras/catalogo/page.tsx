"use client"
import { useState } from "react";

interface ItemCompra {
  id: number;
  nombre: string;
  comprado: boolean;
}

export default function ListaCompras() {
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [nuevoItem, setNuevoItem] = useState("");

  const agregarItem = () => {
    if (!nuevoItem.trim()) return;

    setItems([
      ...items,
      {
        id: Date.now(),
        nombre: nuevoItem,
        comprado: false,
      },
    ]);

    setNuevoItem("");
  };

  const toggleCompra = (id: number) => {
    setItems(items.map((i) =>
      i.id === id ? { ...i, comprado: !i.comprado } : i
    ));
  };

  const totalComprados = items.filter((i) => i.comprado).length;
  const totalItems = items.length;

  return (
    <div className="flex gap-6 p-6">

      {/* LISTA DE COMPRAS */}
      <div className="w-3/4">
        <h1 className="text-3xl font-bold mb-1">🛒 Lista de Compras Familiar</h1>
        <p className="text-gray-600 mb-6">
          Agrega artículos que necesitas comprar y marca cuáles ya se realizaron.
        </p>

        {/* AGREGAR UN PRODUCTO */}
        <div className="flex gap-2 mb-6">
          <input
            value={nuevoItem}
            onChange={(e) => setNuevoItem(e.target.value)}
            placeholder="Ejemplo: Leche, Pan, Jabón..."
            className="border p-3 rounded-lg w-full"
          />
          <button
            onClick={agregarItem}
            className="bg-green-600 text-white px-4 rounded-lg"
          >
            Añadir
          </button>
        </div>

        {/* ITEMS */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white shadow rounded-xl"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.comprado}
                  onChange={() => toggleCompra(item.id)}
                  className="w-5 h-5"
                />
                <span
                  className={`text-lg ${
                    item.comprado ? "line-through text-gray-500" : ""
                  }`}
                >
                  {item.nombre}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL ASISTENTE */}
      <aside className="w-1/4 bg-white shadow p-4 rounded-xl h-fit sticky top-4">
        <h2 className="text-xl font-bold mb-3">🤖 Asistente</h2>

        <div className="space-y-3 text-gray-700">
          <p>📝 Artículos en lista: <b>{totalItems}</b></p>
          <p>✔️ Comprados: <b>{totalComprados}</b></p>
          <p>⌛ Pendientes: <b>{totalItems - totalComprados}</b></p>

          <hr />

          <p className="text-sm bg-gray-100 p-3 rounded-lg">
            {totalItems === 0 &&
              "Agrega los artículos que necesitan comprar esta semana."}

            {totalItems > 0 && totalComprados === 0 &&
              "Ya tienes una lista. Cuando compres algo, márcalo para llevar control."}

            {totalComprados > 0 && totalComprados < totalItems &&
              "¡Buen trabajo! Sigues avanzando con las compras familiares."}

            {totalComprados === totalItems && totalItems > 0 &&
              "🎉 ¡Lista completa! Ya compraron todo lo necesario."}
          </p>
        </div>
      </aside>
    </div>
  );
}
