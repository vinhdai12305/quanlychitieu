// toast.js - Custom Toast Notification System replace native alert

// Create styles
const style = document.createElement('style');
style.innerHTML = `
    .toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
    }
    
    .toast-message {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        padding: 16px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        border: 1px solid #f3f4f6;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        opacity: 0;
    }
    
    .toast-message.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .toast-content {
        flex: 1;
        font-family: 'Manrope', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        line-height: 1.4;
    }
    
    .toast-close {
        flex-shrink: 0;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
    }
    
    .toast-close:hover {
        background: #f3f4f6;
        color: #4b5563;
    }
    
    /* Types */
    .toast-success .toast-icon { background: #d1fae5; color: #059669; }
    .toast-success { border-left: 4px solid #10b981; }
    
    .toast-error .toast-icon { background: #fee2e2; color: #dc2626; }
    .toast-error { border-left: 4px solid #ef4444; }
    
    .toast-warning .toast-icon { background: #fef3c7; color: #d97706; }
    .toast-warning { border-left: 4px solid #f59e0b; }
    
    .toast-info .toast-icon { background: #e0f2fe; color: #0284c7; }
    .toast-info { border-left: 4px solid #3b82f6; }
`;
document.head.appendChild(style);

// Create container
let toastContainer = document.querySelector('.toast-container');
if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
}

const ICONS = {
    success: '<span class="material-symbols-outlined text-[18px]">check</span>',
    error: '<span class="material-symbols-outlined text-[18px]">error</span>',
    warning: '<span class="material-symbols-outlined text-[18px]">warning</span>',
    info: '<span class="material-symbols-outlined text-[18px]">info</span>'
};

export const Toast = {
    show(message, type = 'info') {
        const msgStr = String(message);
        // Clean message from icons if any
        let cleanMsg = msgStr.replace(/^[✅❌⚠️ℹ️]\s*/, '').replace(/\s*[✅❌⚠️ℹ️]$/, '');

        // Auto detect type if not strict
        if (type === 'info') {
            if (msgStr.includes('✅') || msgStr.toLowerCase().includes('thành công')) type = 'success';
            else if (msgStr.includes('❌') || msgStr.toLowerCase().includes('lỗi') || msgStr.toLowerCase().includes('thất bại')) type = 'error';
            else if (msgStr.includes('⚠️')) type = 'warning';
        }

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;

        toast.innerHTML = `
            <div class="toast-icon">
                ${ICONS[type] || ICONS.info}
            </div>
            <div class="toast-content">${cleanMsg}</div>
            <div class="toast-close" onclick="this.parentElement.style.opacity='0'; setTimeout(()=>this.parentElement.remove(), 300)">
                <span class="material-symbols-outlined text-[18px]">close</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Animate
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 400);
        }, 3000);
    }
};

// Override native alert
window.alert = function (message) {
    Toast.show(message);
};

// Export to window for global usage if module not supported
window.Toast = Toast;
