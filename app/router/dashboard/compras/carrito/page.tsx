import CarritoItem from "../components/CarritoItem"; 
import EmptyState from "../components/EmptyState"; 

interface CarritoItemType {
  id: number;
  nombre: string;
  precio: number;
}

const carritoEjemplo: CarritoItemType[] = []; // Luego conectas al backend

export default function Carrito() {
  const carrito = carritoEjemplo;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🛍️ Carrito</h1>

      {carrito.length === 0 ? (
        <EmptyState mensaje="Tu carrito está vacío" />
      ) : (
        <div className="space-y-4">
          {carrito.map((item) => (
            <CarritoItem key={item.id} item={item} />
          ))}

          <button className="bg-green-600 text-white px-6 py-3 rounded-lg mt-4">
            Finalizar Compra
          </button>
        </div>
      )}
    </div>
  );
}
