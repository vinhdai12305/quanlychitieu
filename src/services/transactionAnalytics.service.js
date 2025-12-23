// src/services/transactionAnalytics.service.js

// 1. Import hàm lấy dữ liệu từ Firebase
import { getAllTransactions } from "../firebase/firestore.service.js";

// 2. Import các công thức tính toán từ file utils
import { 
    filterByMonth, 
    getIncomeExpenseTotal, 
    getExpenseByCategory, 
    getWeeklyCashflow 
} from "../utils/analytics.js"; 

export class TransactionAnalyticsService {
    
    /**
     * Lấy toàn bộ số liệu cần thiết để vẽ lên Dashboard cho một tháng cụ thể
     * @param {number} month - Tháng cần xem (1-12)
     * @param {number} year - Năm cần xem (ví dụ: 2024)
     */
    async getDashboardStats(month, year) {
        // Bước 1: Lấy toàn bộ giao dịch từ Database
        // (Lưu ý: Dữ liệu này đã được adapter chuyển đổi sang format chuẩn)
        const allTransactions = await getAllTransactions();

        // Bước 2: Lọc lấy dữ liệu của tháng đang chọn
        const monthTransactions = filterByMonth(allTransactions, year, month);

        // Bước 3: Tính toán cho 3 thẻ thống kê (Tổng quan)
        const totals = getIncomeExpenseTotal(monthTransactions);
        const balance = totals.income - totals.expense;

        // Bước 4: Tính toán cho biểu đồ cột "Dòng tiền" (Weekly Cashflow)
        const weeklyStats = getWeeklyCashflow(monthTransactions);

        // Bước 5: Tính toán cho biểu đồ tròn "Phân loại chi tiêu"
        const categoryStats = getExpenseByCategory(monthTransactions);

        // Bước 6: Lấy danh sách "Giao dịch gần đây" (5 cái mới nhất)
        // Sort: Mới nhất lên đầu -> Cắt lấy 5 cái
        const recentTransactions = [...monthTransactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        // Bước 7: Trả về Object khớp với cấu trúc UI Dashboard
        return {
            // Dữ liệu cho 3 thẻ trên cùng
            summary: {
                totalIncome: totals.income,
                totalExpense: totals.expense,
                currentBalance: balance
            },
            // Dữ liệu cho 2 biểu đồ
            charts: {
                cashflow: weeklyStats,      // Dùng vẽ biểu đồ cột (Bar Chart)
                spending: categoryStats     // Dùng vẽ biểu đồ tròn (Pie Chart)
            },
            // Dữ liệu cho danh sách bên dưới
            recentList: recentTransactions
        };
    }
}