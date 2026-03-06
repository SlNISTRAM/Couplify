import { MONTHS, INCOME_BASE, INCOME_BONUS, FIXED_EXPENSES_BASE, SAVINGS_GOALS } from './constants.js';

export const initializeYearData = () => {
  const years = [2026, 2027, 2028];
  let allMonths = [];
  let globalIndex = 0;

  years.forEach(year => {
    const monthCount = year === 2028 ? 3 : 12; // Stop at March for 2028
    
    for (let i = 0; i < monthCount; i++) {
        const monthName = MONTHS[i];
        
        // Bonus Logic: July (6) and December (11) only
        const isBonusMonth = i === 6 || i === 11;
        
        // Fixed Expenses Logic
        // Jan/Feb 2026 have 0 expenses
        const monthlyFixed = (year === 2026 && i < 2) ? [] : [...FIXED_EXPENSES_BASE];
        


        // Boda Savings: Start from March 2026 (Index 2)
        // If year is 2026 and month < 2 (Jan/Feb), amount is 0. Otherwise use constant (200).
        
        allMonths.push({
            id: `${year}-${i}`, // Unique ID for stability
            year: year,
            monthIndex: i,
            globalIndex: globalIndex,
            name: monthName,
            income: {
                base: (year === 2026 && i < 2) ? 0 : INCOME_BASE,
                bonus: (year === 2026 && i < 2) ? 0 : (isBonusMonth ? INCOME_BONUS : 0),
            },
            incomeStatus: {
                base: false,
                bonus: false
            },
            additionalIncomes: [],
            fixedExpenses: monthlyFixed,
            savings: {
                depa: (year === 2026 && i < 2) ? 0 : SAVINGS_GOALS.depa.monthly,
                boda: (year === 2026 && i < 2) ? 0 : SAVINGS_GOALS.boda.monthly,
            },
            savingsPayments: { 
                depa: { userPaid: 0, partnerPaid: 0, completed: false }, 
                boda: { userPaid: 0, partnerPaid: 0, completed: false } 
            },
            // Track payments
            payments: monthlyFixed.reduce((acc, item) => ({
                ...acc,
                [item.id]: { amountPaid: 0, completed: false }
            }), {}),
            variableBudget: 500,
            variableExpenses: [],
            // Metadata for goals (only needed in first month for reference, or all for ease)
            goalMetadata: (i === 0) ? {
              depa: { name: "Meta 1", icon: "Target", color: "from-blue-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600", target: 19200, isLocked: false },
              boda: { name: "Meta 2", icon: "Star", color: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-600", target: 9600, isLocked: false }
            } : null,
            accountSettings: (i === 0) ? {
              cash: { initialBalance: 0, limit: 0 },
              card1: { initialBalance: 0, limit: 2000 },
              card2: { initialBalance: 0, limit: 1000 },
              bank: { initialBalance: 0, limit: 0 }
            } : null
        });


        globalIndex++;
    }
  });

  return allMonths;
};
