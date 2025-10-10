import Sidebar from "./components/Sidebar"; 
import Header from "./components/Header"; 
import AccountOverview from "./components/AccountOverview"; 
import CurrencyAnalytics from "./components/CurrencyAnalytics"; 
import TransactionHistory from "./components/TransactionHistory";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 space-y-6 overflow-y-auto">
          <AccountOverview />
          <TransactionHistory />

          <CurrencyAnalytics />
        </main>
      </div>
    </div>
  );
}