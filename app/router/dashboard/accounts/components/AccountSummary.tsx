const accounts = [
  { name: "Cuenta USD", currency: "USD", balance: 12450 },
  { name: "Cuenta EUR", currency: "EUR", balance: 9320 },
  { name: "Cuenta CLP", currency: "CLP", balance: 245000 },
];

export default function AccountSummary() {
  const total = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Total acumulado</h2>
      <p className="text-2xl font-bold text-blue-700">
        ${total.toLocaleString()}
      </p>
    </div>
  );
}