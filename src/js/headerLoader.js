// src/js/headerLoader.js
// Utility function để load header cho tất cả các trang
import { getUserProfile } from '../firebase/firestore.service.js';
import { auth } from '../firebase/firebase.config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getCurrentCurrency,
  toggleCurrency,
  getExchangeRate,
  formatExchangeRate
} from '../services/currencyService.js';

/**
 * Load header component và thực thi script bên trong
 * @param {string} headerPath - Đường dẫn đến file header.html
 */
export async function loadHeader(headerPath = '../../src/components/header.html') {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) {
    console.warn('Không tìm thấy element #header-container');
    return;
  }

  try {
    const response = await fetch(headerPath);
    if (!response.ok) {
      console.error(`Không tải được header từ ${headerPath}`);
      return;
    }

    const html = await response.text();
    headerContainer.innerHTML = html;

    // --- FIX NAVIGATION LINKS ---
    // Detect if we are at the root level (index.html)
    // Simple check: headerPath starts with '.' (./src...) instead of '..' (../../src...)
    const isRoot = headerPath.startsWith('./');

    if (isRoot) {
      const navLinks = headerContainer.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== 'index.html' && !href.startsWith('src/page') && !href.startsWith('http')) {
          link.setAttribute('href', `./src/page/${href}`);
        }
      });
    } else {
      // We are in a sub-page (e.g., src/page/expense.html)
      // The "Tổng quan" link (index.html) needs to point to the root
      const navLinks = headerContainer.querySelectorAll('.nav-link, .flex.items-center.gap-2.flex-shrink-0'); // Select nav links AND Logo link
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === 'index.html') {
          link.setAttribute('href', '../../index.html');
        }
      });
    }
    // ----------------------------

    // Thực thi các script trong HTML được load
    const scripts = headerContainer.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Khởi tạo mobile menu
    initMobileMenu();

    // Khởi tạo Auth Guard sau khi load header
    try {
      const { initAuthGuard } = await import('../firebase/authGuard.js');
      initAuthGuard();
    } catch (error) {
      console.warn('Không thể load authGuard:', error);
    }

    // Trigger custom event để logout.js biết header đã load xong
    const headerLoadedEvent = new CustomEvent('headerLoaded');
    document.dispatchEvent(headerLoadedEvent);

    // --- NEW: Init Transaction Modal ---
    try {
      // Import dynamically to avoid side effects if not needed or path issues
      const { initTransactionModal } = await import('./transaction-modal.js');
      initTransactionModal();

      // Attach Click Event to "Add New" button in the header
      const addBtn = headerContainer.querySelector('.btn-add');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          if (window.openTransactionModal) {
            window.openTransactionModal();
          } else {
            console.warn('Transaction Modal not loaded yet');
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load transaction modal script:', error);
    }
    // -----------------------------------

    // --- NEW: Load User Profile for Header (wait for auth) ---
    onAuthStateChanged(auth, async (user) => {
      if (!user) return; // Not logged in

      try {
        const profile = await getUserProfile();
        console.log('Header profile loaded:', profile);

        if (profile) {
          // Update username
          const userNameEl = document.getElementById('userName');
          if (userNameEl) {
            userNameEl.textContent = profile.username || profile.email?.split('@')[0] || 'User';
          }

          // Update avatar
          const userAvatarEl = document.getElementById('userAvatar');
          const userAvatarText = document.getElementById('userAvatarText');

          if (userAvatarEl && profile.avatarUrl) {
            // Has avatar URL - show image
            userAvatarEl.style.backgroundImage = `url("${profile.avatarUrl}")`;
            if (userAvatarText) userAvatarText.style.display = 'none';
          } else if (userAvatarText) {
            // No avatar - show initials
            const name = profile.username || profile.email || 'User';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            userAvatarText.textContent = initials || 'U';
          }
        }
      } catch (error) {
        console.warn('Failed to load user profile for header:', error);
      }
    });
    // -----------------------------------------

    // --- NEW: Init Currency Toggle Button ---
    initCurrencyToggle();

  } catch (error) {
    console.error('Lỗi khi load header:', error);
  }
}

/**
 * Khởi tạo menu mobile cho header
 */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  // Đóng menu khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
}

/**
 * Khởi tạo Currency Toggle button trong header
 */
async function initCurrencyToggle() {
  const toggleBtn = document.getElementById('currencyToggle');
  const currencyIcon = document.getElementById('currencyIcon');
  const currencyText = document.getElementById('currencyText');

  if (!toggleBtn || !currencyIcon || !currencyText) return;

  // Update UI dựa trên currency hiện tại
  function updateCurrencyUI(currency) {
    if (currency === 'USD') {
      currencyIcon.textContent = '$';
      currencyText.textContent = 'USD';
      toggleBtn.classList.add('usd');
    } else {
      currencyIcon.textContent = '₫';
      currencyText.textContent = 'VND';
      toggleBtn.classList.remove('usd');
    }
  }

  // Load và hiển thị tỉ giá trong tooltip
  async function updateTooltip() {
    try {
      const rate = await getExchangeRate();
      toggleBtn.title = `1 USD = ${formatExchangeRate(rate)} VND\nClick để chuyển đổi`;
    } catch (e) {
      toggleBtn.title = 'Click để chuyển đổi tiền tệ';
    }
  }

  // Khởi tạo trạng thái ban đầu
  const currentCurrency = getCurrentCurrency();
  updateCurrencyUI(currentCurrency);
  await updateTooltip();

  // Xử lý click toggle
  toggleBtn.addEventListener('click', async () => {
    const newCurrency = toggleCurrency();
    updateCurrencyUI(newCurrency);

    // Reload trang để áp dụng currency mới
    // Hoặc có thể dispatch event để các component khác lắng nghe
    window.location.reload();
  });

  // Lắng nghe sự kiện currencyChanged từ các trang khác
  window.addEventListener('currencyChanged', (e) => {
    updateCurrencyUI(e.detail);
  });
}
