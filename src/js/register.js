import './toast.js';
// register.js
import { register } from '../firebase/auth.js';

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. HÀM DÙNG CHUNG ẨN/HIỆN MẬT KHẨU (Giữ nguyên)
  // ==========================================
  function setupPasswordToggle(toggleBtnId, inputId) {
    const toggleBtn = document.getElementById(toggleBtnId);
    const input = document.getElementById(inputId);

    if (toggleBtn && input) {
      toggleBtn.addEventListener('click', function () {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);

        const icon = this.querySelector('span');
        if (type === 'text') {
          icon.textContent = 'visibility_off';
        } else {
          icon.textContent = 'visibility';
        }
      });
    }
  }

  // Áp dụng toggle cho 2 ô mật khẩu
  setupPasswordToggle('togglePassword', 'password');
  setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

  // ==========================================
  // 2. XỬ LÝ ĐĂNG KÝ VỚI FIREBASE
  // ==========================================
  const registerForm = document.getElementById('registerForm');
  const submitBtn = registerForm?.querySelector('button[type="submit"]');

  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const dob = document.getElementById('dob').value;
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Validation
      if (!username || !email || !password || !confirmPassword || !phone || !dob) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.");
        return;
      }

      if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      // Phone validation (simple)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert("Số điện thoại không hợp lệ! (10-11 số)");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Email không hợp lệ!");
        return;
      }

      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
      }

      // Gọi Firebase Auth
      const result = await register(email, password, username, {
        phone: phone,
        dateOfBirth: dob
      });

      if (result.success) {
        alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
        window.location.href = "login.html";
      } else {
        alert(result.error);

        // Enable lại button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Đăng ký';
        }
      }
    });
  }
});
