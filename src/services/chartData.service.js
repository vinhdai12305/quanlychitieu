/**
 * transactions: Array<{
 *   id: string
 *   type: 'income' | 'expense'
 *   category: string
 *   amount: number
 *   date: 'YYYY-MM-DD'
 *   note: string
 * }>
 */

/**
 * PIE CHART
 * Chi tiêu theo danh mục (expense only)
 * => { 'Ăn uống': 500000, 'Mua sắm': 300000 }
 */
export function getExpensePieData(transactions = []) {
    const result = {};
  
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Khác';
        result[category] = (result[category] || 0) + t.amount;
      });
  
    return result;
  }
  
  /**
   * BAR CHART
   * Tổng income vs expense
   * => { income: 10000000, expense: 5000000 }
   */
  export function getIncomeExpenseBarData(transactions = []) {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        if (t.type === 'expense') acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }
  
  /**
   * WEEKLY CASHFLOW
   * Dòng tiền theo tuần trong tháng
   * => [{ week: 1, income: 2000000, expense: 500000 }]
   */
  export function getWeeklyCashflowData(transactions = []) {
    const map = {};
  
    transactions.forEach(t => {
      if (!t.date) return;
  
      const date = new Date(t.date);
      const week = getWeekOfMonth(date);
  
      if (!map[week]) {
        map[week] = { week, income: 0, expense: 0 };
      }
  
      if (t.type === 'income') map[week].income += t.amount;
      if (t.type === 'expense') map[week].expense += t.amount;
    });
  
    return Object.values(map).sort((a, b) => a.week - b.week);
  }
  
  /**
   * HELPER
   * Tính tuần trong tháng (1–5)
   */
  function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    return Math.ceil((date.getDate() + offset) / 7);
  }
  