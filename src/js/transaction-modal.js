/**
 * Logic for Transaction Modal
 * Handles opening/closing, tab switching, and form submission
 * Connected to Firebase Firestore
 */

import { addTransaction, getUserBudgetsOnce } from '../firebase/firestore.service.js';

// Store budgets for the current month
let currentBudgets = [];

export function initTransactionModal() {
    const modalPath = '/quanlychitieu/components/transaction-modal.html';

    // Check if modal already exists to avoid duplicates
    if (document.getElementById('transaction-modal')) return;

    // Load modal HTML
    fetch(modalPath)
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            setupModalEvents();
        })
        .catch(err => console.error('Failed the load transaction modal:', err));
}

async function loadBudgetsForDropdown() {
    const budgetSelect = document.getElementById('transaction-budget');
    if (!budgetSelect) return;

    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        currentBudgets = await getUserBudgetsOnce(currentMonth, currentYear);

        // Clear existing options except the first one
        budgetSelect.innerHTML = '<option value="">-- Không tính vào ngân sách --</option>';

        // Add budget options
        currentBudgets.forEach(budget => {
            const option = document.createElement('option');
            option.value = budget.id;
            option.textContent = `📊 ${budget.name} (${new Intl.NumberFormat('vi-VN').format(budget.limit)} đ)`;
            budgetSelect.appendChild(option);
        });

        console.log(`📦 Loaded ${currentBudgets.length} budgets for dropdown`);
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}

function setupModalEvents() {
    const modal = document.getElementById('transaction-modal');
    const overlay = document.getElementById('transaction-modal-overlay');
    const closeBtn = document.getElementById('transaction-modal-close');
    const cancelBtn = document.getElementById('transaction-modal-cancel');
    const form = document.getElementById('transaction-form');
    const typeBtns = document.querySelectorAll('.transaction-type-btn');
    const typeInput = document.getElementById('transaction-type');
    const dateInput = document.getElementById('transaction-date');
    const submitBtn = form?.querySelector('button[type="submit"]');
    const budgetContainer = document.getElementById('budget-container');

    // Category selects
    const expenseCategory = document.getElementById('expense-category');
    const incomeCategory = document.getElementById('income-category');

    // Set default date to today
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // --- Functions ---
    const openModal = async () => {
        modal.classList.remove('hidden');
        // Load budgets when modal opens
        await loadBudgetsForDropdown();
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    // Show/hide budget container based on transaction type
    const toggleBudgetContainer = (type) => {
        if (budgetContainer) {
            if (type === 'expense') {
                budgetContainer.classList.remove('hidden');
            } else {
                budgetContainer.classList.add('hidden');
                // Reset selection when hidden
                const budgetSelect = document.getElementById('transaction-budget');
                if (budgetSelect) budgetSelect.value = '';
            }
        }
    };

    // Switch category dropdown based on type
    const switchCategory = (type) => {
        if (type === 'expense') {
            // Show expense, hide income with animation
            expenseCategory.classList.remove('hidden', 'opacity-0', 'scale-95');
            expenseCategory.classList.add('opacity-100', 'scale-100');
            expenseCategory.name = 'category';
            expenseCategory.required = true;

            incomeCategory.classList.add('hidden', 'opacity-0', 'scale-95');
            incomeCategory.classList.remove('opacity-100', 'scale-100');
            incomeCategory.name = '';
            incomeCategory.required = false;
            incomeCategory.selectedIndex = 0;
        } else {
            // Show income, hide expense with animation
            incomeCategory.classList.remove('hidden', 'opacity-0', 'scale-95');
            incomeCategory.classList.add('opacity-100', 'scale-100');
            incomeCategory.name = 'category';
            incomeCategory.required = true;

            expenseCategory.classList.add('hidden', 'opacity-0', 'scale-95');
            expenseCategory.classList.remove('opacity-100', 'scale-100');
            expenseCategory.name = '';
            expenseCategory.required = false;
            expenseCategory.selectedIndex = 0;
        }

        // Toggle budget container
        toggleBudgetContainer(type);
    };

    // Expose openModal globally
    window.openTransactionModal = openModal;

    // Close events
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Keyboard 'Esc' to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Tab switching (Expense vs Income) with category change
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-type');
            typeInput.value = type;

            // Switch category dropdown
            switchCategory(type);
        });
    });

    // Set default active tab
    const defaultTab = document.querySelector('.transaction-type-btn[data-type="expense"]');
    if (defaultTab) {
        defaultTab.click();
    }

    // Form submission - CONNECTED TO FIREBASE
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validation
        if (!data.amount || !data.category || !data.date) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Disable button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="animate-spin material-symbols-rounded">progress_activity</span> Đang lưu...';
        }

        try {
            // Prepare transaction data
            const transactionData = {
                type: data.type || 'expense',
                amount: parseFloat(data.amount),
                category: data.category,
                note: data.note || '',
                date: data.date
            };

            // Add budgetId only if expense and a budget is selected
            if (data.type === 'expense' && data.budgetId) {
                transactionData.budgetId = data.budgetId;

                // Also store budget name for display purposes
                const selectedBudget = currentBudgets.find(b => b.id === data.budgetId);
                if (selectedBudget) {
                    transactionData.budgetName = selectedBudget.name;
                }
            }

            console.log('📤 Saving transaction with data:', transactionData);

            // Save to Firebase
            const result = await addTransaction(transactionData);

            if (result.success) {
                alert('✅ Thêm giao dịch thành công!');
                closeModal();
                form.reset();

                // Reload page to update data table
                window.location.reload();
            } else {
                alert('❌ Lỗi: ' + result.error);
            }
        } catch (error) {
            console.error('Transaction error:', error);
            alert('❌ Lỗi: ' + error.message);
        } finally {
            // Enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="material-symbols-rounded">check</span> Lưu giao dịch';
            }
        }
    });
}
