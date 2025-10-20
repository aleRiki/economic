"use client";

import React, { useRef, useEffect } from "react";
import {
  PiggyBank,
  BarChart3,
  ShieldCheck,
  Wallet,
  Globe2,
  LogIn,
} from "lucide-react";
import Link from "next/link";

export default function Init() {
  return (
    <main className="flex min-h-screen w-screen flex-col bg-gradient-to-b from-blue-50 to-white text-gray-800">
      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-5 py-4 md:px-10 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-blue-700 flex items-center gap-2">
          <PiggyBank className="text-blue-600 w-6 h-6 md:w-7 md:h-7" />
          Mi Familia 💸
        </h1>

        <Link href="/auth/login">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md text-sm sm:text-base">
            <LogIn className="w-4 h-4" />
            Iniciar Sesión
          </button>
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20 md:py-24 perspective-1000">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent leading-tight">
          Controla tus Finanzas Familiares
        </h2>

        <p className="text-base sm:text-lg md:text-xl max-w-3xl text-gray-600 mb-12 leading-relaxed px-2">
          Administra tus ingresos, gastos, cuentas y presupuestos{" "}
          <span className="font-semibold text-blue-600">desde un solo lugar</span>.
          Mantén el control económico de tu hogar de manera{" "}
          <span className="font-semibold text-blue-700">sencilla, segura y visual</span>.
        </p>

        {/* TARJETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          <Card
            icon={<Wallet size={40} className="text-blue-500" />}
            title="Gestión de Cuentas"
            text="Administra todas tus cuentas bancarias y saldos en diferentes monedas desde una única interfaz."
          />
          <Card
            icon={<PiggyBank size={40} className="text-green-500" />}
            title="Presupuestos Inteligentes"
            text="Crea y sigue presupuestos mensuales flexibles para mantener tus finanzas familiares equilibradas."
          />
          <Card
            icon={<BarChart3 size={40} className="text-orange-500" />}
            title="Estadísticas Claras"
            text="Visualiza tus ingresos y gastos con gráficos detallados, reportes y tendencias fáciles de entender."
          />
          <Card
            icon={<ShieldCheck size={40} className="text-purple-500" />}
            title="Seguridad Total"
            text="Tus datos financieros están protegidos con altos estándares de privacidad y encriptación."
          />
          <Card
            icon={<Globe2 size={40} className="text-cyan-500" />}
            title="Multi-Moneda"
            text="Controla tus finanzas en diferentes divisas con conversión automática y seguimiento global."
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs sm:text-sm py-6 text-gray-500 bg-white border-t border-gray-100 mt-8 px-4">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-700">MiEconomía Familiar</span> — Tu control financiero en un solo lugar.
      </footer>
    </main>
  );
}

// ----------------------------------------------------------------------
// CARD COMPONENT CON EFECTO 3D + GLOSSY LIGHT
// ----------------------------------------------------------------------
type CardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  className?: string;
};

function Card({ icon, title, text, className = "" }: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * -8;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      card.style.boxShadow = `${-rotateY * 3}px ${rotateX * 3}px 25px rgba(0,0,0,0.15)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
      card.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-md transform-gpu transition-transform duration-300 ease-out cursor-pointer overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Capa de brillo animado */}
      <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000 before:ease-out rounded-2xl" />

      <div className="mb-3">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
        {title}
      </h3>
      <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
        {text}
      </p>
    </div>
  );
}
