import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

const Auth = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', content: '¡Registro exitoso! Revisa tu email para confirmar.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-[#0f172a] p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo className="h-16 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            Sincronización en la Nube
          </p>
        </div>

        <div className="app-card p-8 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="glass-input w-full pl-12 h-14"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="glass-input w-full pl-12 h-14"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message.content && (
              <div className={`p-4 rounded-2xl text-sm font-bold animate-fade-in ${
                message.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
              }`}>
                {message.content}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-14 flex items-center justify-center space-x-2 text-lg active:scale-95 disabled:opacity-50 transition-all font-black"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                  <span>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              {isRegistering 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate gratis'}
            </button>

            <div className="mt-6">
              <button
                onClick={onGuestLogin}
                className="text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors uppercase tracking-widest"
              >
                Continuar como Invitado
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">
          Tus datos se sincronizarán automáticamente en todos tus dispositivos de forma segura.
        </p>
      </div>
    </div>
  );
};

export default Auth;
