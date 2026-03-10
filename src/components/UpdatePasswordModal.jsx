import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Save, X, ShieldCheck } from 'lucide-react';
import { useToast } from '../hooks/useContexts';

const UpdatePasswordModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      showToast('¡Contraseña actualizada con éxito!', 'success');
      onClose();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl border border-white/20 dark:border-slate-700 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Nueva Contraseña</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asegura tu cuenta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="glass-input w-full pl-12 h-14"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Repite tu contraseña"
                  className="glass-input w-full pl-12 h-14"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-14 flex items-center justify-center space-x-2 text-lg active:scale-95 disabled:opacity-50 transition-all font-black mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} />
                <span>Actualizar y Entrar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
