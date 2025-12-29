// report.js - Refactored to use modules and Firebase data
import { loadHeader } from './headerLoader.js';
import { checkAuth } from '../firebase/auth.js';
import { getMonthlyStats } from '../firebase/firestore.service.js';

document.addEventListener("DOMContentLoaded", async function () {
  // Kiểm tra đăng nhập
  const user = await checkAuth();
  if (!user) return;

  // Load header
  loadHeader('../components/header.html');

  // Load data và vẽ charts
  await initCharts();
});

async function initCharts() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  try {
    const data = await getMonthlyStats(currentMonth, currentYear);

    // Xử lý dữ liệu cho chart
    const expenseByCategory = {};
    data.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expenseByCategory[t.category]) {
          expenseByCategory[t.category] = 0;
        }
        expenseByCategory[t.category] += t.amount;
      });

    // Line Chart – Dòng tiền
    const lineCtx = document.getElementById("lineChart");
    if (lineCtx) {
      // Group transactions by week
      const weeklyData = processWeeklyData(data.transactions);

      new Chart(lineCtx, {
        type: "line",
        data: {
          labels: weeklyData.labels,
          datasets: [
            {
              label: "Thu nhập",
              data: weeklyData.income,
              borderColor: "#22c55e",
              backgroundColor: "rgba(34,197,94,0.15)",
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2
            },
            {
              label: "Chi tiêu",
              data: weeklyData.expense,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.12)",
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.raw * 1000000)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              grid: { color: "#f1f5f9" },
              ticks: { callback: (value) => value + "tr" }
            }
          }
        }
      });
    }

    // Donut Chart – Phân loại chi tiêu
    const donutCtx = document.getElementById("donutChart");
    if (donutCtx) {
      const categories = Object.keys(expenseByCategory);
      const amounts = Object.values(expenseByCategory);

      // Màu động cho các category
      const colors = [
        "#3b82f6", "#22c55e", "#ef4444", "#f59e0b",
        "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
      ];

      new Chart(donutCtx, {
        type: "doughnut",
        data: {
          labels: categories.length > 0 ? categories : ["Chưa có dữ liệu"],
          datasets: [{
            data: amounts.length > 0 ? amounts : [1],
            backgroundColor: categories.length > 0
              ? colors.slice(0, categories.length)
              : ["#e5e7eb"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: { usePointStyle: true, padding: 16 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  if (ctx.label === "Chưa có dữ liệu") return ctx.label;
                  return `${ctx.label}: ${formatMoney(ctx.raw)}`;
                }
              }
            }
          }
        }
      });
    }

  } catch (error) {
    console.error("Error loading chart data:", error);
  }
}

function processWeeklyData(transactions) {
  const labels = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"];
  const income = [0, 0, 0, 0];
  const expense = [0, 0, 0, 0];

  transactions.forEach(t => {
    const day = parseInt(t.date.split('-')[2]);
    let weekIndex = 0;
    if (day <= 7) weekIndex = 0;
    else if (day <= 14) weekIndex = 1;
    else if (day <= 21) weekIndex = 2;
    else weekIndex = 3;

    if (t.type === 'income') {
      income[weekIndex] += t.amount / 1000000;
    } else {
      expense[weekIndex] += t.amount / 1000000;
    }
  });

  return { labels, income, expense };
}

function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}
