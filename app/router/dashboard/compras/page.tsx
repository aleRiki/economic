export default function ComprasHome() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        🏡 Control Familiar de Compras
      </h1>

      <p className="text-gray-600 mb-10 text-lg">
        Gestiona las compras del hogar, organiza tus gastos y lleva un control familiar sencillo y visual.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <a
          href="/router/dashboard/compras/catalogo"
          className="bg-white shadow-lg hover:shadow-xl transition rounded-2xl p-7 border border-blue-100 hover:border-blue-300"
        >
          <div className="text-5xl mb-3">🛒</div>
          <h2 className="text-2xl font-semibold text-blue-700">Catálogo Familiar</h2>
          <p className="text-gray-600 mt-2">Productos del hogar, necesidades básicas y más.</p>
        </a>

        <a
          href="/router/dashboard/compras/carrito"
          className="bg-white shadow-lg hover:shadow-xl transition rounded-2xl p-7 border border-green-100 hover:border-green-300"
        >
          <div className="text-5xl mb-3">🧺</div>
          <h2 className="text-2xl font-semibold text-green-700">Carrito del Hogar</h2>
          <p className="text-gray-600 mt-2">Artículos pendientes por comprar.</p>
        </a>

        <a
          href="/router/dashboard/compras/historial"
          className="bg-white shadow-lg hover:shadow-xl transition rounded-2xl p-7 border border-yellow-100 hover:border-yellow-300"
        >
          <div className="text-5xl mb-3">📘</div>
          <h2 className="text-2xl font-semibold text-yellow-700">Historial Familiar</h2>
          <p className="text-gray-600 mt-2">Registros de compras y gastos anteriores.</p>
        </a>

      </div>
    </div>
  );
}
