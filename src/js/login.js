document.addEventListener('DOMContentLoaded', function() {
    // -----------------------------------------------------------
    // 1. CHỨC NĂNG ẨN/HIỆN MẬT KHẨU
    // -----------------------------------------------------------
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            // Kiểm tra loại input hiện tại (password hay text)
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Đổi icon con mắt
            const icon = this.querySelector('span');
            if (type === 'text') {
                icon.textContent = 'visibility_off'; // Icon mắt gạch chéo
            } else {
                icon.textContent = 'visibility'; // Icon mắt thường
            }
        });
    }

    // -----------------------------------------------------------
    // 2. XỬ LÝ ĐĂNG NHẬP
    // -----------------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Ngăn form tải lại trang mặc định
            e.preventDefault(); 

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Kiểm tra dữ liệu nhập vào (Validation cơ bản)
            if (email && password) {
                // --- QUAN TRỌNG: LƯU TRẠNG THÁI ĐĂNG NHẬP ---
                // Lưu biến 'isLoggedIn' = 'true' vào bộ nhớ trình duyệt
                localStorage.setItem('isLoggedIn', 'true');
                
                // Lưu email người dùng để hiển thị ở các trang sau (nếu cần)
                localStorage.setItem('userEmail', email); 
                
                // Thông báo và chuyển hướng
                alert("Đăng nhập thành công! Đang chuyển hướng...");
                window.location.href = "index.html"; 
            } else {
                alert("Vui lòng điền đầy đủ email và mật khẩu!");
            }
        });
    }
});