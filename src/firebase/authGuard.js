// authGuard.js - Using CDN
import { auth } from './firebase.config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ==========================================
// XÓA LOCALSTORAGE CŨ (Chạy 1 lần khi app khởi động)
// ==========================================
function cleanOldAuthData() {
  const oldKeys = ['isLoggedIn', 'userEmail'];
  let cleaned = false;

  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleaned = true;
    }
  });

  if (cleaned) {
    console.log('✅ Đã xóa localStorage cũ (localStorage-based auth)');
  }
}

// Chạy ngay khi import
cleanOldAuthData();

// ==========================================
// AUTH GUARD
// ==========================================
const publicPages = ['login.html', 'register.html'];

function isProtectedPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  return !publicPages.includes(currentPage);
}

export function initAuthGuard() {
  onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    // Define paths
    const loginPath = '/quanlychitieu/src/page/login.html';
    const dashboardPath = '/quanlychitieu/';

    if (!user && isProtectedPage()) {
      console.log('⚠️ Chưa đăng nhập, redirect về login...');
      window.location.href = loginPath;
    } else if (user && publicPages.includes(currentPage)) {
      console.log('✅ Đã đăng nhập, redirect về dashboard...');
      window.location.href = dashboardPath;
    } else if (user) {
      console.log('✅ User:', user.email);
    }
  });
}
