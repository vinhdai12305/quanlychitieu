// File: src/js/income.js

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Lấy các element cần thiết
    const form = document.getElementById('incomeForm');
    const tableBody = document.getElementById('incomeTableBody');
    const incomeAmountInput = document.getElementById('incomeAmount');
    const incomeSourceInput = document.getElementById('incomeSource');
    const incomeDateInput = document.getElementById('incomeDate');
    const incomeCountDisplay = document.getElementById('incomeCount'); // Thẻ hiển thị số lần

    // 2. Xử lý khi nhấn nút "Lưu thu nhập"
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Ngăn load lại trang

            // Lấy dữ liệu từ input
            const amount = parseFloat(incomeAmountInput.value);
            const source = incomeSourceInput.value;
            const date = incomeDateInput.value;

            // Format tiền tệ (VD: 5000000 -> 5.000.000 ₫)
            const formattedAmount = new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
            }).format(amount);

            // Format ngày (YYYY-MM-DD -> DD/MM/YYYY)
            const formattedDate = date.split('-').reverse().join('/');

            // Tạo HTML cho dòng mới
            const newRowHTML = `
                <tr class="hover:bg-gray-50/80 transition-colors group new-row">
                    <td class="p-4 pl-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-emerald-600">
                                <span class="material-symbols-outlined text-[20px]">payments</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">${source}</span>
                        </div>
                    </td>
                    <td class="p-4 text-right">
                        <span class="text-sm font-bold text-emerald-600 bg-green-50 px-2.5 py-1 rounded-full">+${formattedAmount}</span>
                    </td>
                    <td class="p-4 text-sm font-medium text-gray-500">${formattedDate}</td>
                    <td class="p-4 text-right pr-6">
                        <div class="flex justify-end gap-2 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button class="w-8 h-8 rounded-full hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                            <button class="w-8 h-8 rounded-full hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all btn-delete"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;

            // Chèn dòng mới vào đầu bảng
            tableBody.insertAdjacentHTML('afterbegin', newRowHTML);

            // Cập nhật số đếm (Demo)
            if(incomeCountDisplay) {
                let count = parseInt(incomeCountDisplay.innerText);
                incomeCountDisplay.innerText = count + 1;
            }

            // Reset form
            form.reset();
        });
    }

    // 3. Xử lý nút Xóa (Event Delegation)
    if(tableBody) {
        tableBody.addEventListener('click', function(e) {
            // Kiểm tra xem có click vào nút xóa hoặc icon xóa không
            const deleteBtn = e.target.closest('.btn-delete');
            
            if(deleteBtn) {
                if(confirm('Bạn có chắc muốn xóa khoản thu này?')) {
                    const row = deleteBtn.closest('tr');
                    row.remove();
                    
                    // Giảm số đếm
                    if(incomeCountDisplay) {
                        let count = parseInt(incomeCountDisplay.innerText);
                        incomeCountDisplay.innerText = Math.max(0, count - 1);
                    }
                }
            }
        });
    }
});