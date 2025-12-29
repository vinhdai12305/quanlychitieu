// charts/expensePieChart.js
import { getPieChartData } from "../services/chartData.service.js";

let pieChartInstance = null;

export async function renderExpensePieChart(year, month) {
  const data = await getPieChartData(year, month);

  const labels = Object.keys(data);
  const values = Object.values(data);

  const ctx = document
    .getElementById("expensePieChart")
    .getContext("2d");

  // Destroy chart cũ nếu có
  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  pieChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#4CAF50",
            "#FF9800",
            "#2196F3",
            "#F44336",
            "#9C27B0",
            "#03A9F4",
            "#FFC107"
          ]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}
