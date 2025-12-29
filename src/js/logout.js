import './toast.js';
// src/js/logout.js
import { logout } from '../firebase/auth.js';
import { getCurrentUser } from '../firebase/auth.js';

console.log('🔧 logout.js loaded');

// Hàm khởi tạo logout
function initLogout() {
  console.log('🔧 Initializing logout...');

  // Hiển thị thông tin user (chỉ log, không set UI vì headerLoader đã xử lý)
  const user = getCurrentUser();
  if (user) {
    console.log('👤 Current user:', user.email);
  }

  // Gắn sự kiện logout
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    console.log('✅ Found logout button');

    // Xóa event listener cũ nếu có (tránh duplicate)
    const newBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);

    newBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log('🔴 Logout button clicked');

      if (confirm('Bạn có chắc muốn đăng xuất?')) {
        try {
          // Disable button
          newBtn.disabled = true;
          newBtn.innerHTML = '<span class="material-symbols-outlined">progress_activity</span> Đang đăng xuất...';

          console.log('⏳ Calling logout function...');

          // Gọi logout
          await logout();

          console.log('✅ Logout completed');

        } catch (error) {
          console.error('❌ Logout error:', error);
          alert('Có lỗi xảy ra khi đăng xuất!');

          // Khôi phục button
          newBtn.disabled = false;
          newBtn.innerHTML = '<span class="material-symbols-outlined">logout</span> Đăng xuất';
        }
      } else {
        console.log('❌ User cancelled logout');
      }
    });
  } else {
    console.warn('⚠️ Logout button NOT found yet, will retry...');
    // Retry sau 500ms nếu button chưa có (header chưa load xong)
    setTimeout(() => {
      const retryBtn = document.getElementById('logoutBtn');
      if (retryBtn) {
        initLogout();
      }
    }, 500);
  }
}

// Lắng nghe event khi header được load
document.addEventListener('headerLoaded', function () {
  console.log('📢 Header loaded event received');
  setTimeout(initLogout, 100);
});

// Chờ DOM ready và thử init ngay
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    // Đợi một chút để header được load
    setTimeout(initLogout, 500);
  });
} else {
  // DOM đã sẵn sàng
  setTimeout(initLogout, 500);
}

// Sử dụng MutationObserver để theo dõi khi header được thêm vào DOM (backup)
const observer = new MutationObserver(function (mutations) {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && !logoutBtn.hasAttribute('data-logout-initialized')) {
    console.log('📢 Logout button detected via MutationObserver');
    logoutBtn.setAttribute('data-logout-initialized', 'true');
    initLogout();
  }
});

// Quan sát header-container
const headerContainer = document.getElementById('header-container');
if (headerContainer) {
  observer.observe(headerContainer, {
    childList: true,
    subtree: true
  });
}
