import Image from "next/image";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  img: string;
}

export default function ProductoCard({ producto }: { producto: Producto }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow hover:shadow-lg transition">
      <div className="relative h-40 w-full">
        <Image
          src={producto.img}
          alt={producto.nombre}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <h3 className="text-lg font-semibold mt-3">{producto.nombre}</h3>
      <p className="text-gray-600">${producto.precio}</p>

      <button className="mt-3 w-full bg-blue-600 text-white p-2 rounded-lg">
        Añadir al carrito
      </button>
    </div>
  );
}
