export function injectConfirmModal() {
    if (document.getElementById('global-confirm-modal')) return;

    const modalHTML = `
    <div id="global-confirm-modal" class="fixed inset-0 z-[100] hidden transition-opacity duration-300 font-body">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" id="global-confirm-overlay"></div>
        <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div class="bg-white rounded-[28px] w-full max-w-md p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] pointer-events-auto text-center relative transform transition-all scale-100">
                
                <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                    <span class="material-symbols-rounded text-[32px] text-red-500">delete</span>
                </div>

                <h3 class="text-2xl font-extrabold text-gray-900 mb-2">Xóa giao dịch?</h3>
                <p class="text-gray-500 font-medium mb-8" id="global-confirm-message">
                    Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác.
                </p>

                <div class="flex gap-4">
                    <button id="global-confirm-cancel" class="flex-1 py-3.5 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all">
                        Hủy
                    </button>
                    <button id="global-confirm-ok" class="flex-1 py-3.5 px-6 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200">
                        <span class="material-symbols-rounded text-[20px]">delete</span>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Bind events for overlay and cancel button
    document.getElementById('global-confirm-overlay').addEventListener('click', closeConfirmModal);
    document.getElementById('global-confirm-cancel').addEventListener('click', closeConfirmModal);
}

let onConfirmCallback = null;

export function showConfirmModal(message, onConfirm) {
    injectConfirmModal();

    const modal = document.getElementById('global-confirm-modal');
    const messageEl = document.getElementById('global-confirm-message');
    const okBtn = document.getElementById('global-confirm-ok');

    if (message) {
        messageEl.textContent = message;
    }

    // Store callback
    onConfirmCallback = onConfirm;

    // Show modal
    modal.classList.remove('hidden');

    // One-time event listener for OK button
    // We remove old listener to prevent multiple firings if opened multiple times
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);

    newOkBtn.addEventListener('click', () => {
        if (onConfirmCallback) onConfirmCallback();
        closeConfirmModal();
    });
}

export function closeConfirmModal() {
    const modal = document.getElementById('global-confirm-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}
