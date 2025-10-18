export default function Header() {
  const fechaActual = new Date();

  // Formatear la fecha en formato "10 Oct 2025"
  const opciones = { day: '2-digit', month: 'short', year: 'numeric' } as const;
  const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">Panel de Finanzas</h1>
      <div className="text-sm text-gray-500">
        Última actualización: {fechaFormateada}
      </div>
    </header>
  );
}
