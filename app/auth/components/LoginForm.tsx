"use client";

import React, { useState } from "react";
import { Lock, UserPlus, Mail, Key, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth-service"; 
import { LoginDto } from "../types/auth"; // Se asume que este tipo y servicio están definidos

// ----------------------------------------------------------------------
// COMPONENTE DE LOGIN: CIPHER ACCESS PORTAL
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
      // 1. Consumir el endpoint /auth/login (CONFIGURACIÓN ORIGINAL MANTENIDA)
      const result = await loginUser(formData);

      // 2. Si es exitoso, redireccionar (CONFIGURACIÓN ORIGINAL MANTENIDA)
      console.log("Login exitoso:", result.email);
      router.push("/router/dashboard");
    } catch (err: unknown) {
      // Manejo de error seguro (CONFIGURACIÓN ORIGINAL MANTENIDA)
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
    // Estilo Futurista: Fondo Oscuro y Enfoque de Rejilla
    <main className="flex h-screen w-screen items-center justify-center bg-gray-950 text-white relative overflow-hidden">
      
      {/* Fondo de Rejilla Ciber-Holográfico */}
      <div className="absolute inset-0 z-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(to right, #083344 1px, transparent 1px), linear-gradient(to bottom, #083344 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
      }} />

      {/* Orbes de Energía Sutiles */}
      <div className="absolute top-[-10rem] left-[-10rem] w-80 h-80 bg-cyan-500 opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10rem] right-[-10rem] w-80 h-80 bg-blue-600 opacity-10 rounded-full blur-3xl animate-pulse-slow" />

      {/* Contenedor principal: Tarjeta de Datos Flotante */}
      <div className="w-full max-w-sm relative z-10 p-1 border border-cyan-700/50 rounded-2xl shadow-2xl shadow-cyan-900/50 backdrop-blur-md transition-all duration-500 hover:shadow-cyan-500/10">
        
        <div className="w-full bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center text-center">
          
          {/* Logo y título Futurista */}
          <div className="mb-8">
            <Zap className="text-cyan-400 w-10 h-10 mb-2 mx-auto drop-shadow-lg shadow-cyan-500/50" />
            <h1 className="text-3xl font-extrabold mb-1 tracking-wider text-cyan-400">
              Cipher-Fin Access
            </h1>
            <p className="text-gray-400 text-sm font-mono">
              AUTH_PROTOCOL_V4.0 - Gestión Económica
            </p>
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

            {/* Mensaje de Error Futurista */}
            {error && (
              <p className="p-3 bg-red-600/80 text-white text-sm rounded-lg mt-2 font-mono border border-red-400">
                ERROR: {error}
              </p>
            )}

            {/* Botón de login: Generación de Token */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center text-gray-900 tracking-wider uppercase
                ${
                  loading
                    ? "bg-cyan-700 cursor-not-allowed opacity-75"
                    : "bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/50"
                }`}
            >
              <Lock size={18} className="mr-3" />
              {/* Texto de estado de carga MANTENIDO, con estilo futurista */}
              {loading ? "GENERANDO TOKEN..." : "INICIAR CONEXIÓN"}
            </button>
          </form>

          {/* Enlace de registro Futurista */}
          <div className="mt-8 text-sm text-gray-500 font-mono">
            ¿Necesita un nuevo ID de usuario?
            <a
              href="/auth/register"
              className="ml-2 text-cyan-400 font-semibold hover:text-white transition inline-flex items-center gap-1 hover:underline"
            >
              REGISTRO <UserPlus size={14} />
            </a>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para animaciones */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </main>
  );
};

// ----------------------------------------------------------------------
// COMPONENTE DE INPUT MEJORADO (InputGroup) - Estructura Mantenida
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
}

const InputGroup = ({ label, name, type, value, onChange, placeholder, Icon, loading }: InputGroupProps) => (
    <div className="flex flex-col items-start relative">
        <label htmlFor={name} className="text-xs text-gray-500 mb-1 ml-1 font-mono uppercase tracking-widest">
            {label}
        </label>
        {/* Estilo de Input Holográfico */}
        <div className="flex items-center w-full bg-gray-800/70 rounded-lg p-3 border border-cyan-800 focus-within:border-cyan-400 transition-all duration-300 shadow-inner shadow-gray-900/50">
            <Icon className="text-cyan-400 mr-3 shrink-0" size={18} />
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                disabled={loading}
                className="w-full bg-transparent outline-none placeholder-gray-500 text-white text-sm font-sans tracking-wide"
            />
        </div>
    </div>
);