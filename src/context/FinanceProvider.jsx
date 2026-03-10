import React, { useMemo } from 'react';
import { useData2026 } from '../hooks/useData2026';
import { FinanceContext } from './FinanceContext.js';

export const FinanceProvider = ({ children, userId, isGuest = false }) => {
  const financeData = useData2026(userId, isGuest);

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
