export default function AccountOverview() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm text-gray-500">Cuenta USD</h2>
        <p className="text-2xl font-bold text-blue-800">$12,450.00</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm text-gray-500">Cuenta EUR</h2>
        <p className="text-2xl font-bold text-green-700">€9,320.00</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm text-gray-500">Cuenta CUP</h2>
        <p className="text-2xl font-bold text-red-600">₱245,000.00</p>
      </div>
    </section>
  );
}