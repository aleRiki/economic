"use client";
import React from "react";
import {
  PiggyBank,
  BarChart3,
  ShieldCheck,
  Wallet,
  Globe2,
} from "lucide-react";
import Link from "next/link";

export default function Init() {
  return (
    // CAMBIO 1: Fondo más limpio (blanco/gris claro) para hacer juego con el entorno de los gráficos.
    // Esto también mejora la legibilidad general.
    <main className="flex min-h-screen w-screen flex-col bg-gray-50 text-gray-800">
      
      {/* Encabezado */}
      {/* CAMBIO 2: Header más simple, mantiene el color primario del sistema. */}
      <header className="w-full flex items-center justify-between p-6 bg-white shadow-md border-b border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-blue-700">
          Mi Familia 💸
        </h1>
        <Link href="/auth/login">
          {/* Botón con el color primario del sistema */}
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
            Iniciar Sesión
          </button>
        </Link>
      </header>

      {/* Contenido principal - Título y descripción */}
      {/* Usamos padding y centrado para un mejor aspecto en pantallas grandes */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6 py-20 bg-blue-50">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-blue-900">
          Controla tus finanzas familiares
        </h2>
        <p className="text-lg md:text-xl max-w-3xl text-gray-600 mb-12">
          Administra tus ingresos, gastos, cuentas bancarias y presupuestos
          desde un solo lugar. Mantén el control económico de tu hogar de manera
          sencilla, **segura y visual**.
        </p>

        {/* MÓDULO DE TARJETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Tarjetas informativas */}
          {/* CAMBIO 3: Tarjetas con fondo blanco y sombra para destacarlas. */}
          
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
            <Wallet size={40} className="text-blue-500 mb-3" /> {/* Icono en color primario */}
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Gestión de Cuentas</h3>
            <p className="text-gray-500 text-sm">
              Administra todas tus cuentas bancarias y saldos en diferentes
              monedas desde una única interfaz.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
            <PiggyBank size={40} className="text-green-500 mb-3" /> {/* Color de crecimiento/éxito */}
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Presupuestos Inteligentes
            </h3>
            <p className="text-gray-500 text-sm">
              Crea y sigue presupuestos mensuales flexibles para mantener tus finanzas
              familiares siempre equilibradas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
            <BarChart3 size={40} className="text-orange-500 mb-3" /> {/* Color de análisis/alerta */}
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Estadísticas Claras</h3>
            <p className="text-gray-500 text-sm">
              Visualiza tus ingresos y gastos con gráficos detallados y reportes
              fáciles de entender (como el de velas).
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
            <ShieldCheck size={40} className="text-purple-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Seguridad Total</h3>
            <p className="text-gray-500 text-sm">
              Tus datos financieros están protegidos con los más altos
              estándares de seguridad y privacidad digital.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100 sm:col-span-2 lg:col-span-1">
            <Globe2 size={40} className="text-cyan-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Multi-moneda</h3>
            <p className="text-gray-500 text-sm">
              Controla tus finanzas en diferentes divisas con conversión
              automática para un seguimiento global de tu patrimonio.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-4 text-gray-500 bg-white border-t border-gray-100">
        © 2025 MiEconomía Familiar — Tu control financiero en un solo lugar.
      </footer>
    </main>
  );
}