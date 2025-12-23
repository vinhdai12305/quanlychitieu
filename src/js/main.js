document.addEventListener("DOMContentLoaded", () => {
    // Lưu ý: Đường dẫn tính từ file index.html gọi nó
    loadComponent("header", "./src/components/header.html");
    loadComponent("footer", "./src/components/footer.html");
});

async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            element.innerHTML = html;
            
            // Re-init logic cho menu mobile nếu là header
            if (elementId === 'header') initMobileMenu(); 
        } else {
            console.error(`Lỗi tải ${filePath}: ${response.status}`);
        }
    } catch (error) {
        console.error(`Lỗi fetch ${filePath}:`, error);
    }
}

function initMobileMenu() {
    // Logic menu mobile (như cũ)
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if(btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }
}