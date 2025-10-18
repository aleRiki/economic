"use client";
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import HBank from "./components/homebank";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 space-y-6 overflow-y-auto">
          <div>
            <HBank />
          </div>
        </main>
      </div>
    </div>
  );
}
