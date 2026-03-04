import React, { createContext, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', action = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, action }]);

    // Auto remove after 5 seconds if there's an action, else 3 seconds
    const duration = action ? 6000 : 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      {/* Toast Container - Rendered via Portal to ensure it's always on top of everything */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed top-4 right-4 left-4 md:left-auto md:max-w-md z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
            <div
                key={toast.id}
                className={`
                pointer-events-auto flex items-center p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transform transition-all duration-300 animate-slide-in-right
                ${toast.type === 'success' ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200' : ''}
                ${toast.type === 'error' ? 'bg-white/95 dark:bg-slate-900/95 border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-200' : ''}
                ${toast.type === 'info' ? 'bg-white/95 dark:bg-slate-900/95 border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-200' : ''}
                `}
            >
                <div className={`mr-3 p-2 rounded-xl flex-shrink-0 ${
                    toast.type === 'success' ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600' :
                    toast.type === 'error' ? 'bg-rose-100/50 dark:bg-rose-900/30 text-rose-600' :
                    'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600'
                }`}>
                    {toast.type === 'success' && <CheckCircle size={18} />}
                    {toast.type === 'error' && <AlertCircle size={18} />}
                    {toast.type === 'info' && <Info size={18} />}
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm tracking-tight break-words">{toast.message}</p>
                    {toast.action && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                toast.action.onClick();
                                removeToast(toast.id);
                            }}
                            className="mt-2 px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-dark transition-colors"
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        removeToast(toast.id);
                    }}
                    className="ml-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 transition-colors flex-shrink-0"
                >
                    <X size={14} />
                </button>
            </div>
            ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
