import React, { createContext, useContext, useMemo } from 'react';
import { useData2026 } from '../hooks/useData2026';

const FinanceContext = createContext();

export const FinanceProvider = ({ children, userId, isGuest = false }) => {
  const financeData = useData2026(userId, isGuest);

  // We expose the same interface as useFinance would, but shared
  const value = useMemo(() => ({
    ...financeData,
    saveStatus: financeData.saveStatus
  }), [financeData]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
};
