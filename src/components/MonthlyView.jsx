import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useFinance } from "../hooks/useFinance";
import { useToast } from "../hooks/useContexts";
import {
  formatCurrency,
  formatCompactCurrency,
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
  Shield,
  ShoppingBag,
  Target,
  Receipt,
  Tv,
  PartyPopper,
  Stethoscope,
  Copy,
  ChevronDown as ChevronIcon,
  Clock,
  AlertCircle
} from "lucide-react";
import { EXPENSE_CATEGORIES, ACCOUNTS } from "../utils/constants";
import ExpenseCharts from "./ExpenseCharts";
import ConfirmModal from "./ConfirmModal";
import DateTimeSelector from "./DateTimeSelector";
import InteractiveMonthlyTour from "./InteractiveMonthlyTour";

const AccountSelector = ({
  value,
  onChange,
  accounts,
  size = "sm",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('main'); // 'main' or 'vaults'
  const selectedAccount = accounts.find((a) => a.id === value) || accounts[0];
  const Icon = selectedAccount?.type === 'vault'
    ? PiggyBank
    : selectedAccount?.id === "cash"
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
        const dropdownHeight = 320;

        setDropUp(spaceBelow < dropdownHeight);
        setCoords({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width
        });
        setView('main');
      }
    }, [isOpen]);


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
            {view === 'main' ? (
              <>
                {accounts
                  .filter((acc) => acc.type !== 'vault' && (!acc.hidden || acc.id === value))
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
                
                {accounts.some(acc => acc.type === 'vault') && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setView('vaults');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 mt-2 border border-dashed border-purple-200 dark:border-purple-800/50`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield size={16} />
                      <span className="text-xs font-black uppercase tracking-tight text-left">
                        Mis Bóvedas
                      </span>
                    </div>
                    <ChevronDown size={14} className="-rotate-90" />
                  </button>
                )}
              </>
            ) : (
              <div className="animate-in slide-in-from-right-2 duration-200">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setView('main');
                  }}
                  className="w-full flex items-center gap-2 p-2 mb-2 text-slate-400 hover:text-indigo-500 transition-colors border-b border-slate-100 dark:border-slate-800 pb-3"
                >
                  <ChevronDown size={14} className="rotate-90" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Regresar</span>
                </button>
                
                {accounts
                  .filter(acc => acc.type === 'vault')
                  .map((acc) => {
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
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                            : `hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-600 dark:text-slate-300`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PiggyBank
                            size={16}
                            className={isSelected ? "text-white" : "text-purple-500"}
                          />
                          <span className="text-xs font-black uppercase tracking-tight text-left">
                            {acc.name}
                          </span>
                        </div>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MonthlyView = ({ year, monthRelIndex, userName, onViewChange }) => {
  const {
    monthsData,
    updateFixedPayment,
    updateFixedExpenseAmount,
    addFixedExpense,
    removeFixedExpense,
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
    addInstallmentExpense,
    addVariableExpense,
    removeVariableExpense,
    updateVariableExpense,
    calculateMonthStats,
    restoreFixedExpense,
    updateFixedExpenseMetadata,
    getExpenseDistribution,
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

  // 1. Hook Declarations (Must be at the top)

  // Onboarding Tour State
  const [runTour, setRunTour] = useState(false);

  // Month Selection State (Derived from props)
  const currentMonthIndex = useMemo(() => {
    if (!monthsData) return -1;
    return monthsData.findIndex(
      (m) => m.year === year && m.monthIndex === monthRelIndex,
    );
  }, [monthsData, year, monthRelIndex]);

  useEffect(() => {
    if (!userName) return;

    const hasSeenTour = localStorage.getItem('hasSeenCouplifyMonthlyTour');
    if (!hasSeenTour && monthsData && monthsData.length > 0 && accounts) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [monthsData, accounts, userName]);

  const [newFixedExpense, setNewFixedExpense] = useState({
    name: "",
    amount: "",
    accountId: "bank",
    dueDate: "",
  });
  const [isLimited, setIsLimited] = useState(false);
  const [untilMonth, setUntilMonth] = useState(currentMonthIndex);
  const [editingFixedId, setEditingFixedId] = useState(null);
  const [payingFixedId, setPayingFixedId] = useState(null);
  const [payingFixedSource, setPayingFixedSource] = useState(null);
  const [payingFixedView, setPayingFixedView] = useState('main'); // 'main' or 'vaults'
  const [originalExpense, setOriginalExpense] = useState(null);
  const [expandedFixedId, setExpandedFixedId] = useState(null);
  const [unlockedExpenses, setUnlockedExpenses] = useState({}); // Tracking which rows are unlocked

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    accountId: accounts?.[0]?.id || "cash",
    isInstallment: false,
    installments: 12,
    customDate: "",
  });

  // Dynamic sorting of categories based on usage frequency (count of records)
  const sortedCategories = useMemo(() => {
    if (!monthsData) return EXPENSE_CATEGORIES;
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
    onConfirmSecondary: null,
    confirmTextSecondary: "",
    type: "danger",
  });

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
  const [editingVariableId, setEditingVariableId] = useState(null);
  const [originalVariableExpense, setOriginalVariableExpense] = useState(null);
  const [uiVersion, setUiVersion] = useState(0);

  const [newIncome, setNewIncome] = useState({
    description: "",
    amount: "",
    accountId: "bank",
  });

  const editCardRef = useRef(null);
  const fixedCardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // 1. Variable Expense Detection
      if (editingVariableId && editCardRef.current && !editCardRef.current.contains(e.target)) {
        if (confirmConfig.isOpen) return;

        const currentMonthData = monthsData?.[currentMonthIndex];
        const currentExpense = currentMonthData?.variableExpenses?.find(ex => ex.id === editingVariableId);
        if (!currentExpense || !originalVariableExpense) return;

        const hasChanges = 
          currentExpense.description !== originalVariableExpense.description ||
          currentExpense.amount !== originalVariableExpense.amount ||
          currentExpense.category !== originalVariableExpense.category ||
          currentExpense.accountId !== originalVariableExpense.accountId ||
          (currentExpense.date && originalVariableExpense.date && 
           new Date(currentExpense.date).getTime() !== new Date(originalVariableExpense.date).getTime());

        if (hasChanges) {
          setConfirmConfig({
            isOpen: true,
            title: "Cambios sin guardar",
            message: `Has realizado cambios en "${currentExpense.description}". ¿Deseas guardarlos antes de salir?`,
            confirmText: "Guardar",
            confirmTextSecondary: "Descartar",
            type: "warning",
            onConfirm: () => {
              setEditingVariableId(null);
              setOriginalVariableExpense(null);
              showToast("Cambios guardados", "success");
              closeConfirm();
            },
            onConfirmSecondary: () => {
              updateVariableExpense(currentMonthIndex, editingVariableId, { ...originalVariableExpense });
              setEditingVariableId(null);
              setOriginalVariableExpense(null);
              showToast("Cambios descartados", "info");
              closeConfirm();
            }
          });
        } else {
          setEditingVariableId(null);
          setOriginalVariableExpense(null);
        }
      }

      // 2. Fixed Expense Detection
      if (expandedFixedId && fixedCardRef.current && !fixedCardRef.current.contains(e.target)) {
        if (confirmConfig.isOpen) return;

        const currentMonthData = monthsData?.[currentMonthIndex];
        const currentExpense = currentMonthData?.fixedExpenses?.find(ex => ex.id === expandedFixedId);
        const currentPayment = currentMonthData?.payments?.[expandedFixedId];
        
        if (!currentExpense || !originalExpense) return;

        const hasChanges = 
          currentExpense.name !== originalExpense.name ||
          currentExpense.amount !== originalExpense.amount ||
          currentExpense.dueDate !== originalExpense.dueDate ||
          currentExpense.accountId !== originalExpense.accountId ||
          (currentPayment?.amountPaid !== originalExpense.amountPaid);

        if (hasChanges) {
          setConfirmConfig({
            isOpen: true,
            title: "Cambios sin guardar",
            message: `Has realizado cambios en "${currentExpense.name}". ¿Deseas guardarlos antes de salir?`,
            confirmText: "Guardar",
            confirmTextSecondary: "Descartar",
            type: "warning",
            onConfirm: () => {
              setExpandedFixedId(null);
              setOriginalExpense(null);
              showToast("Cambios guardados", "success");
              closeConfirm();
            },
            onConfirmSecondary: () => {
              // Revert metadata
              updateFixedExpenseMetadata(currentMonthIndex, expandedFixedId, { 
                name: originalExpense.name,
                dueDate: originalExpense.dueDate,
                accountId: originalExpense.accountId
              }, true);
              updateFixedExpenseAmount(currentMonthIndex, expandedFixedId, originalExpense.amount, true);
              // Revert payment
              updateFixedPayment(currentMonthIndex, expandedFixedId, originalExpense.amountPaid);
              
              setExpandedFixedId(null);
              setOriginalExpense(null);
              showToast("Cambios descartados", "info");
              closeConfirm();
            }
          });
        } else {
          setExpandedFixedId(null);
          setOriginalExpense(null);
        }
      }
    };

    if (editingVariableId || expandedFixedId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingVariableId, expandedFixedId, originalVariableExpense, originalExpense, monthsData, currentMonthIndex, confirmConfig.isOpen]);

  // 2. Conditional Returns (After all hooks)

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

  if (currentMonthIndex === -1)
    return (
      <div className="p-10 text-center text-slate-400">Mes no disponible</div>
    );

  const monthData = monthsData[currentMonthIndex];
  const stats = calculateMonthStats(currentMonthIndex);

  // Values are now calculated centrally in useFinance.js/calculateMonthStats
  const variableBudget = stats.variableBudget;
  const dynamicStats = stats;

  const closeConfirm = () =>
    setConfirmConfig((prev) => ({ ...prev, isOpen: false, onConfirmSecondary: null, confirmTextSecondary: "" }));
  const forceInputReset = () => setUiVersion((v) => v + 1);

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
        accountId: newFixedExpense.accountId,
        dueDate: newFixedExpense.dueDate ? parseInt(newFixedExpense.dueDate) : null,
      },
      isLimited ? parseInt(untilMonth) : null,
    );
    showToast(`Pago fijo añadido: ${newFixedExpense.name}`, "success");
    setNewFixedExpense({ name: "", amount: "", accountId: "bank", dueDate: "" });
    setIsLimited(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <InteractiveMonthlyTour run={runTour} setRun={setRunTour} monthName={monthData?.name || "este mes"} onTourFinish={() => onViewChange('dashboard')} />
      {/* Mobile Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Wallet Card */}
        <div
          className={`tour-mensual-disponible app-card p-6 border-l-8 ${stats.availableReal < 20 ? "border-l-rose-500" : "border-l-emerald-500"} relative`}
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
            <div className="tour-mensual-ingresos flex items-center mb-4 space-x-3">
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
            <div className="tour-mensual-ahorro flex items-center mb-4 space-x-3">
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
              {Object.entries(monthData.goalMetadata || {
                goal1: { name: "Meta 1", icon: "Target", color: "from-blue-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600", target: 0, isLocked: false }
              }).map(([type, goalMeta]) => {
                const userGoal = Number(monthData.savings?.[type] || 0);
                // Partner goal defaults to user goal (legacy compatibility)
                const partnerGoal =
                  monthData.savings?.[type + "_partner"] !== undefined
                    ? Number(monthData.savings[type + "_partner"])
                    : userGoal;

                const totalGoal = goalMeta.isShared === false ? userGoal : userGoal + partnerGoal;

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
                            {goalMeta.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                            {goalMeta.isShared === false ? "Meta Individual" : "Meta Juntos"}: {formatCurrency(totalGoal)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-xs font-black px-3 py-1 rounded-lg ${isCompleted ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}
                      >
                        {isCompleted ? "META LOGRADA" : "EN PROGRESO"}
                      </div>
                    </div>

                    <div className={`grid gap-3 ${goalMeta.isShared === false ? "grid-cols-1" : "grid-cols-2"}`}>
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
                        <div className="flex flex-col space-y-2">
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
                                  payments.date,
                                  payments.userAccountId || "bank",
                                  payments.userDestAccountId || ""
                                )
                              }
                              className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${payments.userPaid >= userGoal ? "text-emerald-600" : "text-slate-600"}`}
                            />
                          </div>
                          <div className="flex flex-col space-y-2 mt-3 p-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col space-y-1" title="Cuenta origen">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">Extraer de:</span>
                              <AccountSelector
                                value={payments.userAccountId || "bank"}
                                onChange={(val) => {
                                  updateSavingsPayment(
                                    currentMonthIndex,
                                    type,
                                    "userPaid",
                                    payments.userPaid || 0,
                                    payments.date,
                                    val,
                                    payments.userDestAccountId || ""
                                  );
                                  showToast(`Origen: ${accounts.find(a => a.id === val)?.name}`, 'info');
                                }}
                                accounts={accounts.filter(a => a.type !== 'vault')}
                                size="xs"
                              />
                            </div>
                            <div className="flex flex-col space-y-1" title="Bóveda destino">
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider ml-1">Guardar en bóveda:</span>
                              <AccountSelector
                                value={payments.userDestAccountId || ""}
                                onChange={(val) => {
                                  updateSavingsPayment(
                                    currentMonthIndex,
                                    type,
                                    "userPaid",
                                    payments.userPaid || 0,
                                    payments.date,
                                    payments.userAccountId || "bank",
                                    val
                                  );
                                  showToast(`Destino: ${accounts.find(a => a.id === val)?.name}`, 'info');
                                }}
                                accounts={accounts.filter(a => a.type === 'vault')}
                                size="xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {goalMeta.isShared !== false && (
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
                        <div className="flex flex-col space-y-2">
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
                                  payments.date,
                                  payments.partnerAccountId || "bank",
                                  payments.partnerDestAccountId || ""
                                )
                              }
                              className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${payments.partnerPaid >= partnerGoal ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}
                            />
                          </div>
                          <div className="flex flex-col space-y-2 mt-3 p-2 bg-rose-50/30 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <div className="flex-1 hidden" title="Cuenta origen (pareja)">
                               {/* Partner's source account isn't typically tracked in the user's balances, but we keep the selector hidden or just use default */}
                            </div>
                            <div className="flex flex-col space-y-1" title="Bóveda destino">
                              <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider ml-1">Guardar en bóveda:</span>
                              <AccountSelector
                                value={payments.partnerDestAccountId || payments.userDestAccountId || ""}
                                onChange={(val) => {
                                  updateSavingsPayment(
                                    currentMonthIndex,
                                    type,
                                    "partnerPaid",
                                    payments.partnerPaid || 0,
                                    payments.date,
                                    payments.partnerAccountId || "bank",
                                    val
                                  );
                                  showToast(`Destino: ${accounts.find(a => a.id === val)?.name}`, 'info');
                                }}
                                accounts={accounts.filter(a => a.type === 'vault')}
                                size="xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Fixed Expenses Section */}
          <section>
            <div className="tour-mensual-fijos flex items-center justify-between mb-4">
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

            <div className="app-card shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {[...monthData.fixedExpenses]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((expense) => {
                  const isEditing = editingFixedId === expense.id;
                  const isExpanded = expandedFixedId === expense.id;
                  const payment = monthData.payments[expense.id];
                  const isPaid = payment?.completed;
                  const acc = accounts.find(a => a.id === (expense.accountId || 'bank'));

                  return (
                    <div
                      key={expense.id}
                      className={`relative flex flex-col transition-all ${isPaid ? "bg-emerald-50/10 dark:bg-emerald-900/5" : ""}`}
                    >
                      <div className="group">
                        {/* Main row – always visible */}
                        <div
                          role="button"
                          tabIndex={0}
                          ref={isExpanded ? fixedCardRef : null}
                          className={`w-full flex items-center px-4 py-3.5 gap-3 text-left transition-colors cursor-pointer ${isExpanded ? "bg-slate-50 dark:bg-slate-800/60" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"}`}
                          onClick={() => {
                            if (!isExpanded) {
                              setOriginalExpense({ 
                                ...expense, 
                                amountPaid: payment?.amountPaid || 0 
                              });
                            }
                            setExpandedFixedId(isExpanded ? null : expense.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (!isExpanded) {
                                setOriginalExpense({ 
                                  ...expense, 
                                  amountPaid: payment?.amountPaid || 0 
                                });
                              }
                              setExpandedFixedId(isExpanded ? null : expense.id);
                            }
                          }}
                        >
                            {/* Checkbox / Quick Pay Trigger */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPaid) {
                                    updateFixedPayment(currentMonthIndex, expense.id, 0);
                                    showToast("Pago desmarcado", "info");
                                  } else {
                                    setPayingFixedId(expense.id);
                                    setPayingFixedSource(null);
                                    setPayingFixedView('main');
                                  }
                                }}
                                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isPaid
                                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                                }`}
                              >
                                {isPaid && <Check size={14} />}
                              </button>

                              {/* Quick Pay Account Selector Popover */}
                              {!isPaid && payingFixedId === expense.id && (
                                <div className="absolute left-0 top-9 z-[100] animate-scale-in bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 min-w-[220px]">
                                  {payingFixedSource ? (
                                    <div className="space-y-2 p-1">
                                      <p className="text-[10px] font-black text-slate-500 uppercase px-2">¿Pagar con {payingFixedSource.name}?</p>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // 1. Update metadata to make it persistent for future months
                                            updateFixedExpenseMetadata(currentMonthIndex, expense.id, { accountId: payingFixedSource.id }, true);
                                            // 2. Mark as paid
                                            updateFixedPayment(currentMonthIndex, expense.id, expense.amount);
                                            setPayingFixedId(null);
                                            setPayingFixedSource(null);
                                            setPayingFixedView('main');
                                            showToast(`Pagado con ${payingFixedSource.name} ✓`, "success");
                                          }}
                                          className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-emerald-500/20"
                                        >
                                          Confirmar
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setPayingFixedSource(null); }}
                                          className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-xl"
                                        >
                                          Cambiar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      {/* Using a local view state here or just filtering? 
                                          Since we are inside a map, using a persistent view state for all popovers is tricky.
                                          Let's use a simple sub-view logic if possible or just filter vaults.
                                      */}
                                      {payingFixedView === 'main' ? (
                                        <>
                                          <div className="flex justify-between items-center px-2 py-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Selecciona Pago</p>
                                            <button onClick={(e) => { e.stopPropagation(); setPayingFixedId(null); }} className="text-slate-400 hover:text-rose-500"><X size={12}/></button>
                                          </div>
                                          {accounts.filter(a => a.id !== 'cash' && a.type !== 'vault' && !a.hidden).map(acc => (
                                            <button 
                                              key={acc.id}
                                              onClick={(e) => { e.stopPropagation(); setPayingFixedSource(acc); }}
                                              className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                            >
                                              {acc.type === 'credit' ? (
                                                <CreditCard size={12} className="text-rose-500" />
                                              ) : (
                                                <Wallet size={12} className="text-indigo-500" />
                                              )}
                                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{acc.name}</span>
                                            </button>
                                          ))}
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setPayingFixedSource({ id: 'cash', name: 'Efectivo' }); }}
                                            className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                          >
                                            <Banknote size={12} className="text-emerald-500" />
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Efectivo</span>
                                          </button>
                                          {accounts.some(a => a.type === 'vault') && (
                                            <button 
                                              onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setPayingFixedView('vaults');
                                              }}
                                              className="w-full flex items-center justify-between p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors text-purple-600 dark:text-purple-400 border border-dashed border-purple-200 dark:border-purple-800/50 mt-1"
                                            >
                                              <div className="flex items-center gap-2">
                                                <Shield size={12} />
                                                <span className="text-[10px] font-black uppercase">Mis Bóvedas</span>
                                              </div>
                                              <ChevronDown size={10} className="-rotate-90 text-purple-400" />
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        <div className="animate-in slide-in-from-right-2 duration-200 min-w-[220px]">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPayingFixedView('main');
                                            }}
                                            className="w-full flex items-center gap-2 p-2 mb-1 text-slate-400 hover:text-indigo-500 transition-colors border-b border-slate-100 dark:border-slate-800 pb-2"
                                          >
                                            <ChevronDown size={12} className="rotate-90" />
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">Regresar</span>
                                          </button>
                                          {accounts.filter(a => a.type === 'vault').map(acc => (
                                            <button 
                                              key={acc.id}
                                              onClick={(e) => { e.stopPropagation(); setPayingFixedSource(acc); }}
                                              className="w-full flex items-center gap-3 p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                                            >
                                              <PiggyBank size={14} className="text-purple-500" />
                                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{acc.name}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Name and Paid info */}
                            <div className="flex-1 flex flex-col min-w-0">
                              <span className={`text-sm font-bold leading-tight ${isPaid ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                                {expense.name}
                              </span>
                              {isPaid && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                                    Pagado con {accounts.find(a => a.id === expense.accountId)?.name || 'Efectivo'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Due date chip – always visible if set */}
                            {expense.dueDate && (() => {
                              const today = new Date();
                              const currentDay = today.getDate();
                              const daysUntil = expense.dueDate - currentDay;
                              
                              let chipClass = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500";
                              let icon = <CalendarIcon size={10} />;
                              let label = `Vence ${expense.dueDate}`;

                              if (!isPaid) {
                                if (daysUntil < 0) {
                                  chipClass = "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 animate-pulse-subtle";
                                  icon = <AlertTriangle size={10} />;
                                  label = `Vencido (${expense.dueDate})`;
                                } else if (daysUntil <= 3) {
                                  chipClass = "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
                                  icon = <AlertTriangle size={10} />;
                                }
                              }

                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black flex-shrink-0 transition-colors ${chipClass}`}>
                                  {icon}
                                  {label}
                                </span>
                              );
                            })()}

                            {/* Amount */}
                            <span className={`text-sm font-black flex-shrink-0 ${
                              isPaid ? "text-emerald-500" : "text-slate-700 dark:text-slate-200"
                            }`}>
                              S/ {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>

                            {/* Expand chevron */}
                            <ChevronDown
                              size={15}
                              className={`flex-shrink-0 text-slate-300 dark:text-slate-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 space-y-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                              {/* Meta info row – account + payment date (when paid) */}
                              <div className="flex flex-wrap gap-2">
                                {acc && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    <CreditCard size={11} className="text-indigo-400" />
                                    <span>{acc.name}</span>
                                  </span>
                                )}
                                {isPaid && payment?.date && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold text-emerald-600">
                                    <Check size={11} />
                                    <span>Pagado</span>
                                    <DateTimeSelector 
                                      value={payment.date}
                                      onChange={(newDate) => updateFixedPayment(currentMonthIndex, expense.id, payment?.amountPaid, newDate)}
                                      size="xs"
                                      color="emerald"
                                      showLabel={false}
                                    />
                                  </span>
                                )}
                              </div>

                              {/* Name and Paid info */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre / Concepto</label>
                                <input
                                  type="text"
                                  value={expense.name}
                                  onChange={(e) => updateFixedExpenseMetadata(currentMonthIndex, expense.id, { name: e.target.value }, true)}
                                  className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {/* Total Amount */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monto Total</label>
                                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                                    <span className="text-[10px] font-black text-slate-400 mr-2">S/</span>
                                    <input
                                      type="number"
                                      value={expense.amount}
                                      onChange={(e) => updateFixedExpenseAmount(currentMonthIndex, expense.id, parseFloat(e.target.value) || 0, true)}
                                      className="w-full bg-transparent font-bold text-sm focus:outline-none dark:text-white text-right"
                                    />
                                  </div>
                                </div>

                                {/* Due Date quick edit */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Día Vencimiento</label>
                                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                                    <CalendarIcon size={12} className="text-indigo-400 mr-2" />
                                    <input
                                      type="number"
                                      min="1" max="31"
                                      value={expense.dueDate || ""}
                                      placeholder="--"
                                      onChange={(e) => {
                                        let val = e.target.value === "" ? null : parseInt(e.target.value);
                                        if (val !== null) val = Math.max(1, Math.min(31, val));
                                        updateFixedExpenseMetadata(currentMonthIndex, expense.id, { dueDate: val }, true);
                                      }}
                                      className="w-full text-center bg-transparent font-bold text-sm focus:outline-none dark:text-white"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Abonado input */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Abonado este mes</label>
                                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 border-l-4 border-l-emerald-500">
                                  <span className="text-[10px] font-black text-slate-400 mr-2">S/</span>
                                  <input
                                    type="number"
                                    value={payment?.amountPaid > 0 ? payment.amountPaid : ""}
                                    placeholder="0"
                                    onChange={(e) => updateFixedPayment(currentMonthIndex, expense.id, parseFloat(e.target.value) || 0)}
                                    className={`flex-1 text-right bg-transparent font-mono font-black text-sm focus:outline-none ${
                                      isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Account selector */}
                              <AccountSelector
                                value={expense.accountId || "bank"}
                                onChange={(val) => {
                                  updateFixedExpenseMetadata(currentMonthIndex, expense.id, { accountId: val }, true);
                                  showToast(`Cuenta actualizada`, "info");
                                }}
                                accounts={accounts}
                                size="xs"
                              />

                              {/* Action buttons */}
                              <div className="flex items-center justify-end space-x-2 pt-1">
                                <button
                                  onClick={() => {
                                    setConfirmConfig({
                                      isOpen: true,
                                      title: "Eliminar Pago",
                                      message: `¿Deseas eliminar "${expense.name}" solo este mes o de forma definitiva?`,
                                      confirmText: "Definitivo",
                                      confirmTextSecondary: "Solo este mes",
                                      type: "warning",
                                      onConfirm: () => removeFixedExpense(currentMonthIndex, expense.id, true),
                                      onConfirmSecondary: () => removeFixedExpense(currentMonthIndex, expense.id, false)
                                    });
                                  }}
                                  className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl text-xs font-black hover:bg-rose-100 transition-all"
                                >
                                  <Trash2 size={13} />
                                  <span>Eliminar</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setExpandedFixedId(null);
                                    setOriginalExpense(null);
                                    showToast("Cambios guardados", "success");
                                  }}
                                  className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                                >
                                  <Check size={13} />
                                  <span>Guardar</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>


            {/* Add New Fixed Expense Form */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 px-4 sm:px-6 py-5 rounded-b-2xl border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                    <Plus size={18} />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Nuevo Pago Fijo
                  </h4>
                </div>

                <form onSubmit={handleAddFixedExpense} className="space-y-3">
                  <input
                    type="text"
                    placeholder="¿Qué estás pagando?"
                    value={newFixedExpense.name}
                    onChange={(e) => setNewFixedExpense({ ...newFixedExpense, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 px-4 py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none dark:text-slate-200 shadow-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                      <span className="text-xs font-black text-slate-400 mr-2">S/</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newFixedExpense.amount}
                        onChange={(e) => setNewFixedExpense({ ...newFixedExpense, amount: e.target.value })}
                        className="w-full bg-transparent text-sm font-black focus:outline-none text-right dark:text-slate-200"
                        />
                      </div>
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                        <CalendarIcon size={14} className="text-indigo-500 mr-2" />
                        <input 
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Día"
                          value={newFixedExpense.dueDate}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (val !== "") {
                              const numMatch = val.match(/\d+/);
                              if (numMatch) {
                                let num = parseInt(numMatch[0]);
                                num = Math.max(1, Math.min(31, num));
                                val = num.toString();
                              }
                            }
                            setNewFixedExpense({ ...newFixedExpense, dueDate: val });
                          }}
                          className="w-full bg-transparent text-sm font-black text-center focus:outline-none dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-[1fr_80px] gap-3">
                      <AccountSelector 
                        value={newFixedExpense.accountId}
                        onChange={val => setNewFixedExpense({...newFixedExpense, accountId: val})}
                        accounts={accounts}
                        size="sm"
                      />
                      <button
                        type="submit"
                        disabled={!newFixedExpense.name || !newFixedExpense.amount}
                        className="w-full bg-indigo-500 text-white rounded-xl font-black uppercase text-xs hover:bg-indigo-600 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                      >
                        A&ntilde;adir
                      </button>
                    </div>

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
              </form>
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
            </section>
          </div>

        {/* RIGHT COLUMN: Spending and Analysis */}
        <div className="space-y-8">
          {/* 4. Variable Expenses Section */}
          <section>
            <div className="tour-mensual-variables flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
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
                      return (
                        <div
                          key={expense.id}
                          ref={editingVariableId === expense.id ? editCardRef : null}
                          onClick={() => {
                            if (editingVariableId !== expense.id) {
                              setOriginalVariableExpense({ ...expense });
                              setEditingVariableId(expense.id);
                            }
                          }}
                          className={`flex flex-col group transition-all cursor-pointer border-b border-slate-50 dark:border-slate-800 ${editingVariableId === expense.id ? "p-4 bg-indigo-50/30 dark:bg-indigo-900/10 ring-1 ring-inset ring-indigo-100/50 dark:ring-indigo-900/20" : "p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"}`}
                        >
                          {editingVariableId === expense.id ? (
                            <div className="flex flex-col space-y-3 w-full">
                              {/* Header: Icon and Actions */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                    <Unlock size={14} />
                                  </div>
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Editando Gasto</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (originalVariableExpense) {
                                        updateVariableExpense(currentMonthIndex, expense.id, originalVariableExpense);
                                      }
                                      setEditingVariableId(null);
                                      setOriginalVariableExpense(null);
                                    }}
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-slate-100 dark:bg-slate-800 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                                    title="Cancelar"
                                  >
                                    <X size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingVariableId(null);
                                      setOriginalVariableExpense(null);
                                      showToast("Cambios guardados", "success");
                                    }}
                                    className="p-2 rounded-xl text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 transition-all hover:scale-110"
                                    title="Fijar cambios"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmConfig({
                                        isOpen: true,
                                        title: "Eliminar Gasto",
                                        message: `¿Estás seguro de que deseas eliminar el gasto "${expense.description}"?`,
                                        confirmText: "Sí, eliminar",
                                        type: "danger",
                                        onConfirm: () => {
                                          removeVariableExpense(currentMonthIndex, expense.id);
                                          setEditingVariableId(null);
                                          showToast("Gasto eliminado", "error");
                                        },
                                      });
                                    }}
                                    className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 transition-all hover:scale-110 ml-2"
                                    title="Eliminar gasto"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>

                              {/* Main Fields: Description, Amount, Date */}
                              <div className="flex flex-col space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Concepto</label>
                                  <input
                                    type="text"
                                    value={expense.description}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                      updateVariableExpense(currentMonthIndex, expense.id, { description: e.target.value })
                                    }
                                    className="w-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                    autoFocus
                                  />
                                </div>
                                {/* Form Row: Amount & Date (Grid for compact design) */}
                                 <div className="grid grid-cols-2 gap-3">
                                   <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Monto</label>
                                     <div className="relative">
                                       <input
                                         type="number"
                                         value={expense.amount}
                                         onClick={(e) => e.stopPropagation()}
                                         onChange={(e) =>
                                           updateVariableExpense(currentMonthIndex, expense.id, { amount: parseFloat(e.target.value) || 0 })
                                         }
                                         className="w-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl px-4 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                       />
                                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px] pointer-events-none">
                                         {accounts.find(a => a.id === (expense.accountId || "cash"))?.currency || "PEN"}
                                       </span>
                                     </div>
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fecha</label>
                                     <div className="relative">
                                       <CalendarIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                                       <input
                                         type="date"
                                         value={expense.date ? new Date(expense.date).toISOString().split('T')[0] : ''}
                                         onClick={(e) => e.stopPropagation()}
                                         onChange={(e) =>
                                           updateVariableExpense(currentMonthIndex, expense.id, { date: new Date(e.target.value).toISOString() })
                                         }
                                         className="w-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white appearance-none cursor-pointer"
                                         style={{
                                           WebkitAppearance: 'none',
                                           MozAppearance: 'none'
                                         }}
                                       />
                                     </div>
                                   </div>
                                 </div>
                              </div>

                              {/* Categories */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
                                <div className="flex flex-wrap gap-2 p-1">
                                  {sortedCategories.map((cat) => (
                                    <button
                                      key={cat}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateVariableExpense(currentMonthIndex, expense.id, { category: cat });
                                      }}
                                      className={`p-2 rounded-xl border transition-all flex-shrink-0 flex items-center gap-2 ${expense.category === cat ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105" : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-500"}`}
                                      title={cat}
                                    >
                                      {React.cloneElement(getCategoryIcon(cat), { size: 14 })}
                                      {expense.category === cat && <span className="text-[10px] font-bold uppercase tracking-tighter">{cat}</span>}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Account Selector */}
                              <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col space-y-1 flex-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cuenta utilizada:</span>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <AccountSelector 
                                      value={expense.accountId || "cash"}
                                      onChange={(val) =>
                                        updateVariableExpense(currentMonthIndex, expense.id, { accountId: val })
                                      }
                                      accounts={accounts}
                                      size="sm"
                                    />
                                  </div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-3 rounded-xl flex items-center space-x-3 max-w-xs">
                                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                  <p className="text-[9px] font-medium text-amber-600 dark:text-amber-400 leading-tight">
                                    Los cambios se guardan automáticamente, pero puedes cancelarlos para restaurar el estado anterior.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Normal View */
                            <>
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center transition-all group-hover:scale-110">
                                  {getCategoryIcon(expense.category)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-700 dark:text-slate-200">
                                    {expense.description}
                                  </p>
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
                              <div className="flex items-center space-x-4 ml-8 pt-1">
                                <span className="font-black text-slate-800 dark:text-white text-lg">
                                  {formatCurrency(
                                    expense.amount,
                                    accounts.find(
                                      (a) =>
                                        a.id === (expense.accountId || "cash"),
                                    )?.currency || "PEN",
                                  )}
                                </span>
                              </div>
                            </>
                          )}
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
        onConfirmSecondary={confirmConfig.onConfirmSecondary}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        confirmTextSecondary={confirmConfig.confirmTextSecondary}
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
