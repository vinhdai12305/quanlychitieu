// report_logic.js - Connected to Firebase
import { getMonthlyStats } from '../firebase/firestore.service.js';
import { checkAuth } from '../firebase/auth.js';

// Biến toàn cục để lưu trữ đối tượng Chart
let myChart;
let selectedMonth = new Date().getMonth() + 1;
let selectedYear = new Date().getFullYear();

// ==========================================
// POPULATE MONTH FILTER (Custom Dropdown)
// ==========================================
function populateMonthFilter() {
    const container = document.getElementById('month-options');
    if (!container) return;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    let html = '';
    for (let i = 0; i < 12; i++) {
        let month = currentMonth - i;
        let year = currentYear;

        if (month <= 0) {
            month += 12;
            year -= 1;
        }

        const isActive = month === selectedMonth && year === selectedYear;

        html += `
    <div onclick="selectMonth(${month}, ${year})"
        class="month-item px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center ${isActive ? 'bg-emerald-50 text-primary font-bold' : 'hover:bg-emerald-50 hover:text-primary font-medium'}">
        <span>Tháng ${month}/${year}</span>
        ${isActive ? '<span class="material-symbols-outlined text-[18px]">check</span>' : ''}
    </div>`;
    }

    container.innerHTML = html;
    updateSelectedMonthText();
}

// Update selected month text display
function updateSelectedMonthText() {
    const el = document.getElementById('selected-month');
    if (el) {
        el.textContent = `Tháng ${selectedMonth}/${selectedYear}`;
    }
}

// Toggle month dropdown
window.toggleMonthDropdown = function () {
    const dropdown = document.getElementById('month-dropdown');
    const arrow = document.getElementById('month-arrow');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (arrow) {
            arrow.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
    // Stop propagation to prevent document click handler from closing dropdown
    if (event) event.stopPropagation();
};

// Select month from dropdown
window.selectMonth = function (month, year) {
    selectedMonth = month;
    selectedYear = year;

    updateSelectedMonthText();
    populateMonthFilter();
    toggleMonthDropdown();

    // Reload data
    loadCurrentMonthData();
};

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('month-dropdown');
    const button = e.target.closest('button[onclick="toggleMonthDropdown()"]');
    if (!button && dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
        const arrow = document.getElementById('month-arrow');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
});

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', async function () {
    // Kiểm tra đăng nhập
    const user = await checkAuth();
    if (!user) return;

    // Initialize month filter dropdown FIRST
    populateMonthFilter();

    const ctx = document.getElementById('flowChart');
    if (!ctx) return;

    const context = ctx.getContext('2d');

    // Tạo hiệu ứng gradient cho vùng Thu nhập
    const greenGradient = context.createLinearGradient(0, 0, 0, 300);
    greenGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
    greenGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    // Khởi tạo biểu đồ trống
    myChart = new Chart(context, {
        type: 'line',
        data: {
            labels: ['01', '05', '10', '15', '20', '25', '30'],
            datasets: [
                {
                    label: 'Thu nhập',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#22c55e',
                    backgroundColor: greenGradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    borderWidth: 3
                },
                {
                    label: 'Chi tiêu',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#ef4444',
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
                y: { display: false },
                x: {
                    grid: { display: false },
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

    // Load dữ liệu tháng hiện tại
    await loadCurrentMonthData();
});

// Format tiền VND
const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Load dữ liệu từ Firebase (sử dụng selectedMonth và selectedYear)
async function loadCurrentMonthData() {
    try {
        const data = await getMonthlyStats(selectedMonth, selectedYear);

        // Cập nhật số liệu
        const incomeEl = document.getElementById('incomeVal');
        const expenseEl = document.getElementById('expenseVal');
        const balanceEl = document.getElementById('balanceVal');
        const periodLabelEl = document.getElementById('periodLabel');

        if (incomeEl) incomeEl.innerText = formatMoney(data.totalIncome);
        if (expenseEl) expenseEl.innerText = formatMoney(data.totalExpense);
        if (balanceEl) balanceEl.innerText = formatMoney(data.balance);
        if (periodLabelEl) periodLabelEl.innerText = `Tháng ${selectedMonth}/${selectedYear}`;

        // Xử lý dữ liệu cho biểu đồ theo ngày trong tháng
        const incomeByDay = processTransactionsByDay(data.transactions.filter(t => t.type === 'income'));
        const expenseByDay = processTransactionsByDay(data.transactions.filter(t => t.type === 'expense'));

        // Cập nhật biểu đồ
        if (myChart) {
            myChart.data.datasets[0].data = incomeByDay;
            myChart.data.datasets[1].data = expenseByDay;
            myChart.update();
        }

    } catch (error) {
        console.error('Error loading report data:', error);
    }
}

// Xử lý transactions thành dữ liệu theo các mốc ngày: 01, 05, 10, 15, 20, 25, 30
function processTransactionsByDay(transactions) {
    const periods = [1, 5, 10, 15, 20, 25, 30];
    const result = [0, 0, 0, 0, 0, 0, 0];

    transactions.forEach(t => {
        const day = parseInt(t.date.split('-')[2]);
        // Tìm period phù hợp
        for (let i = periods.length - 1; i >= 0; i--) {
            if (day >= periods[i]) {
                result[i] += t.amount / 1000000; // Đổi sang triệu
                break;
            }
        }
    });

    return result;
}

// Hàm cập nhật Dashboard khi người dùng chọn tháng khác
window.updateDashboard = async function () {
    const selectedPeriod = document.getElementById('periodSelect')?.value;

    if (selectedPeriod === 'current') {
        await loadCurrentMonthData();
    } else if (selectedPeriod === 'previous') {
        // Load tháng trước
        const today = new Date();
        let month = today.getMonth(); // 0-indexed, nên getMonth() là tháng trước
        let year = today.getFullYear();

        if (month === 0) {
            month = 12;
            year -= 1;
        }

        try {
            const data = await getMonthlyStats(month, year);

            const incomeEl = document.getElementById('incomeVal');
            const expenseEl = document.getElementById('expenseVal');
            const balanceEl = document.getElementById('balanceVal');
            const periodLabelEl = document.getElementById('periodLabel');

            if (incomeEl) incomeEl.innerText = formatMoney(data.totalIncome);
            if (expenseEl) expenseEl.innerText = formatMoney(data.totalExpense);
            if (balanceEl) balanceEl.innerText = formatMoney(data.balance);
            if (periodLabelEl) periodLabelEl.innerText = `Tháng ${month}`;

            const incomeByDay = processTransactionsByDay(data.transactions.filter(t => t.type === 'income'));
            const expenseByDay = processTransactionsByDay(data.transactions.filter(t => t.type === 'expense'));

            if (myChart) {
                myChart.data.datasets[0].data = incomeByDay;
                myChart.data.datasets[1].data = expenseByDay;
                myChart.update();
            }
        } catch (error) {
            console.error('Error loading previous month data:', error);
        }
    }
};