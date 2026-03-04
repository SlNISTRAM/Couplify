import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFinance } from "../hooks/useFinance";
import { useToast } from "../context/ToastContext";
import {
  formatCurrency,
  formatCompactCurrency,
  getDaysRemaining,
} from "../utils/helpers";
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  AlertTriangle,
  Wallet,
  Calculator,
  Calendar as CalendarIcon,
  TrendingDown,
  PiggyBank,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Utensils,
  Gamepad2,
  Heart,
  Shirt,
  Package,
  Lock,
  Unlock,
  Pencil,
  Check,
  X,
  Car,
  Home,
  CreditCard,
  Gift,
  Banknote,
  ShoppingBag,
  Target,
  Receipt,
  Tv,
  PartyPopper,
  Stethoscope,
  Copy,
  ChevronDown as ChevronIcon,
  Clock,
} from "lucide-react";
import { EXPENSE_CATEGORIES, ACCOUNTS } from "../utils/constants";
import ExpenseCharts from "./ExpenseCharts";
import ConfirmModal from "./ConfirmModal";
import DateTimeSelector from "./DateTimeSelector";

const AccountSelector = ({
  value,
  onChange,
  accounts,
  size = "sm",
  color = "indigo",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAccount = accounts.find((a) => a.id === value) || accounts[0];
  const Icon =
    selectedAccount?.id === "cash"
      ? Banknote
      : selectedAccount?.id?.includes("bank")
        ? Wallet
        : CreditCard;

    const containerRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const [dropUp, setDropUp] = useState(false);

    useEffect(() => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 300; 
        
        setDropUp(spaceBelow < dropdownHeight);
        setCoords({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    }, [isOpen]);

    const { showToast } = useToast();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-800"
            : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
        } ${size === "xs" ? "h-7 px-2" : ""}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Icon
            size={size === "xs" ? 12 : 14}
            className={
              selectedAccount?.id === "cash"
                ? "text-emerald-500"
                : "text-indigo-500"
            }
          />
          <span
            className={`${size === "xs" ? "text-[8px]" : "text-[10px]"} font-black uppercase tracking-tight truncate max-w-[80px]`}
          >
            {selectedAccount?.name}
          </span>
        </div>
        <ChevronIcon
          size={size === "xs" ? 10 : 12}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} text-slate-400`}
        />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="fixed inset-0 bg-transparent pointer-events-auto"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          ></div>
          <div 
            className={`fixed p-2 space-y-1 bg-white dark:bg-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-700/50 overflow-hidden pointer-events-auto`}
            style={{
              width: '240px', 
              left: coords.left,
              ...(dropUp 
                ? { bottom: window.innerHeight - coords.top + 8 } 
                : { top: coords.bottom + 8 }
              )
            }}
          >
            {accounts
              .filter((acc) => !acc.hidden || acc.id === value)
              .map((acc) => {
                const AccIcon =
                  acc.id === "cash"
                    ? Banknote
                    : acc.id?.includes("bank")
                      ? Wallet
                      : CreditCard;
                const isSelected = acc.id === value;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(acc.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : `hover:bg-slate-50 dark:hover:bg-slate-700 ${acc.hidden ? 'text-slate-400 opacity-60' : 'text-slate-600 dark:text-slate-300'}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AccIcon
                        size={16}
                        className={
                          isSelected
                            ? "text-white"
                            : acc.id === "cash"
                              ? "text-emerald-500"
                              : "text-indigo-500"
                        }
                      />
                      <span className="text-xs font-black uppercase tracking-tight text-left">
                        {acc.name}
                        {acc.hidden && <span className="ml-2 text-[9px] opacity-50">(Oculta)</span>}
                      </span>
                    </div>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MonthlyView = ({ year, monthRelIndex, userName }) => {
  const {
    monthsData,
    updateFixedPayment,
    updateFixedExpenseAmount,
    addFixedExpense,
    removeFixedExpense,
    updateSavingsAmount,
    updateSavingsPayment,
    addAdditionalIncome,
    removeAdditionalIncome,
    updateAdditionalIncome,
    updatePartnerName,
    toggleIncomeStatus,
    toggleAdditionalIncomeStatus,
    updateBaseIncome,
    updateBonusIncome,
    updateSavingsGoal,
    updateVariableBudget,
    addInstallmentExpense,
    getExpenseDistribution,
    addVariableExpense,
    removeVariableExpense,
    updateVariableExpense,
    calculateMonthStats,
    restoreFixedExpense,
    moveFixedExpense,
    updateFixedExpenseMetadata,
    accounts,
    loading,
    error,
  } = useFinance();
  const { showToast } = useToast();
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Comida":
        return <Utensils size={18} />;
      case "Transporte":
        return <Car size={18} />;
      case "Hogar":
        return <Home size={18} />;
      case "Ocio":
        return <Gamepad2 size={18} />;
      case "Salud":
        return <Stethoscope size={18} />;
      case "Suscripciones":
        return <Tv size={18} />;
      case "Regalos":
        return <PartyPopper size={18} />;
      case "Ropa":
        return <Shirt size={18} />;
      default:
        return <Package size={18} />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-[#0f172a] p-10">
        <div className="app-card p-8 border-rose-500/50 text-center">
          <div className="text-rose-500 mb-4 font-black">
            ❌ ERROR AL CARGAR EL MES
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading || !monthsData || monthsData.length === 0 || !accounts) {
    return (
      <div className="p-20 text-center text-slate-400 font-bold">
        Cargando detalles del mes...
      </div>
    );
  }

  // Find the valid global index for this specific year/month combo
  const currentMonthIndex = monthsData.findIndex(
    (m) => m.year === year && m.monthIndex === monthRelIndex,
  );

  if (currentMonthIndex === -1)
    return (
      <div className="p-10 text-center text-slate-400">Mes no disponible</div>
    );

  const monthData = monthsData[currentMonthIndex];
  const stats = calculateMonthStats(currentMonthIndex);

  // Values are now calculated centrally in useFinance.js/calculateMonthStats
  const variableBudget = stats.variableBudget;
  const dynamicStats = stats;

  const [captureValue, setCaptureValue] = useState(null);
  const [newFixedExpense, setNewFixedExpense] = useState({
    name: "",
    amount: "",
    accountId: "bank",
  });
  const [isLimited, setIsLimited] = useState(false);
  const [untilMonth, setUntilMonth] = useState(currentMonthIndex);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [unlockedExpenses, setUnlockedExpenses] = useState({}); // Tracking which rows are unlocked

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    accountId: accounts[0]?.id || "cash",
    isInstallment: false,
    installments: 12,
    customDate: "",
  });

  // Dynamic sorting of categories based on usage frequency (count of records)
  const sortedCategories = React.useMemo(() => {
    const counts = {};
    monthsData.forEach((month) => {
      month.variableExpenses?.forEach((exp) => {
        counts[exp.category] = (counts[exp.category] || 0) + 1;
      });
    });
    return [...EXPENSE_CATEGORIES].sort(
      (a, b) => (counts[b] || 0) - (counts[a] || 0),
    );
  }, [monthsData]);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    type: "danger",
  });

  const closeConfirm = () =>
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    if (newExpense.isInstallment) {
      addInstallmentExpense(
        currentMonthIndex,
        {
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          date: newExpense.customDate
            ? new Date(newExpense.customDate).toISOString()
            : new Date().toISOString(),
        },
        newExpense.installments,
      );
      showToast(`Cuotas agregadas: ${newExpense.description}`, "success");
    } else {
      addVariableExpense(currentMonthIndex, {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: newExpense.customDate
          ? new Date(newExpense.customDate).toISOString()
          : new Date().toISOString(),
      });
      showToast(`Gasto agregado: ${newExpense.description}`, "success");
    }
    setNewExpense((prev) => ({
      ...prev,
      description: "",
      amount: "",
      isInstallment: false,
      installments: 12,
      customDate: "",
    }));
  };

  // Income Editing State
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editIncomeValues, setEditIncomeValues] = useState({
    description: "",
    amount: "",
  });

  // Partner Name Editing State
  const [editingPartnerName, setEditingPartnerName] = useState(false);
  const [tempPartnerName, setTempPartnerName] = useState("");

  // Savings Update Confirmation State
  const [pendingUpdate, setPendingUpdate] = useState(null); // { type, isPartner, amount }
  const [uiVersion, setUiVersion] = useState(0);

  const forceInputReset = () => setUiVersion((v) => v + 1);

  const [newIncome, setNewIncome] = useState({
    description: "",
    amount: "",
    accountId: "bank",
  });

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newIncome.description || !newIncome.amount) return;
    addAdditionalIncome(currentMonthIndex, {
      description: newIncome.description,
      amount: parseFloat(newIncome.amount),
      accountId: newIncome.accountId || "bank",
    });
    showToast(`Ingreso agregado: ${newIncome.description}`, "success");
    setNewIncome({ description: "", amount: "", accountId: "bank" });
  };

  const handleAddFixedExpense = (e) => {
    e.preventDefault();
    if (!newFixedExpense.name || !newFixedExpense.amount) return;
    addFixedExpense(
      currentMonthIndex,
      {
        name: newFixedExpense.name,
        amount: parseFloat(newFixedExpense.amount),
      },
      isLimited ? parseInt(untilMonth) : null,
    );
    showToast(`Pago fijo añadido: ${newFixedExpense.name}`, "success");
    setNewFixedExpense({ name: "", amount: "" });
    setIsLimited(false);
  };

  // Determine Alert Color & Styles for Light Theme
  let statusColor = "text-emerald-600";
  let statusBg = "bg-gradient-to-br from-emerald-100 to-teal-100";
  let statusBorder = "border-emerald-200";
  let statusIconColor = "text-emerald-500";

  if (stats.availableReal < 20) {
    statusColor = "text-rose-600";
    statusBg =
      "bg-gradient-to-br from-rose-100 to-orange-100 animate-pulse-slow";
    statusBorder = "border-rose-200";
    statusIconColor = "text-rose-500";
  } else if (stats.availableReal < 100) {
    statusColor = "text-amber-600";
    statusBg = "bg-gradient-to-br from-amber-100 to-yellow-100";
    statusBorder = "border-amber-200";
    statusIconColor = "text-amber-500";
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Mobile Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Wallet Card */}
        <div
          className={`app-card p-6 border-l-8 ${stats.availableReal < 20 ? "border-l-rose-500" : "border-l-emerald-500"} relative`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Disponible Total
              </h3>
              <div
                className={`text-5xl font-black tracking-tight ${stats.availableReal < 20 ? "text-rose-600" : "text-slate-800 dark:text-white"}`}
              >
                {formatCompactCurrency(stats.availableReal)}
              </div>

              <div className="flex items-center mt-3 space-x-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Mes Actual
                  </span>
                  <span
                    className={`text-xs font-bold ${stats.monthlyNet >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {stats.monthlyNet >= 0 ? "+" : ""}
                    {formatCompactCurrency(stats.monthlyNet)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Acarreo Meses Prev.
                  </span>
                  <span
                    className={`text-xs font-bold ${stats.carryOver >= 0 ? "text-brand-primary" : "text-rose-500"}`}
                  >
                    {stats.carryOver >= 0 ? "+" : ""}
                    {formatCompactCurrency(stats.carryOver)}
                  </span>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-400 mt-4 flex items-center">
                <Wallet size={16} className="mr-2" /> Saldo acumulado para
                gastar
              </p>
            </div>
            {stats.availableReal < 100 && (
              <div className="bg-rose-100 text-rose-600 p-2 rounded-full animate-bounce">
                <AlertTriangle size={24} />
              </div>
            )}
          </div>
        </div>

        {/* Daily Budget Card */}
        <div className="app-card p-6 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calculator size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase">
              Presupuesto Diario
            </h3>
          </div>
          <div className="text-4xl font-black text-slate-800">
            {formatCurrency(dynamicStats.dailyBudget)}
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Límite seguro por día
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Inflow & Obligations */}
        <div className="space-y-8">
          {/* 1. Income Section */}
          <section>
            <div className="flex items-center mb-4 space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shadow-sm">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                  Ingresos
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Lo que entra este mes
                </p>
              </div>
            </div>

            <div className="app-card p-6 space-y-4">
              {/* Sueldo Base */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      toggleIncomeStatus(currentMonthIndex, "base");
                      showToast(
                        monthData.incomeStatus?.base
                          ? "Sueldo desmarcado"
                          : "¡Sueldo cobrado!",
                        "success",
                      );
                    }}
                    className={`p-1 rounded-full border-2 transition-all ${monthData.incomeStatus?.base ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-emerald-400"}`}
                  >
                    <CheckCircle
                      size={18}
                      className={
                        monthData.incomeStatus?.base
                          ? "opacity-100"
                          : "opacity-0"
                      }
                    />
                  </button>
                  <span
                    className={`font-semibold ${monthData.incomeStatus?.base ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    Sueldo Base
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-slate-400 mr-1">S/</span>
                  <input
                    type="number"
                    value={monthData.income.base}
                    onChange={(e) =>
                      updateBaseIncome(currentMonthIndex, e.target.value)
                    }
                    onBlur={() =>
                      showToast(
                        "Sueldo actualizado (propagado a meses futuros)",
                        "info",
                      )
                    }
                    className={`w-20 text-right bg-transparent font-black tracking-tight focus:outline-none ${monthData.incomeStatus?.base ? "text-emerald-600" : "text-slate-800 dark:text-slate-200"}`}
                  />
                </div>
              </div>

              {/* Gratificación / Bono */}
              {(monthData.income.bonus > 0 ||
                monthRelIndex === 6 ||
                monthRelIndex === 11) && (
                <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        toggleIncomeStatus(currentMonthIndex, "bonus");
                        showToast(
                          monthData.incomeStatus?.bonus
                            ? "Gratificación desmarcada"
                            : "¡Gratificación cobrada!",
                          "success",
                        );
                      }}
                      className={`p-1 rounded-full border-2 transition-all ${monthData.incomeStatus?.bonus ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-emerald-400"}`}
                    >
                      <CheckCircle
                        size={18}
                        className={
                          monthData.incomeStatus?.bonus
                            ? "opacity-100"
                            : "opacity-0"
                        }
                      />
                    </button>
                    <span
                      className={`font-semibold ${monthData.incomeStatus?.bonus ? "text-slate-400 dark:text-slate-500" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      Gratificación
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-emerald-400 mr-1">S/</span>
                    <input
                      type="number"
                      value={monthData.income.bonus}
                      onChange={(e) =>
                        updateBonusIncome(currentMonthIndex, e.target.value)
                      }
                      onBlur={() =>
                        showToast(
                          "Gratificación actualizada (propagado)",
                          "info",
                        )
                      }
                      className={`w-20 text-right bg-transparent font-black tracking-tight focus:outline-none ${monthData.incomeStatus?.bonus ? "text-emerald-600" : "text-emerald-600 dark:text-emerald-400"}`}
                    />
                  </div>
                </div>
              )}

              {/* Additional Incomes List */}
              {monthData.additionalIncomes &&
                monthData.additionalIncomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800 last:border-0 group"
                  >
                    {editingIncomeId === inc.id ? (
                      /* EDIT MODE - Mobile Optimized */
                      <div className="flex items-center w-full gap-2 animate-fade-in">
                        <input
                          type="text"
                          value={editIncomeValues.description}
                          onChange={(e) =>
                            setEditIncomeValues({
                              ...editIncomeValues,
                              description: e.target.value,
                            })
                          }
                          className="flex-1 bg-white dark:bg-slate-800 border-b border-brand-primary px-1 py-1 text-xs outline-none dark:text-slate-200 min-w-0"
                          autoFocus
                          placeholder="Descripción"
                        />
                        <input
                          type="number"
                          value={editIncomeValues.amount}
                          onChange={(e) =>
                            setEditIncomeValues({
                              ...editIncomeValues,
                              amount: e.target.value,
                            })
                          }
                          className="w-16 bg-white dark:bg-slate-800 border-b border-brand-primary px-1 py-1 text-xs text-right outline-none dark:text-slate-200 flex-shrink-0"
                          placeholder="0.00"
                        />
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              if (
                                editIncomeValues.description &&
                                editIncomeValues.amount
                              ) {
                                updateAdditionalIncome(currentMonthIndex, inc.id, {
                                  description: editIncomeValues.description,
                                  amount: parseFloat(editIncomeValues.amount),
                                });
                                setEditingIncomeId(null);
                                showToast("Ingreso actualizado", "success");
                              }
                            }}
                            className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingIncomeId(null)}
                            className="p-1.5 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* VIEW MODE */
                      <>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              toggleAdditionalIncomeStatus(currentMonthIndex, inc.id);
                              showToast(
                                inc.received
                                  ? "Extra desmarcado"
                                  : "¡Extra cobrado!",
                                "success",
                              );
                            }}
                            className={`p-1 rounded-full border-2 transition-all ${inc.received ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-emerald-400"}`}
                          >
                            <CheckCircle
                              size={14}
                              className={
                                inc.received ? "opacity-100" : "opacity-0"
                              }
                            />
                          </button>
                          <div className="flex flex-col">
                            <span
                              className={`font-medium text-sm group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors ${inc.received ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-600 dark:text-slate-300"}`}
                            >
                              {inc.description}
                            </span>
                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">
                              {
                                accounts.find(
                                  (a) => a.id === (inc.accountId || "bank"),
                                )?.name
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`font-bold text-sm ${inc.received ? "text-emerald-600" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {formatCurrency(
                              inc.amount,
                              accounts.find(
                                (a) => a.id === (inc.accountId || "bank"),
                              )?.currency || "PEN",
                            )}
                          </span>

                          <div className="flex items-center">
                            <button
                              onClick={() => {
                                setEditingIncomeId(inc.id);
                                setEditIncomeValues({
                                  description: inc.description,
                                  amount: inc.amount,
                                });
                              }}
                              className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors mr-1"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: "Eliminar Ingreso",
                                  message: `¿Estás seguro de eliminar "${inc.description}"?`,
                                  confirmText: "Sí, eliminar",
                                  type: "danger",
                                  onConfirm: () => {
                                    removeAdditionalIncome(currentMonthIndex, inc.id);
                                    showToast(
                                      "Ingreso extra eliminado",
                                      "info",
                                    );
                                  },
                                });
                              }}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

              {/* Add New Income Form */}
              <form
                onSubmit={handleAddIncome}
                className="pt-2 flex flex-col space-y-2"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Extra..."
                    value={newIncome.description}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        description: e.target.value,
                      })
                    }
                    className="flex-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-emerald-500 outline-none dark:text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newIncome.amount}
                    onChange={(e) =>
                      setNewIncome({ ...newIncome, amount: e.target.value })
                    }
                    className="w-20 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-emerald-500 outline-none text-right dark:text-slate-200"
                  />
                </div>
                <div className="flex space-x-2">
                  <AccountSelector 
                    value={newIncome.accountId}
                    onChange={val => setNewIncome({...newIncome, accountId: val})}
                    accounts={accounts}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* 2. Plan de Ahorro Section */}
          <section>
            <div className="flex items-center mb-4 space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-sm">
                <PiggyBank size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                  Plan de Ahorro
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Prioridad antes de gastar
                </p>
              </div>
            </div>

            <div className="app-card p-6 space-y-6">
              {["depa", "boda"].map((type) => {
                const userGoal = Number(monthData.savings?.[type] || 0);
                // Partner goal defaults to user goal (legacy compatibility)
                const partnerGoal =
                  monthData.savings?.[type + "_partner"] !== undefined
                    ? Number(monthData.savings[type + "_partner"])
                    : userGoal;

                const totalGoal = userGoal + partnerGoal;

                const payments = monthData.savingsPayments?.[type] || {
                  userPaid: 0,
                  partnerPaid: 0,
                  completed: false,
                };
                const isCompleted = payments.completed;

                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              const newUserAmount = isCompleted ? 0 : userGoal;
                              const newPartnerAmount = isCompleted
                                ? 0
                                : partnerGoal;
                              updateSavingsPayment(
                                currentMonthIndex,
                                type,
                                "userPaid",
                                newUserAmount,
                              );
                              updateSavingsPayment(
                                currentMonthIndex,
                                type,
                                "partnerPaid",
                                newPartnerAmount,
                              );
                              showToast(
                                isCompleted
                                  ? "Ahorro reiniciado"
                                  : "Ahorro completado (ambos)",
                                "info",
                              );
                            }}
                            className={`p-1 rounded-full border-2 transition-all ${isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}
                          >
                            <CheckCircle
                              size={16}
                              className={
                                isCompleted ? "opacity-100" : "opacity-0"
                              }
                            />
                          </button>
                          {(payments.userPaid > 0 || payments.partnerPaid > 0) && (
                            <div className="mt-1">
                              <DateTimeSelector 
                                value={payments.date}
                                onChange={(newDate) => updateSavingsPayment(currentMonthIndex, type, "userPaid", payments.userPaid, newDate)}
                                size="xs"
                                color="emerald"
                                showLabel={false}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm leading-none ${isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {type === "depa" ? "Departamento" : "Boda"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                            Meta Juntos: {formatCurrency(totalGoal)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-xs font-black px-3 py-1 rounded-lg ${isCompleted ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}
                      >
                        {isCompleted ? "META LOGRADA" : "EN PROGRESO"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase">
                            Yo (Descontar)
                          </span>
                          <div className="flex items-center group/edit">
                            <input
                              key={`user-${type}-${userGoal}-${uiVersion}`}
                              type="number"
                              defaultValue={userGoal}
                              onBlur={(e) => {
                                const newVal = parseFloat(e.target.value) || 0;
                                if (newVal !== userGoal) {
                                  setPendingUpdate({
                                    type,
                                    isPartner: false,
                                    amount: newVal,
                                  });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.target.blur();
                                }
                              }}
                              className="w-12 text-[9px] font-bold text-indigo-500 bg-transparent text-right outline-none focus:border-b focus:border-indigo-500"
                            />
                            <Pencil
                              size={8}
                              className="text-slate-300 ml-1 opacity-0 group-hover/edit:opacity-100 transition-opacity cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-slate-400 mr-1">
                            S/
                          </span>
                          <input
                            type="number"
                            value={payments.userPaid || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateSavingsPayment(
                                currentMonthIndex,
                                type,
                                "userPaid",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${payments.userPaid >= userGoal ? "text-emerald-600" : "text-slate-600"}`}
                          />
                        </div>
                      </div>

                      <div className="bg-rose-50/30 dark:bg-rose-900/10 p-3 rounded-2xl border border-dashed border-rose-100 dark:border-rose-900/30">
                        <div className="flex justify-between items-center mb-1 group/partner">
                          {editingPartnerName ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="text"
                                value={tempPartnerName}
                                onChange={(e) =>
                                  setTempPartnerName(e.target.value)
                                }
                                className="w-16 text-[9px] font-black text-rose-500 bg-white dark:bg-slate-800 border-b border-rose-300 outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (tempPartnerName) {
                                    updatePartnerName(tempPartnerName);
                                    setEditingPartnerName(false);
                                  }
                                }}
                              >
                                <Check size={10} className="text-emerald-500" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => {
                                setTempPartnerName(
                                  monthData.partnerName || "Pareja",
                                );
                                setEditingPartnerName(true);
                              }}
                            >
                              <span className="text-[9px] font-black text-rose-300 dark:text-rose-700 uppercase whitespace-nowrap">
                                {monthData.partnerName || "Pareja"} (Suma)
                              </span>
                              <Pencil
                                size={8}
                                className="text-rose-300 ml-1 opacity-0 group-hover/partner:opacity-100 transition-opacity"
                              />
                            </div>
                          )}

                          <div className="flex items-center group/edit">
                            <input
                              key={`partner-${type}-${partnerGoal}-${uiVersion}`}
                              type="number"
                              defaultValue={partnerGoal}
                              onBlur={(e) => {
                                const newVal = parseFloat(e.target.value) || 0;
                                if (newVal !== partnerGoal) {
                                  setPendingUpdate({
                                    type,
                                    isPartner: true,
                                    amount: newVal,
                                  });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.target.blur();
                                }
                              }}
                              className="w-12 text-[9px] font-bold text-rose-400 bg-transparent text-right outline-none focus:border-b focus:border-rose-400"
                            />
                            <Pencil
                              size={8}
                              className="text-rose-300 ml-1 opacity-0 group-hover/edit:opacity-100 transition-opacity cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-slate-400 mr-1">
                            S/
                          </span>
                          <input
                            type="number"
                            value={payments.partnerPaid || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateSavingsPayment(
                                currentMonthIndex,
                                type,
                                "partnerPaid",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${payments.partnerPaid >= partnerGoal ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Fixed Expenses Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold shadow-sm">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                    Pagos Fijos
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Compromisos mensuales
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                  Total
                </span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                  {formatCurrency(stats.totalFixed)}
                </span>
              </div>
            </div>

            <div className="app-card divide-y divide-slate-50 dark:divide-slate-800 shadow-sm">
              {[...monthData.fixedExpenses]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((expense, idx, arr) => {
                  const payment = monthData.payments[expense.id];
                  const isPaid = payment?.completed;

                  return (
                    <div
                      key={expense.id}
                      className={`relative flex items-center justify-between p-4 transition-all z-1 focus-within:z-[100] ${isPaid ? "bg-emerald-50/20 dark:bg-emerald-900/10" : ""}`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Order Controls */}
                        <div className="flex flex-col -space-y-1">
                          <button
                            onClick={() => moveFixedExpense(expense.id, "up")}
                            disabled={idx === 0}
                            className={`p-0.5 rounded transition-colors ${idx === 0 ? "text-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-indigo-500"}`}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => moveFixedExpense(expense.id, "down")}
                            disabled={idx === arr.length - 1}
                            className={`p-0.5 rounded transition-colors ${idx === arr.length - 1 ? "text-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-indigo-500"}`}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              updateFixedPayment(
                                currentMonthIndex,
                                expense.id,
                                isPaid ? 0 : expense.amount,
                              );
                              showToast(
                                isPaid ? "Pago desmarcado" : "Pago registrado",
                                "info",
                              );
                            }}
                            className={`p-1 rounded-full border-2 transition-all ${isPaid ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}
                          >
                            <CheckCircle
                              size={20}
                              className={isPaid ? "opacity-100" : "opacity-0"}
                            />
                          </button>
                          {isPaid && (
                            <div className="mt-1">
                              <DateTimeSelector 
                                value={payment?.date}
                                onChange={(newDate) => updateFixedPayment(currentMonthIndex, expense.id, payment?.amountPaid, newDate)}
                                size="xs"
                                color="emerald"
                                showLabel={false}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm ${isPaid ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-700 dark:text-slate-200"}`}
                          >
                            {expense.name}
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <span className="mr-1">S/</span>
                            <input
                              type="number"
                              value={expense.amount}
                              onFocus={(e) =>
                                setCaptureValue(parseFloat(e.target.value) || 0)
                              }
                              onChange={(e) =>
                                updateFixedExpenseAmount(
                                  currentMonthIndex,
                                  expense.id,
                                  parseFloat(e.target.value) || 0,
                                  false,
                                )
                              }
                              onBlur={(e) => {
                                const newValue =
                                  parseFloat(e.target.value) || 0;
                                if (
                                  captureValue !== null &&
                                  newValue !== captureValue
                                ) {
                                  updateFixedExpenseAmount(
                                    currentMonthIndex,
                                    expense.id,
                                    newValue,
                                    true,
                                  );
                                  showToast(
                                    "Monto actualizado en meses futuros",
                                    "success",
                                    {
                                      label: "SOLO ESTE MES",
                                      onClick: () => {
                                        updateFixedExpenseAmount(
                                          currentMonthIndex,
                                          expense.id,
                                          captureValue,
                                          true,
                                        );
                                        updateFixedExpenseAmount(
                                          currentMonthIndex,
                                          expense.id,
                                          newValue,
                                          false,
                                        );
                                        showToast(
                                          "Cambio aplicado solo a este mes",
                                          "info",
                                        );
                                      },
                                    },
                                  );
                                }
                                setCaptureValue(newValue);
                              }}
                              className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-primary focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 px-1">
                          <AccountSelector
                            value={expense.accountId || "bank"}
                            onChange={(val) => {
                              updateFixedExpenseMetadata(
                                currentMonthIndex,
                                expense.id,
                                { accountId: val },
                                true,
                              );
                              showToast(
                                `Pasado a: ${accounts.find((a) => a.id === val)?.name}`,
                                "info",
                              );
                            }}
                            accounts={accounts}
                            size="xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          value={
                            payment.amountPaid > 0 ? payment.amountPaid : ""
                          }
                          placeholder={payment.amountPaid}
                          onChange={(e) => {
                            updateFixedPayment(
                              currentMonthIndex,
                              expense.id,
                              parseFloat(e.target.value) || 0,
                            );
                          }}
                          onBlur={() => showToast("Monto actualizado", "info")}
                          className={`w-20 text-right bg-transparent font-mono font-bold text-sm focus:outline-none focus:border-b-2 focus:border-indigo-500 ${isPaid ? "text-emerald-600" : "text-slate-300"}`}
                        />
                        <button
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: "Eliminar Pago",
                              message: `¿Estás seguro de que deseas eliminar "${expense.name}" de este mes?`,
                              confirmText: "Sí, eliminar",
                              type: "warning",
                              onConfirm: () => {
                                removeFixedExpense(
                                  currentMonthIndex,
                                  expense.id,
                                  false,
                                );
                                showToast(
                                  "Pago fijo eliminado de este mes",
                                  "info",
                                  {
                                    label: "ELIMINAR SIEMPRE",
                                    onClick: () => {
                                      setConfirmConfig({
                                        isOpen: true,
                                        title: "¡Aviso Importante!",
                                        message: `¿BORRAR PERMANENTEMENTE?\nEsto eliminará "${expense.name}" de todos los meses futuros. Esta acción no se puede deshacer.`,
                                        confirmText: "Borrar Siempre",
                                        type: "danger",
                                        onConfirm: () => {
                                          removeFixedExpense(
                                            currentMonthIndex,
                                            expense.id,
                                            true,
                                          );
                                          showToast(
                                            "Pago fijo eliminado permanentemente",
                                            "error",
                                          );
                                        },
                                      });
                                    },
                                  },
                                );
                              },
                            });
                          }}
                          className="text-slate-300 hover:text-rose-500 transition-colors ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {/* Add New Fixed Expense Form */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4">
                <form
                  onSubmit={handleAddFixedExpense}
                  className="flex space-x-2 mb-3"
                >
                  <input
                    type="text"
                    placeholder="Nuevo pago fijo..."
                    value={newFixedExpense.name}
                    onChange={(e) =>
                      setNewFixedExpense({
                        ...newFixedExpense,
                        name: e.target.value,
                      })
                    }
                    className="flex-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-100 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none dark:text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="S/ 0"
                    value={newFixedExpense.amount}
                    onChange={(e) =>
                      setNewFixedExpense({
                        ...newFixedExpense,
                        amount: e.target.value,
                      })
                    }
                    className="w-20 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-100 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none text-right dark:text-slate-200 font-bold"
                  />
                  <AccountSelector 
                    value={newFixedExpense.accountId}
                    onChange={val => setNewFixedExpense({...newFixedExpense, accountId: val})}
                    accounts={accounts}
                  />
                  <button
                    type="submit"
                    className="px-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-500/20"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                <div className="flex items-center space-x-4 px-1">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isLimited}
                        onChange={(e) => setIsLimited(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-8 h-4 rounded-full transition-colors ${isLimited ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isLimited ? "translate-x-4" : "translate-x-0"}`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">
                      ¿Tiempo limitado?
                    </span>
                  </label>

                  {isLimited && (
                    <div className="flex items-center space-x-2 animate-fade-in-right">
                      <span className="text-[10px] font-black text-slate-300 uppercase">
                        Hasta
                      </span>
                      <select
                        value={untilMonth}
                        onChange={(e) => setUntilMonth(e.target.value)}
                        className="bg-white dark:bg-slate-800 text-[10px] font-bold border-none rounded-lg px-2 py-1 outline-none text-slate-600 dark:text-slate-300 shadow-sm"
                      >
                        {monthsData.map((m, idx) => {
                          if (idx < currentMonthIndex) return null;
                          return (
                            <option key={idx} value={idx}>
                              {m.name} {m.year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Restoration of missing fixed expenses */}
              {currentMonthIndex > 0 &&
                monthsData[currentMonthIndex - 1] &&
                (() => {
                  const prevMonthFixed =
                    monthsData[currentMonthIndex - 1].fixedExpenses || [];
                  const restorable = prevMonthFixed.filter(
                    (prevExp) =>
                      !monthData.fixedExpenses.find(
                        (currExp) => currExp.id === prevExp.id,
                      ),
                  );

                  if (restorable.length > 0) {
                    return (
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 border-t border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertTriangle size={14} className="text-amber-500" />
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                            Pagos faltantes del mes pasado
                          </span>
                        </div>
                        <div className="space-y-2">
                          {restorable.map((exp) => (
                            <div
                              key={exp.id}
                              className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-xl border border-amber-100 dark:border-amber-900/20 shadow-sm"
                            >
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {exp.name}
                              </span>
                              <button
                                onClick={() => {
                                  restoreFixedExpense(currentMonthIndex, exp);
                                  showToast(
                                    `Restaurado: ${exp.name}`,
                                    "success",
                                  );
                                }}
                                className="text-[10px] px-3 py-1 bg-amber-500 text-white rounded-lg font-black uppercase hover:bg-amber-600 transition-colors"
                              >
                                Restaurar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Spending and Analysis */}
        <div className="space-y-8">
          {/* 4. Variable Expenses Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                    Gastos Variables
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Día a día
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Presupuesto (Dinámico)
                  </span>
                  <div className="bg-indigo-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-indigo-100 dark:border-slate-700">
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(variableBudget)}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 text-right max-w-[150px] leading-tight">
                  (Acarreo + Ingresos Cobrados - Fijos - Ahorro)
                </div>
              </div>
            </div>

            {/* Variable Budget Progress Bar */}
            <div className="app-card p-4 mb-4 border-2 border-slate-50 dark:border-slate-800">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Usado hasta ahora
                  </p>
                  <p
                    className={`text-xl font-black ${stats.totalVariable > stats.variableBudget ? "text-rose-600" : "text-slate-800 dark:text-slate-100"}`}
                  >
                    {formatCompactCurrency(stats.totalVariable, 10000)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Restante
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                    Restante
                  </p>
                  <p
                    className={`text-sm font-bold ${variableBudget - stats.totalVariable < 0 ? "text-rose-500" : "text-emerald-500"}`}
                  >
                    {formatCompactCurrency(
                      Math.max(0, variableBudget - stats.totalVariable),
                      10000,
                    )}
                  </p>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${stats.totalVariable > variableBudget ? "bg-rose-500" : "bg-indigo-500"}`}
                  style={{
                    width: `${Math.min(100, (variableBudget > 0 ? stats.totalVariable / variableBudget : stats.totalVariable > 0 ? 100 : 0) * 100)}%`,
                  }}
                ></div>
              </div>
              {stats.totalVariable > variableBudget && (
                <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center">
                  <AlertTriangle size={12} className="mr-1" /> Has superado el
                  presupuesto para este mes
                </p>
              )}
            </div>

            <form
              onSubmit={handleAddExpense}
              className="app-card p-4 mb-4 space-y-4 shadow-md bg-indigo-50/20"
            >
              <input
                type="text"
                placeholder="&iquest;Qué compraste?"
                className="glass-input w-full"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
              />
              <div className="flex flex-col space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-input flex items-center px-4 h-16 w-full group focus-within:ring-2 ring-indigo-500/50 transition-all">
                    <span className="text-slate-400 font-black text-xl mr-2 select-none">
                      {accounts.find((a) => a.id === newExpense.accountId)
                        ?.currency === "USD"
                        ? "$"
                        : "S/"}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="bg-transparent border-none p-0 !text-xl w-full font-black focus:ring-0 dark:text-white"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      ¿Cuándo fue?
                    </label>
                    <DateTimeSelector
                      value={newExpense.customDate}
                      onChange={(date) =>
                        setNewExpense({ ...newExpense, customDate: date })
                      }
                      color="indigo"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 flex flex-wrap gap-2">
                    {accounts.map((acc) => {
                      const isSelected = newExpense.accountId === acc.id;
                      const Icon =
                        acc.id === "cash"
                          ? Banknote
                          : acc.id === "bank"
                            ? Wallet
                            : CreditCard;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() =>
                            setNewExpense({ ...newExpense, accountId: acc.id })
                          }
                          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                              : "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Icon
                            size={14}
                            className={
                              isSelected ? "text-indigo-500" : "text-slate-400"
                            }
                          />
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {acc.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="submit"
                    className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform flex-shrink-0"
                  >
                    <Plus size={32} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {sortedCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setNewExpense({ ...newExpense, category: c })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 flex-shrink-0 ${newExpense.category === c ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
                  >
                    <span className="opacity-70">{getCategoryIcon(c)}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div
                    onClick={() =>
                      setNewExpense({
                        ...newExpense,
                        isInstallment: !newExpense.isInstallment,
                      })
                    }
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${newExpense.isInstallment ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${newExpense.isInstallment ? "translate-x-4" : ""}`}
                    ></div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                      ¿Dividir en cuotas?
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Se repetirá en meses futuros
                    </span>
                  </div>
                </label>

                {newExpense.isInstallment && (
                  <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-fade-in">
                    <span className="text-[10px] font-black text-indigo-400 uppercase">
                      Meses:
                    </span>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={newExpense.installments}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          installments: parseInt(e.target.value) || 2,
                        })
                      }
                      className="bg-transparent w-8 text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </form>

            {/* Monthly Distribution Chart */}
            <ExpenseCharts
              distribution={getExpenseDistribution(currentMonthIndex)}
              totalSpent={stats.totalVariable}
              title="Distribución Mensual"
              subLabel="A dónde se fue tu dinero este mes"
              showTrend={false}
            />

            <div className="app-card max-h-[400px] overflow-y-auto no-scrollbar shadow-sm">
              {monthData.variableExpenses.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm">
                    Sin gastos extra. &iexcl;Bien hecho!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {monthData.variableExpenses
                    .slice()
                    .reverse()
                    .map((expense) => {
                      const isUnlocked = unlockedExpenses[expense.id];

                      return (
                        <div
                          key={expense.id}
                          className={`p-4 flex justify-between items-center group transition-all ${isUnlocked ? "bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-inset ring-indigo-100 dark:ring-indigo-900/30" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"}`}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div
                              onClick={() =>
                                setUnlockedExpenses((prev) => ({
                                  ...prev,
                                  [expense.id]: !isUnlocked,
                                }))
                              }
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${isUnlocked ? "bg-indigo-600 text-white shadow-lg scale-110" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400"}`}
                            >
                              {isUnlocked ? (
                                <Unlock size={18} />
                              ) : (
                                getCategoryIcon(expense.category)
                              )}
                            </div>
                            <div className="flex-1">
                              {isUnlocked ? (
                                <div className="flex flex-col space-y-2">
                                  <input
                                    type="text"
                                    value={expense.description}
                                    onChange={(e) =>
                                      updateVariableExpense(
                                        currentMonthIndex,
                                        expense.id,
                                        { description: e.target.value },
                                      )
                                    }
                                    className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none dark:text-white"
                                    autoFocus
                                  />
                                  <div className="flex flex-nowrap gap-1 overflow-x-auto pb-1 mask-linear-right custom-scrollbar">
                                    {sortedCategories.map((cat) => (
                                      <button
                                        key={cat}
                                        onClick={() =>
                                          updateVariableExpense(
                                            currentMonthIndex,
                                            expense.id,
                                            { category: cat },
                                          )
                                        }
                                        className={`p-1.5 rounded-lg border transition-all flex-shrink-0 ${expense.category === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"}`}
                                        title={cat}
                                      >
                                        {React.cloneElement(
                                          getCategoryIcon(cat),
                                          { size: 12 },
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                  <AccountSelector 
                                    value={expense.accountId || "cash"}
                                    onChange={(val) =>
                                      updateVariableExpense(
                                        currentMonthIndex,
                                        expense.id,
                                        { accountId: val },
                                      )
                                    }
                                    accounts={accounts}
                                    size="xs"
                                  />
                                </div>
                              ) : (
                                <p className="font-bold text-slate-700 dark:text-slate-200">
                                  {expense.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-0.5">
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  {new Date(expense.date).toLocaleDateString()}
                                </p>
                                <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                                  {accounts.find(
                                    (a) =>
                                      a.id === (expense.accountId || "cash"),
                                  )?.name || "Otro"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <div className="flex items-center">
                              <span className="text-xs text-slate-400 mr-1">
                                {accounts.find(
                                  (a) => a.id === (expense.accountId || "cash"),
                                )?.currency === "USD"
                                  ? "$"
                                  : "S/"}
                              </span>
                              {isUnlocked ? (
                                <input
                                  type="number"
                                  value={expense.amount}
                                  onChange={(e) =>
                                    updateVariableExpense(
                                      currentMonthIndex,
                                      expense.id,
                                      {
                                        amount: parseFloat(e.target.value) || 0,
                                      },
                                    )
                                  }
                                  className="w-20 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg px-2 py-1 text-right text-sm font-black focus:outline-none dark:text-white"
                                />
                              ) : (
                                <span className="font-black text-slate-800 dark:text-white">
                                  {formatCurrency(
                                    expense.amount,
                                    accounts.find(
                                      (a) =>
                                        a.id === (expense.accountId || "cash"),
                                    )?.currency || "PEN",
                                  )}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1">
                              {isUnlocked && (
                                <button
                                  onClick={() =>
                                    setUnlockedExpenses((prev) => ({
                                      ...prev,
                                      [expense.id]: false,
                                    }))
                                  }
                                  className="p-2 rounded-lg text-indigo-600 bg-indigo-100 transition-colors"
                                  title="Fijar cambios"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setConfirmConfig({
                                    isOpen: true,
                                    title: "Eliminar Gasto",
                                    message: `¿Estás seguro de que deseas eliminar el gasto "${expense.description}"?`,
                                    confirmText: "Sí, eliminar",
                                    type: "danger",
                                    onConfirm: () => {
                                      removeVariableExpense(
                                        currentMonthIndex,
                                        expense.id,
                                      );
                                      showToast("Gasto eliminado", "error");
                                    },
                                  });
                                }}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Debts / Recurring section */}
            <div className="mt-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold shadow-sm">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">
                    Resumen Cuotas
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400">
                    Gastos a futuro
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {monthData.variableExpenses.filter((e) =>
                  e.description.includes("Cuota"),
                ).length > 0 ? (
                  monthData.variableExpenses
                    .filter((e) => e.description.includes("Cuota"))
                    .map((e) => (
                      <div
                        key={e.id}
                        className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500 hover:scale-[1.01] transition-transform"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {e.description}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            {e.category}
                          </p>
                        </div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">
                          {formatCurrency(
                            e.amount,
                            accounts.find(
                              (a) => a.id === (e.accountId || "cash"),
                            )?.currency || "PEN",
                          )}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase italic">
                      No hay cuotas activas este mes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Global Modals */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />

      {/* Scope Update Modal */}
      {pendingUpdate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setPendingUpdate(null)}
          ></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-8 border border-white/20 animate-scale-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                Actualizar Meta
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Has cambiado el monto a{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(pendingUpdate.amount, "PEN")}
              </span>
              . ¿Quieres aplicar este cambio solo a este mes o también a los
              siguientes?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  updateSavingsGoal(
                    currentMonthIndex,
                    pendingUpdate.type,
                    pendingUpdate.isPartner,
                    pendingUpdate.amount,
                    false,
                  );
                  setPendingUpdate(null);
                  forceInputReset();
                  showToast("Actualizado solo este mes", "success");
                }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all"
              >
                Solo este mes
              </button>
              <button
                onClick={() => {
                  updateSavingsGoal(
                    currentMonthIndex,
                    pendingUpdate.type,
                    pendingUpdate.isPartner,
                    pendingUpdate.amount,
                    true,
                  );
                  setPendingUpdate(null);
                  forceInputReset();
                  showToast("Actualizado en todos los meses", "success");
                }}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
              >
                Este y siguientes
              </button>
              <button
                onClick={() => {
                  setPendingUpdate(null);
                  forceInputReset();
                }}
                className="w-full py-2 text-sm text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;
