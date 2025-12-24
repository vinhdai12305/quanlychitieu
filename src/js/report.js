/* =========================
   LINE CHART – DÒNG TIỀN
========================= */
const lineCtx = document.getElementById("lineChart");

if (lineCtx) {
  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [
        "01 Th11",
        "05 Th11",
        "10 Th11",
        "15 Th11",
        "20 Th11",
        "25 Th11",
        "30 Th11"
      ],
      datasets: [
        {
          label: "Thu nhập",
          data: [3, 4, 3.5, 6, 5, 7, 6],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: "Chi tiêu",
          data: [2.5, 2.8, 2.6, 3, 4, 4, 5],
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
      maintainAspectRatio: false, // BẮT BUỘC
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.raw} triệu`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            color: "#f1f5f9"
          },
          ticks: {
            callback: (value) => value + "tr"
          }
        }
      }
    }
  });
}

/* =========================
   DONUT CHART – PHÂN LOẠI CHI TIÊU
========================= */
const donutCtx = document.getElementById("donutChart");

if (donutCtx) {
  new Chart(donutCtx, {
    type: "doughnut",
    data: {
      labels: ["Ăn uống", "Nhà ở"],
      datasets: [
        {
          data: [7500000, 5000000],
          backgroundColor: ["#3b82f6", "#22c55e"],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // BẮT BUỘC
      cutout: "65%",              // LỖ GIỮA ĐẸP GIỐNG DEMO
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.raw.toLocaleString("vi-VN");
              return `${ctx.label}: ${value} đ`;
            }
          }
        }
      }
    }
  });
}

/* =========================
   SAFETY FIX – TRÁNH LỖI KHI CANVAS KHÔNG TỒN TẠI
========================= */
// Không cần code thêm – if() đã xử lý
