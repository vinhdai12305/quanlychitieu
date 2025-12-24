// Biến toàn cục để lưu trữ đối tượng Chart
let myChart;

// Dữ liệu giả lập (Sau này bạn có thể thay bằng dữ liệu lấy từ Firebase)
const dataStore = {
    current: {
        label: "tháng này",
        income: "25.000.000 đ",
        expense: "18.200.000 đ",
        balance: "6.800.000 đ",
        chartData: {
            income: [30, 45, 40, 70, 60, 95, 85], // Dữ liệu 7 ngày/tuần
            expense: [20, 35, 25, 45, 40, 65, 75]
        }
    },
    previous: {
        label: "tháng trước",
        income: "21.500.000 đ",
        expense: "19.000.000 đ",
        balance: "2.500.000 đ",
        chartData: {
            income: [35, 50, 45, 60, 55, 70, 65],
            expense: [30, 40, 35, 50, 45, 60, 55]
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('flowChart').getContext('2d');

    // Tạo hiệu ứng đổ màu (Gradient) cho vùng Thu nhập
    const greenGradient = ctx.createLinearGradient(0, 0, 0, 300);
    greenGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)'); // Màu xanh nhạt dần
    greenGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    // Khởi tạo biểu đồ lần đầu tiên với dữ liệu tháng này (current)
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01', '05', '10', '15', '20', '25', '30'],
            datasets: [
                {
                    label: 'Thu nhập',
                    data: dataStore.current.chartData.income,
                    borderColor: '#22c55e', // Màu xanh lá
                    backgroundColor: greenGradient,
                    fill: true,
                    tension: 0.4, // Tạo đường cong mềm
                    pointRadius: 3,
                    borderWidth: 3
                },
                {
                    label: 'Chi tiêu',
                    data: dataStore.current.chartData.expense,
                    borderColor: '#ef4444', // Màu đỏ
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top', 
                    align: 'end', 
                    labels: { usePointStyle: true, boxWidth: 8 } 
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: { display: false }, // Ẩn trục Y
                x: { 
                    grid: { display: false }, // Ẩn lưới trục X
                    ticks: { color: '#94a3b8' } 
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
});

// Hàm cập nhật Dashboard khi người dùng chọn tháng khác
function updateDashboard() {
    // 1. Lấy giá trị từ ô chọn (current hoặc previous)
    const selectedPeriod = document.getElementById('periodSelect').value;
    
    // 2. Lấy bộ dữ liệu tương ứng từ dataStore
    const data = dataStore[selectedPeriod];

    // 3. Cập nhật Text hiển thị (Số tiền, label)
    document.getElementById('incomeVal').innerText = data.income;
    document.getElementById('expenseVal').innerText = data.expense;
    document.getElementById('balanceVal').innerText = data.balance;
    document.getElementById('periodLabel').innerText = data.label;

    // 4. Cập nhật dữ liệu bên trong biểu đồ
    myChart.data.datasets[0].data = data.chartData.income;
    myChart.data.datasets[1].data = data.chartData.expense;

    // 5. Vẽ lại biểu đồ để hiển thị thay đổi
    myChart.update();
}