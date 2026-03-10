import React, { useState } from 'react';
import DateTimeSelector from './DateTimeSelector';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useContexts';
import { formatCurrency } from '../utils/helpers';
import { Landmark, Plus, Check, Trash2, X, CreditCard, Wallet, Banknote, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const PrestamosSection = ({ currentMonthIndex, prestamos = [] }) => {
  const { addPrestamo, completePrestamo, removePrestamo, accounts } = useFinance();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    person: '',
    accountId: accounts.find(a => a.type === 'debit')?.id || 'bank',
    customDate: '',
    type: 'received'
  });

  const pendingPrestamos = prestamos.filter(p => p.status === 'pending');
  const paidPrestamos = prestamos.filter(p => p.status === 'paid');

  const totalOwe = pendingPrestamos.filter(p => p.type !== 'given').reduce((s, p) => s + p.amount, 0);
  const totalOwedToMe = pendingPrestamos.filter(p => p.type === 'given').reduce((s, p) => s + p.amount, 0);

  const handleAdd = () => {
    if (!form.description || !form.amount) return;
    addPrestamo(currentMonthIndex, {
      description: form.description,
      amount: parseFloat(form.amount),
      person: form.person || form.givenBy, // backward compatible
      accountId: form.accountId,
      date: form.customDate ? new Date(form.customDate).toISOString() : new Date().toISOString(),
      type: form.type
    });
    setForm({ description: '', amount: '', person: '', accountId: form.accountId, customDate: '', type: form.type });
    setShowForm(false);
    showToast(form.type === 'received' ? 'Préstamo recibido registrado' : 'Préstamo otorgado registrado', 'warning');
  };

  const handleComplete = (id) => {
    completePrestamo(currentMonthIndex, id);
    showToast('Préstamo marcado como pagado ✓', 'success');
  };

  const handleRemove = (id) => {
    removePrestamo(currentMonthIndex, id);
    showToast('Registro eliminado', 'info');
  };

  return (
    <div className="app-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Landmark size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Préstamos Personales
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Dinero prestado o recibido
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Summary badges */}
      {(totalOwe > 0 || totalOwedToMe > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 flex flex-col justify-center">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Debo pagar</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalOwe)}
            </span>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-center">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Me deben</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalOwedToMe)}
            </span>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
         <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
            <button
              onClick={() => setForm({ ...form, type: 'received' })}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                form.type === 'received' 
                  ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <ArrowDownCircle size={14} />
              <span>Me Prestaron</span>
            </button>
            <button
              onClick={() => setForm({ ...form, type: 'given' })}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                form.type === 'given' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <ArrowUpCircle size={14} />
              <span>Yo Presté</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="¿Motivo o detalle? (ej: Para la luz)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 ring-amber-500 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center px-3 bg-white dark:bg-slate-900 rounded-xl focus-within:ring-2 ring-amber-500 transition-all">
              <span className="text-slate-400 text-xs font-black mr-2 select-none">S/</span>
              <input
                type="number"
                placeholder="Monto"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-transparent border-none p-3 pl-0 text-sm font-black focus:ring-0 dark:text-white"
              />
            </div>
            <input
              type="text"
              placeholder={form.type === 'received' ? "¿Quién te prestó?" : "¿A quién le prestaste?"}
              value={form.person}
              onChange={e => setForm({ ...form, person: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 ring-amber-500 dark:text-white"
            />
          </div>
          <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                 {form.type === 'received' ? "¿Cuándo te lo dieron?" : "¿Cuándo se lo diste?"}
              </label>
              <DateTimeSelector 
                value={form.customDate}
                onChange={(date) => setForm({ ...form, customDate: date })}
                color={form.type === 'received' ? "amber" : "emerald"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                {form.type === 'received' ? "¿A qué cuenta entró?" : "¿De qué cuenta salió?"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.filter(a => a.type !== 'credit').map(acc => {
                  const isSelected = form.accountId === acc.id;
                  const Icon = acc.id === 'cash' ? Banknote : acc.id === 'bank' ? Wallet : CreditCard;
                  const themeColor = form.type === 'received' ? 'amber' : 'emerald';
                  
                  // For tailwind compilation (it needs full strings)
                  const borderClass = isSelected 
                    ? (themeColor === 'amber' ? 'border-amber-500' : 'border-emerald-500') 
                    : 'border-transparent';
                  const bgClass = isSelected 
                    ? (themeColor === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20') 
                    : 'bg-white dark:bg-slate-900';
                  const textClass = isSelected 
                    ? (themeColor === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300') 
                    : 'text-slate-500';
                  const iconClass = isSelected 
                    ? (themeColor === 'amber' ? 'text-amber-500' : 'text-emerald-500') 
                    : 'text-slate-400';
                  const hoverClass = !isSelected ? 'hover:bg-slate-50 dark:hover:bg-slate-800' : '';
                  
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setForm({ ...form, accountId: acc.id })}
                      className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${borderClass} ${bgClass} ${textClass} ${hoverClass}`}
                    >
                      <Icon size={16} className={iconClass} />
                      <span className="text-xs font-bold truncate">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          <button
            onClick={handleAdd}
            className={`w-full py-3 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all ${
              form.type === 'received' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600'
            }`}
          >
            {form.type === 'received' ? "Registrar Ingreso" : "Registrar Salida"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {prestamos.length === 0 && !showForm && (
        <p className="text-center text-slate-400 text-xs font-medium py-4">
          Sin préstamos activos este mes
        </p>
      )}

      {/* Pending List */}
      {pendingPrestamos.length > 0 && (
        <div className="space-y-2">
          {pendingPrestamos.map(p => {
            const acc = accounts.find(a => a.id === p.accountId);
            const isReceived = p.type !== 'given';
            const personStr = p.person || p.givenBy;
            
            return (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border ${
                isReceived 
                  ? 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' 
                  : 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {isReceived ? <ArrowDownCircle size={12} className="text-amber-500" /> : <ArrowUpCircle size={12} className="text-emerald-500" />}
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{p.description}</p>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 ml-5">
                    {personStr && `${isReceived ? 'Me prestó' : 'Le presté a'}: ${personStr} · `}{acc?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <span className={`text-sm font-black ${isReceived ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(p.amount)}
                  </span>
                  <button
                    onClick={() => handleComplete(p.id)}
                    title={isReceived ? "Devolver" : "Cobrar"}
                    className={`p-1.5 rounded-lg transition-all font-black text-[10px] px-3 uppercase text-nowrap ${
                      isReceived 
                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-200' 
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 hover:bg-indigo-200'
                    }`}
                  >
                    {isReceived ? "Pagar" : "Cobrar"}
                  </button>
                  <button
                    onClick={() => handleRemove(p.id)}
                    title="Eliminar registro"
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-200 hover:text-slate-600 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed List */}
      {paidPrestamos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Completados (Pagados/Cobrados)</p>
          <div className="space-y-1.5">
            {paidPrestamos.map(p => {
              const isReceived = p.type !== 'given';
              return (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 opacity-50">
                <div className="flex items-center space-x-2">
                  {isReceived ? <ArrowDownCircle size={10} className="text-amber-500" /> : <ArrowUpCircle size={10} className="text-emerald-500" />}
                  <p className="text-xs font-bold text-slate-500 line-through truncate">{p.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-400">{formatCurrency(p.amount)}</span>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="p-1 text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestamosSection;
