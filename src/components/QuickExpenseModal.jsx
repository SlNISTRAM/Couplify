import React, { useState } from 'react';
import { X, Plus, Utensils, Gamepad2, Heart, Shirt, Package, Calculator, Car, Home, Tv, PartyPopper, Stethoscope, Banknote, CreditCard, Wallet } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../context/ToastContext';
import { EXPENSE_CATEGORIES, ACCOUNTS } from '../utils/constants';
import DateTimeSelector from './DateTimeSelector';

const QuickExpenseModal = ({ isOpen, onClose, monthRelIndex, selectedYear }) => {
  const { addVariableExpense, monthsData, accounts } = useFinance();
  const { showToast } = useToast();
  
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    accountId: accounts[0]?.id || 'cash',
    customDate: ''
  });

  // Dynamic sorting of categories based on usage frequency (count of records)
  const sortedCategories = React.useMemo(() => {
    const counts = {};
    monthsData.forEach(month => {
      month.variableExpenses?.forEach(exp => {
        counts[exp.category] = (counts[exp.category] || 0) + 1;
      });
    });
    return [...EXPENSE_CATEGORIES].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  }, [monthsData]);

  if (!isOpen) return null;

  // Find the valid global index for the month
  const currentMonthIndex = monthsData.findIndex(m => m.year === selectedYear && m.monthIndex === monthRelIndex);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Comida': return <Utensils size={18} />;
      case 'Transporte': return <Car size={18} />;
      case 'Hogar': return <Home size={18} />;
      case 'Ocio': return <Gamepad2 size={18} />;
      case 'Salud': return <Stethoscope size={18} />;
      case 'Suscripciones': return <Tv size={18} />;
      case 'Regalos': return <PartyPopper size={18} />;
      case 'Ropa': return <Shirt size={18} />;
      default: return <Package size={18} />;
    }
  };

  const getAccountIcon = (iconName) => {
    switch (iconName) {
      case 'Banknote': return <Banknote size={16} />;
      case 'CreditCard': return <CreditCard size={16} />;
      case 'Wallet': return <Wallet size={16} />;
      default: return <Banknote size={16} />;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense.description || !expense.amount) return;
    
    addVariableExpense(currentMonthIndex, {
      ...expense,
      amount: parseFloat(expense.amount),
      date: expense.customDate ? new Date(expense.customDate).toISOString() : new Date().toISOString()
    });
    
    showToast(`Registrado: ${expense.description}`, 'success');
    setExpense({ ...expense, description: '', amount: '', customDate: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 animate-fade-in"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up sm:animate-scale-in border border-white/20">
        <div className="p-8 pb-12 sm:pb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Rápido y Fácil</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  En {monthsData[currentMonthIndex]?.name || '...'} {selectedYear}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">¿Qué compraste?</label>
              <input 
                autoFocus
                type="text"
                value={expense.description}
                onChange={e => setExpense({...expense, description: e.target.value})}
                className="w-full glass-input p-4 text-sm font-bold"
                placeholder="Ej: Hamburguesa, Cine..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Monto</label>
                  <div className="glass-input flex items-center px-4 p-4 w-full group focus-within:ring-2 ring-indigo-500/50 transition-all">
                    <span className="text-slate-400 font-black mr-2 select-none">S/</span>
                    <input 
                      type="number"
                      step="0.01"
                      value={expense.amount}
                      onChange={e => setExpense({...expense, amount: e.target.value})}
                      className="bg-transparent border-none p-0 text-xl font-black focus:ring-0 w-full dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">¿Cuándo fue?</label>
                   <DateTimeSelector 
                     value={expense.customDate}
                     onChange={(date) => setExpense({...expense, customDate: date})}
                     color="indigo"
                   />
                </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pagar con</label>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map(acc => {
                  const isSelected = expense.accountId === acc.id;
                  const Icon = acc.id === 'cash' ? Banknote : acc.id === 'bank' ? Wallet : CreditCard;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setExpense({...expense, accountId: acc.id})}
                      className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold truncate">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</label>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest transition-all">
                      {expense.category}
                  </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mask-linear-right">
                {sortedCategories.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setExpense({...expense, category: c})}
                    className={`aspect-square w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all ${
                      expense.category === c 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    {getCategoryIcon(c)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!expense.description || !expense.amount}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 mt-4"
            >
              Registrar Gasto
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickExpenseModal;
