import React, { useState } from 'react';
import { X, ArrowRightLeft, Send, Wallet, Banknote, CreditCard, Save } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/helpers';

const TransferModal = ({ isOpen, onClose, currentMonthIndex, accountBalances }) => {
  const { accounts, updateAccountAdjustment } = useFinance();
  const { showToast } = useToast();

  const [transfer, setTransfer] = useState({
    fromId: '',
    toId: '',
    amount: '',
    description: ''
  });

  if (!isOpen) return null;

  const debitAccounts = accounts.filter(acc => acc.type !== 'credit');
  
  const handleTransfer = (e) => {
    e.preventDefault();
    const amount = parseFloat(transfer.amount);
    
    if (!transfer.fromId || !transfer.toId || !amount || amount <= 0) {
      showToast('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    if (transfer.fromId === transfer.toId) {
      showToast('No puedes transferir a la misma cuenta', 'error');
      return;
    }

    const fromAcc = accounts.find(a => a.id === transfer.fromId);
    const toAcc = accounts.find(a => a.id === transfer.toId);

    // 1. Decrease source
    updateAccountAdjustment(currentMonthIndex, transfer.fromId, -amount, true);
    
    // 2. Increase destination
    updateAccountAdjustment(currentMonthIndex, transfer.toId, amount, true);

    showToast(`Transferido: ${formatCurrency(amount, fromAcc.currency)} de ${fromAcc.name} a ${toAcc.name}`, 'success');
    
    setTransfer({ fromId: '', toId: '', amount: '', description: '' });
    onClose();
  };

  const getAccountIcon = (id) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return <Wallet size={18} />;
    switch (acc.id) {
      case 'cash': return <Banknote size={18} />;
      case 'bank': return <Wallet size={18} />;
      default: return <CreditCard size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-scale-in border border-white/20">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                <ArrowRightLeft size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Transferencia</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mueve dinero entre tus cuentas</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleTransfer} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* FROM */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Desde (Origen)</label>
                <div className="grid grid-cols-2 gap-2">
                  {accounts.map(acc => (
                    <button
                      key={`from-${acc.id}`}
                      type="button"
                      onClick={() => setTransfer({...transfer, fromId: acc.id})}
                      className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                        transfer.fromId === acc.id 
                          ? 'border-brand-primary bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="shrink-0 opacity-70">{getAccountIcon(acc.id)}</span>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black truncate leading-tight uppercase">{acc.name}</p>
                        <p className="text-[8px] font-bold opacity-60">{formatCurrency(accountBalances[acc.id]?.balance || 0, acc.currency)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ARROW ICON */}
              <div className="flex justify-center -my-2 opacity-30">
                <ArrowRightLeft className="rotate-90 text-slate-400" size={20} />
              </div>

              {/* TO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Hacia (Destino)</label>
                <div className="grid grid-cols-2 gap-2">
                  {accounts.map(acc => (
                    <button
                      key={`to-${acc.id}`}
                      type="button"
                      onClick={() => setTransfer({...transfer, toId: acc.id})}
                      disabled={transfer.fromId === acc.id}
                      className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                        transfer.fromId === acc.id ? 'opacity-40 grayscale pointer-events-none' : ''
                      } ${
                        transfer.toId === acc.id 
                          ? 'border-brand-secondary bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="shrink-0 opacity-70">{getAccountIcon(acc.id)}</span>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black truncate leading-tight uppercase">{acc.name}</p>
                        <p className="text-[8px] font-bold opacity-60">{formatCurrency(accountBalances[acc.id]?.balance || 0, acc.currency)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Monto a Transferir</label>
              <div className="glass-input flex items-center px-4 p-4 w-full focus-within:ring-2 ring-brand-primary/50 transition-all">
                <span className="text-slate-400 font-black mr-2 select-none">S/</span>
                <input 
                  type="number"
                  step="0.01"
                  value={transfer.amount}
                  onChange={e => setTransfer({...transfer, amount: e.target.value})}
                  className="bg-transparent border-none p-0 text-xl font-black focus:ring-0 w-full dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!transfer.fromId || !transfer.toId || !transfer.amount}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center space-x-3"
            >
              <ArrowRightLeft size={18} />
              <span>Ejecutar Transferencia</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
