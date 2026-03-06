import { LayoutDashboard, Calendar, ChevronDown, Moon, Sun, User, Menu, X as CloseIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useTheme } from '../context/ThemeContext';
import FloatingCalculator from './FloatingCalculator';
import QuickExpenseModal from './QuickExpenseModal';
import Logo from './Logo';
import { Plus } from 'lucide-react';

const Layout = ({ children, currentView, onViewChange, currentMonth, onMonthChange, selectedYear, onYearChange, onEditProfile }) => { // Logo updated
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const { getAvailableYears, getMonthsByYear } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const years = getAvailableYears();
  const months = getMonthsByYear(selectedYear); // Get full month objects for this year
  const currentMonthData = months[currentMonth];

  // Robust body scroll lock for mobile
  useEffect(() => {
    const isLocked = isMobileMenuOpen || isQuickExpenseOpen;
    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen, isQuickExpenseOpen]);
  // We map over the ACTUAL months available in this year data, not just static 12 names
  // This handles 2028 having only 3 months.

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
      {/* Desktop Sidebar - Premium Glassmorphism */}
      <aside className="fixed left-6 top-6 bottom-6 w-72 bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-slate-700/50 hidden lg:flex flex-col p-8 z-40 transition-all">
        <div className="mb-8 flex-shrink-0">
          <Logo />
          <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2"></div>
        </div>

        {/* Scrollable Container for Nav and Controls */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <nav className="space-y-2 px-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-black text-sm uppercase tracking-widest">Dashboard</span>
            </button>

            <button
              onClick={() => {
                const now = new Date();
                onYearChange(now.getFullYear());
                onMonthChange(now.getMonth());
                onViewChange('month');
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                currentView === 'month'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'
              }`}
            >
              <Calendar size={20} />
              <span className="font-black text-sm uppercase tracking-widest">Mensual</span>
            </button>
          </nav>

          <div className="space-y-1 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
             <button 
                  onClick={onEditProfile}
                  className="w-full flex items-center space-x-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-all overflow-hidden whitespace-nowrap"
             >
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                     <User size={16} />
                 </div>
                 <span className="font-black text-[10px] uppercase tracking-[0.2em]">Editar Perfil</span>
             </button>

              <button 
                   onClick={toggleTheme}
                   className="w-full flex items-center space-x-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
             >
                  {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
                  <span className="font-black text-sm uppercase tracking-widest">{isDarkMode ? 'Modo Luz' : 'Modo Oscuro'}</span>
             </button>
             
             <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                 <div className="flex flex-col space-y-3 mb-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Seleccionar Año</h3>
                      <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                          {years.map(year => (
                              <button
                                  key={year}
                                  onClick={() => onYearChange(year)}
                                  className={`px-3 py-2 rounded-lg text-xs font-black transition-all ${selectedYear === year ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                              >
                                  {year}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="pt-1">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Meses</h3>
                      <div className="grid grid-cols-2 gap-2">
                          {months.map((m, idx) => (
                              <button
                                  key={m.id}
                                  onClick={() => {
                                      onMonthChange(idx);
                                      onViewChange('month');
                                  }}
                                  className={`px-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight text-center transition-all duration-300 ${
                                      currentView === 'month' && currentMonth === idx
                                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                                      : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                                  }`}
                              >
                                  {m.name.substring(0, 3)}
                              </button>
                          ))}
                      </div>
                  </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay & Drawer */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div 
          className="absolute inset-0 bg-slate-950/80"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <aside 
          className={`absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-[#1e293b] shadow-2xl transition-transform duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col p-6 rounded-r-[2rem]`}
        >
          <div className="flex justify-between items-center mb-8">
            <Logo className="h-6" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  onViewChange('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${currentView === 'dashboard' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <LayoutDashboard size={20} />
                <span className="font-bold">Dashboard</span>
              </button>
              <button
                onClick={() => {
                   const now = new Date();
                   onYearChange(now.getFullYear());
                   onMonthChange(now.getMonth());
                   onViewChange('month');
                   setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${currentView === 'month' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Calendar size={20} />
                <span className="font-bold">Mensual</span>
              </button>
            </nav>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Configuración</h3>
               <button 
                  onClick={() => { onEditProfile(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center space-x-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
               >
                  <User size={20} />
                  <span className="font-bold">Editar Perfil</span>
               </button>
               <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 mt-2"
               >
                  {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
                  <span className="font-bold">{isDarkMode ? 'Modo Luz' : 'Modo Oscuro'}</span>
               </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Explorar Fechas</h3>
               
               <div className="mb-6">
                  <p className="text-[10px] font-bold text-slate-300 uppercase mb-2 px-2">Año</p>
                  <div className="grid grid-cols-2 gap-2">
                     {years.map(year => (
                        <button
                          key={year}
                          onClick={() => onYearChange(year)}
                          className={`py-2 rounded-xl text-xs font-black transition-all ${selectedYear === year ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                        >
                          {year}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase mb-2 px-2">Mes</p>
                  <div className="grid grid-cols-3 gap-2">
                     {months.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onMonthChange(idx);
                            onViewChange('month');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === 'month' && currentMonth === idx ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                        >
                          {m.name.substring(0, 3)}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="lg:ml-[22rem] p-4 pb-28 md:p-10 md:pb-10 max-w-6xl w-full overflow-x-hidden">
         {/* Mobile Top Bar */}
         <div className="lg:hidden flex items-center justify-between mb-8 pt-4 px-2">
            <div className="flex items-center space-x-4">
               <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-lg border border-slate-100 dark:border-slate-700"
               >
                  <Menu size={24} />
               </button>
               <div>
                  <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                     {currentView === 'dashboard' ? 'Resumen' : (months[currentMonth]?.name || 'Mes')}
                  </h1>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      {currentView === 'dashboard' ? selectedYear : `Detalle ${selectedYear}`}
                   </p>
               </div>
            </div>
         </div>
         
         {children}
      </main>

      {/* Mobile Bottom Tab Bar - Simplified */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] border-t border-slate-200/50 dark:border-slate-800 pb-safe pt-2 px-10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
         <div className="flex justify-between items-center h-20 safe-bottom">
            <button 
               onClick={() => onViewChange('dashboard')}
               className={`flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'dashboard' ? 'text-brand-primary -translate-y-1' : 'text-slate-300'}`}
            >
               <LayoutDashboard size={28} strokeWidth={currentView === 'dashboard' ? 3 : 2} />
               {currentView === 'dashboard' && <div className="w-1 h-1 bg-brand-primary rounded-full mt-1"></div>}
            </button>
            
            <button 
               onClick={() => setIsQuickExpenseOpen(true)}
               className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/40 -translate-y-4 border-4 border-white dark:border-[#1e293b] active:scale-90 transition-transform"
            >
               <Plus size={32} strokeWidth={4} />
            </button>

            <button 
               onClick={() => {
                  const now = new Date();
                  onYearChange(now.getFullYear());
                  onMonthChange(now.getMonth());
                  onViewChange('month');
               }}
               className={`flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'month' ? 'text-brand-primary -translate-y-1' : 'text-slate-300'}`}
            >
               <Calendar size={28} strokeWidth={currentView === 'month' ? 3 : 2} />
               {currentView === 'month' && <div className="w-1 h-1 bg-brand-primary rounded-full mt-1"></div>}
            </button>
         </div>
      </div>

      <FloatingCalculator />
      <QuickExpenseModal 
        isOpen={isQuickExpenseOpen} 
        onClose={() => setIsQuickExpenseOpen(false)}
        monthRelIndex={currentMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
};

export default Layout;
