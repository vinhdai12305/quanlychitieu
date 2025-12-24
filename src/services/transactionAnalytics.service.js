// src/services/transactionAnalytics.service.js

export function filterByMonth(transactions, year, month) {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }
  
  export function getWeeklyCashflow(transactions) {
    const result = {};
  
    transactions.forEach(t => {
      const day = new Date(t.date).getDate();
      const week = Math.ceil(day / 7);
  
      if (!result[week]) {
        result[week] = { week, income: 0, expense: 0 };
      }
  
      if (t.type === "income") result[week].income += t.amount;
      if (t.type === "expense") result[week].expense += t.amount;
    });
  
    return Object.values(result).sort((a, b) => a.week - b.week);
  }
  