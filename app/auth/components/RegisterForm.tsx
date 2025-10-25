"use client";

import React, { useState, ChangeEvent, FormEvent, ElementType } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth-service";
import { RegisterDto } from "../types/auth";
import { Role } from "../types/enums";
import { UserPlus, Mail, Key, User, Server, Code, HomeIcon } from "lucide-react";

// ----------------------------------------------------------------------
// COMPONENTE DE REGISTRO CON ESTILO CLARO Y MODERNO
// ----------------------------------------------------------------------
type InputGroupProps = {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder: string;
  Icon: ElementType;
  loading: boolean;
};

const InputGroupLight = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  Icon,
  loading,
}: InputGroupProps) => (
  <div className="space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-400 transition">
      <Icon className="text-blue-500 mr-2" size={18} />
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        disabled={loading}
        className="w-full bg-transparent outline-none text-gray-700 text-sm"
      />
    </div>
  </div>
);

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await registerUser(formData);
      setMessage(result.message || "¡Registro exitoso!");
      router.push("/auth/login");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al registrar el perfil.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6"
      >
        {/* Encabezado */}
        <div className="text-center">
          <UserPlus className="text-blue-500 w-10 h-10 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Registro de Usuario
          </h2>
          <p className="text-sm text-gray-500">
            Completa los campos para crear tu perfil
          </p>
        </div>

        {/* Campos */}
        <div className="space-y-4">
          <InputGroupLight
            label="Nombre completo"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. Juan Pérez"
            Icon={User}
            loading={loading}
          />

          <InputGroupLight
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            Icon={Mail}
            loading={loading}
          />

          <InputGroupLight
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            Icon={Key}
            loading={loading}
          />

          {/* Rol */}
          <div className="space-y-1">
            <label
              htmlFor="rol-select"
              className="text-sm font-medium text-gray-700"
            >
              Rol de acceso
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <Code className="text-blue-500 mr-2" size={18} />
              <select
                id="rol-select"
                name="rol"
                onChange={handleChange}
                value={formData.rol}
                disabled={loading}
                className="w-full bg-transparent outline-none text-gray-700 text-sm"
              >
                <option value={Role.USER}>Usuario Estándar</option>
                <option value={Role.ADMIN}>Administrador</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition duration-300 ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Server size={18} />
            {loading ? "Registrando..." : "Crear perfil"}
          </div>
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 transition duration-300"
        >
          <div className="flex items-center justify-center gap-2">
            <HomeIcon size={18} />
            {loading ? "Regresando al inicio..." : "Inicio"}
          </div>
        </button>

        {/* Mensajes */}
        {message && (
          <p className="mt-4 p-3 rounded-lg bg-green-100 text-green-800 text-sm text-center border border-green-300">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 p-3 rounded-lg bg-red-100 text-red-800 text-sm text-center border border-red-300">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
