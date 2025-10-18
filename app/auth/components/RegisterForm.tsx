'use client'; 

import React, { useState } from 'react';
import { registerUser } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { RegisterDto } from '../types/auth'; 
import { Role } from '../types/enums';



export const RegisterForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterDto>({ 
    name: '', 
    email: '', 
    password: '', 
    rol: Role.ADMIN, 
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      
      const result = await registerUser(formData);
      setMessage(result.message || 'Registro exitoso!');
      
      
      router.push('/auth/login'); 

    } catch (err: any) {
      // Maneja errores de la API (ej: Email already exists)
      // Nota: Si usas la lógica del servicio, err.message ya contendrá el mensaje de error de la API.
      setError(err.message || 'Error desconocido al registrar.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal: Centra el formulario vertical y horizontalmente
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      
      {/* Tarjeta del Formulario: Estilos de Tailwind */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Crear Cuenta
        </h2>
        
        {/* Input: Nombre */}
        <div className="mb-5">
          <input 
            type="text" 
            name="name" 
            placeholder="Nombre completo" 
            onChange={handleChange} 
            required 
            disabled={loading} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
          />
        </div>

        {/* Input: Email */}
        <div className="mb-5">
          <input 
            type="email" 
            name="email" 
            placeholder="Correo Electrónico" 
            onChange={handleChange} 
            required 
            disabled={loading} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
          />
        </div>

        {/* Input: Contraseña */}
        <div className="mb-5">
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            onChange={handleChange} 
            required 
            disabled={loading} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
          />
        </div>
        
        {/* Select: Rol */}
        <div className="mb-6">
          <label htmlFor="rol-select" className="block text-sm font-medium text-gray-700 mb-2">
            Rol:
          </label>
          <select 
            id="rol-select" 
            name="rol" 
            onChange={handleChange} 
            value={formData.rol} 
            disabled={loading} 
            className="w-full p-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 appearance-none"
          >
            <option value="user">Usuario Estándar</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Botón de Enviar */}
        <button 
          type="submit" 
          disabled={loading} 
          className={`w-full py-3 rounded-md text-white font-semibold transition duration-200 
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`
          }
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>

        {/* Mensajes de Respuesta */}
        {message && (
          <p className="mt-4 p-3 rounded-md bg-green-100 text-green-700 font-medium text-center border border-green-200">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 p-3 rounded-md bg-red-100 text-red-700 font-medium text-center border border-red-200">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
