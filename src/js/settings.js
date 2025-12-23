// 1. Cấu hình Tailwind
tailwind.config = {
    theme: {
        extend: {
            colors: {
                "primary": "#22c55e",
                "primary-hover": "#16a34a",
                "background-main": "#f8fafc",
                "surface-card": "#ffffff",
                "element-bg": "#f1f5f9",
                "border-light": "#e2e8f0",
                "text-primary": "#1e293b",
                "text-secondary": "#64748b",
                "danger": "#ef4444",
                "warning": "#f59e0b",
                "info": "#3b82f6"
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"]
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
            }
        },
    },
};

// 2. Hàm tải Header (Nhúng header.html)
document.addEventListener("DOMContentLoaded", function() {
    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy header.html');
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => console.error('Lỗi khi tải header:', error));
});

// 3. Logic ẩn/hiện mật khẩu (Toggle Password)
document.addEventListener("DOMContentLoaded", function() {
    const toggleButtons = document.querySelectorAll('input[type="password"] + button');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('.material-symbols-outlined');
            
            if (input.type === "password") {
                input.type = "text";
                icon.textContent = "visibility"; // Đổi icon thành mắt mở
            } else {
                input.type = "password";
                icon.textContent = "visibility_off"; // Đổi icon thành mắt đóng
            }
        });
    });
});