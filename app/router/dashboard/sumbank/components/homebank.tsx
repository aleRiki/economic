"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

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

export default function HBank() {
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

  // 🔹 Obtener Bancos
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

  // 🔹 Obtener Cuentas
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

  // 🔹 Crear Banco
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

  // 🔹 Crear Cuenta
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

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
        bankId: 0,
      });
      fetchAccounts();
    } catch (err) {
      setError("Error al crear la cuenta ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Eliminar Banco
  const handleDeleteBank = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este banco?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/bank/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Banco eliminado correctamente 🗑️");
      fetchBanks();
    } catch (err) {
      setError("Error al eliminar el banco ❌");
    }
  };

  // 🔹 Eliminar Cuenta
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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Gestión de Bancos y Cuentas 💳🏦
      </h1>

      {/* CREAR BANCO */}
      <section className="mb-8 border-b pb-6">
        <h2 className="text-lg font-semibold mb-3">Crear Banco</h2>
        <form onSubmit={handleCreateBank} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre del banco"
            value={newBank.name}
            onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
            required
            className="border rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Dirección del banco"
            value={newBank.address}
            onChange={(e) =>
              setNewBank({ ...newBank, address: e.target.value })
            }
            required
            className="border rounded-md p-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Creando..." : "Crear Banco"}
          </button>
        </form>
      </section>

      {/* CREAR CUENTA */}
      <section className="mb-8 border-b pb-6">
        <h2 className="text-lg font-semibold mb-3">Crear Cuenta Bancaria</h2>
        <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre de la cuenta"
            value={newAccount.name}
            onChange={(e) =>
              setNewAccount({ ...newAccount, name: e.target.value })
            }
            required
            className="border rounded-md p-2"
          />

          <select
            value={newAccount.type}
            onChange={(e) =>
              setNewAccount({ ...newAccount, type: e.target.value })
            }
            className="border rounded-md p-2"
          >
            <option value="CUP">CUP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>

          <input
            type="number"
            placeholder="Saldo inicial"
            value={newAccount.balance}
            onChange={(e) =>
              setNewAccount({
                ...newAccount,
                balance: parseFloat(e.target.value),
              })
            }
            required
            className="border rounded-md p-2"
          />

          <select
            value={newAccount.bankId}
            onChange={(e) =>
              setNewAccount({
                ...newAccount,
                bankId: parseInt(e.target.value),
              })
            }
            className="border rounded-md p-2"
            required
          >
            <option value={0}>Seleccionar Banco</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            {loading ? "Creando..." : "Crear Cuenta"}
          </button>
        </form>
      </section>

      {/* MENSAJES */}
      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* LISTA DE BANCOS */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Bancos registrados:</h2>
        {banks.length === 0 ? (
          <p className="text-gray-500">No hay bancos registrados.</p>
        ) : (
          <ul className="space-y-3">
            {banks.map((bank) => (
              <li
                key={bank.id}
                className="flex justify-between items-center border rounded-md p-3"
              >
                <div>
                  <p className="font-semibold">{bank.name}</p>
                  <p className="text-sm text-gray-600">{bank.address}</p>
                </div>
                <button
                  onClick={() => handleDeleteBank(bank.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* LISTA DE CUENTAS */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Cuentas registradas:</h2>
        {accounts.length === 0 ? (
          <p className="text-gray-500">No hay cuentas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex justify-between items-center border rounded-md p-3"
              >
                <div>
                  <p className="font-semibold">{account.name}</p>
                  <p className="text-sm text-gray-600">
                    Tipo: {account.type} — Saldo: {account.balance}
                  </p>
                  <p className="text-xs text-gray-500">
                    Banco ID: {account.bankId}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
