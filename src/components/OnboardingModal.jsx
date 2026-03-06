import React, { useState } from 'react';
import { 
  User, 
  Coins, 
  Wallet, 
  CreditCard, 
  Banknote, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useFinance } from '../hooks/useFinance';

const OnboardingModal = ({ isOpen, onComplete, userId, isGuest = false }) => {
  const { setupInitialAccounts } = useFinance();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('PEN');
  const [balances, setBalances] = useState({
    cash: '',
    bank: '',
    card1: '',
    card2: ''
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Update Profile (only if NOT guest)
      if (!isGuest) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { display_name: name, onboarding_completed: true }
        });
        if (authError) throw authError;
      }

      // 2. Prepare Account Settings
      const accountSettings = {
        cash: { initialBalance: Number(balances.cash || 0), limit: 0 },
        bank: { initialBalance: Number(balances.bank || 0), limit: 0 },
        card1: { initialBalance: 0, limit: Number(balances.card1 || 0) },
        card2: { initialBalance: 0, limit: Number(balances.card2 || 0) }
      };

      // 3. Save to Finance Data
      setupInitialAccounts(accountSettings);

      // 4. Complete
      onComplete({ name, currency });
    } catch (error) {
      console.error("Onboarding error:", error);
      if (!isGuest) alert("Error al guardar tu perfil. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step < 3 && (step !== 1 || name.trim())) {
      handleNext();
    } else if (step === 3) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-y-auto bg-slate-950/40 backdrop-blur-xl">
      <div className="relative w-full max-w-lg min-h-screen md:min-h-0 bg-white dark:bg-[#1e293b] md:rounded-[3rem] shadow-2xl border-white/20 flex flex-col animate-scale-in">
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
          {/* Header Controls */}
          <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-10">
            {step > 1 ? (
              <button 
                type="button"
                onClick={handleBack}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            ) : <div />}
          </div>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`flex-1 transition-all duration-500 ${s <= step ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}
              />
            ))}
          </div>

          <div className="p-8 md:p-12 pt-20 pb-12 flex-1 flex flex-col">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">¡Bienvenido a Couplify!</h2>
                  <p className="text-slate-400 font-medium mt-2">Personalicemos tu experiencia</p>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">¿Cómo te llamas?</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Tu nombre o apodo"
                      className="glass-input w-full pl-14 h-16 text-lg"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!name.trim()}
                  className="btn-primary w-full h-16 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 transition-all text-lg font-black"
                >
                  <span>Continuar</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <Coins size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Tu moneda base</h2>
                  <p className="text-slate-400 font-medium mt-2">Esta será la moneda de tus balances generales</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'PEN', label: 'Soles', symbol: 'S/', desc: 'Soles Peruanos' },
                    { id: 'USD', label: 'Dólares', symbol: '$', desc: 'Dólares USA' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCurrency(opt.id)}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left ${
                        currency === opt.id 
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        currency === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        <span className="font-black text-sm">{opt.symbol}</span>
                      </div>
                      <p className={`font-black text-sm uppercase tracking-widest ${currency === opt.id ? 'text-indigo-600' : 'text-slate-400'}`}>{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                <button 
                  type="submit"
                  className="btn-primary w-full h-16 flex items-center justify-center space-x-3 active:scale-95 transition-all text-lg font-black"
                >
                  <span>Siguiente Paso</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                    <Wallet size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Cuentas Iniciales</h2>
                  <p className="text-slate-400 font-medium mt-2 text-sm">Configura tus saldos (Opcional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center space-x-2">
                      <Banknote size={12} />
                      <span>Efectivo</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="glass-input w-full h-14"
                      value={balances.cash}
                      onChange={(e) => setBalances({...balances, cash: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center space-x-2">
                      <Wallet size={12} />
                      <span>Banco</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="glass-input w-full h-14"
                      value={balances.bank}
                      onChange={(e) => setBalances({...balances, bank: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center space-x-2">
                      <CreditCard size={12} />
                      <span>Límite Tarjeta 1</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="glass-input w-full h-14"
                      value={balances.card1}
                      onChange={(e) => setBalances({...balances, card1: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center space-x-2">
                      <CreditCard size={12} />
                      <span>Límite Tarjeta 2</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="glass-input w-full h-14"
                      value={balances.card2}
                      onChange={(e) => setBalances({...balances, card2: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-16 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 transition-all text-lg font-black"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>¡Empezar ahora!</span>
                        <CheckCircle2 size={24} />
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors"
                  >
                    Omitir saldos por ahora
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
