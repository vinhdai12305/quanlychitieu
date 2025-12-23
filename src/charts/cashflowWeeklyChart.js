// charts/cashflowWeeklyChart.js
import { getWeeklyCashflowData } from "../services/chartData.service.js";

let weeklyChartInstance = null;

export async function renderCashflowWeeklyChart(year, month) {
  const weeklyData = await getWeeklyCashflowData(year, month);

  const labels = weeklyData.map(w => `Week ${w.week}`);
  const incomeData = weeklyData.map(w => w.income);
  const expenseData = weeklyData.map(w => w.expense);

  const ctx = document
    .getElementById("cashflowWeeklyChart")
    .getContext("2d");

  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  weeklyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76,175,80,0.2)",
          tension: 0.3
        },
        {
          label: "Expense",
          data: expenseData,
          borderColor: "#F44336",
          backgroundColor: "rgba(244,67,54,0.2)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
