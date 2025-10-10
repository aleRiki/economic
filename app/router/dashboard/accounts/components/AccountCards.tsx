import { Button } from "@/components/ui/button";
import Link from "next/link";

const accounts = [
  {
    name: "Cuenta EUR",
    currency: "EUR",
    balance: 9320,
    last4: "4821",
    bank: "Banco Santander",
  },
  {
    name: "Cuenta USD",
    currency: "USD",
    balance: 12450,
    last4: "9173",
    bank: "Credic Bank",
  },
  {
    name: "Cuenta CUP",
    currency: "CUP",
    balance: 245000,
    last4: "3019",
    bank: "Banco Metropolitano",
  },
];

const currencyStyles: Record<string, string> = {
  EUR: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
  USD: "bg-gradient-to-r from-gray-300 to-gray-500 text-black",
  CUP: "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
};

export default function AccountCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {accounts.map((acc) => (
        <div
          key={acc.last4}
          className={`relative rounded-xl p-6 shadow-lg overflow-hidden ${
            currencyStyles[acc.currency]
          }`}
        >
          {/* Chip */}
          <div className="w-10 h-7 bg-yellow-300 rounded-sm mb-4"></div>

          {/* Nombre de cuenta */}
          <h2 className="text-sm uppercase font-semibold mb-1">{acc.name}</h2>

          {/* Balance */}
          <p className="text-3xl font-bold mb-4">
            {acc.currency === "EUR" && "€"}
            {acc.currency === "USD" && "$"}
            {acc.currency === "CUP" && "₱"}
            {acc.balance.toLocaleString()}
          </p>

          {/* Terminación de tarjeta */}
          <div className="text-sm tracking-widest font-mono opacity-80">
            •••• {acc.last4}
          </div>

          {/* Banco */}
          <div className="absolute bottom-4 right-4 text-xs font-semibold opacity-70">
            {acc.bank}
          </div>

          {/* Botón visible */}
          <Link href={`/router/dashboard/accounts/income?card=${acc.last4}`}>
            <Button variant="secondary" className="mt-4 text-sm font-semibold">
              Realizar Registro
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
