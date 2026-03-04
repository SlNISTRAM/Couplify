export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const INCOME_BASE = 0;
export const INCOME_BONUS = 0; // Extra for July and December

export const FIXED_EXPENSES_BASE = [];

export const SAVINGS_GOALS = {
  depa: { name: "Departamento", monthly: 0, total: 19200 },
  boda: { name: "Boda", monthly: 0, total: 9600 },
};

export const EXPENSE_CATEGORIES = [
  "Comida",
  "Transporte",
  "Hogar",
  "Ocio",
  "Salud",
  "Suscripciones",
  "Regalos",
  "Ropa",
  "Otros",
];

export const ACCOUNTS = [
  { id: "cash", name: "Efectivo", icon: "Banknote", color: "text-emerald-500", type: "debit" },
  {
    id: "card1",
    name: "Tarjeta Principal",
    icon: "CreditCard",
    color: "text-indigo-500",
    type: "credit",
  },
  {
    id: "card2",
    name: "Tarjeta Secundaria",
    icon: "CreditCard",
    color: "text-rose-500",
    type: "credit",
  },
  {
    id: "bank",
    name: "Cuenta Bancaria",
    icon: "Wallet",
    color: "text-blue-500",
    type: "debit",
  },
];
