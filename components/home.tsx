"use client";

import React from "react";
// 🚨 Asegúrate de tener instalado: npm install lucide-react framer-motion
import { motion, Variants } from "framer-motion"; // Importamos Variants
import {
  ShieldCheck, 
  Wallet,
  LogIn,
  ArrowRight,
  TrendingUp,
  Landmark, 
  Users, 
  BarChart3, 
  Target, 
} from "lucide-react";
import Link from "next/link";

// ----------------------------------------------------------------------
// 🚨 CORRECCIÓN DE TIPADO: Agregamos la extensión de MotionProps para 'custom'
// ----------------------------------------------------------------------
import { MotionProps } from "framer-motion";

// --- TIPOS ---
// Extendemos las props estándar de React y agregamos las props de framer-motion necesarias
// 'delay' se convierte en la prop 'custom' que pasamos a motion.div
interface CardProps extends MotionProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  delay: number; // Este valor es pasado a 'custom'
}

// --- ANIMATION VARIANTS CORREGIDAS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Aseguramos que 'itemVariants' tenga el tipo 'Variants' y use el argumento 'custom' (delay)
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({ // Función que acepta el valor 'custom'
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay: delay * 0.1 + 0.3, 
    } 
  }),
};

// ----------------------------------------------------------------------
// CARD COMPONENT: CLARIDAD Y CONFIANZA
// ----------------------------------------------------------------------

function SecurityCard({ icon, title, text, delay }: CardProps) {
  return (
    <motion.div
      // 🚨 USO CORREGIDO: La prop 'delay' de CardProps se mapea al prop 'custom' de motion.div.
      // TypeScript ahora lo acepta gracias a 'interface CardProps extends MotionProps'.
      custom={delay} 
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-shadow hover:shadow-2xl hover:border-blue-400/50 transform hover:scale-[1.01]"
    >
      <div className="flex items-start mb-4">
        <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-inner">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mt-1">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Init) - (El resto del código se mantiene igual)
// ----------------------------------------------------------------------

export default function Init() {
  return (
    <main className="flex min-h-screen w-screen flex-col bg-gray-50 text-gray-900 overflow-x-hidden">
      
      {/* HEADER - ENFOQUE BANCARIO Y SEGURO */}
      <header className="w-full flex items-center justify-between px-5 py-4 md:px-10 bg-white shadow-lg border-b-4 border-blue-600/10 sticky top-0 z-50">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <Landmark className="text-blue-600 w-7 h-7" />
          <span className="text-gray-800">Finance</span><span className="text-green-600">Hom</span>
        </h1>

        <Link href="/auth/login" passHref>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#1e40af" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full font-semibold transition-all text-base shadow-lg shadow-blue-500/30"
          >
            <LogIn className="w-4 h-4" />
            Acceso Seguro
          </motion.button>
        </Link>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* HERO SECTION: CONFIANZA Y ESTABILIDAD */}
      {/* ---------------------------------------------------------------------- */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 relative z-10 bg-gradient-to-b from-gray-50 to-white">
        
        {/* Etiqueta de Confianza y Seguridad */}
        <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-sm font-semibold text-green-700 bg-green-100 px-4 py-1.5 rounded-full border border-green-300 mb-4 uppercase tracking-wider flex items-center gap-2"
        >
            <ShieldCheck className="w-4 h-4" />
            Tu Bóveda Financiera Personal
        </motion.p>
        
        {/* TITULO PRINCIPAL */}
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-gray-900 max-w-4xl"
        >
            Gestión de <span className="text-blue-600">Ahorros</span> y Finanzas
            <br />
            Para tu <span className="text-green-600">Familia</span> y Futuro.
        </motion.h2>

        {/* SUBTÍTULO */}
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl max-w-3xl text-gray-600 mb-10 leading-relaxed px-2"
        >
            Toma el control de tus presupuestos, establece metas de ahorro claras y 
            asegura la estabilidad económica de tu hogar con una plataforma robusta y transparente.
        </motion.p>
        
        {/* CALL TO ACTION PRINCIPAL */}
        <Link href="/auth/register" passHref>
             <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(22, 163, 74, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-green-600 text-white px-8 py-3 rounded-lg font-bold uppercase text-lg shadow-xl shadow-green-500/40 transition-all hover:bg-green-700"
             >
                Crea tu Cuenta Segura <ArrowRight className="w-5 h-5 ml-1" />
            </motion.button>
        </Link>
      </section>
      
      {/* ---------------------------------------------------------------------- */}
      {/* SECCIÓN DE CARACTERÍSTICAS: ENFOQUE EN AHORRO Y FAMILIA */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-gray-100 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
                Lo Esencial para tus Finanzas
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
                Herramientas diseñadas para la tranquilidad, el crecimiento y la gestión colaborativa de los recursos familiares.
            </p>

            {/* TARJETAS - Disposición centrada en la claridad */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <SecurityCard
                    icon={<Target size={24} />}
                    title="Metas de Ahorro Claras"
                    text="Define objetivos (vacaciones, casa, educación) y sigue tu progreso con visualizaciones motivadoras y reportes."
                    delay={1}
                />
                <SecurityCard
                    icon={<Users size={24} />}
                    title="Gestión Familiar Compartida"
                    text="Permite que varios usuarios administren cuentas compartidas, manteniendo la transparencia y el control total."
                    delay={2}
                />
                <SecurityCard
                    icon={<ShieldCheck size={24} />}
                    title="Seguridad Bancaria"
                    text="Protegemos tus datos con protocolos de encriptación avanzados. Tu información es confidencial e inquebrantable."
                    delay={3}
                />
                <SecurityCard
                    icon={<BarChart3 size={24} />}
                    title="Análisis de Tendencias"
                    text="Obtén una visión clara de tus gastos. Identifica fugas de dinero y optimiza tu presupuesto mensual."
                    delay={4}
                />
                <SecurityCard
                    icon={<TrendingUp size={24} />}
                    title="Proyecciones de Crecimiento"
                    text="Ve más allá del presente. Proyectamos tu balance futuro basado en tu historial y objetivos de ahorro."
                    delay={5}
                />
                <SecurityCard
                    icon={<Wallet size={24} />}
                    title="Cartera Centralizada"
                    text="Unifica todas tus cuentas bancarias y tarjetas en un solo dashboard, simplificando la visión global."
                    delay={6}
                />
            </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* FOOTER - CORPORATIVO Y SERIO */}
      {/* ---------------------------------------------------------------------- */}
      <footer className="text-center text-sm py-8 text-gray-500 bg-white border-t border-gray-200 mt-12 px-4">
        &copy; {new Date().getFullYear()} Finance Hom | Plataforma de Gestión de Ahorros y Finanzas Personales. Confianza y Transparencia.
      </footer>
    </main>
  );
}