// 1. Import thư viện Firebase từ CDN (Không cần cài đặt Node.js)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================================
// 2. CẤU HÌNH FIREBASE (BẠN HÃY DÁN CODE CỦA BẠN VÀO ĐÂY)
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyDiDIFKqm5e_g7MrUMWGTcTvjOtoNhj2GA", // <--- Dán API Key của bạn
    authDomain: "quanlichitieu-c30b4.firebaseapp.com",
    projectId: "quanlichitieu-c30b4",
    storageBucket: "quanlichitieu-c30b4.appspot.com",
    messagingSenderId: "385297935024",
    appId: "1:385297935024:web:26a01ca43a3d6cbc3de975",
    measurementId: "G-7MQX3Z2ZWL"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const budgetCollection = collection(db, "budgets"); // Tên bảng dữ liệu là "budgets"

// Biến lưu trữ dữ liệu cục bộ
let budgets = [];

// 3. Lắng nghe dữ liệu thời gian thực (Real-time Listener)
// Mỗi khi database thay đổi, hàm này sẽ tự chạy lại để cập nhật giao diện
onSnapshot(
    query(budgetCollection, orderBy("createdAt", "desc")),
    (snapshot) => {
        budgets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        window.renderBudgets('all');
    }
);

// 4. Hàm Render Giao diện (Đã fix lại khung Background Premium)
window.renderBudgets = function(filterType = 'all') {
    const grid = document.getElementById('budget-grid');
    if(!grid) return;
    
    let html = '';

    // Lọc dữ liệu
    const filtered = budgets.filter(item => {
        const percent = (item.spent / item.limit) * 100;
        if (filterType === 'warning') return percent >= 80 && percent <= 100;
        if (filterType === 'danger') return percent > 100;
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-3 text-center py-16 text-gray-400 font-medium">Chưa có dữ liệu. Hãy tạo mới!</div>`;
        return;
    }

    filtered.forEach(item => {
        const percent = (item.spent / item.limit) * 100;
        const remaining = item.limit - item.spent;
        const isOver = percent > 100;
        const isWarning = percent >= 80 && percent <= 100;

        let barColor = isOver ? 'bg-red-500' : (isWarning ? 'bg-orange-500' : 'bg-[#10B981]');
        let textColor = isOver ? 'text-red-600' : (isWarning ? 'text-orange-600' : 'text-[#059669]');
        let badgeClass = isOver ? 'bg-red-50 text-red-600' : (isWarning ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600');
        let statusText = isOver ? 'Vượt hạn mức' : (isWarning ? 'Sắp hết' : 'An toàn');
        
        const iconBgMap = {
            'restaurant': 'bg-orange-50 text-orange-600',
            'directions_car': 'bg-blue-50 text-blue-600',
            'shopping_bag': 'bg-purple-50 text-purple-600',
            'bolt': 'bg-yellow-50 text-yellow-600',
            'stadia_controller': 'bg-pink-50 text-pink-600',
            'medical_services': 'bg-red-50 text-red-600',
            'school': 'bg-indigo-50 text-indigo-600',
            'flight': 'bg-sky-50 text-sky-600'
        };
        const iconStyle = iconBgMap[item.icon] || 'bg-gray-50 text-gray-600';

        // CHỖ NÀY: Thêm lại class "premium-card" và "bg-white" để hiện khung
        html += `
        <div class="premium-card bg-white p-8 group cursor-pointer border border-transparent hover:border-emerald-100 relative transition-all duration-300 shadow-sm">
            
            <button onclick="deleteBudget('${item.id}')" class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full" title="Xóa">
                <span class="material-symbols-rounded text-[20px]">delete</span>
            </button>

            <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-5">
                    <div class="w-16 h-16 rounded-[22px] ${iconStyle} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                        <span class="material-symbols-rounded text-[32px]">${item.icon}</span>
                    </div>
                    <div>
                        <h3 class="font-extrabold text-gray-900 text-xl mb-1">${item.name}</h3>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Tháng này</p>
                    </div>
                </div>
            </div>
            <div class="mb-6">
                <div class="flex justify-between text-sm mb-3 font-bold">
                    <span class="text-gray-500">Chi tiêu</span>
                    <span class="text-gray-900">${new Intl.NumberFormat('vi-VN').format(item.spent || 0)} <span class="text-gray-400 font-normal">/ ${new Intl.NumberFormat('vi-VN').format(item.limit)}</span></span>
                </div>
                <div class="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                    <div class="${barColor} h-full rounded-full transition-all duration-1000 shadow-sm relative" style="width: ${Math.min(percent, 100)}%">
                         <div class="absolute inset-0 bg-white/20"></div>
                    </div>
                </div>
            </div>
            <div class="flex justify-between items-center pt-6 border-t border-gray-50">
                <div class="flex flex-col">
                    <span class="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">${isOver ? 'VƯỢT QUÁ' : 'CÒN LẠI'}</span>
                    <span class="text-xl font-black ${textColor}">${new Intl.NumberFormat('vi-VN').format(Math.abs(remaining))}₫</span>
                </div>
                <span class="${badgeClass} px-4 py-2 rounded-xl text-xs font-bold shadow-sm">${statusText}</span>
            </div>
        </div>`;
    });
    grid.innerHTML = html;
};

// 5. Xử lý Thêm mới Ngân sách (Gửi lên Firebase)
const form = document.getElementById('add-budget-form');
if(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Chặn load lại trang
        
        const name = document.getElementById('inp-name').value;
        const limit = Number(document.getElementById('inp-limit').value);
        const icon = document.getElementById('inp-icon').value;

        try {
            // Thêm vào Firestore
            await addDoc(budgetCollection, {
                name: name,
                limit: limit,
                icon: icon,
                spent: 0, // Mặc định mới tạo là chưa chi tiêu
                createdAt: new Date().toISOString()
            });
            
            alert("Đã lưu thành công lên Firebase!");
            form.reset();
            toggleModal(); // Đóng popup

        } catch (error) {
            console.error("Lỗi khi thêm: ", error);
            alert("Có lỗi xảy ra: " + error.message);
        }
    });
}

// 6. Hàm Xóa Ngân sách
window.deleteBudget = async function(id) {
    if(confirm("Bạn có chắc muốn xóa mục này không?")) {
        try {
            await deleteDoc(doc(db, "budgets", id));
        } catch (error) {
            console.error("Lỗi xóa:", error);
        }
    }
}

// --- CÁC HÀM UI UTILS (Giữ nguyên để HTML gọi được) ---

window.filterData = function(type, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderBudgets(type);
};

window.toggleModal = function() {
    const modal = document.getElementById('add-modal');
    const body = document.body;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        body.classList.add('overflow-hidden');
    } else {
        modal.classList.add('hidden');
        body.classList.remove('overflow-hidden');
    }
};

window.toggleDropdown = function() {
    const menu = document.getElementById('time-dropdown');
    const arrow = document.getElementById('time-arrow');
    const isHidden = menu.classList.toggle('hidden');
    arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
};

window.selectTime = function(el) {
    document.getElementById('selected-time').innerText = el.querySelector('span').innerText;
    document.querySelectorAll('.time-item').forEach(i => {
        i.className = 'time-item px-5 py-3 text-sm font-semibold hover:bg-gray-50 cursor-pointer flex justify-between';
        const check = i.querySelector('.material-symbols-rounded');
        if(check) check.remove();
    });
    el.className = 'time-item px-5 py-3 text-sm font-bold bg-emerald-50 text-emerald-600 cursor-pointer flex justify-between';
    const check = document.createElement('span');
    check.className = 'material-symbols-rounded text-[18px]';
    check.innerText = 'check';
    el.appendChild(check);
    toggleDropdown();
};

// Đóng dropdown khi click ra ngoài
window.onclick = function(e) {
    if (!e.target.closest('button[onclick="toggleDropdown()"]')) {
        const menu = document.getElementById('time-dropdown');
        const arrow = document.getElementById('time-arrow');
        if(menu) menu.classList.add('hidden');
        if(arrow) arrow.style.transform = 'rotate(0deg)';
    }
}