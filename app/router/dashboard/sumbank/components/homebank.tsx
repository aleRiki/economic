"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Banknote, Landmark, Plus, Trash2, MapPin, DollarSign, Wallet } from "lucide-react";

// --- TIPOS E INFO DE CONEXIÓN ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Bank {
  id: number;
  name: string;
  address: string;
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  userId: number;
  bankId: number;
}

// --- COMPONENTE PRINCIPAL ---
export default function BankAccountManager() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newBank, setNewBank] = useState({ name: "", address: "" });
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "CUP",
    balance: 0,
    userId: 1,
    bankId: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Memo para mapear IDs de bancos a nombres para la lista de cuentas
  const bankMap = useMemo(() => {
    return banks.reduce((acc, bank) => {
      acc[bank.id] = bank.name;
      return acc;
    }, {} as { [key: number]: string });
  }, [banks]);

  // 🔹 OBTENER DATOS (Lógica de conexión MANTENIDA)
  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API_BASE_URL}/bank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(res.data);
    } catch (err) {
      setError("Error al cargar los bancos.");
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API_BASE_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data);
    } catch (err) {
      setError("Error al cargar las cuentas.");
    }
  };

  // 🔹 CREAR BANCO (Lógica de conexión MANTENIDA)
  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/bank`, newBank, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Banco creado correctamente ✅");
      setNewBank({ name: "", address: "" });
      fetchBanks();
    } catch (err) {
      setError("Error al crear el banco ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 CREAR CUENTA (Lógica de conexión MANTENIDA)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newAccount.bankId === 0) {
      setError("Debe seleccionar un banco válido.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/accounts`, newAccount, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Cuenta creada correctamente ✅");
      setNewAccount({
        name: "",
        type: "CUP",
        balance: 0,
        userId: 1,
        bankId: newAccount.bankId, // Mantener el banco seleccionado
      });
      fetchAccounts();
    } catch (err) {
      setError("Error al crear la cuenta ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 ELIMINAR BANCO (Lógica de conexión MANTENIDA)
  const handleDeleteBank = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este banco?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/bank/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Banco eliminado correctamente 🗑️");
      fetchBanks();
      fetchAccounts(); // Recargar cuentas por si alguna estaba asociada
    } catch (err) {
      setError("Error al eliminar el banco ❌");
    }
  };

  // 🔹 ELIMINAR CUENTA (Lógica de conexión MANTENIDA)
  const handleDeleteAccount = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta cuenta?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Cuenta eliminada correctamente 🗑️");
      fetchAccounts();
    } catch (err) {
      setError("Error al eliminar la cuenta ❌");
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10 border border-gray-100">
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
          <Banknote className="text-blue-600 w-8 h-8" />
          Gestión Centralizada de Activos Bancarios
        </h1>

        {/* MENSAJES DE ESTADO */}
        {message && (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl mb-6 font-medium border border-green-200 shadow-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-6 font-medium border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {/* SECCIÓN DE CREACIÓN: Paneles Laterales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Panel: Crear Banco */}
          <CreationPanel 
            title="Nuevo Centro Financiero" 
            icon={Landmark} 
            color="blue"
          >
            <form onSubmit={handleCreateBank} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Nombre de la institución (Ej: Banco Central X)"
                value={newBank.name}
                onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                required
                icon={Landmark}
              />
              <Input
                type="text"
                placeholder="Ubicación o Dirección (Ej: 123 Ruta Principal)"
                value={newBank.address}
                onChange={(e) => setNewBank({ ...newBank, address: e.target.value })}
                required
                icon={MapPin}
              />
              <ActionButton loading={loading} color="blue">
                <Plus size={18} className="mr-2" />
                Crear Banco
              </ActionButton>
            </form>
          </CreationPanel>

          {/* Panel: Crear Cuenta */}
          <CreationPanel 
            title="Nueva Cuenta de Inversión/Ahorro" 
            icon={Wallet} 
            color="green"
          >
            <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Nombre de la Cuenta (Ej: Fondo de Emergencia)"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                required
                icon={Banknote}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                  options={[
                      { value: "CUP", label: "CUP" }, 
                      { value: "USD", label: "USD" }, 
                      { value: "EUR", label: "EUR" }
                  ]}
                  icon={DollarSign}
                />
                <Input
                  type="number"
                  placeholder="Saldo inicial"
                  value={newAccount.balance === 0 ? "" : newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  icon={Banknote}
                />
              </div>
              <Select
                value={newAccount.bankId}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, bankId: parseInt(e.target.value) || 0 })
                }
                options={[{ value: 0, label: "Seleccionar Banco" }, ...banks.map(b => ({ value: b.id, label: b.name }))]}
                required
                icon={Landmark}
              />

              <ActionButton loading={loading} color="green">
                <Plus size={18} className="mr-2" />
                Crear Cuenta
              </ActionButton>
            </form>
          </CreationPanel>
        </div>

        {/* SECCIÓN DE VISUALIZACIÓN: Tarjetas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lista de Bancos */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Landmark className="text-blue-500" size={20} />
              Centros Bancarios ({banks.length})
            </h2>
            <div className="space-y-4">
              {banks.length === 0 ? (
                <p className="text-gray-500 p-4 border rounded-xl bg-gray-50">No hay bancos registrados. Cree uno para comenzar.</p>
              ) : (
                banks.map((bank) => (
                  <BankCard key={bank.id} bank={bank} onDelete={handleDeleteBank} />
                ))
              )}
            </div>
          </section>

          {/* Lista de Cuentas */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="text-green-500" size={20} />
              Cuentas de Activos ({accounts.length})
            </h2>
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <p className="text-gray-500 p-4 border rounded-xl bg-gray-50">No hay cuentas registradas. Cree una y asóciela a un banco.</p>
              ) : (
                accounts.map((account) => (
                  <AccountCard 
                    key={account.id} 
                    account={account} 
                    bankName={bankMap[account.bankId] || "Banco Desconocido"}
                    onDelete={handleDeleteAccount} 
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// --- COMPONENTES AUXILIARES PARA MEJORAR LA INTUICIÓN Y DEDICACIÓN ---
// ----------------------------------------------------------------------

// 1. Panel de Creación
interface CreationPanelProps {
  title: string;
  icon: React.ElementType;
  color: 'blue' | 'green';
  children: React.ReactNode;
}
const CreationPanel: React.FC<CreationPanelProps> = ({ title, icon: Icon, color, children }) => (
  <div className={`p-6 rounded-2xl shadow-lg border border-${color}-100 bg-${color}-50/50`}>
    <h2 className={`text-xl font-bold text-${color}-800 mb-5 flex items-center gap-2 border-b pb-3 border-${color}-200`}>
      <Icon className={`text-${color}-600`} size={24} />
      {title}
    </h2>
    {children}
  </div>
);

// 2. Input con Ícono
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: React.ElementType;
}
const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
            {...props}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
    </div>
);

// 3. Select con Ícono
interface SelectOption {
    value: string | number;
    label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon: React.ElementType;
    options: SelectOption[];
}
const Select: React.FC<SelectProps> = ({ icon: Icon, options, ...props }) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <select
            {...props}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

// 4. Botón de Acción
interface ActionButtonProps {
    loading: boolean;
    color: 'blue' | 'green';
    children: React.ReactNode;
}
const ActionButton: React.FC<ActionButtonProps> = ({ loading, color, children }) => (
    <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl text-white font-semibold transition duration-200 shadow-md flex items-center justify-center
          ${
            loading
              ? `bg-${color}-400 cursor-not-allowed opacity-80`
              : `bg-${color}-600 hover:bg-${color}-700 shadow-${color}-500/30`
          }`}
    >
        {loading ? "Procesando..." : children}
    </button>
);

// 5. Tarjeta de Banco
interface BankCardProps {
    bank: Bank;
    onDelete: (id: number) => void;
}
const BankCard: React.FC<BankCardProps> = ({ bank, onDelete }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500 flex justify-between items-center transition hover:shadow-xl">
    <div className="flex items-center gap-3">
      <Landmark className="text-blue-500 shrink-0" size={24} />
      <div>
        <p className="font-bold text-gray-900">{bank.name}</p>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin size={14} />
          {bank.address}
        </p>
      </div>
    </div>
    <button
      onClick={() => onDelete(bank.id)}
      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
      aria-label={`Eliminar banco ${bank.name}`}
    >
      <Trash2 size={20} />
    </button>
  </div>
);

// 6. Tarjeta de Cuenta
interface AccountCardProps {
    account: Account;
    bankName: string;
    onDelete: (id: number) => void;
}
const AccountCard: React.FC<AccountCardProps> = ({ account, bankName, onDelete }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 flex justify-between items-center transition hover:shadow-xl">
    <div className="flex items-start gap-3">
      <Wallet className="text-green-500 shrink-0 mt-1" size={24} />
      <div>
        <p className="font-bold text-gray-900">{account.name}</p>
        <div className="text-sm text-gray-700">
            <span className="font-mono text-lg text-green-700 mr-1">{account.balance}</span>
            <span className="font-semibold text-gray-500">{account.type}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Asociada a: <span className="font-medium text-blue-600">{bankName}</span>
        </p>
      </div>
    </div>
    <button
      onClick={() => onDelete(account.id)}
      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
      aria-label={`Eliminar cuenta ${account.name}`}
    >
      <Trash2 size={20} />
    </button>
  </div>
);