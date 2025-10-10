"use client";
import React from "react";
import Sidebar from "../components/Sidebar"; 
import Header from "../components/Header"; 
import AccountMetrics from "./components/AccountMetrics"; 
import AccountTrends from "./components/AccountTrends"; 
import CurrencyDistribution from "./components/CurrencyDistribution"; 

export default function AnalytiPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 space-y-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800">Análisis Económico</h1>
          <AccountMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AccountTrends />
            <CurrencyDistribution />
          </div>
        </main>
      </div>
    </div>
  );
}