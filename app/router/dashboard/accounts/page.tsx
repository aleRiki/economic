"use client";
import React from "react";
import Sidebar from "../components/Sidebar"; 
import Header from "../components/Header"; 
//import AccountList from "./components/AccountList"; 
import AccountSummary from "./components/AccountSummary"; 
import AccountCards from "./components/AccountCards";

export default function AccountsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 space-y-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800">Cuentas Registradas</h1>
          <AccountSummary />
          <AccountCards />
        </main>
      </div>
    </div>
  );
}