interface Compra {
  id: number;
  fecha: string;
  producto: string;
  monto: string;
  estado: string;
}

const historial: Compra[] = [
  { id: 1, fecha: "12/11/2025", producto: "Mouse Gamer", monto: "$18.50", estado: "Entregado" },
  { id: 2, fecha: "02/11/2025", producto: "Teclado Mecánico", monto: "$45.00", estado: "Entregado" }
];

export default function Historial() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📑 Historial de Compras</h1>

      <table className="w-full border rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Producto</th>
            <th className="p-3 text-left">Monto</th>
            <th className="p-3 text-left">Estado</th>
          </tr>
        </thead>

        <tbody>
          {historial.map((h) => (
            <tr key={h.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{h.fecha}</td>
              <td className="p-3">{h.producto}</td>
              <td className="p-3">{h.monto}</td>
              <td className="p-3">{h.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
