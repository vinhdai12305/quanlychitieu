// dashboard.js - With Charts, Category Normalization and Month Filter
import { getMonthlyStats, getTransactionsByMonth } from '../firebase/firestore.service.js';
import './toast.js';
import { checkAuth } from '../firebase/auth.js';
import { groupByCategory, getCategoryInfo, normalizeCategory } from './categoryUtils.js';
import { formatCurrency, getExchangeRate, getCurrentCurrency } from '../services/currencyService.js';

// Legacy formatter (fallback for charts)
const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

let cashflowChartInstance = null;
let spendingChartInstance = null;
let selectedMonth = new Date().getMonth() + 1;
let selectedYear = new Date().getFullYear();
let monthFilter = null;
let currentRate = null; // Cached exchange rate

// Helper: Convert VND to selected currency
function convertAmount(amountVND) {
  const currency = getCurrentCurrency();
  if (currency === 'USD' && currentRate) {
    return amountVND / currentRate;
  }
  return amountVND;
}

// Helper: Format chart value based on currency
function formatChartValue(value) {
  return formatCurrency(value * (getCurrentCurrency() === 'USD' ? currentRate : 1), null, currentRate);
}

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
};

// Select month from dropdown
window.selectMonth = function (month, year) {
  selectedMonth = month;
  selectedYear = year;

  updateSelectedMonthText();
  populateMonthFilter();
  toggleMonthDropdown();

  // Reload data
  loadDashboardData();
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

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================
async function loadDashboardData() {
  try {
    console.log(`📊 Loading dashboard for ${selectedMonth}/${selectedYear}...`);

    // Pre-load exchange rate for currency formatting
    currentRate = await getExchangeRate();

    // Lấy dữ liệu từ Firebase
    const data = await getMonthlyStats(selectedMonth, selectedYear);

    console.log(`📦 Data received:`, data);
    console.log(`📝 Transactions count: ${data.transactions.length}`);

    // 1. Cập nhật 3 thẻ số liệu (sử dụng formatCurrency để hỗ trợ VND/USD)
    document.getElementById('summary-income').innerText = formatCurrency(data.totalIncome, null, currentRate);
    document.getElementById('summary-expense').innerText = formatCurrency(data.totalExpense, null, currentRate);
    document.getElementById('summary-balance').innerText = formatCurrency(data.balance, null, currentRate);

    // 2. Render bảng giao dịch gần đây
    renderRecentTable(data.transactions.slice(0, 5));

    // 3. Vẽ biểu đồ Dòng tiền theo tuần
    renderCashflowChart(data.transactions, selectedMonth, selectedYear);

    // 4. Vẽ biểu đồ Phân loại chi tiêu
    renderSpendingChart(data.transactions, data.totalExpense);

    // 5. Cập nhật label "Tháng này" thành tháng đã chọn
    const monthLabel = document.querySelector('.mt-4.text-center.text-sm.text-gray-500');
    if (monthLabel) {
      monthLabel.textContent = `Tháng ${selectedMonth}/${selectedYear}`;
    }

  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    console.error("🔍 Error details:", error.message);
  }
}

// ==========================================
// BIỂU ĐỒ DÒNG TIỀN THEO TUẦN
// ==========================================
function renderCashflowChart(transactions, month, year) {
  const ctx = document.getElementById('chart-cashflow');
  if (!ctx) return;

  // Phân loại theo tuần
  const weeklyData = {
    week1: { income: 0, expense: 0 },
    week2: { income: 0, expense: 0 },
    week3: { income: 0, expense: 0 },
    week4: { income: 0, expense: 0 }
  };

  transactions.forEach(t => {
    const day = parseInt(t.date.split('-')[2]);
    let week;

    if (day <= 7) week = 'week1';
    else if (day <= 14) week = 'week2';
    else if (day <= 21) week = 'week3';
    else week = 'week4';

    if (t.type === 'income') {
      weeklyData[week].income += t.amount;
    } else if (t.type === 'expense') {
      weeklyData[week].expense += t.amount;
    }
  });

  // Destroy old chart
  if (cashflowChartInstance) {
    cashflowChartInstance.destroy();
  }

  // Convert to selected currency
  const currency = getCurrentCurrency();
  const isUSD = currency === 'USD';

  cashflowChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
      datasets: [
        {
          label: 'Thu nhập',
          data: [
            convertAmount(weeklyData.week1.income),
            convertAmount(weeklyData.week2.income),
            convertAmount(weeklyData.week3.income),
            convertAmount(weeklyData.week4.income)
          ],
          backgroundColor: '#10B981',
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: 'Chi tiêu',
          data: [
            convertAmount(weeklyData.week1.expense),
            convertAmount(weeklyData.week2.expense),
            convertAmount(weeklyData.week3.expense),
            convertAmount(weeklyData.week4.expense)
          ],
          backgroundColor: '#EF4444',
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: { family: 'Manrope', weight: '600', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleFont: { family: 'Manrope', weight: '600' },
          bodyFont: { family: 'Manrope' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              // Convert back to VND for formatting (since data is already converted)
              const vndValue = isUSD ? context.raw * currentRate : context.raw;
              return context.dataset.label + ': ' + formatCurrency(vndValue, null, currentRate);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#F3F4F6' },
          ticks: {
            font: { family: 'Manrope', size: 11 },
            callback: function (value) {
              if (isUSD) {
                if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
                return '$' + value.toFixed(2);
              } else {
                if (value >= 1000000) return (value / 1000000) + 'M';
                if (value >= 1000) return (value / 1000) + 'K';
                return value;
              }
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Manrope', weight: '600', size: 12 } }
        }
      }
    }
  });
}

// ==========================================
// BIỂU ĐỒ PHÂN LOẠI CHI TIÊU
// ==========================================
function renderSpendingChart(transactions, totalExpense) {
  const ctx = document.getElementById('chart-spending');
  if (!ctx) return;

  // Sử dụng groupByCategory từ categoryUtils
  const expenses = transactions.filter(t => t.type === 'expense');
  const grouped = groupByCategory(expenses, 'expense');

  // grouped = { categoryName: { total, color, class } }
  const labels = Object.keys(grouped);
  const values = labels.map(cat => grouped[cat].total);
  const colors = labels.map(cat => grouped[cat].color);

  // Destroy old chart
  if (spendingChartInstance) {
    spendingChartInstance.destroy();
  }

  spendingChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values.map(v => convertAmount(v)),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 1500,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 15,
            font: { family: 'Manrope', weight: '600', size: 11 }
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleFont: { family: 'Manrope', weight: '600' },
          bodyFont: { family: 'Manrope' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const currency = getCurrentCurrency();
              const isUSD = currency === 'USD';

              const value = context.raw;
              // Re-calculate percent based on raw value (which is already converted if needed)
              const convertedTotal = convertAmount(totalExpense);
              const percent = convertedTotal > 0 ? ((value / convertedTotal) * 100).toFixed(1) : 0;

              // Convert back to VND for formatting because formatCurrency handles rate internally
              // BUT wait - formatCurrency uses currentRate to convert VND -> USD again
              // So we should pass VND value to formatCurrency

              const vndValue = isUSD ? value * currentRate : value;

              return `${context.label}: ${formatCurrency(vndValue, null, currentRate)} (${percent}%)`;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'centerText',
      beforeDraw: function (chart) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();

        ctx.font = 'bold 12px Manrope';
        ctx.fillStyle = '#9CA3AF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('TỔNG CHI', centerX, centerY - 5);

        ctx.font = 'bold 18px Manrope';
        ctx.fillStyle = '#111827';
        ctx.textBaseline = 'top';
        const currency = getCurrentCurrency();
        const isUSD = currency === 'USD';

        // Use formatCurrency directly without abbreviation for consistency
        // Or create a short format specific to currency
        let formatted;

        if (isUSD) {
          const val = totalExpense / currentRate;
          formatted = '$' + val.toFixed(2);
        } else {
          formatted = totalExpense >= 1000000
            ? (Math.floor(totalExpense / 100000) / 10).toFixed(1) + 'M'
            : formatCurrency(totalExpense, null, currentRate);
        }

        ctx.fillText(formatted, centerX, centerY + 3);

        ctx.restore();
      }
    }]
  });
}

// ==========================================
// BẢNG GIAO DỊCH GẦN ĐÂY
// ==========================================
function renderRecentTable(transactions) {
  const tbody = document.getElementById('list-recent-transactions');
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-8 text-center text-gray-500 italic">
          Không có giao dịch nào trong tháng ${selectedMonth}/${selectedYear}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    const isIncome = t.type === 'income';
    const colorClass = isIncome ? 'text-green-600' : 'text-red-500';
    const sign = isIncome ? '+' : '-';

    // Format date: DD/MM/YYYY
    let formattedDate = '';
    if (t.date) {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const categoryInfo = getCategoryInfo(t.category, t.type);

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${categoryInfo.class}">
            ${categoryInfo.name}
          </span>
        </td>
        <td class="px-6 py-4">${t.note || '-'}</td>
        <td class="px-6 py-4">${formattedDate}</td>
        <td class="px-6 py-4 text-right font-bold ${colorClass}">
          ${sign}${formatCurrency(t.amount, null, currentRate)}
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// INITIALIZATION
// ==========================================
async function initDashboard() {
  const user = await checkAuth();
  if (!user) return;

  console.log(`👤 User UID: ${user.uid}`);

  // Get month filter element
  monthFilter = document.getElementById('monthFilter');

  // Populate month filter
  populateMonthFilter();

  // Load initial data
  await loadDashboardData();

  // Month filter change event
  if (monthFilter) {
    monthFilter.addEventListener('change', async () => {
      const [month, year] = monthFilter.value.split('-').map(Number);
      selectedMonth = month;
      selectedYear = year;
      await loadDashboardData();
    });
  }
}

// Chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();

  // Listen for new transactions added via modal
  window.addEventListener('transactionAdded', async (event) => {
    console.log('📢 New transaction added, refreshing dashboard...', event.detail);
    await loadDashboardData();
  });
});
