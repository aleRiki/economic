import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AccountOverview from "./components/AccountOverview";

import TransactionHistory from "./components/TransactionHistory";
import DebtAndWithdrawalTracker from "./components/DebtAndWithdrawalTracker";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 space-y-6 overflow-y-auto">
          <AccountOverview />
          <TransactionHistory />

          <DebtAndWithdrawalTracker />
        </main>
      </div>
    </div>
  );
}
