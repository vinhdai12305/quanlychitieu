// File: src/js/expense.js

document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // PHẦN 1: XỬ LÝ HEADER (Code cũ của bạn)
    // ==========================================
    const headerContainer = document.getElementById('header-container');
    if(headerContainer) {
        fetch('../../src/components/header.html') 
            .then(res => {
                if (!res.ok) throw new Error("Không tìm thấy file header!");
                return res.text();
            })
            .then(data => {
                headerContainer.innerHTML = data;
                if (window.setupNavRouting) {
                    window.setupNavRouting(headerContainer);
                }
                if (window.highlightActiveNav) {
                    window.highlightActiveNav(headerContainer);
                }
                highlightExpenseMenu();
            })
            .catch(err => console.error("Lỗi:", err));
    }

    function highlightExpenseMenu() {
        if (window.highlightActiveNav) {
            window.highlightActiveNav(document);
        }
    }

    // ==========================================
    // PHẦN 2: XỬ LÝ DỮ LIỆU & BẢNG (Code mới thêm)
    // ==========================================

    // 1. Dữ liệu mẫu (Giả lập database)
    const transactions = [
        { id: 1, date: '2023-10-20', desc: 'Mua sắm siêu thị BigC', category: 'an-uong', catName: 'Thực phẩm', amount: 1200000, type: 'expense' },
        { id: 2, date: '2023-10-19', desc: 'Lương tháng 10', category: 'luong', catName: 'Lương', amount: 25000000, type: 'income' },
        { id: 3, date: '2023-10-18', desc: 'Đổ xăng xe máy', category: 'di-chuyen', catName: 'Di chuyển', amount: 80000, type: 'expense' },
        { id: 4, date: '2023-10-18', desc: 'Thanh toán Netflix', category: 'hoa-don', catName: 'Giải trí', amount: 260000, type: 'expense' },
        { id: 5, date: '2023-10-15', desc: 'Tiền điện tháng 9', category: 'hoa-don', catName: 'Hóa đơn', amount: 1500000, type: 'expense' },
        { id: 6, date: '2023-10-12', desc: 'Cafe với bạn bè', category: 'an-uong', catName: 'Ăn uống', amount: 150000, type: 'expense' },
    ];

    // Lấy các element từ HTML (Đảm bảo HTML đã có ID tương ứng)
    const tableBody = document.getElementById('transactionTableBody');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    // Nếu không tìm thấy bảng thì dừng (tránh lỗi ở các trang khác)
    if (!tableBody) return;

    // --- Các hàm tiện ích ---

    // Format tiền tệ (VD: 1200000 -> 1.200.000)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // Format ngày (YYYY-MM-DD -> DD/MM/YYYY)
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Style cho badge danh mục
    const getCategoryStyle = (catCode) => {
        const styles = {
            'an-uong': 'bg-blue-100 text-blue-700',
            'di-chuyen': 'bg-orange-100 text-orange-700',
            'mua-sam': 'bg-purple-100 text-purple-700',
            'hoa-don': 'bg-yellow-100 text-yellow-700',
            'luong': 'bg-green-100 text-green-700',
            'thuong': 'bg-teal-100 text-teal-700'
        };
        return styles[catCode] || 'bg-gray-100 text-gray-700'; // Mặc định
    };

    // --- Hàm Render bảng ---
    function renderTable(data) {
        // Xóa nội dung cũ
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="p-5 text-center text-gray-500 italic">Không tìm thấy giao dịch nào</td></tr>';
            return;
        }

        // Tạo dòng HTML cho từng giao dịch
        data.forEach(item => {
            // Xác định màu sắc và dấu +/- dựa trên loại giao dịch
            const isIncome = item.type === 'income';
            const amountClass = isIncome ? 'text-green-500' : 'text-red-500';
            const amountSign = isIncome ? '+' : '-';
            const iconClass = isIncome ? 'bg-green-500 ring-green-100' : 'bg-red-500 ring-red-100';

            // Template literal để tạo dòng tr
            const row = `
                <tr class="hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-none">
                    <td class="p-5 text-center"><input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"></td>
                    <td class="p-5 text-sm text-gray-600 font-medium">${formatDate(item.date)}</td>
                    <td class="p-5 text-sm text-gray-900 font-semibold">${item.desc}</td>
                    <td class="p-5">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyle(item.category)}">
                            ${item.catName}
                        </span>
                    </td>
                    <td class="p-5 text-sm font-bold text-right ${amountClass}">${amountSign}${formatCurrency(item.amount)} ₫</td>
                    <td class="p-5 text-center">
                        <div class="w-6 h-6 mx-auto rounded-full bg-white border border-gray-100 flex items-center justify-center">
                            <span class="inline-block w-2.5 h-2.5 rounded-full ${item.type === 'income' ? 'bg-green-500' : 'bg-red-500'}"></span>
                        </div>
                    </td>
                    <td class="p-5 text-right">
                        <div class="flex justify-end gap-2 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button class="hover:text-blue-500 transition-colors"><span class="material-symbols-outlined text-[20px]">edit</span></button>
                            <button class="hover:text-red-500 transition-colors"><span class="material-symbols-outlined text-[20px]">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- Hàm Lọc dữ liệu ---
    function filterData() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';

        const filtered = transactions.filter(item => {
            // Lọc theo từ khóa (Mô tả hoặc Số tiền)
            const matchesSearch = item.desc.toLowerCase().includes(searchText) || 
                                  item.amount.toString().includes(searchText);
            
            // Lọc theo danh mục
            const matchesCategory = selectedCategory === '' || item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        renderTable(filtered);
    }

    // --- Gắn sự kiện ---
    if(searchInput) searchInput.addEventListener('input', filterData);
    if(categoryFilter) categoryFilter.addEventListener('change', filterData);

    // Chạy lần đầu khi load trang
    renderTable(transactions);
});