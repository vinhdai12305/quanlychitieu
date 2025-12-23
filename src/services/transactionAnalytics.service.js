/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {"income" | "expense"} type
 * @property {string} category
 * @property {number} amount
 * @property {string} date // YYYY-MM-DD
 * @property {string} note
 */

/**
 * TỔNG CHI THEO DANH MỤC (Pie Chart)
@param {Transaction[]} transactions
@returns {Object<string, number>}
 */
export function getExpenseByCategory(transactions = []) {
    return transactions
      .filter(t => t.type === "expense")
      .reduce((result, tx) => {
        const category = tx.category || "Khác";
        result[category] = (result[category] || 0) + tx.amount;
        return result;
      }, {});
  }
  
  /**
   * TỔNG THU / CHI (Bar Chart)
   * @param {Transaction[]} transactions
   * @returns {{ income: number, expense: number }}
   */
  export function getIncomeExpenseTotal(transactions = []) {
    return transactions.reduce(
      (total, tx) => {
        if (tx.type === "income") total.income += tx.amount;
        if (tx.type === "expense") total.expense += tx.amount;
        return total;
      },
      { income: 0, expense: 0 }
    );
  }
  
  /**

   * LỌC THEO THÁNG
@param {Transaction[]} transactions
@param {number} year  (VD: 2025)
@param {number} month (1-12)
@returns {Transaction[]}
   */
  export function filterByMonth(transactions = [], year, month) {
    return transactions.filter(tx => {
      if (!tx.date) return false;
  
      const [y, m] = tx.date.split("-").map(Number);
      return y === year && m === month;
    });
  }
  
  /**
   * ==============================
   * DÒNG TIỀN THEO TUẦN (Weekly Cashflow)
   * ==============================
   * @param {Transaction[]} transactions
   * @returns {{ labels: string[], income: number[], expense: number[] }}
   */
  export function getWeeklyCashflow(transactions = []) {
    const weeks = {};
  
    transactions.forEach(tx => {
      if (!tx.date) return;
  
      const date = new Date(tx.date);
      const week = Math.ceil(date.getDate() / 7);
      const key = `Tuần ${week}`;
  
      if (!weeks[key]) {
        weeks[key] = { income: 0, expense: 0 };
      }
  
      weeks[key][tx.type] += tx.amount;
    });
  
    const labels = Object.keys(weeks).sort();
    return {
      labels,
      income: labels.map(l => weeks[l].income),
      expense: labels.map(l => weeks[l].expense)
    };
  }
  