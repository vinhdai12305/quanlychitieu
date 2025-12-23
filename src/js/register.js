document.addEventListener('DOMContentLoaded', function() {
    // 1. Hàm dùng chung để ẩn/hiện mật khẩu
    function setupPasswordToggle(toggleBtnId, inputId) {
        const toggleBtn = document.getElementById(toggleBtnId);
        const input = document.getElementById(inputId);

        if (toggleBtn && input) {
            toggleBtn.addEventListener('click', function() {
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

    // Áp dụng cho ô Mật khẩu
    setupPasswordToggle('togglePassword', 'password');
    // Áp dụng cho ô Xác nhận mật khẩu
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

    // 2. Xử lý Đăng ký
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Kiểm tra mật khẩu khớp nhau
            if (password !== confirmPassword) {
                alert("Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.");
                return;
            }

            // Kiểm tra độ dài mật khẩu (Ví dụ: tối thiểu 6 ký tự)
            if (password.length < 6) {
                alert("Mật khẩu phải có ít nhất 6 ký tự.");
                return;
            }

            if (username && email && password) {
                // Giả lập đăng ký thành công
                alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
                window.location.href = "login.html"; // Chuyển về trang đăng nhập
            } else {
                alert("Vui lòng điền đầy đủ thông tin!");
            }
        });
    }
});