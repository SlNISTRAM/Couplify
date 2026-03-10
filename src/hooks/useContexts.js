import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext.js';
import { ThemeContext } from '../context/ThemeContext.js';
import { ToastContext } from '../context/ToastContext.js';

export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
