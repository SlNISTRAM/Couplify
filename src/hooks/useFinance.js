import { useFinanceContext } from '../hooks/useContexts';
import { ACCOUNTS } from '../utils/constants';

export const useFinance = () => {
  const { data: monthsData, updateMonthData, exportData, restoreFinanceData, loading, error } = useFinanceContext();
  
  // Dynamic Accounts stored in the first month metadata
  const accounts = monthsData[0]?.accounts || ACCOUNTS;

  const addAccount = (newAccount) => {
    updateMonthData(0, (month) => ({
      ...month,
      accounts: [...(month.accounts || ACCOUNTS), { 
        ...newAccount, 
        id: `acc-${Date.now()}`, 
        currency: newAccount.currency || 'PEN',
        dueDate: newAccount.dueDate || null // Day of month (1-31)
      }]
    }));
  };

  const deleteAccount = (accountId) => {
    updateMonthData(0, (month) => ({
      ...month,
      accounts: (month.accounts || ACCOUNTS).filter(a => a.id !== accountId)
        .map((a, idx) => ({ ...a, order: idx })) // Re-normalize order after deletion
    }));
  };

  const reorderAccount = (accountId, direction) => {
    updateMonthData(0, (month) => {
      const currentAccounts = [...(month.accounts || ACCOUNTS)];
      const index = currentAccounts.findIndex(a => a.id === accountId);
      if (index === -1) return month;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= currentAccounts.length) return month;

      // Swap
      const temp = currentAccounts[index];
      currentAccounts[index] = currentAccounts[newIndex];
      currentAccounts[newIndex] = temp;

      // Update order property for persistence if needed, though index is usually enough
      const updatedAccounts = currentAccounts.map((a, idx) => ({ ...a, order: idx }));

      return {
        ...month,
        accounts: updatedAccounts
      };
    });
  };

  const updateAccount = (accountId, updatedData) => {
    updateMonthData(0, (month) => ({
      ...month,
      accounts: (month.accounts || ACCOUNTS).map(a => 
        a.id === accountId ? { ...a, ...updatedData } : a
      )
    }));
  };
  
  const getAvailableYears = () => [...new Set(monthsData.map(m => m.year))];
  
  const getMonthsByYear = (year) => monthsData.filter(m => m.year === year);

  const addVariableExpense = (monthIndex, expense) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      variableExpenses: [...month.variableExpenses, { ...expense, id: Date.now(), accountId: expense.accountId || 'cash' }]
    }));
  };

  const removeVariableExpense = (monthIndex, expenseId) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      variableExpenses: month.variableExpenses.filter(e => e.id !== expenseId)
    }));
  };

  const updateVariableExpense = (monthIndex, expenseId, updatedData) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      variableExpenses: month.variableExpenses.map(e => 
        e.id === expenseId ? { ...e, ...updatedData } : e
      )
    }));
  };

  const updateFixedPayment = (monthIndex, expenseId, paidAmount, date = null) => {
    updateMonthData(monthIndex, (month) => {
      const targetExpense = month.fixedExpenses.find(e => e.id === expenseId);
      const isCompleted = paidAmount >= targetExpense.amount;
      
      // Preserve existing date if not provided, or set current if newly paid
      const currentPayment = month.payments?.[expenseId] || {};
      const finalDate = date || currentPayment.date || (paidAmount > 0 ? new Date().toISOString() : null);

      return {
        ...month,
        payments: {
          ...month.payments,
          [expenseId]: { amountPaid: paidAmount, completed: isCompleted, date: finalDate }
        }
      };
    });
  };

  const updateIncomeStatus = (monthIndex, type, status) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      incomeStatus: {
        ...month.incomeStatus,
        [type]: status
      }
    }));
  };

  const updateIncomeMetadata = (monthIndex, type, amount) => {
      updateMonthData(monthIndex, (month) => ({
          ...month,
          income: {
              ...month.income,
              [type]: amount
          }
      }));
  };

  const addAdditionalIncome = (monthIndex, income) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      additionalIncomes: [...(month.additionalIncomes || []), { ...income, id: Date.now() }]
    }));
  };

  const removeAdditionalIncome = (monthIndex, incomeId) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      additionalIncomes: (month.additionalIncomes || []).filter(i => i.id !== incomeId)
    }));
  };

  const updateAdditionalIncome = (monthIndex, incomeId, status) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      additionalIncomes: (month.additionalIncomes || []).map(i => 
        i.id === incomeId ? { ...i, completed: status } : i
      )
    }));
  };

  const updateSavingsPayment = (monthIndex, goalKey, type, amount) => {
    updateMonthData(monthIndex, (month) => {
      const goalMeta = (month.goalMetadata || monthsData[0]?.goalMetadata || {})[goalKey];
      const currentPayments = month.savingsPayments?.[goalKey] || { userPaid: 0, partnerPaid: 0, completed: false };
      
      const newPayments = {
        ...currentPayments,
        [`${type}Paid`]: amount
      };

      // Recalculate completion
      const userGoal = Number(month.savings?.[goalKey] || 0);
      const partnerGoal = month.savings?.[`${goalKey}_partner`] !== undefined ? Number(month.savings[`${goalKey}_partner`]) : userGoal;
      const totalGoal = goalMeta?.isShared === false ? userGoal : userGoal + partnerGoal;
      
      newPayments.completed = (newPayments.userPaid + newPayments.partnerPaid) >= totalGoal;

      return {
        ...month,
        savingsPayments: {
          ...month.savingsPayments,
          [goalKey]: newPayments
        }
      };
    });
  };

  const updateSavingsGoal = (monthIndex, goalKey, amount, isPartner = false) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      savings: {
        ...month.savings,
        [isPartner ? `${goalKey}_partner` : goalKey]: amount
      }
    }));
  };

  const updateGoalMetadata = (goalKey, updatedMeta) => {
    updateMonthData(0, (month) => ({
      ...month,
      goalMetadata: {
        ...(month.goalMetadata || {}),
        [goalKey]: { 
          ...(month.goalMetadata?.[goalKey] || {}), 
          ...updatedMeta 
        }
      }
    }));
  };

  const addGoal = (newGoal) => {
    const goalId = `goal-${Date.now()}`;
    updateMonthData(0, (month) => ({
      ...month,
      goalMetadata: {
        ...(month.goalMetadata || {}),
        [goalId]: {
          ...newGoal,
          target: Number(newGoal.target) || 0,
          isLocked: false
        }
      }
    }));
  };

  const deleteGoal = (goalKey) => {
    updateMonthData(0, (month) => {
      const newMetadata = { ...(month.goalMetadata || {}) };
      delete newMetadata[goalKey];
      return {
        ...month,
        goalMetadata: newMetadata
      };
    });
  };

  const updateAccountAdjustment = (monthIndex, accountId, amount, isRelative = false) => {
    updateMonthData(monthIndex, (month) => {
      const currentAdjustments = month.accountAdjustments || {};
      const currentVal = currentAdjustments[accountId] || 0;
      return {
        ...month,
        accountAdjustments: {
          ...currentAdjustments,
          [accountId]: isRelative ? currentVal + amount : amount
        }
      };
    });
  };

  const calculateMonthStats = (globalMonthIndex) => {
    if (monthsData.length === 0) return null;
    const monthData = monthsData[globalMonthIndex];
    if (!monthData) return null;

    // 1. Income
    const totalIncomeRealized = (monthData.incomeStatus.base ? monthData.income.base : 0) +
                                (monthData.incomeStatus.bonus ? monthData.income.bonus : 0) +
                                (monthData.additionalIncomes || []).reduce((sum, i) => sum + (i.completed ? i.amount : 0), 0);

    // 2. Fixed Expenses
    const totalFixedPlanned = (monthData.fixedExpenses || []).reduce((sum, e) => sum + e.amount, 0);
    const totalFixedPaid = (monthData.fixedExpenses || []).reduce((sum, e) => {
        const p = monthData.payments?.[e.id];
        return sum + (p?.amountPaid || 0);
    }, 0);

    // 3. Savings (Meta 1, etc.)
    const userSavingsRealized = Object.keys(monthData.savingsPayments || {}).reduce((sum, key) => sum + (monthData.savingsPayments[key].userPaid || 0), 0);
    const partnerSavingsRealized = Object.keys(monthData.savingsPayments || {}).reduce((sum, key) => sum + (monthData.savingsPayments[key].partnerPaid || 0), 0);

    // 4. Carry Over
    let previousCarryOver = 0;
    if (globalMonthIndex > 0) {
      const prevStats = calculateMonthStats(globalMonthIndex - 1);
      previousCarryOver = prevStats.availableReal;
    }
    const effectiveCarryOver = Math.max(0, previousCarryOver);

    // 5. Variable
    const totalVariable = (monthData.variableExpenses || []).reduce((sum, e) => sum + e.amount, 0);
    
    // Dynamic Budget: What's actually available to be spent as variable expenses
    // Formula: (Realized Income + CarryOver) - (Realized Savings + Paid Fixed)
    const budgetBasis = totalIncomeRealized + effectiveCarryOver - userSavingsRealized - totalFixedPaid;
    const variableBudget = Math.max(0, budgetBasis);
    
    const daysInMonth = new Date(monthData.year, monthData.monthIndex + 1, 0).getDate();
    const dailyBudget = variableBudget / daysInMonth;

    // 6. Encargos & Loans (Simplified for summary)
    const totalPendingEncargos = (monthData.encargos || []).filter(e => !e.completed).reduce((sum, e) => sum + e.amount, 0);
    const totalPendingPrestamosRecibidos = (monthData.prestamosRecibidos || []).filter(p => !p.completed).reduce((sum, p) => sum + (p.amount - p.paid), 0);
    const totalPendingPrestamosOtorgados = (monthData.prestamosOtorgados || []).filter(p => !p.completed).reduce((sum, p) => sum + (p.amount - p.recovered), 0);

    // 7. Account Balances
    const accountSettings = monthsData[0]?.accountSettings || {};
    const accountBalances = {};
    
    accounts.forEach(acc => {
      const settings = accountSettings[acc.id] || { initialBalance: 0 };
      let balance = Number(settings.initialBalance) || 0;
      
      // Aggregate all changes up to this month
      for (let m = 0; m <= globalMonthIndex; m++) {
        const mData = monthsData[m];
        // 1. Adjustments
        balance += (mData.accountAdjustments?.[acc.id] || 0);
        
        // 2. Variable Expenses
        mData.variableExpenses?.filter(e => e.accountId === acc.id).forEach(e => balance -= e.amount);
        
        // 3. Fixed Payments (If explicitly linked, but here they are global. Let's assume cash for now if not specified)
        // For simplicity in this logic, only variable expenses and adjustments affect balances.
      }
      
      accountBalances[acc.id] = {
        ...acc,
        balance,
        limit: settings.limit || 0
      };
    });

    const availableReal = variableBudget - totalVariable;

    return {
      availableReal,
      monthlyNet: totalIncomeRealized + effectiveCarryOver - userSavingsRealized - totalFixedPaid - totalVariable - totalPendingEncargos - totalPendingPrestamosOtorgados,
      totalPendingEncargos,
      totalPendingPrestamosRecibidos,
      totalPendingPrestamosOtorgados,
      carryOver: effectiveCarryOver,
      totalIncome: totalIncomeRealized,
      totalFixed: totalFixedPlanned,
      totalFixedPaid,
      totalSavings: userSavingsRealized + partnerSavingsRealized,
      totalVariable,
      variableBudget,
      dailyBudget,
      accountBalances
    };
  };

  const getGlobalSavingsStats = () => {
    const metadata = monthsData[0]?.goalMetadata || {
        goal1: { name: "Meta 1", icon: "Target", color: "from-blue-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600", target: 0, isLocked: false }
    };

    const stats = {};
    const monthlyTotals = {};
    Object.keys(metadata).forEach(key => {
        stats[key] = { ...metadata[key], saved: 0, target: Number(metadata[key].target) || 0, avgMonthly: 0 };
        monthlyTotals[key] = 0;
    });

    let monthsWithContributions = 0;

    monthsData.forEach(m => {
        let monthHasSavings = false;
        if (m.savingsPayments) {
            Object.keys(metadata).forEach(key => {
                const paid = (Number(m.savingsPayments[key]?.userPaid || 0) + Number(m.savingsPayments[key]?.partnerPaid || 0));
                if (stats[key]) {
                  stats[key].saved += paid;
                  if (paid > 0) {
                      monthHasSavings = true;
                      monthlyTotals[key] += paid;
                  }
                }
            });
            if (monthHasSavings) monthsWithContributions++;
        }
    });

    Object.keys(metadata).forEach(key => {
        stats[key].avgMonthly = monthsWithContributions > 0 ? monthlyTotals[key] / monthsWithContributions : 0;
    });

    return stats;
  };

  const restoreFixedExpense = (monthIndex, expenseId) => {
      updateMonthData(monthIndex, (month) => ({
          ...month,
          fixedExpenses: month.fixedExpenses.map(e => 
              e.id === expenseId ? { ...e, deleted: false } : e
          )
      }));
  };

  const moveFixedExpense = (monthIndex, expenseId, direction) => {
      updateMonthData(monthIndex, (month) => {
          const newExpenses = [...month.fixedExpenses];
          const idx = newExpenses.findIndex(e => e.id === expenseId);
          if (idx === -1) return month;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= newExpenses.length) return month;
          
          const temp = newExpenses[idx];
          newExpenses[idx] = newExpenses[targetIdx];
          newExpenses[targetIdx] = temp;
          
          return { ...month, fixedExpenses: newExpenses };
      });
  };

  const updateAccountSettings = (accountId, settings) => {
    updateMonthData(0, (month) => ({
      ...month,
      accountSettings: {
        ...(month.accountSettings || {}),
        [accountId]: { 
          ...(month.accountSettings?.[accountId] || {}), 
          ...settings 
        }
      }
    }));
  };

  const addEncargo = (monthIndex, encargo) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      encargos: [...(month.encargos || []), { ...encargo, id: Date.now(), completed: false }]
    }));
  };

  const completeEncargo = (monthIndex, encargoId, completed) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      encargos: (month.encargos || []).map(e => 
        e.id === encargoId ? { ...e, completed } : e
      )
    }));
  };

  const removeEncargo = (monthIndex, encargoId) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      encargos: (month.encargos || []).filter(e => e.id !== encargoId)
    }));
  };

  const setupInitialAccounts = (accountSettings, globalCurrency = 'PEN') => {
    updateMonthData(0, (month) => {
      // 1. Update account settings (balances/limits)
      const newAccountSettings = {
        ...(month.accountSettings || {}),
        ...accountSettings
      };

      // 2. Update default accounts with the chosen currency
      const newAccounts = (month.accounts || ACCOUNTS).map(acc => ({
        ...acc,
        currency: globalCurrency
      }));

      return {
        ...month,
        accountSettings: newAccountSettings,
        accounts: newAccounts
      };
    });
  };

  const getExpenseDistribution = (monthIndex) => {
    const month = monthsData[monthIndex];
    if (!month) return [];
    
    const dist = {};
    
    // 1. Variable Expenses by Category
    month.variableExpenses?.forEach(e => {
        dist[e.category] = (dist[e.category] || 0) + (Number(e.amount) || 0);
    });
    
    // 2. Total Fixed Payments Realized
    const totalFixed = Object.values(month.payments || {}).reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    if (totalFixed > 0) dist['Gastos Fijos'] = (dist['Gastos Fijos'] || 0) + totalFixed;
    
    // 3. Total Savings Realized
    const totalSaved = Object.values(month.savingsPayments || {}).reduce((sum, p) => 
        sum + (Number(p.userPaid || 0) + Number(p.partnerPaid || 0)), 0);
    if (totalSaved > 0) dist['Ahorro'] = (dist['Ahorro'] || 0) + totalSaved;

    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrend = (year) => {
    const yearMonths = monthsData.filter(m => m.year === year);
    return yearMonths.map(m => {
      const gIndex = monthsData.indexOf(m);
      const stats = calculateMonthStats(gIndex);
      return {
        name: m.name,
        total: (stats?.totalVariable || 0) + (stats?.totalFixedPaid || 0)
      };
    });
  };

  return {
    monthsData,
    loading,
    error,
    accounts,
    addAccount,
    deleteAccount,
    reorderAccount,
    updateAccount,
    getAvailableYears,
    getMonthsByYear,
    getExpenseDistribution,
    getMonthlyTrend,
    addVariableExpense,
    removeVariableExpense,
    updateVariableExpense,
    updateFixedPayment,
    updateIncomeStatus,
    updateIncomeMetadata,
    addAdditionalIncome,
    removeAdditionalIncome,
    updateAdditionalIncome,
    updateSavingsPayment,
    updateSavingsGoal,
    updateGoalMetadata,
    addGoal,
    deleteGoal,
    updateAccountAdjustment,
    calculateMonthStats,
    getGlobalSavingsStats,
    restoreFixedExpense,
    moveFixedExpense,
    updateAccountSettings,
    addEncargo,
    completeEncargo,
    removeEncargo,
    setupInitialAccounts,
    exportData,
    restoreFinanceData
  };
};
