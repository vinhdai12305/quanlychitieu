// charts/incomeExpenseBarChart.js
import { getBarChartData } from "../services/chartData.service.js";

let barChartInstance = null;

export async function renderIncomeExpenseBarChart(year, month) {
  const data = await getBarChartData(year, month);

  const ctx = document
    .getElementById("incomeExpenseBarChart")
    .getContext("2d");

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Số tiền",
          data: [data.income, data.expense],
          backgroundColor: ["#4CAF50", "#F44336"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
