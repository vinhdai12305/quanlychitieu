import './toast.js';
// login.js
import { login } from '../firebase/auth.js';

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. CHỨC NĂNG ẨN/HIỆN MẬT KHẨU (Giữ nguyên)
  // ==========================================
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      const icon = this.querySelector('span');
      if (type === 'text') {
        icon.textContent = 'visibility_off';
      } else {
        icon.textContent = 'visibility';
      }
    });
  }

  // ==========================================
  // 2. XỬ LÝ ĐĂNG NHẬP VỚI FIREBASE
  // ==========================================
  const loginForm = document.getElementById('loginForm');
  const submitBtn = loginForm?.querySelector('button[type="submit"]');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Validation cơ bản
      if (!email || !password) {
        alert("Vui lòng điền đầy đủ email và mật khẩu!");
        return;
      }

      // Disable button để tránh submit nhiều lần
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng nhập...';
      }

      // Gọi Firebase Auth
      const result = await login(email, password);

      if (result.success) {
        // Lưu thông tin user (optional)
        localStorage.setItem('userEmail', email);

        alert("Đăng nhập thành công!");
        window.location.href = "../../index.html";
      } else {
        // Hiển thị lỗi
        alert(result.error);

        // Enable lại button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Đăng nhập';
        }
      }
    });
  }
});
