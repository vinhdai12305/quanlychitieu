/**
 * Currency Service - Quản lý chuyển đổi tiền tệ VND ↔ USD
 * Sử dụng ExchangeRate-API (miễn phí, không cần key)
 */

// ==========================================
// CONSTANTS
// ==========================================
const API_URL = 'https://open.er-api.com/v6/latest/USD';
const STORAGE_KEYS = {
    CURRENCY: 'moneykeeper_currency',
    EXCHANGE_RATE: 'moneykeeper_exchange_rate'
};
const DEFAULT_RATE = 25345; // Tỉ giá mặc định nếu API lỗi
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 giờ

// ==========================================
// GET/SET CURRENCY PREFERENCE
// ==========================================

/**
 * Lấy đơn vị tiền tệ hiện tại (VND hoặc USD)
 */
export function getCurrentCurrency() {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'VND';
}

/**
 * Đặt đơn vị tiền tệ
 */
export function setCurrency(currency) {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    // Dispatch event để các trang khác biết currency đã thay đổi
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
}

/**
 * Toggle giữa VND và USD
 */
export function toggleCurrency() {
    const current = getCurrentCurrency();
    const newCurrency = current === 'VND' ? 'USD' : 'VND';
    setCurrency(newCurrency);
    return newCurrency;
}

// ==========================================
// EXCHANGE RATE MANAGEMENT
// ==========================================

/**
 * Lấy tỉ giá đã cache
 */
function getCachedRate() {
    try {
        const cached = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
        if (cached) {
            const data = JSON.parse(cached);
            const now = Date.now();
            // Kiểm tra cache còn hiệu lực không (24 giờ)
            if (data.timestamp && (now - data.timestamp) < CACHE_DURATION_MS) {
                return data.rate;
            }
        }
    } catch (e) {
        console.warn('Error reading cached rate:', e);
    }
    return null;
}

/**
 * Lưu tỉ giá vào cache
 */
function setCachedRate(rate) {
    const data = {
        rate: rate,
        timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, JSON.stringify(data));
}

/**
 * Lấy tỉ giá USD -> VND từ API
 * Trả về số VND cho 1 USD
 */
export async function getExchangeRate() {
    // Kiểm tra cache trước
    const cachedRate = getCachedRate();
    if (cachedRate) {
        return cachedRate;
    }

    // Gọi API
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const rate = data.rates?.VND || DEFAULT_RATE;

        // Cache lại
        setCachedRate(rate);

        return rate;
    } catch (error) {
        console.warn('Error fetching exchange rate, using default:', error);
        return DEFAULT_RATE;
    }
}

/**
 * Lấy thông tin tỉ giá (bao gồm thời gian cập nhật)
 */
export function getExchangeRateInfo() {
    try {
        const cached = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
        if (cached) {
            const data = JSON.parse(cached);
            return {
                rate: data.rate || DEFAULT_RATE,
                lastUpdated: data.timestamp ? new Date(data.timestamp) : null
            };
        }
    } catch (e) {
        console.warn('Error reading rate info:', e);
    }
    return { rate: DEFAULT_RATE, lastUpdated: null };
}

/**
 * Force cập nhật tỉ giá (bỏ qua cache)
 */
export async function refreshExchangeRate() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const rate = data.rates?.VND || DEFAULT_RATE;

        setCachedRate(rate);

        return { success: true, rate };
    } catch (error) {
        console.error('Error refreshing exchange rate:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// CURRENCY CONVERSION
// ==========================================

/**
 * Chuyển đổi VND sang USD
 */
export async function convertVNDtoUSD(amountVND) {
    const rate = await getExchangeRate();
    return amountVND / rate;
}

/**
 * Chuyển đổi USD sang VND
 */
export async function convertUSDtoVND(amountUSD) {
    const rate = await getExchangeRate();
    return amountUSD * rate;
}

// ==========================================
// FORMATTING
// ==========================================

/**
 * Format số tiền theo đơn vị tiền tệ hiện tại
 * @param {number} amountVND - Số tiền gốc (VND)
 * @param {string} currency - 'VND' hoặc 'USD' (nếu không truyền, lấy từ preference)
 * @param {number} exchangeRate - Tỉ giá (nếu không truyền, sẽ dùng cached rate)
 */
export function formatCurrency(amountVND, currency = null, exchangeRate = null) {
    const curr = currency || getCurrentCurrency();

    if (curr === 'USD') {
        const rate = exchangeRate || getCachedRate() || DEFAULT_RATE;
        const amountUSD = amountVND / rate;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amountUSD);
    } else {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amountVND);
    }
}

/**
 * Format số tiền (async version - đảm bảo có tỉ giá mới nhất)
 */
export async function formatCurrencyAsync(amountVND, currency = null) {
    const curr = currency || getCurrentCurrency();

    if (curr === 'USD') {
        const rate = await getExchangeRate();
        const amountUSD = amountVND / rate;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amountUSD);
    } else {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amountVND);
    }
}

/**
 * Format tỉ giá để hiển thị
 */
export function formatExchangeRate(rate) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(rate));
}
