"use client";
import React from "react";
import { Lock, UserPlus, Mail, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 text-white">
      {/* Contenedor principal */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
        {/* Logo y título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Familia 💸</h1>
          <p className="text-blue-100 text-sm">
            Gestiona tu economía familiar con facilidad y seguridad
          </p>
        </div>

        {/* Formulario */}
        <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <label className="text-sm text-blue-100 mb-1">Correo electrónico</label>
            <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
              <Mail className="text-blue-200 mr-2" size={18} />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
              />
            </div>
          </div>

          <div className="flex flex-col items-start">
            <label className="text-sm text-blue-100 mb-1">Contraseña</label>
            <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
              <Key className="text-blue-200 mr-2" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
              />
            </div>
          </div>

          {/* Botón de login */}
          <Button
            type="submit"
            className="w-full mt-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
          >
            <Lock size={18} className="mr-2" />
            Iniciar Sesión
          </Button>
        </form>

        {/* Enlace de registro */}
        <div className="mt-6 text-sm text-blue-100">
          ¿Aún no tienes cuenta?
          <a
            href="#"
            className="ml-1 text-white font-semibold hover:underline inline-flex items-center gap-1"
          >
            Crear cuenta <UserPlus size={14} />
          </a>
        </div>
      </div>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </main>
  );
}
