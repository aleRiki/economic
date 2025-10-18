import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ExchangeRateComponent from "./components/componet";

export default function exchangeRatePage(){
    return (
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-6 space-y-6 overflow-y-auto">
             <ExchangeRateComponent/>
            </main>
          </div>
        </div>
      );
}