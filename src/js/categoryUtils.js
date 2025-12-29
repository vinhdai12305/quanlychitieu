/**
 * Category Utilities - Shared module for category normalization
 * Dùng chung cho toàn bộ project để chuẩn hóa tên category
 */

// ==========================================
// CATEGORY MAPPING - TỪ TIẾNG ANH SANG TIẾNG VIỆT
// ==========================================

const EXPENSE_CATEGORIES = {
    // Tiếng Việt (chuẩn)
    'Ăn uống': { name: 'Ăn uống', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    'Di chuyển': { name: 'Di chuyển', class: 'bg-orange-100 text-orange-700', color: '#f97316' },
    'Mua sắm': { name: 'Mua sắm', class: 'bg-purple-100 text-purple-700', color: '#8b5cf6' },
    'Hóa đơn': { name: 'Hóa đơn', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'Giải trí': { name: 'Giải trí', class: 'bg-pink-100 text-pink-700', color: '#ec4899' },
    'Giáo dục': { name: 'Giáo dục', class: 'bg-red-100 text-red-700', color: '#ef4444' },
    'Sức khỏe': { name: 'Sức khỏe', class: 'bg-teal-100 text-teal-700', color: '#14b8a6' },
    'Du lịch': { name: 'Du lịch', class: 'bg-cyan-100 text-cyan-700', color: '#06b6d4' },
    'Chi tiêu khác': { name: 'Chi tiêu khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' },

    // Tiếng Anh -> ánh xạ sang tiếng Việt
    'food': { name: 'Ăn uống', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    'an-uong': { name: 'Ăn uống', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    'transport': { name: 'Di chuyển', class: 'bg-orange-100 text-orange-700', color: '#f97316' },
    'transport-taxi': { name: 'Di chuyển', class: 'bg-orange-100 text-orange-700', color: '#f97316' },
    'di-chuyen': { name: 'Di chuyển', class: 'bg-orange-100 text-orange-700', color: '#f97316' },
    'shopping': { name: 'Mua sắm', class: 'bg-purple-100 text-purple-700', color: '#8b5cf6' },
    'mua-sam': { name: 'Mua sắm', class: 'bg-purple-100 text-purple-700', color: '#8b5cf6' },
    'bill': { name: 'Hóa đơn', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'water_drop': { name: 'Hóa đơn', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'hoa-don': { name: 'Hóa đơn', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'entertainment': { name: 'Giải trí', class: 'bg-pink-100 text-pink-700', color: '#ec4899' },
    'giai-tri': { name: 'Giải trí', class: 'bg-pink-100 text-pink-700', color: '#ec4899' },
    'education': { name: 'Giáo dục', class: 'bg-red-100 text-red-700', color: '#ef4444' },
    'giao-duc': { name: 'Giáo dục', class: 'bg-red-100 text-red-700', color: '#ef4444' },
    'health': { name: 'Sức khỏe', class: 'bg-teal-100 text-teal-700', color: '#14b8a6' },
    'medical_services': { name: 'Sức khỏe', class: 'bg-teal-100 text-teal-700', color: '#14b8a6' },
    'suc-khoe': { name: 'Sức khỏe', class: 'bg-teal-100 text-teal-700', color: '#14b8a6' },
    'travel': { name: 'Du lịch', class: 'bg-cyan-100 text-cyan-700', color: '#06b6d4' },
    'flight': { name: 'Du lịch', class: 'bg-cyan-100 text-cyan-700', color: '#06b6d4' },
    'du-lich': { name: 'Du lịch', class: 'bg-cyan-100 text-cyan-700', color: '#06b6d4' },
    'house': { name: 'Nhà cửa', class: 'bg-amber-100 text-amber-700', color: '#f59e0b' },
    'other': { name: 'Chi tiêu khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' },
    'chi-tieu-khac': { name: 'Chi tiêu khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' }
};

const INCOME_CATEGORIES = {
    // Tiếng Việt (chuẩn)
    'Lương': { name: 'Lương', class: 'bg-green-100 text-green-700', color: '#22c55e' },
    'Thưởng': { name: 'Thưởng', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'Đầu tư': { name: 'Đầu tư', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    'Freelance': { name: 'Freelance', class: 'bg-purple-100 text-purple-700', color: '#8b5cf6' },
    'Thu nhập khác': { name: 'Thu nhập khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' },

    // Tiếng Anh -> ánh xạ sang tiếng Việt
    'salary': { name: 'Lương', class: 'bg-green-100 text-green-700', color: '#22c55e' },
    'luong': { name: 'Lương', class: 'bg-green-100 text-green-700', color: '#22c55e' },
    'bonus': { name: 'Thưởng', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'thuong': { name: 'Thưởng', class: 'bg-yellow-100 text-yellow-700', color: '#eab308' },
    'investment': { name: 'Đầu tư', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    'dau-tu': { name: 'Đầu tư', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    'freelance': { name: 'Freelance', class: 'bg-purple-100 text-purple-700', color: '#8b5cf6' },
    'other': { name: 'Thu nhập khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' },
    'khac': { name: 'Thu nhập khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' },
    'thu-nhap-khac': { name: 'Thu nhập khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

/**
 * Lấy thông tin category đã chuẩn hóa
 * @param {string} rawCategory - Category gốc từ Firebase
 * @param {string} type - 'expense' hoặc 'income'
 * @returns {Object} { name, class, color }
 */
export function getCategoryInfo(rawCategory, type = 'expense') {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const defaultInfo = type === 'income'
        ? { name: rawCategory || 'Khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' }
        : { name: rawCategory || 'Khác', class: 'bg-gray-100 text-gray-700', color: '#6b7280' };

    return categories[rawCategory] || defaultInfo;
}

/**
 * Chuẩn hóa tên category (từ tiếng Anh sang tiếng Việt)
 * @param {string} rawCategory - Category gốc
 * @param {string} type - 'expense' hoặc 'income'
 * @returns {string} Tên category đã chuẩn hóa
 */
export function normalizeCategory(rawCategory, type = 'expense') {
    return getCategoryInfo(rawCategory, type).name;
}

/**
 * Nhóm transactions theo category đã chuẩn hóa
 * @param {Array} transactions - Danh sách transactions
 * @param {string} type - 'expense' hoặc 'income'
 * @returns {Object} { categoryName: totalAmount }
 */
export function groupByCategory(transactions, type = 'expense') {
    const groups = {};

    transactions.forEach(t => {
        const categoryInfo = getCategoryInfo(t.category, type);
        const normalizedName = categoryInfo.name;

        if (!groups[normalizedName]) {
            groups[normalizedName] = {
                total: 0,
                color: categoryInfo.color,
                class: categoryInfo.class
            };
        }
        groups[normalizedName].total += t.amount;
    });

    return groups;
}

/**
 * Lấy danh sách màu theo thứ tự category
 * @param {Array} categoryNames - Danh sách tên category
 * @param {string} type - 'expense' hoặc 'income'
 * @returns {Array} Danh sách màu
 */
export function getCategoryColors(categoryNames, type = 'expense') {
    return categoryNames.map(name => {
        const info = getCategoryInfo(name, type);
        return info.color;
    });
}

// Export all mappings for reference
export { EXPENSE_CATEGORIES, INCOME_CATEGORIES };
