const accounts = [
  { name: "Cuenta USD", currency: "USD", balance: 12450, previous: 11800 },
  { name: "Cuenta EUR", currency: "EUR", balance: 9320, previous: 9100 },
  { name: "Cuenta CLP", currency: "CLP", balance: 245000, previous: 243000 },
];

function getGrowth(current: number, previous: number) {
  const diff = current - previous;
  const percent = ((diff / previous) * 100).toFixed(2);
  return { diff, percent };
}

export default function AccountList() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalle de cuentas</h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b">
            <th>Nombre</th>
            <th>Moneda</th>
            <th>Saldo</th>
            <th>Incremento</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => {
            const { diff, percent } = getGrowth(acc.balance, acc.previous);
            const isPositive = diff >= 0;
            return (
              <tr key={acc.name} className="text-sm text-gray-700 border-b">
                <td className="py-2">{acc.name}</td>
                <td>{acc.currency}</td>
                <td>${acc.balance.toLocaleString()}</td>
                <td className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? "+" : "-"}{Math.abs(diff).toLocaleString()} ({percent}%)
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}