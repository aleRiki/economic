"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
    DollarSign,
    CreditCard,
    Calendar,
    FileText,
    Loader2,
    TrendingUp, 
    TrendingDown, 
    Tag, 
    LucideIcon, 
} from "lucide-react";

// Asumimos que Card y postTransaction son correctos
import { getCard, postTransaction, Card } from "@/lib/auth-service";

// ----------------------------------------------------
// 1️⃣ Definición de Tipos y Categorías
// ----------------------------------------------------

type TransactionType = "deposit" | "withdraw";

// Define las categorías en el frontend
const CATEGORIES = {
    // Ingresos (Deposit)
    deposit: {
        salary: "Salario / Nómina",
        investment: "Inversión / Rendimientos",
        bonus: "Bono / Comisión",
        refund: "Reembolso",
        other_income: "Otros Ingresos",
    },
    // Gastos (Withdraw)
    withdraw: {
        rent: "Alquiler / Hipoteca",
        food_groceries: "Comida / Supermercado",
        entertainment: "Entretenimiento",
        transportation: "Transporte",
        utilities_electricity: "Electricidad",
        utilities_phone: "Teléfono / Móvil",
        utilities_internet: "Internet",
        debt_payment: "Pago de Deuda",
        health_care: "Salud / Médico",
        shopping: "Compras",
        other_expense: "Otros Gastos",
    },
};

// Tipos de Categorías por grupo para mejor tipado
type DepositCategories = typeof CATEGORIES['deposit'];
type WithdrawCategories = typeof CATEGORIES['withdraw'];

// Obtiene la lista aplanada. Incluye "" para el estado inicial y el reseteo.
type CategoryKey = keyof DepositCategories | keyof WithdrawCategories | "";

// Define el tipo para categoryOptions, que será un objeto clave-valor conocido.
// Hacemos CategoryMap indexable con cualquier clave de categoría.
type CategoryMap = { 
    [K in Exclude<CategoryKey, "">]: string;
};


export default function TransactionForm() {
    const router = useRouter();

    const params = useSearchParams();
    const selectedCardParam = params.get("card");
    const initialType = (params.get("type") as TransactionType) || "deposit"; 
    
    const [transactionType, setTransactionType] = useState<TransactionType>(initialType);

    const [cards, setCards] = useState<Card[]>([]);
    const [isCardsLoading, setIsCardsLoading] = useState(true);
    const [cardId, setCardId] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<CategoryKey>(''); 
    
    const [desc, setDesc] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: "error" | "success";
        text: string;
    } | null>(null);

    // ----------------------------------------------------
    // Lógica para sincronizar categorías al cambiar el tipo
    // ----------------------------------------------------
    // ✅ CORRECCIÓN CLAVE: Se fuerza que el resultado del useMemo se adapte a CategoryMap indexable.
    const categoryOptions = useMemo<CategoryMap>(() => {
        return CATEGORIES[transactionType] as CategoryMap;
    }, [transactionType]);

    useEffect(() => {
        // Al cambiar el tipo (depósito/gasto), resetea la categoría
        setCategory('');
    }, [transactionType]);


    // 1. Efecto para cargar tarjetas
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
                
                // Si la categoría aún no está seleccionada, preselecciona la primera opción por defecto
                if (!category) {
                    const defaultCategory = Object.keys(CATEGORIES[initialType])[0] as CategoryKey;
                    
                    if (defaultCategory) {
                        setCategory(defaultCategory);
                    }
                }

            } catch (err: unknown) {
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
    }, [selectedCardParam, category, initialType]);

    // 2. Lógica para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // La validación asegura que 'category' no es ""
        if (!cardId || !amount || !category || !date) {
            setMessage({
                type: "error",
                text: "Por favor completa todos los campos obligatorios (Tarjeta, Monto y Categoría).",
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
        
        // La categoría segura, que será enviada al backend (no puede ser "")
        const categoryKeySafe = category as Exclude<CategoryKey, "">;

        // Definimos el tipo de clave específico para el acceso a categoryOptions
        const currentCategoryKey = transactionType === 'deposit' 
            ? categoryKeySafe as keyof DepositCategories
            : categoryKeySafe as keyof WithdrawCategories;

        // Al forzar el tipo de CategoryMap en el useMemo, TypeScript ahora permite esta indexación.
        // Ya no se requiere el 'as string' adicional.
        const categoryName = categoryOptions[currentCategoryKey];


        const transactionPayload = {
            transactionType: transactionType, 
            category: categoryKeySafe, 
            amount: amountValue,
            // Utilizamos 'categoryName', que ahora está garantizado como string.
            description: desc || (transactionType === 'deposit' ? `Ingreso: ${categoryName}` : `Gasto: ${categoryName}`),
            cardId: Number(cardId),
        };

        setIsSubmitting(true);

        try {
            await postTransaction(transactionPayload);

            setMessage({
                type: "success",
                text: `🎉 ${transactionType === 'deposit' ? 'Depósito' : 'Gasto'} registrado correctamente. Redireccionando...`,
            });

            await new Promise((resolve) => setTimeout(resolve, 1500));

            router.push("/router/dashboard/analyti"); 
        } catch (err: unknown) {
            setIsSubmitting(false);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : `No se pudo registrar el ${transactionType === 'deposit' ? 'ingreso' : 'extracción'}. Verifica fondos y datos.`;
            setMessage({
                type: "error",
                text: errorMessage,
            });
        }
    };
    
    // 3. Clases dinámicas para la UI
    const isDeposit = transactionType === 'deposit';
    const TypeIconComponent: LucideIcon = isDeposit ? TrendingUp : TrendingDown; 
    const typeTitle = isDeposit ? "Nuevo Ingreso / Depósito" : "Nuevo Gasto / Extracción";
    const typeVerb = isDeposit ? "Depositar" : "Retirar";
    const typeAction = isDeposit ? "Depósito" : "Gasto";

    const messageClasses = message
        ? message.type === "error"
          ? "bg-red-50 border-red-400 text-red-700"
          : "bg-green-50 border-green-400 text-green-700"
        : "";

    const mainColorClass = isDeposit
        ? "bg-green-50/70 border-green-100 text-green-800"
        : "bg-red-50/70 border-red-100 text-red-800";
        
    const buttonColorClass = isDeposit
        ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        : "bg-red-600 hover:bg-red-700 focus:ring-red-500";

    const iconColorClass = isDeposit ? "text-green-600" : "text-red-600";


    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 space-y-6">
            <div className="flex flex-col items-center border-b pb-4">
                <TypeIconComponent className={`w-8 h-8 ${iconColorClass} mb-2`} />
                <h2 className="text-2xl font-bold text-gray-800">{typeTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {isDeposit ? "Registre un ingreso a una de sus cuentas." : "Registre una extracción o gasto desde una de sus cuentas."}
                </p>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-xl border text-sm font-medium transition-all ${messageClasses}`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Selector de Tipo de Transacción */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        Tipo de Transacción
                    </label>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setTransactionType('deposit')}
                            className={`flex-1 flex justify-center items-center py-2 rounded-lg font-semibold transition duration-150 border-2 ${
                                isDeposit 
                                    ? 'bg-green-50 border-green-600 text-green-700 shadow-inner' 
                                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-green-50/50'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4 mr-2" /> Ingreso
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType('withdraw')}
                            className={`flex-1 flex justify-center items-center py-2 rounded-lg font-semibold transition duration-150 border-2 ${
                                !isDeposit 
                                    ? 'bg-red-50 border-red-600 text-red-700 shadow-inner' 
                                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-red-50/50'
                            }`}
                        >
                            <TrendingDown className="w-4 h-4 mr-2" /> Gasto
                        </button>
                    </div>
                </div>

                {/* Selector de Categoría */}
                <div className="space-y-1">
                    <label
                        htmlFor="category-select"
                        className="block text-sm font-medium text-gray-700 flex items-center"
                    >
                        <Tag className="w-4 h-4 mr-1 text-gray-500" />
                        Categoría de {typeAction} <span className="text-red-500 ml-1">*</span>
                    </label>

                    <select
                        id="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryKey)}
                        className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none"
                        required
                        disabled={isSubmitting}
                    >
                        <option value="" disabled>
                            -- Selecciona una Categoría --
                        </option>

                        {/* Mapea las categorías según el tipo de transacción */}
                        {Object.entries(categoryOptions).map(([key, name]) => (
                            <option key={key} value={key}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Monto con color dinámico */}
                <div className={`space-y-2 p-4 rounded-xl border ${mainColorClass}`}>
                    <label
                        htmlFor="amount-input"
                        className={isDeposit ? "block text-sm font-semibold text-green-800 flex items-center" : "block text-sm font-semibold text-red-800 flex items-center"} 
                    >
                        <DollarSign className="w-4 h-4 mr-1" /> Monto a {typeVerb} <span className="text-red-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                        <span 
                            className={isDeposit ? "absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-green-900" : "absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-red-900"}
                        >
                            $
                        </span>

                        <input
                            id="amount-input"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={isDeposit ? "w-full bg-white text-3xl font-extrabold text-green-900 pl-8 pr-4 py-3 border-2 border-green-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-md" : "w-full bg-white text-3xl font-extrabold text-red-900 pl-8 pr-4 py-3 border-2 border-red-300 rounded-xl focus:ring-red-500 focus:border-red-500 transition duration-150 shadow-md"}
                            required
                            min="0.01"
                            step="0.01"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Selector de Tarjeta */}
                    <div className="space-y-1">
                        <label
                            htmlFor="card-select"
                            className="block text-sm font-medium text-gray-700 flex items-center"
                        >
                            <CreditCard className="w-4 h-4 mr-1 text-gray-500" />
                            Cuenta {isDeposit ? "Destino" : "Origen"} <span className="text-red-500 ml-1">*</span>
                        </label>

                        <select
                            id="card-select"
                            value={cardId}
                            onChange={(e) => setCardId(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none"
                            required
                            disabled={isCardsLoading || isSubmitting}
                        >
                            <option value="">
                                {isCardsLoading ? "Cargando Cuentas..." : "-- Selecciona una Tarjeta --"}
                            </option>
                            {cards.map((card) => (
                                <option key={card.id} value={card.id}>
                                    {card.account.name} ({card.account.type}) ••••
                                    {card.number.slice(-4)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Input de Fecha */}
                    <div className="space-y-1">
                        <label
                            htmlFor="date-input"
                            className="block text-sm font-medium text-gray-700 flex items-center"
                        >
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                            Fecha <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="date-input"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Input de Descripción */}
                <div className="space-y-1">
                    <label
                        htmlFor="desc-input"
                        className="block text-sm font-medium text-gray-700 flex items-center"
                    >
                        <FileText className="w-4 h-4 mr-1 text-gray-500" /> 
                        Concepto / Descripción (Opcional)
                    </label>
                    <input
                        id="desc-input"
                        type="text"
                        placeholder={isDeposit ? "Ej. Transferencia de salario" : "Ej. Compra en supermercado"}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2.5 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        disabled={isSubmitting}
                    />
                </div>
                
                {/* Botón de Envío */}
                <button
                    type="submit"
                    disabled={isSubmitting || isCardsLoading || cards.length === 0}
                    className={`w-full flex justify-center items-center text-white font-semibold py-3 rounded-xl transition duration-150 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed ${buttonColorClass}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Procesando {typeAction}...
                        </>
                    ) : (
                        `Confirmar ${typeAction}`
                    )}
                </button>
            </form>
        </div>
    );
}