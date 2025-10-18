'use client'; 

import React, { useState } from "react";
import { Lock, UserPlus, Mail, Key } from "lucide-react";
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth-service'; // Importamos la función de login

// Definimos el tipo para los datos de inicio de sesión
interface LoginDto {
  email: string;
  password: string;
}

// Renombramos la exportación a LoginForm para mayor claridad
export const LoginForm = () => {
  const router = useRouter();
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });

  // Estado para la UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manejador de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Consumir el endpoint /auth/login
      const result = await loginUser(formData);
      
      // 2. Si es exitoso, redireccionar (la función loginUser ya guarda el token)
      console.log('Login exitoso:', result.email);
      router.push('/router/dashboard'); 
      
    } catch (err: any) {
      
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.'); 
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          
          {/* Campo de Correo electrónico */}
          <div className="flex flex-col items-start">
            <label htmlFor="email" className="text-sm text-blue-100 mb-1">Correo electrónico</label>
            <div className="flex items-center w-full bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
              <Mail className="text-blue-200 mr-2" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                required
                disabled={loading}
                className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
              />
            </div>
          </div>

          {/* Campo de Contraseña */}
          <div className="flex flex-col items-start">
            <label htmlFor="password" className="text-sm text-blue-100 mb-1">Contraseña</label>
            <div className="flex items-center w-full bg-white/20 rounded-lg px-3 py-2 focus-within:bg-white/30 transition">
              <Key className="text-blue-200 mr-2" size={18} />
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-transparent outline-none placeholder-blue-200 text-white"
              />
            </div>
          </div>
          
          {/* Mensaje de Error */}
          {error && (
            <p className="p-3 bg-red-500/80 text-white text-sm rounded-lg mt-2 font-medium">
              {error}
            </p>
          )}

          {/* Botón de login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 font-semibold py-2 rounded-lg shadow-md transition flex items-center justify-center
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed opacity-75' 
                : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`
            }
          >
            <Lock size={18} className="mr-2" />
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Enlace de registro */}
        <div className="mt-6 text-sm text-blue-100">
          ¿Aún no tienes cuenta?
          <a
            href="/auth/register"
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