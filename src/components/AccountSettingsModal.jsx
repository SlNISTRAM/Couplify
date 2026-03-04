import React, { useState, useEffect } from 'react';
import { X, Save, Banknote, CreditCard, Wallet, AlertTriangle, Pencil, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../context/ToastContext';
import { ACCOUNTS } from '../utils/constants';

const AccountSettingsModal = ({ isOpen, onClose, accountBalances = {}, currentMonthIndex }) => {
  const { monthsData, updateAccountSettings, accounts, addAccount, deleteAccount, updateAccount, reorderAccount, updateAccountAdjustment, resetMonthCarryover, calculateMonthStats } = useFinance();
  const { showToast } = useToast();
  
  const currentSettings = monthsData[0]?.accountSettings || {};
  const [settings, setSettings] = useState({});
  const [syncValues, setSyncValues] = useState({}); // Stores the "Real Balance" input
  const [isAdding, setIsAdding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'debit', currency: 'PEN', limit: 0, initialBalance: 0, dueDate: '' });

  useEffect(() => {
    if (isOpen) {
      setSettings(prev => {
        const initial = { ...prev };
        let changed = false;
        
        accounts.forEach(acc => {
          if (!initial[acc.id]) {
            initial[acc.id] = {
              name: acc.name,
              initialBalance: currentSettings[acc.id]?.initialBalance || 0,
              limit: currentSettings[acc.id]?.limit || 0,
              dueDate: acc.dueDate || ''
            };
            changed = true;
          }
        });

        return changed || Object.keys(prev).length === 0 ? initial : prev;
      });
    } else {
      setSettings({});
      setSyncValues({});
    }
  }, [isOpen, accounts, currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    Object.entries(settings).forEach(([id, data]) => {
      // Update persistent settings (balance/limit)
      updateAccountSettings(id, {
        initialBalance: parseFloat(data.initialBalance) || 0,
        limit: parseFloat(data.limit) || 0
      });

      // Update account name and dueDate if changed
      const originalAcc = accounts.find(a => a.id === id);
      if (originalAcc) {
        const updates = {};
        if (data.name !== originalAcc.name) updates.name = data.name;
        if (data.dueDate !== originalAcc.dueDate) updates.dueDate = data.dueDate ? parseInt(data.dueDate) : null;
        
        if (Object.keys(updates).length > 0) {
          updateAccount(id, updates);
        }
      }

      // Handle Balance Synchronization (Adjustment)
      if (syncValues[id] !== undefined && syncValues[id] !== '') {
        let realBalance = parseFloat(syncValues[id]);
        
        // If it's a credit card, we treat the input as debt (negative balance)
        if (originalAcc?.type === 'credit') {
          realBalance = -Math.abs(realBalance);
        }

        // Compute ABSOLUTE adjustment:
        // Remove the existing stale adjustment from calculatedBalance to get the base
        // (what the app would show purely from income/expenses, no adjustments).
        // Then set the adjustment to exactly bridge that base to the real balance.
        const existingAdjustment = Number(monthsData[currentMonthIndex]?.accountAdjustments?.[id]) || 0;
        const calculatedBalance = accountBalances[id]?.balance || 0;
        const baseBalance = calculatedBalance - existingAdjustment;
        const absoluteAdjustment = realBalance - baseBalance;
        
        if (currentMonthIndex !== undefined && !isNaN(absoluteAdjustment)) {
          updateAccountAdjustment(currentMonthIndex, id, absoluteAdjustment, false); // false = overwrite, not additive
        }
      }
    });

    setSyncValues({});
    showToast('Configuración guardada', 'success');
    onClose();
  };

  const handleAddAccount = () => {
    if (!newAcc.name) return;
    const accountData = {
      name: newAcc.name,
      type: newAcc.type,
      currency: newAcc.currency,
      icon: newAcc.type === 'credit' ? 'CreditCard' : 'Wallet',
      color: newAcc.type === 'credit' ? 'text-rose-500' : 'text-blue-500'
    };
    addAccount(accountData);
    setNewAcc({ name: '', type: 'debit', currency: 'PEN', limit: 0, initialBalance: 0, dueDate: '' });
    setIsAdding(false);
    showToast('Cuenta añadida', 'success');
  };

  const handleDelete = (id, name) => {
    if (accounts.length <= 1) {
      showToast('Debes tener al menos una cuenta', 'error');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar "${name}"? Los gastos asociados podrían no mostrarse correctamente.`)) {
      deleteAccount(id);
      showToast('Cuenta eliminada', 'info');
    }
  };

  const getIcon = (id) => {
    switch (id) {
      case 'cash': return <Banknote size={20} className="text-emerald-500" />;
      case 'bank': return <Wallet size={20} className="text-blue-500" />;
      default: return <CreditCard size={20} className="text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-scale-in border border-white/20">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Configurar Cuentas</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Saldos iniciales y límites</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                El <strong>Saldo Inicial</strong> es el dinero que ya tenías en la cuenta al comenzar a usar la app. El <strong>Límite</strong> es el cupo total de tus tarjetas de crédito.
              </p>
            </div>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {accounts.map(acc => (
              <div key={acc.id} className={`p-4 rounded-2xl border transition-all relative group ${acc.hidden ? 'bg-slate-100/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre de la Cuenta</label>
                  <div className="flex items-center space-x-2">
                    {/* Reorder Controls */}
                    <div className="flex flex-col -space-y-1">
                      <button 
                        onClick={() => reorderAccount(acc.id, 'up')}
                        disabled={accounts.indexOf(acc) === 0}
                        className={`p-0.5 rounded transition-colors ${accounts.indexOf(acc) === 0 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500'}`}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        onClick={() => reorderAccount(acc.id, 'down')}
                        disabled={accounts.indexOf(acc) === accounts.length - 1}
                        className={`p-0.5 rounded transition-colors ${accounts.indexOf(acc) === accounts.length - 1 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500'}`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateAccount(acc.id, { hidden: !acc.hidden })}
                        className={`p-1.5 rounded-lg transition-all ${acc.hidden ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500'}`}
                        title={acc.hidden ? "Mostrar cuenta" : "Ocultar cuenta"}
                      >
                        {acc.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      
                      {acc.id !== 'cash' && (
                        <button 
                          onClick={() => handleDelete(acc.id, acc.name)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar cuenta"
                        >
                          <AlertTriangle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 transition-all mb-4 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                  <div className="text-slate-400 flex-shrink-0">
                    {getIcon(acc.id)}
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <input 
                      type="text"
                      value={settings[acc.id]?.name || ''}
                      onChange={e => setSettings({
                        ...settings,
                        [acc.id]: { ...settings[acc.id], name: e.target.value }
                      })}
                      className="bg-transparent border-none font-black text-slate-700 dark:text-slate-200 text-sm focus:ring-0 w-full p-1"
                      placeholder="Nombre de la cuenta"
                    />
                    <Pencil size={12} className="text-slate-300 ml-2 flex-shrink-0" />
                  </div>
                </div>
                
                <div className="flex justify-start px-1 mb-4">
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                    {acc.currency || 'PEN'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Saldo Inicial</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">
                        {acc.currency === 'USD' ? '$' : 'S/'}
                      </span>
                      <input 
                        type="number"
                        value={settings[acc.id]?.initialBalance || ''}
                        onChange={e => setSettings({
                          ...settings,
                          [acc.id]: { ...settings[acc.id], initialBalance: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border-none rounded-xl pl-8 p-3 text-sm font-black focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {acc.type === 'credit' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Límite Tarjeta</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">
                            {acc.currency === 'USD' ? '$' : 'S/'}
                          </span>
                          <input 
                            type="number"
                            value={settings[acc.id]?.limit || ''}
                            onChange={e => setSettings({
                              ...settings,
                              [acc.id]: { ...settings[acc.id], limit: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl pl-8 p-3 text-sm font-black focus:ring-2 ring-emerald-500 transition-all dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Día de Pago</label>
                        <div className="relative">
                          <input 
                            type="number"
                            min="1"
                            max="31"
                            value={settings[acc.id]?.dueDate || ''}
                            onChange={e => setSettings({
                              ...settings,
                              [acc.id]: { ...settings[acc.id], dueDate: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-black focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                            placeholder="Ej: 15"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Cada mes</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                      {acc.type === 'credit' ? 'Sincronizar Deuda Actual' : 'Sincronizar Saldo Actual'}
                    </label>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block leading-tight">
                        Actual: {acc.currency === 'USD' ? '$' : 'S/'}{Math.abs(accountBalances[acc.id]?.balance || 0).toFixed(2)}
                        </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{acc.currency === 'USD' ? '$' : 'S/'}</span>
                       <input 
                        type="number"
                        placeholder={acc.type === 'credit' ? "Cuánto debes hoy..." : "Saldo real actual..."}
                        value={syncValues[acc.id] || ''}
                        onChange={e => setSyncValues({...syncValues, [acc.id]: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-none rounded-xl py-2.5 pl-8 pr-3 text-xs font-black focus:ring-2 ring-indigo-500/30 dark:text-white"
                      />
                    </div>
                    {syncValues[acc.id] !== undefined && syncValues[acc.id] !== '' && (
                        <div className="animate-fade-in-right">
                           <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                               (acc.type === 'credit' ? (-Math.abs(parseFloat(syncValues[acc.id])) - (accountBalances[acc.id]?.balance || 0)) : (parseFloat(syncValues[acc.id]) - (accountBalances[acc.id]?.balance || 0))) >= 0 
                               ? 'bg-emerald-100 text-emerald-600' 
                               : 'bg-rose-100 text-rose-600'
                           }`}>
                                Ajuste: { (acc.type === 'credit' ? (-Math.abs(parseFloat(syncValues[acc.id])) - (accountBalances[acc.id]?.balance || 0)) : (parseFloat(syncValues[acc.id]) - (accountBalances[acc.id]?.balance || 0))).toFixed(2)}
                           </div>
                        </div>
                    )}
                  </div>
                  <p className="text-[8px] text-slate-400 mt-2 italic leading-tight">
                    * Esto cuadrará tu {acc.type === 'credit' ? 'deuda' : 'saldo'} con la realidad del banco.
                  </p>
                </div>
              </div>
            ))}

            {/* Fresh Start Section */}
            <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 flex-shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest leading-none mb-1">¿Borrón y cuenta nueva?</h4>
                        <p className="text-[10px] font-medium text-amber-600/70 dark:text-amber-500/60 leading-snug mb-3">
                            Si no usaste la app por días, el "acarreo" puede ser engañoso. Este botón ajusta tu presupuesto para que empieces desde cero hoy.
                        </p>
                        
                        {!showResetConfirm ? (
                             <button 
                                onClick={() => setShowResetConfirm(true)}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center space-x-2 group"
                             >
                                <AlertTriangle size={14} className="group-hover:rotate-12 transition-transform" />
                                <span>Reiniciar Presupuesto Automáticamente</span>
                             </button>
                        ) : (
                            <div className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-300">
                                <button 
                                    onClick={() => {
                                        resetMonthCarryover(currentMonthIndex);
                                        showToast('Presupuesto reiniciado: Acarreo anulado', 'success');
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    Sí, Reiniciar
                                </button>
                                <button 
                                    onClick={() => setShowResetConfirm(false)}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAdding ? (
              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 animate-fade-in">
                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Nueva Cuenta</h4>
                <div className="space-y-4">
                  <input 
                    type="text"
                    placeholder="Nombre (ej: BCP, Interbank...)"
                    value={newAcc.name}
                    onChange={e => setNewAcc({...newAcc, name: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 ring-indigo-500 dark:text-white"
                  />
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setNewAcc({...newAcc, type: 'debit'})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAcc.type === 'debit' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
                    >
                      Débito
                    </button>
                    <button 
                      onClick={() => setNewAcc({...newAcc, type: 'credit'})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAcc.type === 'credit' ? 'bg-rose-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
                    >
                      Crédito
                    </button>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Moneda</label>
                    <div className="flex space-x-2">
                        <button 
                          onClick={() => setNewAcc({...newAcc, currency: 'PEN'})}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAcc.currency === 'PEN' ? 'bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                        >
                          Soles (S/)
                        </button>
                        <button 
                          onClick={() => setNewAcc({...newAcc, currency: 'USD'})}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAcc.currency === 'USD' ? 'bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                        >
                          Dólares ($)
                        </button>
                    </div>
                  </div>
                  {newAcc.type === 'credit' && (
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Día de Pago</label>
                      <input 
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Día (1-31)"
                        value={newAcc.dueDate}
                        onChange={e => setNewAcc({...newAcc, dueDate: e.target.value})}
                        className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 ring-indigo-500 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleAddAccount}
                      className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-500 transition-all"
              >
                + Añadir Nueva Cuenta o Tarjeta
              </button>
            )}
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40 active:scale-[0.98] mt-8 flex items-center justify-center space-x-3 group"
          >
            <Save size={18} className="group-hover:scale-110 transition-transform" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
