import './toast.js';
// budget.js - Refactored to use firestore.service.js with userId filter
import { listenToUserBudgets, addBudget, deleteDocument, updateAllBudgetsSpent, getTransactionsByMonth, listenToUserTransactionsForMonth } from '../firebase/firestore.service.js';
import { checkAuth } from '../firebase/auth.js';
import { formatCurrency as formatCurrencyService, getExchangeRate } from '../services/currencyService.js';

// Biến lưu trữ dữ liệu cục bộ
let rawBudgets = []; // Raw budgets from Firestore (without spent calculated)
let budgets = [];    // Budgets with spent calculated
let transactions = [];
let transactionsLoaded = false;
let unsubscribeBudgets = null;
let unsubscribeTransactions = null;
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();
let currentRate = null; // Cached exchange rate

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', async function () {
    // Kiểm tra đăng nhập trước
    const user = await checkAuth();
    if (!user) return;

    // Pre-load exchange rate for currency formatting
    currentRate = await getExchangeRate();

    // Khởi tạo UI
    initializeUI();
    populateMonthDropdown();

    // Khởi tạo listeners cho tháng hiện tại
    initializeListeners();
});

// Khởi tạo UI với tháng hiện tại
function initializeUI() {
    updatePageTitle();
    updateSelectedTimeText();
}

// Cập nhật title trang
function updatePageTitle() {
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = `Ngân sách Tháng ${currentMonth}`;
    }
}

// Cập nhật text hiển thị thời gian đã chọn
function updateSelectedTimeText() {
    const selectedTimeEl = document.getElementById('selected-time');
    if (selectedTimeEl) {
        selectedTimeEl.textContent = `Tháng ${currentMonth}/${currentYear}`;
    }
}

// Populate dropdown với các tháng trong 12 tháng gần nhất
function populateMonthDropdown() {
    const container = document.getElementById('month-options');
    if (!container) return;

    let html = '';
    const today = new Date();

    // Tạo 12 options cho 12 tháng gần nhất
    for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const isActive = month === currentMonth && year === currentYear;

        html += `
        <div onclick="selectMonth(${month}, ${year})"
            class="month-item px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center ${isActive ? 'bg-emerald-50 text-primary font-bold' : 'hover:bg-emerald-50 hover:text-primary font-medium'}">
            <span>Tháng ${month}/${year}</span>
            ${isActive ? '<span class="material-symbols-rounded text-[18px]">check</span>' : ''}
        </div>`;
    }

    container.innerHTML = html;
}

// Xử lý khi chọn tháng
window.selectMonth = function (month, year) {
    // Unsubscribe listeners cũ
    if (unsubscribeTransactions) unsubscribeTransactions();
    if (unsubscribeBudgets) unsubscribeBudgets();

    // Cập nhật tháng/năm hiện tại
    currentMonth = month;
    currentYear = year;
    transactionsLoaded = false;
    rawBudgets = [];
    budgets = [];
    transactions = [];

    // Cập nhật UI
    updatePageTitle();
    updateSelectedTimeText();
    populateMonthDropdown();
    toggleDropdown();

    // Khởi tạo lại listeners với tháng mới
    initializeListeners();
};

// Khởi tạo realtime listeners
function initializeListeners() {
    // Lắng nghe realtime transactions của tháng để tính spent
    unsubscribeTransactions = listenToUserTransactionsForMonth((data) => {
        transactions = data;
        transactionsLoaded = true;
        console.log(`📊 Transactions updated: ${transactions.length} for ${currentMonth}/${currentYear}`);

        // Recalculate and render
        recalculateAndRender();
    }, currentMonth, currentYear);

    // Lắng nghe dữ liệu budgets theo userId và tháng hiện tại
    unsubscribeBudgets = listenToUserBudgets((data) => {
        // Lưu raw budgets (chưa tính spent)
        rawBudgets = data;
        console.log(`📦 Budgets updated: ${rawBudgets.length}`);

        // Recalculate and render
        recalculateAndRender();
    }, currentMonth, currentYear);
}

// Tính toán lại spent cho tất cả budgets và render
function recalculateAndRender() {
    // Chỉ tính khi transactions đã được load
    if (!transactionsLoaded) {
        console.log('⏳ Waiting for transactions to load...');
        return;
    }

    // Tính spent cho mỗi budget từ transactions
    budgets = rawBudgets.map(budget => ({
        ...budget,
        spent: calculateSpentForBudget(budget.id)
    }));

    window.renderBudgets('all');
}

// Tính toán spent cho một budget từ transactions (dựa trên budgetId)
function calculateSpentForBudget(budgetId) {
    // Chỉ tính những giao dịch có budgetId khớp
    const spent = transactions
        .filter(t => t.type === 'expense' && t.budgetId === budgetId)
        .reduce((sum, t) => sum + t.amount, 0);

    console.log(`💰 Budget ${budgetId}: spent = ${spent} `);
    return spent;
}

// Hàm Render Giao diện
window.renderBudgets = function (filterType = 'all') {
    const grid = document.getElementById('budget-grid');
    if (!grid) return;

    // Update summary cards
    updateSummaryCards();

    let html = '';

    const filtered = budgets.filter(item => {
        const percent = (item.spent / item.limit) * 100;
        if (filterType === 'warning') return percent >= 80 && percent <= 100;
        if (filterType === 'danger') return percent > 100;
        return true;
    });

    // Category descriptions and icons mapping
    const categoryInfo = {
        'Ăn uống': { icon: '🍽️', desc: 'Đồ ăn, thức uống', color: 'bg-orange-500' },
        'Di chuyển': { icon: '🚗', desc: 'Grab, Xăng xe', color: 'bg-blue-500' },
        'Mua sắm': { icon: '🛍️', desc: 'Quần áo, Đồ dùng', color: 'bg-pink-500' },
        'Giải trí': { icon: '🎬', desc: 'Xem phim, Cafe', color: 'bg-purple-500' },
        'Hóa đơn': { icon: '⚡', desc: 'Điện, Nước, Internet', color: 'bg-yellow-500' },
        'Sức khỏe': { icon: '💊', desc: 'Thuốc, Khám bệnh', color: 'bg-red-500' },
        'Giáo dục': { icon: '📚', desc: 'Học phí, Sách vở', color: 'bg-indigo-500' },
        'Du lịch': { icon: '✈️', desc: 'Vé máy bay, Khách sạn', color: 'bg-cyan-500' },
        'Chi tiêu khác': { icon: '📦', desc: 'Các khoản khác', color: 'bg-gray-500' }
    };

    filtered.forEach(item => {
        const percent = Math.round((item.spent / item.limit) * 100);
        const remaining = item.limit - item.spent;

        // Determine status based on percentage
        let statusIcon, statusText, statusClass, progressColor;

        if (percent > 100) {
            // Over budget - Red
            statusIcon = '🚫';
            statusText = 'Đã vượt quá ngân sách!';
            statusClass = 'text-red-500';
            progressColor = 'bg-red-500';
        } else if (percent === 100) {
            // Exactly 100% - Orange
            statusIcon = '⚠️';
            statusText = 'Đã hết ngân sách!';
            statusClass = 'text-orange-500';
            progressColor = 'bg-orange-500';
        } else if (percent >= 80) {
            // Warning - Orange (>80%)
            statusIcon = '⚠️';
            statusText = 'Sắp hết ngân sách, hãy chú ý!';
            statusClass = 'text-orange-500';
            progressColor = 'bg-orange-500';
        } else if (percent <= 25) {
            // Very good - Green (<25%)
            statusIcon = '✅';
            statusText = 'Rất tốt, tiếp tục duy trì.';
            statusClass = 'text-green-500';
            progressColor = 'bg-green-500';
        } else {
            // Normal - Green (25-80%)
            statusIcon = '✅';
            statusText = 'Chi tiêu hợp lý.';
            statusClass = 'text-green-500';
            progressColor = 'bg-green-500';
        }

        const catInfo = categoryInfo[item.category] || categoryInfo['Chi tiêu khác'];
        const icon = catInfo.icon;
        const desc = item.description || catInfo.desc;

        html += `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all relative group">
            <!-- Header: Icon, Name, Menu -->
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl ${catInfo.color} bg-opacity-10 flex items-center justify-center text-2xl">
                        ${icon}
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 text-lg">${item.name}</h3>
                        <p class="text-xs text-gray-400">${desc}</p>
                    </div>
                </div>
                <button onclick="deleteBudget('${item.id}')" 
                    class="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                    title="Xóa">
                    <span class="material-symbols-rounded text-[20px]">more_vert</span>
                </button>
            </div>

            <!-- Amount: Spent / Limit -->
            <div class="mb-3">
                <span class="text-2xl font-bold text-gray-900">${formatCurrency(item.spent)}</span>
                <span class="text-gray-400 font-medium ml-1">/ ${formatCurrency(item.limit)}</span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden">
                <div class="${progressColor} h-full rounded-full transition-all duration-500" 
                     style="width: ${Math.min(percent, 100)}%"></div>
            </div>

            <!-- Stats: Percent & Remaining -->
            <div class="flex justify-between items-center text-sm mb-4">
                <span class="${statusClass} font-bold">
                    ${percent}% ${percent > 100 ? '- Vượt quá' : 'đã dùng'}
                </span>
                <span class="text-gray-500">
                    Còn lại: <span class="${remaining < 0 ? 'text-red-500 font-bold' : 'text-gray-700'}">${formatCurrency(remaining)}</span>
                </span>
            </div>

            <!-- Status Message -->
            <div class="flex items-center gap-2 ${statusClass}">
                <span>${statusIcon}</span>
                <span class="text-sm font-medium">${statusText}</span>
            </div>
        </div>`;
    });

    // Add "Thêm danh mục" card
    html += `
    <div onclick="toggleModal()" 
         class="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px]">
        <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <span class="material-symbols-rounded text-[32px]">add</span>
        </div>
        <h3 class="font-bold text-gray-700 text-lg mb-1">Thêm danh mục</h3>
        <p class="text-sm text-gray-400">Tạo ngân sách cho danh mục mới</p>
    </div>`;

    grid.innerHTML = html;
};

// Format currency helper - sử dụng currencyService để hỗ trợ VND/USD
function formatCurrency(amount) {
    return formatCurrencyService(amount, null, currentRate);
}

// Update summary cards at the top
function updateSummaryCards() {
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalRemaining = totalLimit - totalSpent;
    const percentUsed = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    // Update text content if elements exist
    const summaryCards = document.querySelectorAll('.number-style-report');
    if (summaryCards.length >= 3) {
        summaryCards[0].textContent = formatCurrency(totalLimit);
        summaryCards[1].innerHTML = formatCurrency(totalSpent);
        summaryCards[2].textContent = formatCurrency(totalRemaining);
    }

    // Update progress bar
    const progressBar = document.querySelector('.bg-orange-500.h-2');
    if (progressBar) {
        progressBar.style.width = `${Math.min(percentUsed, 100)}% `;
    }
}

// Thêm Ngân sách
const form = document.getElementById('add-budget-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('inp-name').value;
        const limit = Number(document.getElementById('inp-limit').value);
        const categoryInput = document.getElementById('inp-category');
        const category = categoryInput ? categoryInput.value : name;

        // Map category to icon
        const categoryIcons = {
            'Ăn uống': 'restaurant',
            'Di chuyển': 'directions_car',
            'Mua sắm': 'shopping_bag',
            'Giải trí': 'stadia_controller',
            'Hóa đơn': 'bolt',
            'Sức khỏe': 'medical_services',
            'Giáo dục': 'school',
            'Du lịch': 'flight',
            'Chi tiêu khác': 'savings'
        };
        const icon = categoryIcons[category] || 'category';

        if (!name || !limit || !category) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        try {
            const result = await addBudget({
                name: name,
                category: category, // Category để link với transactions
                limit: limit,
                icon: icon,
                month: currentMonth,
                year: currentYear
            });

            if (result.success) {
                alert("✅ Đã lưu thành công!");
                form.reset();
                toggleModal();

                // Reload transactions để cập nhật spent
                transactions = await getTransactionsByMonth(currentMonth, currentYear);
            } else {
                alert("❌ Lỗi: " + result.error);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi: " + error.message);
        }
    });
}

// Xóa Ngân sách
window.deleteBudget = async function (id) {
    if (confirm("Bạn có chắc muốn xóa mục này không?")) {
        try {
            const result = await deleteDocument("budgets", id);
            if (result.success) {
                alert("✅ Đã xóa!");
            } else {
                alert("❌ Lỗi: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi: " + error.message);
        }
    }
}

// UI Utils
window.filterData = function (type, btn) {
    // Remove active styles from all buttons
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-emerald-500', 'text-white');
        b.classList.add('text-gray-500', 'hover:bg-gray-100');
    });

    // Add active styles to clicked button
    btn.classList.add('bg-emerald-500', 'text-white');
    btn.classList.remove('text-gray-500', 'hover:bg-gray-100');

    renderBudgets(type);
};
window.toggleModal = function () {
    const modal = document.getElementById('add-modal');
    document.body.classList.toggle('overflow-hidden');
    modal.classList.toggle('hidden');
};
window.toggleDropdown = function () {
    const menu = document.getElementById('time-dropdown');
    const arrow = document.getElementById('time-arrow');
    const isHidden = menu.classList.toggle('hidden');
    arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
};
window.selectTime = function (el) {
    document.getElementById('selected-time').innerText = el.querySelector('span').innerText;
    document.querySelectorAll('.time-item').forEach(i => {
        i.className = 'time-item px-5 py-3 text-sm font-semibold hover:bg-gray-50 cursor-pointer flex justify-between';
        const check = i.querySelector('.material-symbols-rounded');
        if (check) check.remove();
    });
    el.className = 'time-item px-5 py-3 text-sm font-bold bg-emerald-50 text-emerald-600 cursor-pointer flex justify-between';
    const check = document.createElement('span');
    check.className = 'material-symbols-rounded text-[18px]';
    check.innerText = 'check';
    el.appendChild(check);
    toggleDropdown();
};
window.onclick = function (e) {
    if (!e.target.closest('button[onclick="toggleDropdown()"]')) {
        const menu = document.getElementById('time-dropdown');
        const arrow = document.getElementById('time-arrow');
        if (menu) menu.classList.add('hidden');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}
