import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MonthlyView from './components/MonthlyView';
import Auth from './components/Auth';
import UserProfileModal from './components/UserProfileModal';
import OnboardingModal from './components/OnboardingModal';
import { supabase } from './lib/supabase';

import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { FinanceProvider } from './context/FinanceContext';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [session, setSession] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.display_name) {
        setUserName(session.user.user_metadata.display_name);
      } else if (session) {
        setIsOnboardingOpen(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.display_name) {
        setUserName(session.user.user_metadata.display_name);
      } else if (session) {
        // If logged in but no display name, it's a first-time user
        setIsOnboardingOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-10 text-center font-mono">
        <div className="max-w-md w-full border border-rose-500/50 p-8 rounded-3xl bg-slate-800">
          <h1 className="text-2xl font-black text-rose-500 mb-4">⚙️ CONFIGURACIÓN FALTANTE</h1>
          <p className="text-slate-400 text-sm mb-6">
            La aplicación no puede iniciarse porque faltan las variables de entorno de Supabase en Netlify.
          </p>
          <div className="bg-black/30 p-4 rounded-xl text-left text-[10px] text-slate-500 mb-6">
            <p>VITE_SUPABASE_URL: missing</p>
            <p>VITE_SUPABASE_ANON_KEY: missing</p>
          </div>
          <p className="text-xs text-indigo-400 font-bold">
            Agrégalas en el panel de Netlify y reinicia el despliegue.
          </p>
        </div>
      </div>
    );
  }

  if (!session && !isGuestMode) {
    return (
      <ThemeProvider>
      <Auth onGuestLogin={() => {
          setIsGuestMode(true);
          // Only show onboarding if no local data exists
          const hasData = localStorage.getItem('finanzas_2026_data_v3');
          if (!hasData) {
            setIsOnboardingOpen(true);
          } else {
            setUserName('Invitado');
          }
        }}/>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
      <FinanceProvider userId={session?.user?.id} isGuest={isGuestMode}>
        <ToastProvider>
        <Layout
          currentView={currentView}
          onViewChange={setCurrentView}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onEditProfile={() => setIsProfileModalOpen(true)}
        >
          {currentView === 'dashboard' ? (
            <Dashboard 
                selectedYear={selectedYear} 
                currentMonth={currentMonth} 
                userName={userName}
                onEditName={() => setIsProfileModalOpen(true)}
            />
          ) : (
            <MonthlyView 
                year={selectedYear} 
                monthRelIndex={currentMonth} 
                userName={userName}
            />
          )}
        </Layout>
        
        <UserProfileModal 
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)}
            initialName={userName}
            onNameUpdated={(newName) => {
                setUserName(newName);
                setIsProfileModalOpen(false);
            }}
            onLogout={async () => {
              if (isGuestMode) {
                setIsGuestMode(false);
                setUserName('');
                setSession(null);
                setCurrentView('dashboard'); // Reset view
              } else {
                await supabase.auth.signOut();
                setSession(null);
                setUserName('');
              }
              setIsProfileModalOpen(false);
            }}
        />

        <OnboardingModal 
          isOpen={isOnboardingOpen}
          userId={session?.user?.id}
          isGuest={isGuestMode}
          onComplete={({ name }) => {
            setUserName(name);
            setIsOnboardingOpen(false);
          }}
        />
      </ToastProvider>
      </FinanceProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
