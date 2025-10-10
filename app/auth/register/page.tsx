"use client";
import React from "react";
import { UserPlus, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 text-white">
      {/* Contenedor principal */}
      <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full mx-4">
        {/* Panel izquierdo - Info visual */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-900/40 p-10 w-1/2 text-center border-r border-white/20">
          <h1 className="text-4xl font-bold mb-4">Mi Familia 💸</h1>
          <p className="text-blue-100 text-lg mb-8">
            Gestiona tus cuentas, ahorros y metas familiares en un solo lugar.
          </p>
          <div className="rounded-full bg-blue-700/40 p-6 shadow-inner">
            <UserPlus size={50} className="text-yellow-300" />
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-6">Crea tu cuenta</h2>

          <form className="w-full max-w-sm flex flex-col gap-4">
            {/* Correo */}
            <div className="flex flex-col">
              <label className="text-sm text-blue-100 mb-1">
                Correo electrónico
              </label>
              <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
                <Mail className="mr-2 text-blue-200" size={18} />
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col">
              <label className="text-sm text-blue-100 mb-1">Contraseña</label>
              <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
                <Lock className="mr-2 text-blue-200" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
                />
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="flex flex-col">
              <label className="text-sm text-blue-100 mb-1">
                Confirmar contraseña
              </label>
              <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
                <Lock className="mr-2 text-blue-200" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
                />
              </div>
            </div>

            {/* Botón */}
            <Button
              type="submit"
              className="w-full mt-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Registrarse
            </Button>

            {/* Enlace al login */}
            <p className="mt-4 text-sm text-blue-100 text-center">
              ¿Ya tienes una cuenta?{" "}
              <a
                href="/auth/login"
                className="text-yellow-300 hover:text-yellow-400 font-semibold transition"
              >
                Inicia sesión
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
