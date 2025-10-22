"use client";

import React, { useRef, useEffect } from "react";
import {
  PiggyBank,
  BarChart3,
  ShieldCheck,
  Wallet,
  Globe2,
  LogIn,
  Zap, // Icono más futurista para el logo
} from "lucide-react";
import Link from "next/link";

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Init)
// ----------------------------------------------------------------------

export default function Init() {
  return (
    <main className="flex min-h-screen w-screen flex-col bg-gray-900 text-gray-100 overflow-x-hidden">
      {/* BACKGROUND GRID EFFECT (Simula un display futurista) */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
          backgroundSize: "25px 25px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 80%)",
        }}
      />

      {/* HEADER - BARRA DE NAVEGACIÓN CIBERNÉTICA */}
      <header className="w-full flex items-center justify-between px-5 py-4 md:px-10 bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-50 shadow-lg shadow-cyan-500/5">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-widest text-white flex items-center gap-2">
          <Zap className="text-cyan-400 w-6 h-6 md:w-7 md:h-7 animate-pulse" />
          Cipher-Fin ⚡
        </h1>

        <Link href="/auth/login">
          <button className="flex items-center gap-2 bg-cyan-600 text-gray-900 px-4 py-2 rounded-full font-bold hover:bg-cyan-400 transition transform hover:scale-105 shadow-xl shadow-cyan-500/30 text-sm sm:text-base border border-cyan-400">
            <LogIn className="w-4 h-4" />
            Acceso Cifrado
          </button>
        </Link>
      </header>

      {/* HERO SECTION - PRESENTACIÓN HOLOGRÁFICA */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20 md:py-24 relative z-10">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight uppercase tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            FINANZAS FAMILIARES
          </span>
          <br />
          <span className="text-gray-300">| CONTROL DIGITAL |</span>
        </h2>

        <p className="text-base sm:text-lg md:text-xl max-w-4xl text-gray-400 mb-16 leading-relaxed px-2 font-mono">
          Sistema de gestión{" "}
          <span className="text-cyan-400">descentralizado</span>. Administra tus
          activos, pasivos y proyecciones
        </p>

        {/* TARJETAS - "MAGNETIC DATA SLOTS" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          <FuturisticCard
            icon={
              <Wallet
                size={40}
                className="text-cyan-400 drop-shadow-lg shadow-cyan-500/50"
              />
            }
            title="Núcleo de Cuentas"
            text="Control en tiempo real de saldos multidivisa. Interfaz unificada de activos digitales y tradicionales."
          />
          <FuturisticCard
            icon={
              <PiggyBank
                size={40}
                className="text-purple-400 drop-shadow-lg shadow-purple-500/50"
              />
            }
            title="Presupuesto Holográfico"
            text="Proyección dinámica de gastos. Algoritmos de IA para optimizar el flujo de efectivo familiar."
          />
          <FuturisticCard
            icon={
              <BarChart3
                size={40}
                className="text-yellow-400 drop-shadow-lg shadow-yellow-500/50"
              />
            }
            title="Análisis Predictivo"
            text="Visualización de datos 3D. Identifica patrones de riesgo y oportunidades de crecimiento financiero."
          />
          <FuturisticCard
            icon={
              <ShieldCheck
                size={40}
                className="text-lime-400 drop-shadow-lg shadow-lime-500/50"
              />
            }
            title="Protocolo Cifrado"
            text="Seguridad biométrica multicapa. Protección inquebrantable de datos financieros con encriptación cuántica."
          />
          <FuturisticCard
            icon={
              <Globe2
                size={40}
                className="text-pink-400 drop-shadow-lg shadow-pink-500/50"
              />
            }
            title="Intercambio Global"
            text="Gestión de finanzas transfronterizas. Conversión automática y seguimiento de tipos de cambio en directo."
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </section>

      {/* FOOTER - LÍNEA DE COMANDOS */}
      <footer className="text-center text-xs sm:text-sm py-6 text-gray-600 bg-gray-950 border-t border-cyan-900/50 mt-12 px-4">
        &gt; C:\FINANCIAL_HUB\v{new Date().getFullYear()} —{" "}
        <span className="text-cyan-400 font-mono">
          EJECUTANDO PROTOCOLOS DE SEGURIDAD.
        </span>
      </footer>
    </main>
  );
}

// ----------------------------------------------------------------------
// CARD COMPONENT CON EFECTO 3D AVANZADO + GLOW (FuturisticCard)
// ----------------------------------------------------------------------
type CardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  className?: string;
};

function FuturisticCard({ icon, title, text, className = "" }: CardProps) {
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

      // Rotación 3D más pronunciada para el efecto "flotante"
      const rotateX = ((y - centerY) / centerY) * -12; // Invertido para sensación de profundidad
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

      // Sombra proyectada para acentuar el 3D
      card.style.boxShadow = `${-rotateY * 0.5}px ${
        rotateX * 0.5
      }px 30px rgba(0,255,255,0.2), 
                                     0 0 10px rgba(0,255,255,0.1) inset`;

      // Posición del brillo de seguimiento ("Magnetic Light")
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    };

    const handleMouseLeave = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
      card.style.boxShadow =
        "0 0 10px rgba(0,255,255,0.05) inset, 0 8px 15px rgba(0,0,0,0.5)"; // Sombra más sutil en reposo
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
      className={`relative bg-gray-800 p-8 rounded-xl border border-cyan-700/50 shadow-lg transform-gpu transition-transform duration-300 ease-out cursor-pointer overflow-hidden group ${className}`}
      style={
        {
          transformStyle: "preserve-3d",
          perspective: "1000px",
          boxShadow:
            "0 8px 15px rgba(0,0,0,0.5), 0 0 5px rgba(0,255,255,0.05) inset",
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties
      } // Tipado para propiedades CSS personalizadas
    >
      {/* Brillo Holográfico de Seguimiento (Simula un campo magnético o de datos) */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
        style={{
          background:
            "radial-gradient(400px circle at var(--x) var(--y), rgba(0,255,255,0.2) 0%, transparent 70%)",
          willChange: "background",
        }}
      />

      {/* Borde animado (simula un borde de energía) */}
      <div className="absolute inset-0 border-2 border-cyan-500/0 group-hover:border-cyan-500/50 transition-all duration-300 rounded-xl" />

      {/* Contenido de la Tarjeta */}
      <div className="relative z-10">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400 tracking-wider uppercase">
          {title}
        </h3>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light">
          {text}
        </p>
      </div>
    </div>
  );
}
