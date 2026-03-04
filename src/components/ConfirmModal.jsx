import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "danger" }) => {
  if (!isOpen) return null;
  // Use Portal for Modals too
  if (typeof document === 'undefined') return null;

  const themes = {
    danger: {
      icon: <AlertTriangle className="text-rose-500" size={24} />,
      button: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
      accent: "border-rose-100 bg-rose-50/50"
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      accent: "border-amber-100 bg-amber-50/50"
    },
    info: {
      icon: <AlertTriangle className="text-indigo-500" size={24} />,
      button: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20",
      accent: "border-indigo-100 bg-indigo-50/50"
    }
  };

  const theme = themes[type] || themes.danger;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 animate-fade-in"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-scale-in border border-white/20">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${theme.accent} border`}>
              {theme.icon}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
          
          <div className="mt-8 flex flex-col space-y-3">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full py-4 rounded-2xl text-white font-black text-sm transition-all active:scale-95 shadow-lg ${theme.button}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
