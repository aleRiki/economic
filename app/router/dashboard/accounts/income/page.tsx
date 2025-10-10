import IncomeForm from "./components/IncomeForm"; 
import { Suspense } from 'react'; // Importamos Suspense

export default function IncomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* CORRECCIÓN DEL ERROR DE BUILD:
        Se envuelve el componente IncomeForm (que usa useSearchParams) en un límite de Suspense.
        Esto indica a Next.js que posponga la renderización de este componente hasta el lado del cliente,
        resolviendo así el error de pre-renderización.
      */}
      <Suspense fallback={<div className="text-center p-8 text-lg text-gray-500">Cargando formulario de ingresos...</div>}>
        <IncomeForm />
      </Suspense>
    </div>
  );
}
