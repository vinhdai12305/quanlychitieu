// src/js/dashboard.js
import { TransactionAnalyticsService } from "../services/transactionAnalytics.service.js";

const service = new TransactionAnalyticsService();
const moneyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// Biến lưu instance của Chart để destroy khi vẽ lại (tránh lỗi đè biểu đồ)
let cashflowChartInstance = null;
let spendingChartInstance = null;

async function initDashboard() {
    try {
        // Lấy ngày hiện tại
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        console.log(`Loading dashboard for ${currentMonth}/${currentYear}...`);

        // GỌI SERVICE (Hàm Orchestrator)
        const data = await service.getDashboardStats(currentMonth, currentYear);

        // 1. Cập nhật 3 thẻ số liệu
        document.getElementById('summary-income').innerText = moneyFormatter.format(data.summary.totalIncome);
        document.getElementById('summary-expense').innerText = moneyFormatter.format(data.summary.totalExpense);
        
        const balanceEl = document.getElementById('summary-balance');
        balanceEl.innerText = moneyFormatter.format(data.summary.currentBalance);
        // Đổi màu số dư (Xanh/Đỏ)
        balanceEl.className = `text-2xl font-bold mt-1 ${data.summary.currentBalance >= 0 ? 'text-blue-600' : 'text-red-500'}`;

        // 2. Vẽ biểu đồ Cột (Cashflow)
        renderCashflowChart(data.charts.cashflow);

        // 3. Vẽ biểu đồ Tròn (Spending)
        renderSpendingChart(data.charts.spending);

        // 4. Cập nhật bảng danh sách
        renderRecentTable(data.recentList);

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

/**
 * Hàm vẽ biểu đồ Cột (Bar Chart)
 */
function renderCashflowChart(data) {
    const ctx = document.getElementById('chart-cashflow');
    if (!ctx) return;

    // Hủy biểu đồ cũ nếu có
    if (cashflowChartInstance) cashflowChartInstance.destroy();

    cashflowChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Thu nhập',
                    data: data.income,
                    backgroundColor: '#10B981', // Green-500
                    borderRadius: 4, // Bo tròn đầu cột
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Chi tiêu',
                    data: data.expense,
                    backgroundColor: '#EF4444', // Red-500
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [2, 4], color: '#f3f4f6', drawBorder: false }, // Lưới nét đứt mờ
                    ticks: { callback: (value) => value >= 1000000 ? `${value/1000000}M` : value } // Rút gọn số 1M
                },
                x: {
                    grid: { display: false } // Ẩn lưới dọc
                }
            }
        }
    });
}

/**
 * Hàm vẽ biểu đồ Tròn (Doughnut Chart)
 */
function renderSpendingChart(data) {
    const ctx = document.getElementById('chart-spending');
    if (!ctx) return;

    if (spendingChartInstance) spendingChartInstance.destroy();

    const labels = Object.keys(data);
    const values = Object.values(data);
    
    // Nếu không có dữ liệu chi tiêu -> Hiện biểu đồ trống màu xám
    const isNoData = values.length === 0 || values.every(v => v === 0);

    spendingChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: isNoData ? ['Chưa có dữ liệu'] : labels,
            datasets: [{
                data: isNoData ? [1] : values,
                backgroundColor: isNoData ? ['#E5E7EB'] : [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Độ dày của vòng tròn (làm mỏng đi cho đẹp)
            plugins: {
                legend: { display: !isNoData, position: 'bottom', labels: { boxWidth: 10, padding: 15 } },
                tooltip: { enabled: !isNoData }
            }
        }
    });
}

/**
 * Hàm render bảng danh sách
 */
function renderRecentTable(transactions) {
    const tbody = document.getElementById('list-recent-transactions');
    const emptyState = document.getElementById('empty-state');
    
    if (!tbody) return;

    if (transactions.length === 0) {
        tbody.innerHTML = '';
        if(emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if(emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = transactions.map(t => {
        const isIncome = t.type === 'income';
        const colorClass = isIncome ? 'text-green-600' : 'text-red-600';
        const sign = isIncome ? '+' : '-';

        return `
        <tr class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center text-sm font-bold ${colorClass}">
                        ${t.category.charAt(0).toUpperCase()}
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${t.category}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 truncate max-w-xs">${t.note || 'Không có ghi chú'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${t.date}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${colorClass}">
                ${sign} ${moneyFormatter.format(t.amount)}
            </td>
        </tr>
        `;
    }).join('');
}

// Chạy ứng dụng
document.addEventListener('DOMContentLoaded', initDashboard);