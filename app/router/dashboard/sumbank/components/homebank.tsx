"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Banknote,
  Landmark,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  Wallet,
  Users,
  User,
  Search,
} from "lucide-react";

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
  balance: number | string;
  typeAccount: string;
  bankId: number;
}

// 🆕 Nueva interfaz para los usuarios disponibles
interface UserAvailable {
  id: number;
  name: string; // O el campo que uses para mostrar
  email: string;
}

// 🆕 Nuevo componente de búsqueda
interface UserSearchProps {
  availableUsers: UserAvailable[];
  selectedUsers: UserAvailable[];
  onAdd: (user: UserAvailable) => void;
  onRemove: (id: number) => void;
}

// -------------------------------
// 🔹 COMPONENTE DE BÚSQUEDA DE USUARIOS
// -------------------------------
const UserSearch: React.FC<UserSearchProps> = ({
  availableUsers,
  selectedUsers,
  onAdd,
  onRemove,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Filtrar usuarios disponibles
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];

    const selectedIds = new Set(selectedUsers.map(u => u.id));

    return availableUsers
      .filter(user => !selectedIds.has(user.id)) // Excluir ya seleccionados
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.id.toString().includes(searchTerm)
      )
      .slice(0, 10); // Limitar resultados
  }, [searchTerm, availableUsers, selectedUsers]);

  const handleSelectUser = (user: UserAvailable) => {
    onAdd(user);
    setSearchTerm(""); // Limpiar búsqueda
    setShowDropdown(false);
  };

  return (
    <div className="border p-3 rounded-lg bg-gray-50 space-y-3">
      <label className="font-semibold text-sm text-gray-600 flex items-center gap-2">
        <Users size={16} className="text-green-600" /> Usuarios Asociados (Seleccionar por Nombre)
      </label>
      
      {/* Input de Búsqueda con Dropdown */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
          <Search className="text-gray-400 ml-3" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="px-3 py-2 flex-1 focus:outline-none"
            placeholder="Buscar por nombre o ID"
          />
        </div>
        
        {/* Dropdown de Resultados */}
        {showDropdown && searchTerm && filteredUsers.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onMouseDown={() => handleSelectUser(user)} // Usar onMouseDown para evitar el onBlur
                className="p-3 cursor-pointer hover:bg-green-100 flex justify-between items-center text-sm"
              >
                <span>{user.name} ({user.email})</span>
                <span className="text-xs text-gray-500">ID: {user.id}</span>
              </div>
            ))}
          </div>
        )}
        {showDropdown && searchTerm && filteredUsers.length === 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 p-3 text-sm text-gray-500">
                No se encontraron usuarios.
            </div>
        )}
      </div>

      {/* Chips de Usuarios Seleccionados */}
      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
        {selectedUsers.length === 0 ? (
            <p className="text-sm text-gray-400">Ningún usuario asociado aún.</p>
        ) : (
            selectedUsers.map((user) => (
              <span
                key={user.id}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium"
              >
                {user.name} (ID: {user.id})
                <button
                  type="button"
                  onClick={() => onRemove(user.id)}
                  className="text-red-500 hover:text-red-700 ml-1 transition duration-150"
                >
                  ✕
                </button>
              </span>
            ))
        )}
      </div>
    </div>
  );
};


export default function BankAccountManager() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserAvailable[]>([]); // 🆕 Estado para todos los usuarios
  
  const [newBank, setNewBank] = useState({ name: "", address: "" });

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "CUP",
    balance: 0,
    typeAccount: "personal",
    bankId: 0,
    // El frontend trabajará con objetos UserAvailable, no solo IDs
    associatedUsers: [] as UserAvailable[], 
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const bankMap = useMemo(() => {
    return banks.reduce((acc, bank) => {
      acc[bank.id] = bank.name;
      return acc;
    }, {} as { [key: number]: string });
  }, [banks]);

  // -------------------------------
  // 🔹 OBTENER DATOS DEL SERVIDOR (Usuarios)
  // -------------------------------
  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem("authToken");
        // 🚨 Asume que este endpoint existe en tu backend 🚨
        const res = await axios.get(`${API_BASE_URL}/users`, { 
            headers: { Authorization: `Bearer ${token}` },
        });
        // Adaptar los datos si es necesario (asumo que tu API devuelve { id, name, email })
        setAvailableUsers(res.data); 
    } catch (e) {
        console.error("Error al cargar usuarios disponibles:", e);
        setError("Error al cargar la lista de usuarios. No se podrán asignar cuentas familiares.");
    }
  };

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API_BASE_URL}/bank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(res.data);
    } catch {
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
    } catch {
      setError("Error al cargar las cuentas.");
    }
  };

  // -------------------------------
  // 🔹 CREAR CUENTA (MODIFICADA)
  // -------------------------------
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // 1. Validaciones básicas
    if (newAccount.bankId === 0) {
      setError("Debe seleccionar un banco válido.");
      setLoading(false);
      return;
    }

    // 2. Extracción y validación de userIds
    const userIdsToSend = newAccount.associatedUsers.map(u => u.id);

    if (
      newAccount.typeAccount === "familiar" &&
      userIdsToSend.length === 0
    ) {
      setError("Debe agregar al menos un usuario a la cuenta familiar.");
      setLoading(false);
      return;
    }
    
    // 3. Preparar el payload SÓLO con los IDs
    const payload = {
        name: newAccount.name,
        type: newAccount.type,
        balance: newAccount.balance,
        typeAccount: newAccount.typeAccount,
        bankId: newAccount.bankId,
        userIds: userIdsToSend, // 🚨 ESTO ES LO QUE EL BACKEND ESPERA 🚨
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/accounts`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Cuenta creada correctamente ✅");
      
      // Limpiar formulario
      setNewAccount({
        name: "",
        type: "CUP",
        balance: 0,
        typeAccount: "personal",
        bankId: 0,
        associatedUsers: [], // Limpiar lista de objetos
      });
      
      fetchAccounts();
    } catch (err) {
      console.error(err);
      setError("Error al crear la cuenta ❌");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 🔹 MANEJAR USUARIOS ASOCIADOS (OBJETOS)
  // -------------------------------
  const handleAddUser = (user: UserAvailable) => {
    setNewAccount((prev) => ({ 
        ...prev, 
        associatedUsers: [...prev.associatedUsers, user] 
    }));
  };

  const handleRemoveUser = (id: number) => {
    setNewAccount((prev) => ({
      ...prev,
      associatedUsers: prev.associatedUsers.filter((u) => u.id !== id),
    }));
  };
  
  // -------------------------------
  // 🔹 USE EFFECT
  // -------------------------------
  useEffect(() => {
    fetchBanks();
    fetchAccounts();
    fetchUsers(); // 🆕 Cargar la lista de usuarios
  }, []);


  // ... Resto de funciones (handleCreateBank, handleDeleteBank, handleDeleteAccount) quedan igual ...
  // ... (Las dejo simplificadas por brevedad, asumo que son correctas) ...
  
  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/bank`, newBank, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Banco creado correctamente ✅");
      setNewBank({ name: "", address: "" });
      fetchBanks();
    } catch {
      setError("Error al crear el banco ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este banco?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/bank/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Banco eliminado correctamente 🗑️");
      fetchBanks();
      fetchAccounts();
    } catch {
      setError("Error al eliminar el banco ❌");
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta cuenta?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/accounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Cuenta eliminada correctamente 🗑️");
      fetchAccounts();
    } catch {
      setError("Error al eliminar la cuenta ❌");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
          <Banknote className="text-blue-600 w-8 h-8" />
          Gestión Centralizada de Activos Bancarios
        </h1>

        {/* MENSAJES */}
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

        {/* FORMULARIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <CreationPanel title="Nuevo Centro Financiero" icon={Landmark} color="blue">
            <form onSubmit={handleCreateBank} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Nombre del banco"
                value={newBank.name}
                onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                required
                icon={Landmark}
              />
              <Input
                type="text"
                placeholder="Dirección"
                value={newBank.address}
                onChange={(e) => setNewBank({ ...newBank, address: e.target.value })}
                required
                icon={MapPin}
              />
              <ActionButton loading={loading} color="blue">
                <Plus size={18} className="mr-2" /> Crear Banco
              </ActionButton>
            </form>
          </CreationPanel>

          <CreationPanel title="Nueva Cuenta" icon={Wallet} color="green">
            <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Nombre de la cuenta"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                required
                icon={Banknote}
              />

              <Select
                value={newAccount.typeAccount}
                onChange={(e) => {
                    // Limpiar usuarios asociados si cambiamos a "personal"
                    const typeAccount = e.target.value;
                    setNewAccount(prev => ({ 
                        ...prev, 
                        typeAccount, 
                        associatedUsers: typeAccount === 'personal' ? [] : prev.associatedUsers 
                    }));
                }}
                options={[
                  { value: "personal", label: "Cuenta Personal" },
                  { value: "familiar", label: "Cuenta Familiar" },
                ]}
                icon={User}
              />

              {newAccount.typeAccount === "familiar" && (
                // 🚨 Se reemplaza el bloque de input de ID por el nuevo componente UserSearch
                <UserSearch 
                    availableUsers={availableUsers}
                    selectedUsers={newAccount.associatedUsers}
                    onAdd={handleAddUser}
                    onRemove={handleRemoveUser}
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                  options={[
                    { value: "CUP", label: "CUP" },
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                  ]}
                  icon={DollarSign}
                />
                <Input
                  type="number"
                  placeholder="Saldo inicial"
                  value={newAccount.balance === 0 ? "" : newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })
                  }
                  required
                  icon={Banknote}
                />
              </div>

              <Select
                value={newAccount.bankId}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, bankId: parseInt(e.target.value) })
                }
                options={[
                  { value: 0, label: "Seleccionar Banco" },
                  ...banks.map((b) => ({ value: b.id, label: b.name })),
                ]}
                required
                icon={Landmark}
              />

              <ActionButton loading={loading} color="green">
                <Plus size={18} className="mr-2" /> Crear Cuenta
              </ActionButton>
            </form>
          </CreationPanel>
        </div>

        {/* LISTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Landmark className="text-blue-500" size={20} /> Bancos ({banks.length})
            </h2>
            <div className="space-y-4">
              {banks.length === 0 ? (
                <p className="text-gray-500 p-4 border rounded-xl bg-gray-50">
                  No hay bancos registrados.
                </p>
              ) : (
                banks.map((bank) => (
                  <BankCard key={bank.id} bank={bank} onDelete={handleDeleteBank} />
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="text-green-500" size={20} /> Cuentas ({accounts.length})
            </h2>
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <p className="text-gray-500 p-4 border rounded-xl bg-gray-50">
                  No hay cuentas registradas.
                </p>
              ) : (
                accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    bankName={bankMap[account.bankId] || "Desconocido"}
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

/* ============================
   COMPONENTES AUXILIARES (Sin cambios mayores, solo inclusión de 'User')
============================ */
// ... (Se incluyen solo las props para asegurar que todo el código sea completo)

interface CreationPanelProps {
  title: string;
  icon: React.ElementType;
  color: "blue" | "green";
  children: React.ReactNode;
}

const CreationPanel: React.FC<CreationPanelProps> = ({ title, icon: Icon, color, children }) => (
  <div className={`p-6 rounded-2xl shadow-lg border border-${color}-200 bg-${color}-50/50`}>
    <h2 className={`text-xl font-bold text-${color}-800 mb-5 flex items-center gap-2 border-b pb-3 border-${color}-300`}>
      <Icon className={`text-${color}-600`} size={24} />
      {title}
    </h2>
    {children}
  </div>
);

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
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface ActionButtonProps {
  loading: boolean;
  color: "blue" | "green";
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ loading, color, children }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full py-3 rounded-xl text-white font-semibold transition duration-200 shadow-md flex items-center justify-center ${
      loading
        ? `bg-${color}-400 cursor-not-allowed opacity-80`
        : `bg-${color}-600 hover:bg-${color}-700 shadow-${color}-500/30`
    }`}
  >
    {loading ? "Procesando..." : children}
  </button>
);

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
    >
      <Trash2 size={20} />
    </button>
  </div>
);

interface AccountCardProps {
  account: Account;
  bankName: string;
  onDelete: (id: number) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, bankName, onDelete }) => {
  const balance = Number(account.balance) || 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 flex justify-between items-center transition hover:shadow-xl">
      <div>
        <p className="font-bold text-gray-900">{account.name}</p>
        <p className="text-sm text-gray-600">
          Banco: <span className="font-semibold">{bankName}</span>
        </p>
        <p className="text-sm text-gray-600">
          Tipo: {account.typeAccount} ({account.type})
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <DollarSign size={14} /> Saldo: {balance.toFixed(2)}
        </p>
      </div>
      <button
        onClick={() => onDelete(account.id)}
        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};