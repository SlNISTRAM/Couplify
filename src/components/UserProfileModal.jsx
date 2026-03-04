import React, { useState, useEffect } from 'react';
import { User, Check, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const UserProfileModal = ({ isOpen, onClose, initialName = '', onNameUpdated, onLogout }) => {
    const [name, setName] = useState(initialName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase.auth.updateUser({
                data: { display_name: name.trim() }
            });

            if (updateError) throw updateError;

            if (onNameUpdated) {
                onNameUpdated(name.trim());
            }
            onClose();
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("No se pudo guardar el nombre. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={initialName ? onClose : undefined} />
            
            {/* Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in-up border border-white/20 dark:border-slate-800">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-brand-primary/10 text-brand-primary rounded-3xl mb-4 shadow-sm">
                            <User size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            {initialName ? 'Editar Perfil' : '¡Bienvenido!'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
                            {initialName 
                                ? 'Cambia tu nombre de visualización abajo.' 
                                : '¿Cómo te gustaría que te llamemos?'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tu Nombre</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Ej: Teffen, Juan, Maria..."
                                    className="glass-input w-full pl-12 h-14"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-rose-500 text-xs font-bold text-center animate-shake">{error}</p>
                        )}

                        <div className="flex space-x-3 mt-8">
                            {initialName && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="flex-[2] btn-primary h-14 flex items-center justify-center space-x-2 text-lg active:scale-95 disabled:opacity-50 transition-all font-black"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        <span>Confirmar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tus datos están seguros</span>
                    </div>
                    
                    <button
                        onClick={onLogout}
                        className="text-xs font-bold text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors uppercase tracking-widest"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
