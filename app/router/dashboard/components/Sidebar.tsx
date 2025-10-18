import { Home, BarChart, Settings, CreditCard, LogOut, TrendingUp } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow h-full flex flex-col justify-between">
      {/* Título */}
      <div>
        <div className="p-6 text-2xl font-bold text-blue-800">Finanzas</div>
        <nav className="px-4 space-y-4">
          <a
            href="/router/dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <Home size={20} /> Inicio
          </a>
          <a
            href="/router/dashboard/analyti"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <BarChart size={20} /> Análisis
          </a>
          <a
            href="/router/dashboard/accounts"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <CreditCard size={20} /> Cuentas
          </a>
          <a
            href="/router/dashboard/exchangerate"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <TrendingUp size={20} /> Tasa de cambio
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <Settings size={20} /> Configuración
          </a>
        </nav>
      </div>

      {/* Usuario y logout */}
      <div className="px-4 py-6 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Alejandro</p>
            <p className="text-xs text-gray-500">Activo</p>
          </div>
        </div>

        {/* Logout */}
        <button
          className="text-gray-500 hover:text-red-600"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
