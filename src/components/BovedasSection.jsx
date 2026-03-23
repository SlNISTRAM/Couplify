import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { Shield, PiggyBank } from 'lucide-react';

const BovedasSection = ({ accountBalances = {}, onAccountClick }) => {
  const vaults = Object.entries(accountBalances).filter(([, data]) => data.type === 'vault');

  if (vaults.length === 0) return null;

  const totalSaved = vaults.reduce((sum, [, data]) => sum + data.balance, 0);

  return (
    <section className="mb-0 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 text-white min-w-8 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-purple-600/20">
            <Shield size={16} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">Mis Ahorros Protegidos</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bóvedas Intocables</p>
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-center space-x-2">
            <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-tight">Total</span>
            <span className="text-sm font-black text-purple-700 dark:text-purple-400">{formatCurrency(totalSaved)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {vaults.map(([id, data]) => (
          <div 
            key={id} 
            onClick={() => onAccountClick && onAccountClick(id)}
            className="app-card p-5 border-l-4 border-l-purple-500 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{data.name}</span>
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500">
                <PiggyBank size={14} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                {formatCurrency(data.balance, data.currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BovedasSection;
