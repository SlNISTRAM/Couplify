import { useFinanceContext } from '../context/FinanceContext';
import { getDaysRemaining } from '../utils/helpers';
import { ACCOUNTS } from '../utils/constants';

export const useFinance = () => {
  const { data, updateMonthData, updateAllMonthsData, exportData, restoreFinanceData, loading, error } = useFinanceContext();
  
  // Dynamic Accounts stored in the first month metadata
  const accounts = data[0]?.accounts || ACCOUNTS;

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

  const getMonthData = (globalIndex) => data[globalIndex];

  const getAvailableYears = () => [...new Set(data.map(m => m.year))];
  
  const getMonthsByYear = (year) => data.filter(m => m.year === year);

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
          [expenseId]: { 
            amountPaid: paidAmount, 
            completed: isCompleted,
            date: (isCompleted || paidAmount > 0) ? finalDate : null
          }
        }
      };
    });
  };

  const addFixedExpense = (monthIndex, expense, untilIndex = null) => {
    const newId = `fixed-${Date.now()}`;
    const accountId = expense.accountId || 'bank';
    const newExpense = { ...expense, id: newId, order: Date.now(), accountId };
    
    updateAllMonthsData(prev => prev.map((m, idx) => {
      if (idx < monthIndex) return m;
      if (untilIndex !== null && idx > untilIndex) return m;
      
      return {
        ...m,
        fixedExpenses: [...m.fixedExpenses, newExpense],
        payments: {
          ...m.payments,
          [newId]: { amountPaid: 0, completed: false }
        }
      };
    }));
  };

  const removeFixedExpense = (monthIndex, expenseId, propagate = false) => {
    if (propagate) {
      updateAllMonthsData(prev => prev.map((m, idx) => {
        if (idx < monthIndex) return m;
        const { [expenseId]: _, ...remainingPayments } = m.payments || {};
        return {
          ...m,
          fixedExpenses: m.fixedExpenses.filter(e => e.id !== expenseId),
          payments: remainingPayments
        };
      }));
    } else {
      updateMonthData(monthIndex, (month) => {
        const { [expenseId]: _, ...remainingPayments } = month.payments || {};
        return {
          ...month,
          fixedExpenses: month.fixedExpenses.filter(e => e.id !== expenseId),
          payments: remainingPayments
        };
      });
    }
  };

  const restoreFixedExpense = (monthIndex, expense) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      fixedExpenses: [...month.fixedExpenses, expense],
      payments: {
        ...month.payments,
        [expense.id]: { amountPaid: 0, completed: false }
      }
    }));
  };

  const moveFixedExpense = (expenseId, direction) => {
    // This function will swap orders globally for two items
    updateAllMonthsData(prev => {
      // We need to find the items to swap based on the current sorted state of ANY month
      // (assuming order is consistent across months already)
      // Let's use the first month that has this expense to determine the swap target
      const sampleMonth = prev.find(m => m.fixedExpenses.some(e => e.id === expenseId));
      if (!sampleMonth) return prev;

      const sorted = [...sampleMonth.fixedExpenses].sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = sorted.findIndex(e => e.id === expenseId);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      const currentItem = sorted[currentIndex];
      const targetItem = sorted[targetIndex];

      // Swap their order values
      const currentOrder = currentItem.order || Date.now();
      const targetOrder = targetItem.order || (Date.now() - 1);

      return prev.map(m => ({
        ...m,
        fixedExpenses: m.fixedExpenses.map(e => {
          if (e.id === currentItem.id) return { ...e, order: targetOrder };
          if (e.id === targetItem.id) return { ...e, order: currentOrder };
          return e;
        })
      }));
    });
  };

  const updateFixedExpenseAmount = (monthIndex, expenseId, newAmount, propagate = false) => {
    if (propagate) {
      updateAllMonthsData(prev => prev.map((m, idx) => {
        if (idx < monthIndex) return m;
        return {
          ...m,
          fixedExpenses: m.fixedExpenses.map(e => 
            e.id === expenseId ? { ...e, amount: Number(newAmount) } : e
          )
        };
      }));
    } else {
      updateMonthData(monthIndex, (month) => ({
        ...month,
        fixedExpenses: month.fixedExpenses.map(e => 
          e.id === expenseId ? { ...e, amount: Number(newAmount) } : e
        )
      }));
    }
  };

  const updateFixedExpenseMetadata = (monthIndex, expenseId, updates, propagate = true) => {
    if (propagate) {
      updateAllMonthsData(prev => prev.map((m, idx) => {
        if (idx < monthIndex) return m;
        return {
          ...m,
          fixedExpenses: m.fixedExpenses.map(e => 
            e.id === expenseId ? { ...e, ...updates } : e
          )
        };
      }));
    } else {
      updateMonthData(monthIndex, (month) => ({
        ...month,
        fixedExpenses: month.fixedExpenses.map(e => 
          e.id === expenseId ? { ...e, ...updates } : e
        )
      }));
    }
  };

  const updateGoalMetadata = (goalId, newMetadata) => {
    updateAllMonthsData(prev => prev.map((m, idx) => {
      // We can store it in all months to be safe, or just the first. Let's do all.
      const currentMetadata = m.goalMetadata || {
        depa: { name: "Nueva Meta 1", icon: "Target", color: "from-blue-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600", target: 19200, isLocked: false },
        boda: { name: "Nueva Meta 2", icon: "Star", color: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-600", target: 9600, isLocked: false }
      };
      
      return {
        ...m,
        goalMetadata: {
          ...currentMetadata,
          [goalId]: { ...currentMetadata[goalId], ...newMetadata }
        }
      };
    }));
  };

  const updateAccountSettings = (accountId, settings) => {
    updateMonthData(0, (month) => ({
      ...month,
      accountSettings: {
        ...(month.accountSettings || {}),
        [accountId]: { ...(month.accountSettings?.[accountId] || {}), ...settings }
      }
    }));
  };

  const updateAccountAdjustment = (monthIndex, accountId, adjustmentAmount, additive = true) => {
    updateMonthData(monthIndex, (month) => {
      const currentAdjustments = month.accountAdjustments || {};
      const newAdjustment = additive 
        ? Number(adjustmentAmount) + (Number(currentAdjustments[accountId]) || 0)
        : Number(adjustmentAmount);
      
      return {
        ...month,
        accountAdjustments: {
          ...currentAdjustments,
          [accountId]: newAdjustment
        }
      };
    });
  };

  const resetMonthCarryover = (monthIndex) => {
    const stats = calculateMonthStats(monthIndex);
    if (!stats) return;

    const carryOver = stats.carryOver || 0;
    if (carryOver === 0) return;

    // Store the reset amount separately so calculateMonthStats can zero it out
    // in both the math AND the displayed value.
    updateMonthData(monthIndex, (month) => ({
      ...month,
      carryoverReset: carryOver
    }));
  };

  const updateSavingsAmount = (monthIndex, type, newAmount) => {
    updateMonthData(monthIndex, (month) => {
      // Fork logic: Ensure partner's amount stays static if it depends on user's amount
      const currentPartnerAmount = month.savings[type + '_partner'] !== undefined 
        ? month.savings[type + '_partner'] 
        : month.savings[type];

      return {
        ...month,
        savings: {
          ...month.savings,
          [type]: newAmount,
          [type + '_partner']: currentPartnerAmount // Explicitly save partner Amount
        }
      };
    });
  };

  const updateSavingsGoal = (monthIndex, type, isPartner, newAmount, applyToFuture) => {
    const key = isPartner ? `${type}_partner` : type;

    updateAllMonthsData(prev => prev.map((month, idx) => {
      // Skip previous months
      if (idx < monthIndex) return month;
      
      // Stop if only applying to current month and we passed it
      if (!applyToFuture && idx > monthIndex) return month;

      // Fork logic for User updates (preserve partner amount if it was implicit)
      let additionalUpdates = {};
      if (!isPartner && month.savings[type + '_partner'] === undefined) {
         // If partner amount doesn't exist explicitly, it was defaulting to user amount.
         // We must verify what that default was. 
         // Actually, if we are changing user amount, we want partner amount to stay as it was BEFORE this change?
         // Or stay equal to the NEW user amount?
         // The previous "Decoupling" logic laid out: "currentPartnerAmount = ... || month.savings[type]".
         // So if we change user amount, we "freeze" partner amount to whatever it was (which was equal to old user amount).
         // BUT since we are mapping over future months, we might not know the "old" value easily unless we look at it before modification.
         // Simplified: If partner savings is undefined, set it to the CURRENT (old) user savings of that month before overwriting user savings.
         additionalUpdates[type + '_partner'] = month.savings[type];
      }

      return {
        ...month,
        savings: {
          ...month.savings,
          ...additionalUpdates,
          [key]: newAmount
        }
      };
    }));
  };

  const updateSavingsPayment = (monthIndex, type, field, amount, date = null) => {
    updateMonthData(monthIndex, (month) => {
      const targetGoal = (Number(month.savings[type]) || 0) + (Number(month.savings[type + '_partner'] !== undefined ? month.savings[type + '_partner'] : month.savings[type]) || 0);
      const currentPayments = month.savingsPayments?.[type] || { userPaid: 0, partnerPaid: 0, completed: false };
      
      const updatedPayments = {
        ...currentPayments,
        [field]: Number(amount)
      };

      // Recalculate completion
      const totalPaid = updatedPayments.userPaid + updatedPayments.partnerPaid;
      const isNowCompleted = totalPaid >= targetGoal;
      
      // Date logic: prioritize provided date, preserve old if still completed, or set new if just completed
      if (date) {
        updatedPayments.date = date;
      } else if (isNowCompleted && !currentPayments.completed) {
        updatedPayments.date = new Date().toISOString();
      } else if (!isNowCompleted) {
        updatedPayments.date = null;
      }

      updatedPayments.completed = isNowCompleted;
      
      return {
        ...month,
        savingsPayments: {
          ...month.savingsPayments,
          [type]: updatedPayments
        }
      };
    });
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

  const updateAdditionalIncome = (monthIndex, incomeId, updatedData) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      additionalIncomes: (month.additionalIncomes || []).map(i => 
        i.id === incomeId ? { ...i, ...updatedData } : i
      )
    }));
  };

  const updatePartnerName = (newName) => {
    updateAllMonthsData(prev => prev.map(m => ({
      ...m,
      partnerName: newName
    })));
  };

  const toggleIncomeStatus = (monthIndex, type) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      incomeStatus: {
        ...month.incomeStatus,
        [type]: !month.incomeStatus?.[type]
      }
    }));
  };

  const toggleAdditionalIncomeStatus = (monthIndex, incomeId) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      additionalIncomes: month.additionalIncomes.map(i => 
        i.id === incomeId ? { ...i, received: !i.received } : i
      )
    }));
  };

  const updateBaseIncome = (monthIndex, newAmount) => {
    updateAllMonthsData(prev => prev.map((m, idx) => {
      if (idx < monthIndex) return m;
      return {
        ...m,
        income: { ...m.income, base: Number(newAmount) }
      };
    }));
  };

  const updateBonusIncome = (monthIndex, newAmount) => {
    updateAllMonthsData(prev => prev.map((m, idx) => {
      if (idx < monthIndex) return m;
      return {
        ...m,
        income: { ...m.income, bonus: Number(newAmount) }
      };
    }));
  };

  const updateVariableBudget = (monthIndex, newAmount) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      variableBudget: Number(newAmount)
    }));
  };

  const addInstallmentExpense = (monthIndex, expense, installments) => {
    const monthlyAmount = Number(expense.amount) / Number(installments);
    
    updateAllMonthsData(prev => prev.map((m, idx) => {
      // If the month is current or within the next (installments - 1) months
      if (idx >= monthIndex && idx < monthIndex + Number(installments)) {
        const currentInstallment = idx - monthIndex + 1;
        return {
          ...m,
          variableExpenses: [
            ...m.variableExpenses, 
            { 
              ...expense, 
              amount: monthlyAmount, 
              description: `${expense.description} (Cuota ${currentInstallment}/${installments})`,
              id: `${Date.now()}-${idx}` 
            }
          ]
        };
      }
      return m;
    }));
  };


  const addEncargo = (monthIndex, encargo) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      encargos: [...(month.encargos || []), { 
        ...encargo, 
        id: `enc-${Date.now()}`,
        status: 'pending'
      }]
    }));
  };

  const completeEncargo = (monthIndex, encargoId) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      encargos: (month.encargos || []).map(e =>
        e.id === encargoId ? { ...e, status: 'spent' } : e
      )
    }));
  };

  const removeEncargo = (monthIndex, encargoId) => {
    updateMonthData(monthIndex, (month) => ({
      ...month,
      encargos: (month.encargos || []).filter(e => e.id !== encargoId)
    }));
  };

  const calculateMonthStats = (monthIndex) => {
    const month = data[monthIndex];
    if (!month) return null;

    const settings = data[0]?.accountSettings || {
      cash: { initialBalance: 0, limit: 0 },
      card1: { initialBalance: 0, limit: 2000 },
      card2: { initialBalance: 0, limit: 1000 },
      bank: { initialBalance: 0, limit: 0 }
    };

    // 1. Calculate cumulative balances from month 0 up to monthIndex
    const cumulativeAccountStats = accounts.reduce((acc, account) => {
      acc[account.id] = { balance: Number(settings[account.id]?.initialBalance || 0), spent: 0 };
      return acc;
    }, {});

    let globalCarryOver = 0; // Legacy carryOver logic for compatibility

    for (let i = 0; i <= monthIndex; i++) {
      const m = data[i];
      if (!m) continue;

      // Income (Default to bank for base/bonus, selectable for additional)
      const baseRealized = m.incomeStatus?.base ? m.income.base : 0;
      const bonusRealized = m.incomeStatus?.bonus ? m.income.bonus : 0;
      
      cumulativeAccountStats.bank.balance += (baseRealized + bonusRealized);

      let extraRealizedInMonth = 0;
      (m.additionalIncomes || []).forEach(income => {
        if (income.received) {
          extraRealizedInMonth += Number(income.amount);
          const accountId = income.accountId || 'bank';
          if (cumulativeAccountStats[accountId]) {
            cumulativeAccountStats[accountId].balance += Number(income.amount);
          }
        }
      });
      const totalIncomeRealizedInMonth = baseRealized + bonusRealized + extraRealizedInMonth;

      // Fixed Expenses
      const fixedSpentInMonth = Object.entries(m.payments || {}).reduce((sum, [id, p]) => {
        const exp = m.fixedExpenses.find(e => e.id === id);
        const accountId = exp?.accountId || 'bank';
        const paid = Number(p.amountPaid) || 0;
        
        if (cumulativeAccountStats[accountId]) {
          cumulativeAccountStats[accountId].balance -= paid;
          if (i === monthIndex) cumulativeAccountStats[accountId].spent += paid;
        }
        return sum + paid;
      }, 0);

      // Variable Expenses
      const variableSpentInMonth = m.variableExpenses.reduce((sum, e) => {
        const accountId = e.accountId || 'cash';
        const amount = Number(e.amount) || 0;
        
        if (cumulativeAccountStats[accountId]) {
          cumulativeAccountStats[accountId].balance -= amount;
          if (i === monthIndex) cumulativeAccountStats[accountId].spent += amount;
        }
        return sum + amount;
      }, 0);

      // 1.5 Apply Account Adjustments for this month
      let adjustmentSum = 0;
      Object.entries(m.accountAdjustments || {}).forEach(([id, adj]) => {
        const val = Number(adj) || 0;
        adjustmentSum += val;
        if (cumulativeAccountStats[id]) {
          cumulativeAccountStats[id].balance += val;
        }
      });

      // Savings
      const userSavingsRealizedInMonth = 
        (Number(m.savingsPayments?.depa?.userPaid) || 0) + 
        (Number(m.savingsPayments?.boda?.userPaid) || 0);
      
      cumulativeAccountStats.bank.balance -= userSavingsRealizedInMonth;

      // Legacy CarryOver Calculation (for budget logic)
      if (i < monthIndex) {
        globalCarryOver += (totalIncomeRealizedInMonth + adjustmentSum - userSavingsRealizedInMonth - fixedSpentInMonth - variableSpentInMonth);
      }
    }

    // If the user triggered a "Fresh Start" reset, subtract the stored amount
    const carryoverReset = Number(month.carryoverReset) || 0;
    const effectiveCarryOver = globalCarryOver - carryoverReset;

    // Current Month Metrics (for specific Dashboard parts)
    const extraProjected = (month.additionalIncomes || []).reduce((sum, i) => sum + Number(i.amount), 0);
    const totalIncomeProjected = month.income.base + month.income.bonus + extraProjected;

    const baseRealized = month.incomeStatus?.base ? month.income.base : 0;
    const bonusRealized = month.incomeStatus?.bonus ? month.income.bonus : 0;
    const extraRealized = (month.additionalIncomes || []).reduce((sum, i) => 
        sum + (i.received ? Number(i.amount) : 0), 0);
    const totalIncomeRealized = baseRealized + bonusRealized + extraRealized;
    
    const userSavingsRealized = 
      (Number(month.savingsPayments?.depa?.userPaid) || 0) + 
      (Number(month.savingsPayments?.boda?.userPaid) || 0);

    const partnerSavingsRealized = 
      (Number(month.savingsPayments?.depa?.partnerPaid) || 0) + 
      (Number(month.savingsPayments?.boda?.partnerPaid) || 0);

    const totalFixedPaid = Object.values(month.payments || {}).reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const totalFixedPlanned = (month.fixedExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalVariable = month.variableExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalAdjustments = Object.values(month.accountAdjustments || {}).reduce((sum, adj) => sum + (Number(adj) || 0), 0);

    const userSavingsPlanned = (Number(month.savings?.depa) || 0) + (Number(month.savings?.boda) || 0);

    // Encargos: money that's in the account but belongs to someone else
    const totalPendingEncargos = (month.encargos || []).reduce((sum, e) =>
      e.status === 'pending' ? sum + (Number(e.amount) || 0) : sum, 0
    );

    const variableBudget = Math.max(0, effectiveCarryOver + totalIncomeRealized + totalAdjustments - totalFixedPaid - userSavingsRealized - totalPendingEncargos);
    
    // Account details for UI
    const accountBalances = accounts.reduce((acc, account) => {
      const stats = cumulativeAccountStats[account.id] || { balance: 0, spent: 0 };
      const accountType = account.type || 'debit';
      const limit = Number(settings[account.id]?.limit || 0);

      acc[account.id] = {
        name: account.name,
        type: accountType,
        currency: account.currency || 'PEN',
        balance: stats.balance, // Current net (Total In - Total Out)
        spent: stats.spent,     // Just this month
        limit: limit,
        available: accountType === 'credit' ? Math.max(0, limit + stats.balance) : stats.balance
      };
      return acc;
    }, {});

    // availableReal = sum of debit account balances (includes sync adjustments) - encargos
    // This mirrors what the user actually has in their bank/cash right now.
    const totalDebitBalance = accounts
      .filter(a => (a.type || 'debit') !== 'credit')
      .reduce((sum, a) => {
        return sum + (cumulativeAccountStats[a.id]?.balance || 0);
      }, 0);
    const availableReal = totalDebitBalance - totalPendingEncargos;

    // Daily budget: variable budget / remaining days in the month
    const daysInMonth = new Date(month.year, month.monthIndex + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = month.year === today.getFullYear() && month.monthIndex === today.getMonth();
    const daysRemaining = isCurrentMonth ? Math.max(1, daysInMonth - today.getDate() + 1) : daysInMonth;
    const dailyBudget = variableBudget / daysRemaining;

    return {
      availableProjected: totalIncomeProjected + totalAdjustments - (Number(month.savings.depa) + Number(month.savings.boda)) - totalFixedPlanned - totalVariable,
      availableReal,
      monthlyNet: totalIncomeRealized + totalAdjustments - userSavingsRealized - totalFixedPaid - totalVariable - totalPendingEncargos,
      totalPendingEncargos,
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
    const metadata = data[0]?.goalMetadata || {
        depa: { name: "Nueva Meta 1", icon: "Target", color: "from-blue-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600", target: 19200, isLocked: false },
        boda: { name: "Nueva Meta 2", icon: "Star", color: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-600", target: 9600, isLocked: false }
    };

    const stats = {
        depa: { ...metadata.depa, saved: 0, target: Number(metadata.depa.target) || 19200, avgMonthly: 0 },
        boda: { ...metadata.boda, saved: 0, target: Number(metadata.boda.target) || 9600, avgMonthly: 0 }
    };

    let monthsWithContributions = 0;
    const monthlyTotals = { depa: 0, boda: 0 };

    data.forEach(m => {
        let monthHasSavings = false;
        if (m.savingsPayments) {
            const depaPaid = (Number(m.savingsPayments.depa?.userPaid || 0) + Number(m.savingsPayments.depa?.partnerPaid || 0));
            const bodaPaid = (Number(m.savingsPayments.boda?.userPaid || 0) + Number(m.savingsPayments.boda?.partnerPaid || 0));
            
            stats.depa.saved += depaPaid;
            stats.boda.saved += bodaPaid;

            if (depaPaid > 0 || bodaPaid > 0) {
                monthHasSavings = true;
                monthlyTotals.depa += depaPaid;
                monthlyTotals.boda += bodaPaid;
                monthsWithContributions++;
            }
        }
    });

    if (monthsWithContributions > 0) {
        stats.depa.avgMonthly = monthlyTotals.depa / monthsWithContributions;
        stats.boda.avgMonthly = monthlyTotals.boda / monthsWithContributions;
    }

    return stats;
  };

  const getExpenseDistribution = (monthIndex) => {
    const month = data[monthIndex];
    if (!month) return [];

    const distribution = {};
    
    // 1. Variable Expenses
    month.variableExpenses.forEach(e => {
        const cat = e.category || 'Otros';
        distribution[cat] = (distribution[cat] || 0) + Number(e.amount);
    });

    // 2. Paid Fixed Expenses
    const totalFixedPaid = Object.values(month.payments || {}).reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    if (totalFixedPaid > 0) {
        distribution['Pagos Fijos'] = (distribution['Pagos Fijos'] || 0) + totalFixedPaid;
    }

    // 3. Paid Savings
    let totalSavingsPaid = 0;
    if (month.savingsPayments) {
        Object.values(month.savingsPayments).forEach(p => {
            totalSavingsPaid += (Number(p.userPaid) || 0) + (Number(p.partnerPaid) || 0);
        });
    }
    if (totalSavingsPaid > 0) {
        distribution['Plan de Ahorro'] = (distribution['Plan de Ahorro'] || 0) + totalSavingsPaid;
    }

    return Object.entries(distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  };

  const getMonthlyTrend = (selectedYear) => {
    return data
        .filter(m => m.year === selectedYear)
        .map(m => ({
            name: m.name.substring(0, 3),
            total: m.variableExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
        }));
  };


  return {
    monthsData: data,
    addVariableExpense,
    addEncargo,
    completeEncargo,
    removeEncargo,
    removeVariableExpense,
    updateVariableExpense,
    addFixedExpense,
    removeFixedExpense,
    updateFixedPayment,
    updateFixedExpenseAmount,
    updateFixedExpenseMetadata,
    updateSavingsAmount,
    updateSavingsGoal,
    updateSavingsPayment,
    addAdditionalIncome,
    removeAdditionalIncome,
    updateAdditionalIncome,
    updatePartnerName,
    toggleIncomeStatus,
    toggleAdditionalIncomeStatus,
    updateBaseIncome,
    updateBonusIncome,
    updateVariableBudget,
    addInstallmentExpense,
    getExpenseDistribution,
    getMonthlyTrend,
    getGlobalSavingsStats,
    updateGoalMetadata,
    updateAccountSettings,
    updateAccountAdjustment,
    resetMonthCarryover,
    accounts,
    addAccount,
    deleteAccount,
    reorderAccount,
    updateAccount,
    calculateMonthStats,
    getAvailableYears,
    getMonthsByYear,
    restoreFixedExpense,
    moveFixedExpense,
    exportData,
    restoreFinanceData,
    loading,
    error
  };
};



