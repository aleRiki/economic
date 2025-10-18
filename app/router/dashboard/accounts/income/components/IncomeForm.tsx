"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";

import { getCard, postTransaction, Card } from "@/lib/auth-service";

export default function IncomeForm() {
  const router = useRouter();

  const params = useSearchParams();
  const selectedCardParam = params.get("card");

  const [cards, setCards] = useState<Card[]>([]);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [cardId, setCardId] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const fetchedCards = await getCard();
        setCards(fetchedCards);

        if (selectedCardParam) {
          const targetCard = fetchedCards.find(
            (c) =>
              String(c.id) === selectedCardParam ||
              c.number.slice(-4) === selectedCardParam
          );
          if (targetCard) {
            setCardId(String(targetCard.id));
          }
        }
      } catch (err: unknown) {
        // 👈 CORRECCIÓN 1: Línea 49
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar las tarjetas.";
        setMessage({
          type: "error",
          text: errorMessage,
        });
      } finally {
        setIsCardsLoading(false);
      }
    };
    loadCards();
  }, [selectedCardParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!cardId || !amount || !date) {
      setMessage({
        type: "error",
        text: "Por favor completa todos los campos obligatorios.",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setMessage({
        type: "error",
        text: "El monto debe ser un número positivo válido.",
      });
      return;
    }

    const transactionPayload = {
      transactionType: "deposit" as const,
      amount: amountValue,
      description: desc || "Ingreso manual sin descripción",
      cardId: Number(cardId),
    };

    setIsSubmitting(true);

    try {
      await postTransaction(transactionPayload);

      setMessage({
        type: "success",
        text: "🎉 Ingreso registrado correctamente. Redireccionando...",
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push("/router/dashboard/analyti");
    } catch (err: unknown) {
      // 👈 CORRECCIÓN 2: Línea 102
      setIsSubmitting(false);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "No se pudo registrar el ingreso. Inténtalo de nuevo.";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  };

  const messageClasses = message
    ? message.type === "error"
      ? "bg-red-50 border-red-400 text-red-700"
      : "bg-green-50 border-green-400 text-green-700"
    : "";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 space-y-6">
           {" "}
      <div className="flex flex-col items-center border-b pb-4">
                <DollarSign className="w-8 h-8 text-green-600 mb-2" />       {" "}
        <h2 className="text-2xl font-bold text-gray-800">
                    Nuevo Depósito Bancario        {" "}
        </h2>
               {" "}
        <p className="text-sm text-gray-500 mt-1">
                    Registre un ingreso a una de sus cuentas.        {" "}
        </p>
             {" "}
      </div>
           {" "}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium transition-all ${messageClasses}`}
        >
                    {message.text}       {" "}
        </div>
      )}
           {" "}
      <form onSubmit={handleSubmit} className="space-y-6">
                {/* GRUPO 1: MONTO (Destacado) */}       {" "}
        <div className="space-y-2 p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                   {" "}
          <label
            htmlFor="amount-input"
            className="block text-sm font-semibold text-blue-800 flex items-center"
          >
                        <DollarSign className="w-4 h-4 mr-1" />            Monto
            a Depositar <span className="text-red-500 ml-1">*</span>         {" "}
          </label>
                   {" "}
          <div className="relative">
                       {" "}
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-blue-900">
                            $            {" "}
            </span>
                       {" "}
            <input
              id="amount-input"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white text-3xl font-extrabold text-blue-900 pl-8 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-md"
              required
              min="0.01"
              step="0.01"
              disabled={isSubmitting}
            />
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {" "}
          <div className="space-y-1">
                       {" "}
            <label
              htmlFor="card-select"
              className="block text-sm font-medium text-gray-700 flex items-center"
            >
                           {" "}
              <CreditCard className="w-4 h-4 mr-1 text-gray-500" />             
              Cuenta Destino <span className="text-red-500 ml-1">*</span>       
                 {" "}
            </label>
                       {" "}
            <select
              id="card-select"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none"
              required
              disabled={isCardsLoading || isSubmitting}
            >
                           {" "}
              <option value="">
                               {" "}
                {isCardsLoading
                  ? "Cargando Cuentas..."
                  : "-- Selecciona una Tarjeta --"}
                             {" "}
              </option>
                           {" "}
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                                    {card.account.name} ({card.account.type})
                  ••••                   {card.number.slice(-4)}               {" "}
                </option>
              ))}
                         {" "}
            </select>
                     {" "}
          </div>
                   {" "}
          <div className="space-y-1">
                       {" "}
            <label
              htmlFor="date-input"
              className="block text-sm font-medium text-gray-700 flex items-center"
            >
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" /> 
                          Fecha <span className="text-red-500 ml-1">*</span>   
                     {" "}
            </label>
                       {" "}
            <input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
              disabled={isSubmitting}
            />
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="space-y-1">
                   {" "}
          <label
            htmlFor="desc-input"
            className="block text-sm font-medium text-gray-700 flex items-center"
          >
                        <FileText className="w-4 h-4 mr-1 text-gray-500" />     
                  Concepto / Descripción (Opcional)          {" "}
          </label>
                   {" "}
          <input
            id="desc-input"
            type="text"
            placeholder="Ej. Transferencia de salario"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isSubmitting}
          />
                 {" "}
        </div>
               {" "}
        <button
          type="submit"
          disabled={isSubmitting || isCardsLoading || cards.length === 0}
          className="w-full flex justify-center items-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition duration-150 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
                   {" "}
          {isSubmitting ? (
            <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />   
                        Procesando Depósito...            {" "}
            </>
          ) : (
            "Confirmar Depósito"
          )}
                 {" "}
        </button>
             {" "}
      </form>
         {" "}
    </div>
  );
}
