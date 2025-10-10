"use client";
import React from "react";
import {
  PiggyBank,
  BarChart3,
  ShieldCheck,
  Wallet,
  Globe2,
} from "lucide-react";

export default function Init() {
  return (
    <main className="flex h-screen w-screen flex-col bg-gradient-to-br from-blue-800 to-blue-600 text-white">
      {/* Encabezado */}
      <header className="w-full flex items-center justify-between p-6 bg-blue-900 bg-opacity-40 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
          Mi Familia 💸
        </h1>
        <button className="bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">
          Iniciar Sesión
        </button>
      </header>

      {/* Contenido principal */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Controla tus finanzas familiares
        </h2>
        <p className="text-lg md:text-xl max-w-2xl text-blue-100 mb-10">
          Administra tus ingresos, gastos, cuentas bancarias y presupuestos desde un solo lugar.
          Mantén el control económico de tu hogar de manera sencilla, segura y visual.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Tarjetas informativas */}
          <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition">
            <Wallet size={40} className="text-yellow-300 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Gestión de Cuentas</h3>
            <p className="text-blue-100 text-sm">
              Administra todas tus cuentas bancarias y saldos en diferentes monedas.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition">
            <PiggyBank size={40} className="text-pink-300 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Presupuestos Inteligentes</h3>
            <p className="text-blue-100 text-sm">
              Crea y sigue presupuestos mensuales para mantener tus finanzas equilibradas.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition">
            <BarChart3 size={40} className="text-green-300 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Estadísticas Claras</h3>
            <p className="text-blue-100 text-sm">
              Visualiza tus ingresos y gastos mediante gráficos detallados y fáciles de entender.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition">
            <ShieldCheck size={40} className="text-cyan-300 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Seguridad Total</h3>
            <p className="text-blue-100 text-sm">
              Tus datos financieros están protegidos con los más altos estándares de seguridad.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition sm:col-span-2 lg:col-span-1">
            <Globe2 size={40} className="text-orange-300 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Multi-moneda</h3>
            <p className="text-blue-100 text-sm">
              Controla tus finanzas en diferentes divisas con conversión automática actualizada.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-4 bg-blue-900 bg-opacity-40 backdrop-blur-md">
        © 2025 MiEconomía Familiar — Tu control financiero en un solo lugar.
      </footer>
    </main>
  );
}
