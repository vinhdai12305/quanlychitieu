// src/js/main.js

document.addEventListener("DOMContentLoaded", () => {
  loadComponent(
    "header-container",
    "./src/components/header.html",
    initMobileMenu
  );
});

/**
 * Load HTML component vào 1 element
 * @param {string} elementId - ID của element (vd: header-container)
 * @param {string} filePath - Đường dẫn file HTML
 * @param {Function} callback - Hàm chạy sau khi load xong (optional)
 */
async function loadComponent(elementId, filePath, callback) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      console.error(`Không tải được ${filePath}`);
      return;
    }

    element.innerHTML = await response.text();

    if (typeof callback === "function") {
      callback();
    }
  } catch (error) {
    console.error(`Lỗi khi load ${filePath}:`, error);
  }
}

/**
 * Khởi tạo menu mobile cho header
 */
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");

  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
}
