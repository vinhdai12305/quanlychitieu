// src/services/transactionAnalytics.service.js
import { fetchAllTransactions } from "../repositories/transactionRepository.js";

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

// Class TransactionAnalyticsService
export class TransactionAnalyticsService {
  async getDashboardStats(month, year) {
    const transactions = await fetchAllTransactions();
    const filtered = filterByMonth(transactions, year, month);

    // Tính tổng thu nhập và chi tiêu
    let totalIncome = 0;
    let totalExpense = 0;
    const spendingByCategory = {};

    filtered.forEach(t => {
      if (t.type === "income") {
        totalIncome += t.amount || 0;
      } else {
        totalExpense += t.amount || 0;
        const category = t.category || "Khác";
        spendingByCategory[category] = (spendingByCategory[category] || 0) + (t.amount || 0);
      }
    });

    // Tính dòng tiền theo tuần
    const weeklyData = getWeeklyCashflow(filtered);
    const cashflowData = {
      labels: weeklyData.map(w => `Tuần ${w.week}`),
      income: weeklyData.map(w => w.income),
      expense: weeklyData.map(w => w.expense)
    };

    // Lấy 5 giao dịch gần đây nhất
    const recentList = filtered
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(t => ({
        ...t,
        date: new Date(t.date).toLocaleDateString('vi-VN')
      }));

    return {
      summary: {
        totalIncome,
        totalExpense,
        currentBalance: totalIncome - totalExpense
      },
      charts: {
        cashflow: cashflowData,
        spending: spendingByCategory
      },
      recentList
    };
  }
}
  