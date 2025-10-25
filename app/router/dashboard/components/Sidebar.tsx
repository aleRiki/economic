"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart,
  CreditCard,
  LogOut,
  TrendingUp,
  Landmark,
} from "lucide-react";


const getUserInfo = () => {
  
  if (typeof window === "undefined") {
    return { initial: "...", name: "Cargando..." };
  }

  // Obtener el nombre guardado en el login
  const userName = localStorage.getItem("email") || "name";

  // Obtener la primera letra para el avatar
  const initial = userName.charAt(0).toUpperCase();

  return { initial, name: userName };
};
console.log(getUserInfo)
// --- Manejador de Logout ---
const handleLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
   
    window.location.href = "/";
  }
};

export default function Sidebar() {
  const [userInfo, setUserInfo] = useState({ initial: "A", name: "Alejandro" });

 
  useEffect(() => {
    const data = getUserInfo();
    setUserInfo(data);
  }, []); 

  return (
    <aside className="w-64 bg-white shadow h-full flex flex-col justify-between">
      {/* Título */}
      <div>
        <div className="p-6 text-2xl font-bold text-blue-800">
           <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              <Landmark className="text-blue-600 w-7 h-7" />
              <span className="text-gray-800">Finance</span>
              <span className="text-green-600">Hom</span>
            </h1>
        </div>
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
            href="/router/dashboard/sumbank"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <Landmark size={20} /> Gestinar Cuentas y banco
          </a>
        </nav>
      </div>

      {/* ====================================================
        USUARIO Y LOGOUT (CON LA INFORMACIÓN DINÁMICA)
        ====================================================
      */}
      <div className="px-4 py-6 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar (Muestra la INICIAL del usuario) */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
            {userInfo.initial} {/* <-- DINÁMICO */}
          </div>
          <div>
            {/* Nombre (Muestra el NOMBRE del usuario) */}
            <p className="text-sm font-semibold text-gray-800">
              {userInfo.name}
            </p>
            <p className="text-xs text-gray-500">Activo</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
