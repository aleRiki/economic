"use client";

import React, { useState } from "react";
import { registerUser } from "@/lib/auth-service";
import { useRouter } from "next/navigation";
import { RegisterDto } from "../types/auth";
import { Role } from "../types/enums";
import { UserPlus, Mail, Key, User, Server, Code } from "lucide-react"; 
import { ChangeEvent, FormEvent, ElementType } from "react"; // Importaciones de tipos necesarias

// ----------------------------------------------------------------------
// COMPONENTE DE REGISTRO: CIPHER PROFILE TERMINAL (Corregido)
// ----------------------------------------------------------------------

export const CipherProfileTerminal = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterDto>({
    name: "",
    email: "",
    password: "",
    rol: Role.ADMIN,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Manejador de cambios (Mantiene el tipo original para input/select)
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador de envío (Mantiene el tipo original)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await registerUser(formData);
      setMessage(result.message || "Registro de perfil exitoso!");
      router.push("/auth/login");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al registrar el perfil.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 p-4 relative overflow-hidden">
      
      {/* Fondo de Rejilla Ciber-Holográfico */}
      <div className="absolute inset-0 z-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(to right, #083344 1px, transparent 1px), linear-gradient(to bottom, #083344 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
      }} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-1 border border-cyan-700/50 rounded-2xl shadow-2xl shadow-cyan-900/50 backdrop-blur-md transition-all duration-500"
      >
        <div className="w-full bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center text-center">

          {/* Logo y Título */}
          <div className="mb-8">
            <UserPlus className="text-cyan-400 w-10 h-10 mb-2 mx-auto drop-shadow-lg shadow-cyan-500/50" />
            <h2 className="text-3xl font-extrabold text-cyan-400 tracking-wider">
              CREACIÓN DE PERFIL
            </h2>
            <p className="text-gray-500 text-sm font-mono mt-1">
              INSERTE CREDENCIALES EN EL REGISTRO DE DATOS
            </p>
          </div>

          <div className="w-full flex flex-col gap-5">
            
            {/* Campo: Nombre Completo */}
            <InputGroupFuturistic
              label="Nombre de Entidad"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              Icon={User}
              loading={loading}
            />

            {/* Campo: Correo Electrónico */}
            <InputGroupFuturistic
              label="Identificador (Email)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@protocolo.com"
              Icon={Mail}
              loading={loading}
            />

            {/* Campo: Contraseña */}
            <InputGroupFuturistic
              label="Clave de Encriptación"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="• • • • • • • •"
              Icon={Key}
              loading={loading}
            />

            {/* Campo: Rol (Select) */}
            <div className="flex flex-col items-start relative mb-4">
                <label
                    htmlFor="rol-select"
                    className="text-xs text-gray-500 mb-1 ml-1 font-mono uppercase tracking-widest"
                >
                    Nivel de Acceso (Rol)
                </label>
                <div className="flex items-center w-full bg-gray-800/70 rounded-lg border border-cyan-800 focus-within:border-cyan-400 transition-all duration-300 shadow-inner shadow-gray-900/50">
                    <Code className="text-cyan-400 mx-3 shrink-0" size={18} />
                    <select
                        id="rol-select"
                        name="rol"
                        onChange={handleChange}
                        value={formData.rol}
                        disabled={loading}
                        className="w-full p-3 bg-transparent text-white text-sm font-sans appearance-none outline-none"
                    >
                        <option value={Role.USER || "user"} className="bg-gray-800 text-gray-300">
                            Usuario Estándar
                        </option>
                        <option value={Role.ADMIN || "admin"} className="bg-gray-800 text-cyan-400">
                            Administrador (Root)
                        </option>
                    </select>
                </div>
            </div>

          </div>

          {/* Botón de Registro: Activación de Perfil */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-gray-900 font-bold uppercase tracking-wider mt-4 shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center
              ${
                loading
                  ? "bg-cyan-700 cursor-not-allowed opacity-75"
                  : "bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/50"
              }`}
          >
            <Server size={18} className="mr-3" />
            {loading ? "TRANSFERIENDO DATOS..." : "ACTIVAR PERFIL"}
          </button>
          
          {/* Mensajes de estado Futuristas */}
          {message && (
            <p className="mt-4 p-3 rounded-lg bg-green-700/80 text-white font-mono text-center border border-green-400">
               STATUS: {message}
            </p>
          )}
          
          {error && (
            <p className="mt-4 p-3 rounded-lg bg-red-600/80 text-white font-mono text-center border border-red-400">
               ERROR: {error}
            </p>
          )}
        </div>
      </form>
      
    </div>
  );
};


// ----------------------------------------------------------------------
// COMPONENTE DE INPUT MEJORADO (InputGroupFuturistic) - TIPO CORREGIDO
// ----------------------------------------------------------------------
type InputGroupProps = {
    label: string;
    name: string;
    type: string;
    value: string;
    // CORRECCIÓN CLAVE: El onChange debe aceptar ChangeEvent<HTMLInputElement | HTMLSelectElement>
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; 
    placeholder: string;
    Icon: ElementType;
    loading: boolean;
}

const InputGroupFuturistic = ({ label, name, type, value, onChange, placeholder, Icon, loading }: InputGroupProps) => (
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
                onChange={onChange} // ¡CORREGIDO! Ya no se necesita 'as any'.
                placeholder={placeholder}
                required
                disabled={loading}
                className="w-full bg-transparent outline-none placeholder-gray-500 text-white text-sm font-sans tracking-wide"
            />
        </div>
    </div>
);