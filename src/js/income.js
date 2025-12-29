import './toast.js';
// income.js - Full-featured income management with month filter
import {
  listenToUserTransactions,
  deleteDocument,
  updateDocument,
  getMonthlyStats,
  getTransactionsByMonth
} from '../firebase/firestore.service.js';
import { checkAuth } from '../firebase/auth.js';
import { getCategoryInfo, normalizeCategory } from './categoryUtils.js';
import { formatCurrency, getExchangeRate } from '../services/currencyService.js';

// Legacy formatter (kept for backward compatibility in specific cases)
const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

// State
let allIncomes = [];
let filteredIncomes = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let selectedMonth = new Date().getMonth() + 1;
let selectedYear = new Date().getFullYear();
let currentRate = null; // Cached exchange rate
let selectedCategory = ''; // New state for category filter

// DOM elements
let tableBody = null;
let searchInput = null;
let categoryFilter = null;
let monthFilter = null;
let paginationContainer = null;

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
  loadDataForMonth();
};

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
  // Month dropdown
  const monthDropdown = document.getElementById('month-dropdown');
  const monthButton = e.target.closest('button[onclick="toggleMonthDropdown()"]');
  if (!monthButton && monthDropdown && !monthDropdown.contains(e.target)) {
    monthDropdown.classList.add('hidden');
    const arrow = document.getElementById('month-arrow');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }

  // Category dropdown
  const catDropdown = document.getElementById('category-dropdown');
  const catButton = e.target.closest('button[onclick="toggleCategoryDropdown()"]');
  if (!catButton && catDropdown && !catDropdown.contains(e.target)) {
    catDropdown.classList.add('hidden');
    const arrow = document.getElementById('category-arrow');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }
});

// ==========================================
// LOAD DATA FOR SELECTED MONTH
// ==========================================
async function loadDataForMonth() {
  try {
    // Pre-load exchange rate for currency formatting
    currentRate = await getExchangeRate();

    const transactions = await getTransactionsByMonth(selectedMonth, selectedYear);

    allIncomes = transactions
      .filter(t => t.type === 'income')
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

    currentPage = 1;
    filterAndRender();
    await loadMonthlySummaryWithComparison();

  } catch (error) {
    console.error('Error loading data for month:', error);
  }
}

// ==========================================
// LOAD MONTHLY SUMMARY WITH COMPARISON
// ==========================================
async function loadMonthlySummaryWithComparison() {
  try {
    const currentData = await getMonthlyStats(selectedMonth, selectedYear);

    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = selectedYear - 1;
    }

    let prevData = { totalIncome: 0, totalExpense: 0, transactions: [] };
    try {
      prevData = await getMonthlyStats(prevMonth, prevYear);
    } catch (e) {
      console.log('No previous month data');
    }

    // Calculate income percentage change
    const incomeChange = prevData.totalIncome > 0
      ? ((currentData.totalIncome - prevData.totalIncome) / prevData.totalIncome * 100).toFixed(0)
      : 0;

    // Find main income source
    const incomeByCategory = {};
    currentData.transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const cat = normalizeCategory(t.category, 'income');
        if (!incomeByCategory[cat]) incomeByCategory[cat] = 0;
        incomeByCategory[cat] += t.amount;
      });

    const sortedCategories = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]);
    const mainSource = sortedCategories.length > 0 ? sortedCategories[0][0] : '--';
    const mainSourcePercent = sortedCategories.length > 0 && currentData.totalIncome > 0
      ? Math.round((sortedCategories[0][1] / currentData.totalIncome) * 100)
      : 0;

    // Count transactions
    const incomeCount = currentData.transactions.filter(t => t.type === 'income').length;
    const prevIncomeCount = prevData.transactions ? prevData.transactions.filter(t => t.type === 'income').length : 0;
    const countChange = incomeCount - prevIncomeCount;

    // Update UI
    updateIncomeCard(currentData.totalIncome, incomeChange);
    updateMainSourceCard(mainSource, mainSourcePercent);
    updateCountCard(incomeCount, countChange);

  } catch (error) {
    console.error('Error loading monthly summary:', error);
  }
}

function updateIncomeCard(value, percentChange) {
  const valueEl = document.getElementById('summary-income');
  if (valueEl) {
    valueEl.innerText = formatCurrency(value, null, currentRate);
  }

  const card = valueEl?.closest('.stat-card');
  if (card) {
    const badge = card.querySelector('.inline-flex');
    if (badge) {
      const isPositive = parseFloat(percentChange) >= 0;
      const sign = isPositive ? '+' : '';
      const badgeClass = isPositive ? 'bg-green-50 text-emerald-600' : 'bg-red-50 text-red-500';

      badge.className = `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${badgeClass}`;
      badge.innerHTML = `${sign}${percentChange}% <span class="text-gray-400 font-medium ml-1">vs tháng trước</span>`;
    }
  }
}

function updateMainSourceCard(source, percent) {
  const sourceEl = document.getElementById('summary-main-source');
  if (sourceEl) {
    sourceEl.innerText = source;
  }

  const card = sourceEl?.closest('.stat-card');
  if (card) {
    const badge = card.querySelector('.inline-flex');
    if (badge) {
      badge.innerHTML = `Chiếm ${percent}% <span class="text-gray-400 font-medium ml-1">tổng thu</span>`;
    }
  }
}

function updateCountCard(count, change) {
  const countEl = document.getElementById('summary-count');
  if (countEl) {
    countEl.innerText = count;
  }

  const card = countEl?.closest('.stat-card');
  if (card) {
    const badge = card.querySelector('.inline-flex');
    if (badge) {
      const sign = change >= 0 ? '+' : '';
      badge.innerHTML = `${sign}${change} <span class="text-gray-400 font-medium ml-1">vs tháng trước</span>`;
    }
  }
}

// ==========================================
// POPULATE CATEGORY FILTER
// ==========================================
// Toggle category dropdown
window.toggleCategoryDropdown = function () {
  const dropdown = document.getElementById('category-dropdown');
  const arrow = document.getElementById('category-arrow');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
    if (arrow) {
      arrow.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }
};

// Select category from dropdown
window.selectCategory = function (category) {
  selectedCategory = category;

  // Update UI text
  const textEl = document.getElementById('selected-category-text');
  if (textEl) textEl.textContent = category || 'Tất cả nguồn thu';

  // Update UI active state in dropdown
  populateCategoryFilter();

  // Close dropdown
  toggleCategoryDropdown();

  // Reload data
  currentPage = 1;
  filterAndRender();
};

function populateCategoryFilter() {
  const container = document.getElementById('category-options');
  if (!container) return;

  const categories = ['Lương', 'Thưởng', 'Đầu tư', 'Freelance', 'Thu nhập khác'];

  let html = `
    <div onclick="selectCategory('')"
        class="px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center ${selectedCategory === '' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-emerald-50 hover:text-emerald-600 font-medium text-gray-700'}">
        <span>Tất cả nguồn thu</span>
        ${selectedCategory === '' ? '<span class="material-symbols-outlined text-[18px]">check</span>' : ''}
    </div>
  `;

  categories.forEach(cat => {
    const isActive = cat === selectedCategory;
    html += `
        <div onclick="selectCategory('${cat}')"
            class="px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center ${isActive ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-emerald-50 hover:text-emerald-600 font-medium text-gray-700'}">
            <span>${cat}</span>
            ${isActive ? '<span class="material-symbols-outlined text-[18px]">check</span>' : ''}
        </div>`;
  });

  container.innerHTML = html;
}

// ==========================================
// FILTER AND RENDER
// ==========================================
function filterAndRender() {
  filteredIncomes = [...allIncomes];

  if (searchInput && searchInput.value) {
    const searchText = searchInput.value.toLowerCase();
    filteredIncomes = filteredIncomes.filter(t =>
      (t.note || '').toLowerCase().includes(searchText) ||
      normalizeCategory(t.category, 'income').toLowerCase().includes(searchText) ||
      t.amount.toString().includes(searchText)
    );
  }

  // Filter by category (normalized)
  if (selectedCategory) {
    filteredIncomes = filteredIncomes.filter(t => {
      const normalizedCat = normalizeCategory(t.category, 'income');
      return normalizedCat === selectedCategory;
    });
  }

  renderTable();
  renderPagination();
}

// ==========================================
// RENDER TABLE WITH PAGINATION
// ==========================================
function renderTable() {
  if (!tableBody) return;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageIncomes = filteredIncomes.slice(startIndex, endIndex);

  if (pageIncomes.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="p-5 text-center text-gray-500 italic">
          Không tìm thấy giao dịch nào trong tháng ${selectedMonth}/${selectedYear}
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = pageIncomes.map(item => {
    const formattedAmount = formatCurrency(item.amount, null, currentRate);

    let formattedDate = '';
    if (item.date) {
      const parts = item.date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const categoryInfo = getCategoryInfo(item.category, 'income');
    const categoryClass = categoryInfo.class;
    const categoryName = categoryInfo.name;

    return `
      <tr class="hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-none">
        <td class="p-5 text-center">
          <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer">
        </td>
        <td class="p-5 text-sm text-gray-600 font-medium">${formattedDate}</td>
        <td class="p-5 text-sm text-gray-900 font-semibold">${item.note || 'Không có ghi chú'}</td>
        <td class="p-5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${categoryClass}">
            ${categoryName}
          </span>
        </td>
        <td class="p-5 text-sm font-bold text-right text-emerald-600">+${formattedAmount}</td>
        <td class="p-5 text-center">
          <div class="w-6 h-6 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        </td>
        <td class="p-5 text-right">
          <div class="flex justify-end gap-2 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
            <button class="hover:text-blue-500 transition-colors btn-edit" data-id="${item.id}" 
              data-amount="${item.amount}" data-category="${item.category}" 
              data-note="${item.note || ''}" data-date="${item.date}">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button class="hover:text-red-500 transition-colors btn-delete" data-id="${item.id}">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachEventListeners();
}

// ==========================================
// RENDER PAGINATION
// ==========================================
function renderPagination() {
  if (!paginationContainer) return;

  const totalItems = filteredIncomes.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  let pageButtons = '';

  pageButtons += `
    <button class="pagination-btn w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
      data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      <span class="material-symbols-outlined text-[16px]">chevron_left</span>
    </button>
  `;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === currentPage;
    pageButtons += `
      <button class="pagination-btn w-8 h-8 flex items-center justify-center rounded ${isActive ? 'bg-[#10B981] text-white font-bold shadow-sm shadow-emerald-200' : 'border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold'} text-xs transition-colors" 
        data-page="${i}">
        ${i}
      </button>
    `;
  }

  pageButtons += `
    <button class="pagination-btn w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs transition-colors ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
      data-page="${currentPage + 1}" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
      <span class="material-symbols-outlined text-[16px]">chevron_right</span>
    </button>
  `;

  paginationContainer.innerHTML = `
    <p class="text-xs font-medium text-gray-500">
      Hiển thị <span class="font-bold text-gray-900">${totalItems > 0 ? startIndex : 0}</span> 
      đến <span class="font-bold text-gray-900">${endIndex}</span> 
      trong số <span class="font-bold text-gray-900">${totalItems}</span> giao dịch
    </p>
    <div class="flex items-center gap-1">
      ${pageButtons}
    </div>
  `;

  paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.disabled) return;
      const page = parseInt(this.dataset.page);
      const totalPages = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        renderPagination();
      }
    });
  });
}

// ==========================================
// EVENT LISTENERS (Edit & Delete)
// ==========================================
function attachEventListeners() {
  tableBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async function () {
      const id = this.dataset.id;
      if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
        const result = await deleteDocument('transactions', id);
        if (result.success) {
          alert('✅ Đã xóa!');
          await loadDataForMonth();
        }
      }
    });
  });

  tableBody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function () {
      const data = {
        id: this.dataset.id,
        amount: this.dataset.amount,
        category: this.dataset.category,
        note: this.dataset.note,
        date: this.dataset.date
      };
      openEditModal(data);
    });
  });
}

// ==========================================
// EDIT MODAL
// ==========================================
function openEditModal(data) {
  let modal = document.getElementById('edit-income-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-income-modal';
    modal.innerHTML = createEditModalHTML();
    document.body.appendChild(modal);
  }

  document.getElementById('edit-income-id').value = data.id;
  document.getElementById('edit-income-amount').value = data.amount;
  document.getElementById('edit-income-category').value = normalizeCategory(data.category, 'income');
  document.getElementById('edit-income-note').value = data.note;
  document.getElementById('edit-income-date').value = data.date;

  modal.classList.remove('hidden');
  setupEditModalEvents();
}

function createEditModalHTML() {
  const categories = ['Lương', 'Thưởng', 'Đầu tư', 'Freelance', 'Thu nhập khác'];

  return `
    <div class="fixed inset-0 z-[100] transition-opacity duration-300 font-body">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" id="edit-income-modal-overlay"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div class="bg-white rounded-[32px] w-full max-w-xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] pointer-events-auto relative">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-2xl font-extrabold text-gray-900">Sửa Thu Nhập</h3>
            <button id="edit-income-modal-close" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <span class="material-symbols-rounded text-[24px]">close</span>
            </button>
          </div>
          <form id="edit-income-form">
            <input type="hidden" id="edit-income-id">
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Mô tả</label>
                <input id="edit-income-note" type="text" class="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium text-gray-900" placeholder="Ghi chú">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Số tiền</label>
                  <input id="edit-income-amount" type="number" class="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium text-gray-900" required>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nguồn thu</label>
                  <select id="edit-income-category" class="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:border-emerald-500 outline-none font-medium text-gray-900 cursor-pointer">
                    ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Ngày</label>
                <input id="edit-income-date" type="date" class="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium text-gray-900" required>
              </div>
              <div class="grid grid-cols-2 gap-4 pt-2">
                <button type="button" id="edit-income-modal-cancel" class="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50">Hủy</button>
                <button type="submit" class="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 flex items-center justify-center gap-2">
                  <span class="material-symbols-rounded">check</span> Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function setupEditModalEvents() {
  const modal = document.getElementById('edit-income-modal');
  const overlay = document.getElementById('edit-income-modal-overlay');
  const closeBtn = document.getElementById('edit-income-modal-close');
  const cancelBtn = document.getElementById('edit-income-modal-cancel');
  const form = document.getElementById('edit-income-form');

  const closeModal = () => modal.classList.add('hidden');

  overlay.onclick = closeModal;
  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  form.onsubmit = async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-income-id').value;
    const amount = parseFloat(document.getElementById('edit-income-amount').value);
    const category = document.getElementById('edit-income-category').value;
    const note = document.getElementById('edit-income-note').value;
    const date = document.getElementById('edit-income-date').value;

    if (!amount || !category || !date) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const result = await updateDocument('transactions', id, {
        amount,
        category,
        description: note,
        date
      });

      if (result.success) {
        alert('✅ Đã cập nhật!');
        closeModal();
        await loadDataForMonth();
      } else {
        alert('❌ Lỗi: ' + result.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Lỗi: ' + error.message);
    }
  };
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async function () {
  const user = await checkAuth();
  if (!user) return;

  // Assign DOM elements
  tableBody = document.getElementById('transactionTableBody');
  searchInput = document.getElementById('searchInput');
  categoryFilter = document.getElementById('categoryFilter');
  monthFilter = document.getElementById('monthFilter');
  paginationContainer = document.getElementById('pagination-container');

  // Initialize filters
  populateMonthFilter();
  populateCategoryFilter();

  // Load initial data
  await loadDataForMonth();

  // Month filter is now handled by custom dropdown (selectMonth function)

  // Search event
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentPage = 1;
      filterAndRender();
    });
  }

  // Category filter is now handled by custom dropdown (selectCategory function)

  // Listen for new transactions added via modal
  window.addEventListener('transactionAdded', async (event) => {
    console.log('📢 New transaction added, refreshing income data...', event.detail);
    await loadDataForMonth();
  });
});
