'use client';

import React, { useState, useEffect, useMemo } from 'react';
// Asegúrate de que esta ruta sea correcta para tu función de servicio
import { getAccounts } from '@/lib/auth-service'; 
import { useRouter } from 'next/navigation';

// Tipos de datos que esperamos de la API
interface Account {
    id: number;
    name: string;
    type: string; // Ejemplo: 'USD', 'EUR', 'CUP', 'Savings', etc.
    balance: string; // La API lo retorna como string, lo convertiremos a number
    deletedAt: string | null;
}

interface GroupedBalance {
    [key: string]: number; // Clave: tipo de cuenta, Valor: suma total
}

// Mapeo de Símbolos, Nombres y Colores para el renderizado
const ACCOUNT_DISPLAY_MAP: { [key: string]: { symbol: string, color: string, name: string } } = {
    'USD': { symbol: '$', color: 'text-blue-800', name: 'Cuenta USD' },
    'Euro': { symbol: '€', color: 'text-green-700', name: 'Cuenta EUR' },
    'CUP': { symbol: 'CUP ', color: 'text-red-600', name: 'Cuenta CUP' },
    'Savings': { symbol: '$', color: 'text-yellow-600', name: 'Ahorros' },
    // Añade más tipos de cuenta si es necesario
};

export default function AccountOverview() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. Obtención de datos y manejo de autenticación
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                // Llama a la API /accounts (asume que usa el token de localStorage)
                const data = await getAccounts();
                setAccounts(data);
                setError('');
            } catch (err: any) {
                // Si el token es inválido o no existe, redirigir al login
                if (err.message && err.message.includes('Token de autenticación no encontrado')) {
                     router.push('/auth/login');
                }
                setError(err.message || 'Error al cargar las cuentas.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [router]);

    // 2. Lógica de Agrupación y Suma (se recalcula solo si 'accounts' cambia)
    const groupedBalances: GroupedBalance = useMemo(() => {
        const initialBalances: GroupedBalance = {};

        return accounts.reduce((acc, account) => {
            // Convertir el balance (que viene como string) a un número flotante
            const balanceValue = parseFloat(account.balance) || 0;
            
            // Sumar al tipo de cuenta correspondiente
            acc[account.type] = (acc[account.type] || 0) + balanceValue;
            
            return acc;
        }, initialBalances);
    }, [accounts]);

    // Estados de Carga y Error
    if (loading) {
        return (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                <div className="bg-white p-4 rounded-lg shadow h-24"></div>
                <div className="bg-white p-4 rounded-lg shadow h-24"></div>
                <div className="bg-white p-4 rounded-lg shadow h-24"></div>
            </section>
        );
    }
    
    if (error && !error.includes('Token de autenticación no encontrado')) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold">Error al conectar con el servicio de cuentas:</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    // 3. Renderizado Dinámico
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(groupedBalances).map(type => {
                const totalBalance = groupedBalances[type];
                // Usar el mapeo para obtener símbolos y colores, o un valor por defecto
                const display = ACCOUNT_DISPLAY_MAP[type] || { symbol: '', color: 'text-gray-800', name: `Cuenta ${type}` };

                // Formateo del número a moneda
                const formattedBalance = totalBalance.toLocaleString('es-ES', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });

                return (
                    <div 
                        key={type} 
                        className="bg-white p-4 rounded-lg shadow"
                    >
                        <h2 className="text-sm text-gray-500">{display.name}</h2>
                        {/* Se usa el color dinámico del mapeo */}
                        <p className={`text-2xl font-bold ${display.color}`}>
                            {display.symbol}{formattedBalance}
                        </p>
                    </div>
                );
            })}
            
            {/* Si no hay cuentas, muestra un mensaje amigable */}
             {Object.keys(groupedBalances).length === 0 && (
                <div className="md:col-span-3 p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-center">
                    <p>No tienes cuentas registradas. ¡Empieza a añadir una!</p>
                </div>
            )}
        </section>
    );
}
