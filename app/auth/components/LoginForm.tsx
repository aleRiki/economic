"use client";

import React, { useState } from "react";
import {
  Lock,
  UserPlus,
  Mail,
  Key,
  ShieldCheck,
  Landmark,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth-service";
import { LoginDto } from "../types/auth"; // Se asume que este tipo y servicio están definidos
import Link from "next/link";

// ----------------------------------------------------------------------
// COMPONENTE DE LOGIN: CIPHER ACCESS PORTAL (VERSIÓN CLARA)
// ----------------------------------------------------------------------

export const CipherAccessPortal = () => {
  const router = useRouter();

  // Estado para los datos del formulario (Mantenido)
  const [formData, setFormData] = useState<LoginDto>({
    email: "",
    password: "",
  });

  // Estado para la UI (Mantenido)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Manejador de cambios en los inputs (Mantenido)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador del envío del formulario (Lógica de Conexión Mantenida)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser(formData);
      console.log("Login exitoso:", result.email);
      router.push("/router/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Protocolo de autenticación fallido. Verifique las credenciales.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🚨 CAMBIO 1: Fondo Claro Principal (bg-gray-100/bg-white)
    <main className="flex h-screen w-screen items-center justify-center bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* 🚨 CAMBIO 2: Fondo de Rejilla Claro (Gris/Azul claro) */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, #bfdbfe 1px, transparent 1px), linear-gradient(to bottom, #bfdbfe 1px, transparent 1px)", // Blue-200
          backgroundSize: "20px 20px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 80%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10 p-1 border border-blue-300 rounded-2xl shadow-2xl shadow-blue-500/20 backdrop-blur-sm transition-all duration-500 hover:shadow-blue-500/30">
        <div className="w-full bg-white/90 rounded-2xl p-8 flex flex-col items-center text-center text-gray-900">
          {/* Logo y título Claro */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              <Landmark className="text-blue-600 w-7 h-7" />
              <span className="text-gray-800">Finance</span>
              <span className="text-green-600">Hom</span>
            </h1>
            {/* 🚨 CAMBIO 5: Ícono Azul Claro */}
            <ShieldCheck className="text-blue-500 w-10 h-10 mb-2 mx-auto drop-shadow-lg shadow-blue-500/50" />
            <h1 className="text-3xl font-extrabold mb-1 tracking-wider text-blue-600">
              Inicio de Sesión Seguro
            </h1>
            {/* 🚨 CAMBIO 6: Texto de subtítulo oscuro */}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            {/* Campo de Correo electrónico */}
            <InputGroup
              label="ID de Usuario (Email)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ingrese@credenciales.com"
              Icon={Mail}
              loading={loading}
            />

            {/* Campo de Contraseña */}
            <InputGroup
              label="Clave de Acceso (Password)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="• • • • • • • •"
              Icon={Key}
              loading={loading}
            />

            {/* Mensaje de Error Claro */}
            {error && (
              <p className="p-3 bg-red-100 text-red-700 text-sm rounded-lg mt-2 font-mono border border-red-400">
                ERROR: {error}
              </p>
            )}

            {/* Botón de login: Generación de Token (Azul Claro) */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center text-white tracking-wider uppercase
                ${
                  loading
                    ? "bg-blue-700 cursor-not-allowed opacity-75"
                    : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/50"
                }`}
            >
              <Lock size={18} className="mr-3" />
              {loading ? "GENERANDO TOKEN..." : "INICIAR CONEXIÓN"}
            </button>
          </form>

          <div className="mt-8 w-full">
            {/* CORREGIDO: Usamos <Link href="/"> en lugar de <a href="/"> */}
            <div className="flex justify-end text-sm mb-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-blue-700 transition inline-flex items-center gap-1 hover:underline font-medium"
              >
                <Home size={14} className="text-blue-500" />
                Volver a la Página Principal
              </Link>
            </div>

            {/* 2. Fila de Acción (Pregunta de registro) */}
            <div className="text-sm text-center text-gray-600 font-sans p-3 bg-gray-50 rounded-lg border border-gray-200">
              ¿Aún no tienes un perfil de acceso?
              {/* Asegúrate de que este enlace de registro también use <Link /> si apunta a una página interna: */}
              <Link
                href="/auth/register"
                className="ml-2 text-blue-600 font-bold hover:text-blue-800 transition inline-flex items-center gap-1 hover:underline tracking-wide"
              >
                REGISTRAR NUEVO ID <UserPlus size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para animaciones (Mantenidos) */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </main>
  );
};

// ----------------------------------------------------------------------
// COMPONENTE DE INPUT MEJORADO (InputGroup) - COLORES CLAROS
// ----------------------------------------------------------------------
type InputGroupProps = {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  Icon: React.ElementType;
  loading: boolean;
};

const InputGroup = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  Icon,
  loading,
}: InputGroupProps) => (
  <div className="flex flex-col items-start relative">
    {/* 🚨 CAMBIO 7: Texto de etiqueta oscuro */}
    <label
      htmlFor={name}
      className="text-xs text-gray-600 mb-1 ml-1 font-mono uppercase tracking-widest"
    >
      {label}
    </label>
    {/* 🚨 CAMBIO 8: Input Blanco, Borde Gris, Focus Azul, Texto Negro */}
    <div className="flex items-center w-full bg-white rounded-lg p-3 border border-gray-300 focus-within:border-blue-500 transition-all duration-300 shadow-inner shadow-gray-200/50">
      {/* 🚨 CAMBIO 9: Ícono Azul */}
      <Icon className="text-blue-500 mr-3 shrink-0" size={18} />
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        disabled={loading}
        // Texto negro, placeholder gris
        className="w-full bg-transparent outline-none placeholder-gray-400 text-gray-900 text-sm font-sans tracking-wide"
      />
    </div>
  </div>
);
