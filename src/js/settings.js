import './toast.js';
// settings.js - User profile management
import { loadHeader } from './headerLoader.js';
import { checkAuth } from '../firebase/auth.js';
import { getUserProfile, updateUserProfile } from '../firebase/firestore.service.js';
import { auth } from '../firebase/firebase.config.js';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
    getCurrentCurrency,
    setCurrency,
    getExchangeRate,
    getExchangeRateInfo,
    refreshExchangeRate,
    formatExchangeRate
} from '../services/currencyService.js';

// State
let currentUser = null;
let currentProfile = null;
let avatarFile = null;

document.addEventListener("DOMContentLoaded", async function () {
    // Kiểm tra đăng nhập
    currentUser = await checkAuth();
    if (!currentUser) return;

    // Load header
    loadHeader('/quanlychitieu/components/header.html');

    // Load user profile
    await loadUserProfile();

    // Setup event listeners
    setupEventListeners();
    setupPasswordToggles();
    setupAvatarUpload();
    setupChangePassword();

    // Setup currency settings
    setupCurrencySettings();
});

// ==========================================
// LOAD USER PROFILE
// ==========================================
async function loadUserProfile() {
    try {
        currentProfile = await getUserProfile();
        console.log('Loaded profile:', currentProfile);

        if (currentProfile) {
            // Populate form fields (using correct Firestore field names)
            document.getElementById('inp-fullname').value = currentProfile.username || '';
            document.getElementById('inp-email').value = currentProfile.email || currentUser.email || '';
            document.getElementById('inp-phone').value = currentProfile.phone || '';
            document.getElementById('inp-birthday').value = currentProfile.dateOfBirth || '';

            // Set avatar
            const avatarPreview = document.getElementById('avatar-preview');
            if (currentProfile.avatarUrl) {
                avatarPreview.style.backgroundImage = `url("${currentProfile.avatarUrl}")`;
            } else {
                // Use UI Avatars as fallback
                const name = currentProfile.username || currentProfile.email || 'User';
                avatarPreview.style.backgroundImage = `url("https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=128")`;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Save button
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', saveProfile);
    }

    // Cancel button
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            loadUserProfile(); // Reload original data
            avatarFile = null;
        });
    }
}

// ==========================================
// AVATAR UPLOAD
// ==========================================
function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatar-input');

    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File ảnh không được vượt quá 2MB!');
                return;
            }

            avatarFile = file;

            // Preview
            const reader = new FileReader();
            reader.onload = function (e) {
                const avatarPreview = document.getElementById('avatar-preview');
                avatarPreview.style.backgroundImage = `url("${e.target.result}")`;
            };
            reader.readAsDataURL(file);
        });
    }
}

// ==========================================
// SAVE PROFILE
// ==========================================
async function saveProfile() {
    const btnSave = document.getElementById('btn-save');
    const originalText = btnSave.innerHTML;

    try {
        // Show loading state
        btnSave.disabled = true;
        btnSave.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang lưu...
        `;

        // Get form values
        const username = document.getElementById('inp-fullname').value.trim();
        const phone = document.getElementById('inp-phone').value.trim();
        const dateOfBirth = document.getElementById('inp-birthday').value;

        // Prepare data (using correct Firestore field names)
        const profileData = {
            username,
            phone,
            dateOfBirth
        };

        // Handle avatar upload if there's a new file
        if (avatarFile) {
            // Convert to base64 for simple storage (for demo)
            // In production, you should upload to Firebase Storage
            const base64 = await fileToBase64(avatarFile);
            profileData.avatarUrl = base64;
        }

        // Save to Firestore
        const result = await updateUserProfile(profileData);

        if (result.success) {
            alert('✅ Đã lưu thông tin thành công!');
            avatarFile = null;
            await loadUserProfile(); // Reload to confirm
        } else {
            alert('❌ Lỗi: ' + result.error);
        }

    } catch (error) {
        console.error('Save profile error:', error);
        alert('❌ Lỗi: ' + error.message);
    } finally {
        // Restore button
        btnSave.disabled = false;
        btnSave.innerHTML = originalText;
    }
}

// ==========================================
// HELPERS
// ==========================================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('input[type="password"] + button');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const icon = this.querySelector('.material-symbols-outlined');

            if (input.type === "password") {
                input.type = "text";
                icon.textContent = "visibility";
            } else {
                input.type = "password";
                icon.textContent = "visibility_off";
            }
        });
    });
}

// ==========================================
// CHANGE PASSWORD
// ==========================================
function setupChangePassword() {
    const btnChangePassword = document.getElementById('btn-change-password');

    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', async function () {
            const currentPassword = document.getElementById('inp-current-password').value;
            const newPassword = document.getElementById('inp-new-password').value;

            // Validation
            if (!currentPassword) {
                alert('Vui lòng nhập mật khẩu hiện tại!');
                return;
            }

            if (!newPassword) {
                alert('Vui lòng nhập mật khẩu mới!');
                return;
            }

            if (newPassword.length < 6) {
                alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
                return;
            }

            const originalText = btnChangePassword.textContent;

            try {
                // Show loading
                btnChangePassword.disabled = true;
                btnChangePassword.textContent = 'Đang xử lý...';

                const user = auth.currentUser;
                if (!user) {
                    alert('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại!');
                    return;
                }

                // Re-authenticate with current password first
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);

                // Update to new password
                await updatePassword(user, newPassword);

                alert('✅ Đổi mật khẩu thành công!');

                // Clear form
                document.getElementById('inp-current-password').value = '';
                document.getElementById('inp-new-password').value = '';

            } catch (error) {
                console.error('Change password error:', error);

                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    alert('❌ Mật khẩu hiện tại không đúng!');
                } else if (error.code === 'auth/weak-password') {
                    alert('❌ Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn!');
                } else if (error.code === 'auth/requires-recent-login') {
                    alert('❌ Phiên đăng nhập đã cũ. Vui lòng đăng xuất và đăng nhập lại!');
                } else {
                    alert('❌ Lỗi: ' + error.message);
                }
            } finally {
                btnChangePassword.disabled = false;
                btnChangePassword.textContent = originalText;
            }
        });
    }
}

// ==========================================
// CURRENCY SETTINGS
// ==========================================
async function setupCurrencySettings() {
    const currencySelect = document.getElementById('currency-select');
    const rateValueEl = document.getElementById('exchange-rate-value');
    const rateUpdatedEl = document.getElementById('exchange-rate-updated');
    const btnRefresh = document.getElementById('btn-refresh-rate');

    if (!currencySelect) return;

    // Load current currency preference
    const currentCurrency = getCurrentCurrency();
    currencySelect.value = currentCurrency;

    // Load and display exchange rate
    await updateExchangeRateDisplay();

    // Currency change handler
    currencySelect.addEventListener('change', function () {
        setCurrency(this.value);
        alert(`✅ Đã chuyển sang ${this.value === 'VND' ? 'Việt Nam Đồng (₫)' : 'US Dollar ($)'}`);
    });

    // Refresh rate button
    if (btnRefresh) {
        btnRefresh.addEventListener('click', async function () {
            const icon = this.querySelector('.material-symbols-outlined');
            icon.classList.add('animate-spin');

            const result = await refreshExchangeRate();

            icon.classList.remove('animate-spin');

            if (result.success) {
                await updateExchangeRateDisplay();
                alert('✅ Đã cập nhật tỉ giá mới nhất!');
            } else {
                alert('❌ Không thể cập nhật tỉ giá. Vui lòng thử lại sau.');
            }
        });
    }

    // Helper function to update rate display
    async function updateExchangeRateDisplay() {
        if (!rateValueEl || !rateUpdatedEl) return;

        try {
            const rate = await getExchangeRate();
            const info = getExchangeRateInfo();

            rateValueEl.textContent = `1 USD = ${formatExchangeRate(rate)} VND`;

            if (info.lastUpdated) {
                const date = new Date(info.lastUpdated);
                rateUpdatedEl.textContent = `Cập nhật: ${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                rateUpdatedEl.textContent = 'Tỉ giá mặc định';
            }
        } catch (error) {
            console.error('Error updating rate display:', error);
            rateValueEl.textContent = '1 USD = -- VND';
            rateUpdatedEl.textContent = 'Không thể tải tỉ giá';
        }
    }
}