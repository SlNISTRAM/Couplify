import React, { useState } from 'react';
import DateTimeSelector from './DateTimeSelector';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/helpers';
import { ShoppingBag, Plus, Check, Trash2, X, CreditCard, Wallet, Banknote } from 'lucide-react';

const EncargosSection = ({ currentMonthIndex, encargos = [], stats }) => {
  const { addEncargo, completeEncargo, removeEncargo, accounts } = useFinance();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    receivedFrom: '',
    accountId: accounts.find(a => a.type === 'debit')?.id || 'bank',
    customDate: ''
  });

  const pendingEncargos = encargos.filter(e => e.status === 'pending');
  const spentEncargos = encargos.filter(e => e.status === 'spent');

  const handleAdd = () => {
    if (!form.description || !form.amount) return;
    addEncargo(currentMonthIndex, {
      description: form.description,
      amount: parseFloat(form.amount),
      receivedFrom: form.receivedFrom,
      accountId: form.accountId,
      date: form.customDate ? new Date(form.customDate).toISOString() : new Date().toISOString()
    });
    setForm({ description: '', amount: '', receivedFrom: '', accountId: form.accountId, customDate: '' });
    setShowForm(false);
    showToast('Encargo registrado — no conta como tu dinero', 'info');
  };

  const handleComplete = (id) => {
    completeEncargo(currentMonthIndex, id);
    showToast('Encargo marcado como gastado ✓', 'success');
  };

  const handleRemove = (id) => {
    removeEncargo(currentMonthIndex, id);
    showToast('Encargo eliminado', 'info');
  };

  const totalPending = pendingEncargos.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="app-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Dinero de Terceros
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Encargos · No es tuyo
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-500 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Summary badge */}
      {totalPending > 0 && (
        <div className="mb-4 px-4 py-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-900/40 flex items-center justify-between">
          <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Dinero retenido (no tuyo)</span>
          <span className="text-sm font-black text-violet-600 dark:text-violet-400">
            -{formatCurrency(totalPending)}
          </span>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
          <input
            type="text"
            placeholder="¿Para qué? (ej: Compra para Juan)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 ring-violet-500 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center px-3 bg-white dark:bg-slate-900 rounded-xl focus-within:ring-2 ring-violet-500 transition-all">
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
              placeholder="¿Quién te lo dio?"
              value={form.receivedFrom}
              onChange={e => setForm({ ...form, receivedFrom: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 ring-violet-500 dark:text-white"
            />
          </div>
          <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">¿Cuándo lo recibiste?</label>
              <DateTimeSelector 
                value={form.customDate}
                onChange={(date) => setForm({ ...form, customDate: date })}
                color="violet"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">¿En qué cuenta entró?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.map(acc => {
                  const isSelected = form.accountId === acc.id;
                  const Icon = acc.id === 'cash' ? Banknote : acc.id === 'bank' ? Wallet : CreditCard;
                  
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setForm({ ...form, accountId: acc.id })}
                      className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' 
                          : 'border-transparent bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-violet-500' : 'text-slate-400'} />
                      <span className="text-xs font-bold truncate">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-purple-700 active:scale-95 transition-all"
          >
            Registrar Encargo
          </button>
        </div>
      )}

      {/* Empty state */}
      {encargos.length === 0 && !showForm && (
        <p className="text-center text-slate-400 text-xs font-medium py-4">
          Sin encargos activos este mes
        </p>
      )}

      {/* Pending List */}
      {pendingEncargos.length > 0 && (
        <div className="space-y-2">
          {pendingEncargos.map(e => {
            const acc = accounts.find(a => a.id === e.accountId);
            return (
              <div key={e.id} className="flex items-center justify-between p-3 bg-violet-50/60 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-900/30">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{e.description}</p>
                  <p className="text-[10px] font-medium text-slate-400">
                    {e.receivedFrom && `De: ${e.receivedFrom} · `}{acc?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                    {formatCurrency(e.amount)}
                  </span>
                  <button
                    onClick={() => handleComplete(e.id)}
                    title="Ya lo gasté"
                    className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-lg hover:bg-emerald-200 transition-all"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleRemove(e.id)}
                    title="Eliminar"
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-rose-100 hover:text-rose-500 transition-all"
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
      {spentEncargos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ya gastados</p>
          <div className="space-y-1.5">
            {spentEncargos.map(e => (
              <div key={e.id} className="flex items-center justify-between px-3 py-2 opacity-50">
                <p className="text-xs font-bold text-slate-500 line-through truncate">{e.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-400">{formatCurrency(e.amount)}</span>
                  <button
                    onClick={() => handleRemove(e.id)}
                    className="p-1 text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EncargosSection;
