import React from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, formatCompactCurrency } from '../utils/helpers';
import { SAVINGS_GOALS } from '../utils/constants';
import { Home, Heart, TrendingUp, Wallet, Shield, Database, Download, Bot, User, PieChart as PieChartIcon, Plane, Target, AlertTriangle } from 'lucide-react';
import GoalTracker from './GoalTracker';
import ExpenseCharts from './ExpenseCharts';
import AiAssistant from './AiAssistant';
import { useState } from 'react';


// Old SavingsThermometer removed in favor of GoalTracker
import { generateFinancialReport } from '../services/pdfExport';
import AccountSettingsModal from './AccountSettingsModal';
import EncargosSection from './EncargosSection';
import TransferModal from './TransferModal';
import { ArrowRightLeft, CreditCard, Banknote, X, Save } from 'lucide-react';

function Dashboard({ selectedYear, currentMonth, userName, onEditName }) {
  const { 
    monthsData,
    getMonthsByYear, 
    getGlobalSavingsStats,
    getExpenseDistribution,
    getMonthlyTrend,
    exportData,
    restoreFinanceData,
    calculateMonthStats,
    updateAccountAdjustment,
    accounts,
    loading,
    error
  } = useFinance();

  console.log('Dashboard render:', { getMonthsByYear, monthsDataLength: monthsData?.length });
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [payingCard, setPayingCard] = useState(null); // The card object being paid
  const [showSourceSelect, setShowSourceSelect] = useState(false);
  
  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-[#0f172a] p-10">
            <div className="app-card p-8 border-rose-500/50 text-center">
                <div className="text-rose-500 mb-4 font-black">❌ ERROR DE CONEXIÓN</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error}</div>
                <p className="text-xs text-slate-400">Asegúrate de haber ejecutado el script SQL en Supabase y que las claves en .env.local sean correctas.</p>
                <button onClick={() => window.location.reload()} className="mt-8 btn-primary px-6 py-2">Reintentar</button>
            </div>
        </div>
    );
  }

  if (loading || !monthsData || monthsData.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-[#0f172a]">
            <div className="text-center text-slate-400 font-bold animate-pulse">
                Cargando tus finanzas...
            </div>
        </div>
    );
  }

  const yearData = getMonthsByYear(selectedYear) || [];
  const globalSavings = getGlobalSavingsStats() || { depa: { saved: 0, target: 1 }, boda: { saved: 0, target: 1 } };
  
  // Custom logic for Dashboard charts: 
  // We'll show the distribution of the ENTIRE year to give a broad view
  const yearDistributionMap = {};
  let totalYearVariable = 0;
  
  yearData.forEach((m, idx) => {
    const mIndex = monthsData.indexOf(m);
    const dist = getExpenseDistribution(mIndex);
    dist.forEach(d => {
        yearDistributionMap[d.name] = (yearDistributionMap[d.name] || 0) + d.value;
        totalYearVariable += d.value;
    });
  });

  const yearDistribution = Object.entries(yearDistributionMap).map(([name, value]) => ({ name, value }));
  const monthlyTrend = getMonthlyTrend(selectedYear);

  // Get current month stats for balances
  const currentMonthGlobalIndex = monthsData.findIndex(m => m.year === selectedYear && m.monthIndex === currentMonth);
  const currentMonthStats = currentMonthGlobalIndex !== -1 ? calculateMonthStats(currentMonthGlobalIndex) : null;
  const accountBalances = currentMonthStats?.accountBalances || {};

  // Logic for Credit Card Due Date Notifications
  const today = new Date();
  const currentDay = today.getDate();
  
  const upcomingPayments = accounts.filter(acc => {
    if (acc.type !== 'credit' || !acc.dueDate) return false;
    const balance = accountBalances[acc.id]?.balance || 0;
    if (balance >= 0) return false; // No debt

    const daysUntil = acc.dueDate - currentDay;
    // Notify if due is within next 3 days or already passed (negative)
    return daysUntil <= 3 && daysUntil >= -2;
  });

  const handleQuickPay = (card, sourceId) => {
    const debtAmount = Math.abs(accountBalances[card.id]?.balance || 0);
    
    // 1. Set Card to 0
    updateAccountAdjustment(currentMonthGlobalIndex, card.id, debtAmount);
    
    // 2. Deduct from source
    updateAccountAdjustment(currentMonthGlobalIndex, sourceId, -debtAmount);
    
    setPayingCard(null);
    setShowSourceSelect(false);
  };




  return (
      <div id="dashboard-content" className="space-y-12">
        {/* Payments Notification Bar */}
        {upcomingPayments.length > 0 && (
          <div className="animate-fade-in-down">
            {upcomingPayments.map(card => {
              const daysUntil = card.dueDate - currentDay;
              const isUrgent = daysUntil <= 1;
              const debt = Math.abs(accountBalances[card.id]?.balance || 0);
              
              return (
                <div key={card.id} className={`p-4 rounded-[24px] border-2 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isUrgent ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isUrgent ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {daysUntil < 0 ? 'Pago Vencido' : daysUntil === 0 ? '¡Hoy vence tu pago!' : `Vence en ${daysUntil} ${daysUntil === 1 ? 'día' : 'días'}`}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-xs font-bold leading-none mt-1">
                        Tarjeta <span className="text-slate-800 dark:text-white font-black">{card.name}</span>: {formatCurrency(debt, card.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {payingCard?.id === card.id ? (
                      <div className="flex items-center space-x-2 animate-scale-in">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">¿De dónde pagas?</span>
                        {accounts.filter(a => a.type !== 'credit').map(source => (
                          <button 
                            key={source.id}
                            onClick={() => handleQuickPay(card, source.id)}
                            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-tight hover:border-emerald-500 hover:text-emerald-500 transition-all text-slate-600 dark:text-slate-300"
                          >
                            {source.name}
                          </button>
                        ))}
                        <button 
                          onClick={() => setPayingCard(null)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setPayingCard(card)}
                        className={`px-6 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${isUrgent ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600' : 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-600'}`}
                      >
                        Ya pagué
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
           <div>
               <div className="flex items-center space-x-4 mb-2">
                   <h2 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
                     Hola, {userName || 'Invitado'} <span className="inline-block animate-wave origin-bottom-right">👋</span>
                   </h2>
                   <button 
                        onClick={onEditName}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-brand-primary transition-colors mt-2 md:mt-4 shadow-sm"
                        title="Editar Perfil"
                   >
                       <User size={16} />
                   </button>
               </div>
               <p className="text-slate-400 dark:text-slate-500 text-lg md:text-2xl font-medium tracking-tight">Evolución de tu plan en {selectedYear}</p>
           </div>
           
            <div className="flex items-center space-x-3">
               <button 
                    onClick={() => setIsAiOpen(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 rounded-3xl text-white font-black text-sm shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
               >
                    <Bot size={18} />
                    <span>Analizar con AI</span>
               </button>

               <div className="flex items-center space-x-2">
                    <button 
                        onClick={exportData}
                        className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 px-4 md:px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400 font-bold text-sm"
                        title="Descargar Backup"
                    >
                        <Database size={18} className="text-indigo-500" />
                        <span className="hidden sm:inline">Backup</span>
                    </button>

                    <label className="cursor-pointer flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 px-4 md:px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400 font-bold text-sm">
                        <Download size={18} className="text-emerald-500 rotate-180" />
                        <span className="hidden sm:inline">Restaurar</span>
                        <input 
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    try {
                                        const imported = JSON.parse(event.target.result);
                                        restoreFinanceData(imported);
                                    } catch (err) {
                                        console.error("Error al importar backup:", err);
                                        alert("El archivo no es un backup válido.");
                                    }
                                };
                                reader.readAsText(file);
                                // Reset input
                                e.target.value = '';
                            }}
                        />
                    </label>

                    <button 
                        onClick={() => generateFinancialReport(userName, selectedYear, yearData, globalSavings, yearDistribution, monthlyTrend)}
                        className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 px-4 md:px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400 font-bold text-sm no-print"
                        title="Generar Informe Financiero"
                    >
                        <Plane size={18} className="text-rose-500" />
                        <span className="hidden sm:inline">Informe</span>
                    </button>
               </div>
            </div>
      </header>

      <AiAssistant 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        currentYear={selectedYear}
        currentMonthIndex={currentMonth}
        userName={userName}
      />

      {/* Account Balances Section */}
      <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 text-white min-w-8 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-black text-xs"><Wallet size={16} /></div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Saldos por Cuenta (Efectivo/Bancos)</h3>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsTransferOpen(true)}
                  className="flex items-center space-x-1 text-[10px] font-black text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/10 whitespace-nowrap flex-shrink-0"
                >
                  <ArrowRightLeft size={14} />
                  <span>Transferencia</span>
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Configurar Cuentas
                </button>
              </div>
          </div>
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar snap-x snap-mandatory">
              {Object.entries(accountBalances).map(([id, data]) => {
                  const isCredit = data.type === 'credit';
                  const isNegative = data.balance < 0;
                  
                  return (
                    <div key={id} className={`app-card p-5 border-l-4 ${isNegative ? 'border-l-rose-500' : 'border-l-emerald-500'} hover:scale-[1.02] transition-transform w-[280px] sm:w-[320px] lg:w-full flex-shrink-0 snap-center`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.name}</span>
                            <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {id === 'cash' ? <Banknote size={14} /> : id === 'bank' ? <Wallet size={14} /> : <CreditCard size={14} />}
                            </div>
                        </div>

                        {isCredit ? (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Deuda Actual</p>
                                <p className={`text-2xl font-black tracking-tight ${isNegative ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                                    {formatCurrency(Math.abs(data.balance), data.currency)}
                                </p>
                                <div className="pt-2 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Disponible</p>
                                        <p className="text-sm font-black text-emerald-500">{formatCurrency(data.available, data.currency)}</p>
                                    </div>
                                    {accounts.find(a => a.id === id)?.dueDate && (
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Paga el día</p>
                                            <p className="text-[11px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-2 rounded-lg leading-tight uppercase">
                                                {accounts.find(a => a.id === id)?.dueDate}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                                    {formatCurrency(data.balance, data.currency)}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight text-nowrap">Gastado este mes</span>
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 ml-1">{formatCurrency(data.spent, data.currency)}</span>
                        </div>
                    </div>
                  );
              })}
          </div>
      </section>

      <GoalTracker stats={globalSavings} />

      {/* Account Settings Modal */}
      <AccountSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        accountBalances={accountBalances}
        currentMonthIndex={currentMonthGlobalIndex}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        currentMonthIndex={currentMonthGlobalIndex}
        accountBalances={accountBalances}
      />

      {/* Encargos Section */}
      <EncargosSection
        currentMonthIndex={currentMonthGlobalIndex}
        encargos={currentMonthGlobalIndex !== -1 ? (monthsData[currentMonthGlobalIndex]?.encargos || []) : []}
        stats={currentMonthStats}
      />

      {/* Expense Analysis Section */}
      <section>
          <div className="flex items-center mb-6 space-x-3">
              <div className="bg-fuchsia-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"><PieChartIcon size={16} /></div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Análisis Anual</h3>
          </div>
          <ExpenseCharts 
            distribution={yearDistribution} 
            trend={monthlyTrend} 
            totalSpent={totalYearVariable} 
            title="Distribución Anual"
            subLabel="A dónde se fue el dinero en todo el año"
          />
      </section>



      {/* Annual Stats Grid - Minimalist Modern */}
      <div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center tracking-tight">
                <TrendingUp className="mr-3 text-brand-primary" />
                Resumen {selectedYear}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
                <div className="app-card p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-brand-accent/10 text-brand-accent rounded-2xl mb-1 shadow-sm">
                        <Wallet size={28} />
                    </div>
                    <h3 className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">Ingresos</h3>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {formatCompactCurrency(yearData.reduce((sum, m) => {
                            const baseRealized = m.incomeStatus?.base ? m.income.base : 0;
                            const bonusRealized = m.incomeStatus?.bonus ? m.income.bonus : 0;
                            const extraRealized = (m.additionalIncomes || []).reduce((s, i) => 
                                s + (i.received ? Number(i.amount) : 0), 0);
                            return sum + baseRealized + bonusRealized + extraRealized;
                        }, 0))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Proyectado: {formatCompactCurrency(yearData.reduce((sum, m) => {
                            const extra = (m.additionalIncomes || []).reduce((s, i) => s + Number(i.amount), 0);
                            return sum + m.income.base + m.income.bonus + extra;
                        }, 0))}
                    </p>
                </div>
                
                <div className="app-card p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-brand-secondary/10 text-brand-secondary rounded-2xl mb-1 shadow-sm">
                        <Shield size={28} />
                    </div>
                    <h3 className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">Ahorros</h3>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {formatCompactCurrency(yearData.reduce((sum, m) => {
                            const detail = m.savingsPayments;
                            const realized = 
                                (Number(detail?.depa?.userPaid || 0) + Number(detail?.depa?.partnerPaid || 0)) +
                                (Number(detail?.boda?.userPaid || 0) + Number(detail?.boda?.partnerPaid || 0));
                            return sum + realized;
                        }, 0))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Meta: {formatCompactCurrency(yearData.reduce((sum, m) => sum + Number(m.savings.depa) + Number(m.savings.boda), 0))}
                    </p>
                </div>

                <div className="app-card col-span-2 md:col-span-1 p-6 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-brand-warning/10 text-brand-warning rounded-2xl mb-1 shadow-sm">
                        <TrendingUp size={28} />
                    </div>
                    <h3 className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">Gastos Fijos</h3>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {formatCompactCurrency(yearData.reduce((sum, m) => sum + Object.values(m.payments || {}).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0), 0))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Presupuestado: {formatCompactCurrency(yearData.reduce((sum, m) => sum + (m.fixedExpenses || []).reduce((s, e) => s + e.amount, 0), 0))}
                    </p>
                </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
