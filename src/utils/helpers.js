export const formatCurrency = (amount, currencyCode = 'PEN') => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatCompactCurrency = (amount, threshold = 100000, currencyCode = 'PEN') => {
  if (amount < threshold) return formatCurrency(amount, currencyCode);
  
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
};

export const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

export const getDaysRemaining = (year, monthIndex) => {
  const today = new Date();
  if (today.getFullYear() !== year || today.getMonth() !== monthIndex) {
    // If viewing a past month, 0 days remaining.
    if (today.getFullYear() > year || (today.getFullYear() === year && today.getMonth() > monthIndex)) {
      return 0;
    }
    // If viewing a future month, all days represent "budget per day" logic differently, 
    // but usually user wants full month scope.
    return getDaysInMonth(year, monthIndex);
  }
  return Math.max(1, getDaysInMonth(year, monthIndex) - today.getDate() + 1);
};
