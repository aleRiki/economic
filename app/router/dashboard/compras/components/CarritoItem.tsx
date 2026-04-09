interface CarritoItemType {
  id: number;
  nombre: string;
  precio: number;
}

export default function CarritoItem({ item }: { item: CarritoItemType }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow">
      <div>
        <h3 className="font-semibold">{item.nombre}</h3>
        <p className="text-gray-500">${item.precio}</p>
      </div>

      <button className="text-red-500 hover:underline">Eliminar</button>
    </div>
  );
}
