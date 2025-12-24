document.addEventListener("DOMContentLoaded", function () {
    
    // --- 1. NHÚNG HEADER ---
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('header.html')
            .then(res => res.text())
            .then(data => { headerContainer.innerHTML = data; })
            .catch(err => console.error("Lỗi header:", err));
    }

    // --- 2. DỮ LIỆU ---
    const budgets = [
        { id: 1, name: "Ăn uống", icon: "restaurant", bg: "bg-orange-50 text-orange-500", limit: 5000000, spent: 4200000, note: "Hàng tháng" },
        { id: 2, name: "Di chuyển", icon: "directions_car", bg: "bg-blue-50 text-blue-500", limit: 3000000, spent: 1200000, note: "Hàng tháng" },
        { id: 3, name: "Mua sắm", icon: "shopping_bag", bg: "bg-purple-50 text-purple-500", limit: 2000000, spent: 2550000, note: "Hàng tháng" },
        { id: 4, name: "Hóa đơn", icon: "bolt", bg: "bg-yellow-50 text-yellow-600", limit: 1500000, spent: 950000, note: "Hàng tháng" },
        { id: 5, name: "Giải trí", icon: "stadia_controller", bg: "bg-pink-50 text-pink-500", limit: 2000000, spent: 450000, note: "Hàng tháng" }
    ];

    // --- 3. HÀM RENDER CARD (HIỆN DANH SÁCH) ---
    const grid = document.getElementById('budget-grid');
    function render() {
        if (!grid) return;
        let html = '';
        budgets.forEach(item => {
            const percent = (item.spent / item.limit) * 100;
            const remaining = item.limit - item.spent;
            const isOver = percent > 100;

            html += `
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div class="flex justify-between items-start mb-5">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span class="material-symbols-rounded text-[28px]">${item.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-extrabold text-gray-900 text-lg">${item.name}</h3>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">${item.note}</p>
                        </div>
                    </div>
                </div>
                <div class="mb-5 text-sm font-medium">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-500">Đã chi: <b class="text-gray-900">${new Intl.NumberFormat('vi-VN').format(item.spent)}₫</b></span>
                        <span class="text-gray-400">/ ${new Intl.NumberFormat('vi-VN').format(item.limit)}₫</span>
                    </div>
                    <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div class="${isOver ? 'bg-red-500' : 'bg-primary'} h-full rounded-full" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-dashed border-gray-100">
                    <div class="flex flex-col">
                        <span class="text-[11px] text-gray-400 font-bold uppercase">${isOver ? 'Vượt quá' : 'Còn lại'}</span>
                        <span class="text-sm font-extrabold ${isOver ? 'text-red-600' : 'text-emerald-600'}">${new Intl.NumberFormat('vi-VN').format(Math.abs(remaining))}₫</span>
                    </div>
                    <span class="${isOver ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} px-3 py-1 rounded-lg text-[11px] font-bold">
                        ${isOver ? 'Vượt mức' : 'An toàn'}
                    </span>
                </div>
            </div>`;
        });
        grid.innerHTML = html;
    }
    render(); // Chạy hàm render ngay khi load trang

    // --- 4. LOGIC CLICK DROPDOWN THÁNG NÀY ---
    const menuBtn = document.getElementById('time-menu-btn');
    const dropdown = document.getElementById('time-dropdown');
    const arrow = document.getElementById('time-arrow');
    const display = document.getElementById('selected-time');
    const items = document.querySelectorAll('.time-item');

    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isHidden = dropdown.classList.toggle('hidden');
            arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }

    items.forEach(item => {
        item.addEventListener('click', function() {
            display.innerText = this.querySelector('span').innerText;
            
            // Xóa style cũ
            items.forEach(i => {
                i.className = 'time-item flex items-center justify-between px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-primary font-medium transition-colors';
                const check = i.querySelector('.material-symbols-rounded');
                if (check) check.remove();
            });

            // Active item mới
            this.className = 'time-item active-item flex items-center justify-between px-4 py-2.5 text-sm bg-emerald-50 text-primary font-bold transition-colors';
            const icon = document.createElement('span');
            icon.className = 'material-symbols-rounded text-[18px]';
            icon.innerText = 'check';
            this.appendChild(icon);

            dropdown.classList.add('hidden');
            arrow.style.transform = 'rotate(0deg)';
        });
    });

    window.addEventListener('click', function() {
        if (dropdown) dropdown.classList.add('hidden');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    });
});




s