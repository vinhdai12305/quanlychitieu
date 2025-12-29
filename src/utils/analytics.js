/**
 * src/utils/analytics.js
 * Chứa các hàm tính toán logic thuần túy, xử lý mảng dữ liệu.
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {"income" | "expense"} type
 * @property {string} category
 * @property {number} amount
 * @property {string} date // YYYY-MM-DD
 * @property {string} note
 */

/**
 * 1. TÍNH TỔNG THU / CHI / SỐ DƯ
 * Dùng cho 3 thẻ thống kê trên cùng (Tổng quan)
 * @param {Transaction[]} transactions
 * @returns {{ income: number, expense: number }}
 */
export function getIncomeExpenseTotal(transactions = []) {
  return transactions.reduce(
    (total, tx) => {
      // Đảm bảo amount luôn là số để tránh lỗi cộng chuỗi
      const amount = Number(tx.amount) || 0;
      
      if (tx.type === "income") {
        total.income += amount;
      } else if (tx.type === "expense") {
        total.expense += amount;
      }
      return total;
    },
    { income: 0, expense: 0 }
  );
}

/**
 * 2. TỔNG CHI THEO DANH MỤC
 * Dùng cho biểu đồ tròn (Pie/Doughnut Chart)
 * @param {Transaction[]} transactions
 * @returns {Object<string, number>} VD: { "Ăn uống": 50000, "Nhà": 100000 }
 */
export function getExpenseByCategory(transactions = []) {
  return transactions
    .filter(t => t.type === "expense") // Chỉ lấy khoản chi
    .reduce((result, tx) => {
      const category = tx.category || "Khác";
      const amount = Number(tx.amount) || 0;
      
      // Cộng dồn tiền theo từng danh mục
      result[category] = (result[category] || 0) + amount;
      return result;
    }, {});
}

/**
 * 3. LỌC THEO THÁNG
 * Giúp lọc dữ liệu thô ra tháng cần xem trước khi tính toán biểu đồ
 * @param {Transaction[]} transactions
 * @param {number} year  (VD: 2025)
 * @param {number} month (1-12)
 * @returns {Transaction[]}
 */
export function filterByMonth(transactions = [], year, month) {
  return transactions.filter(tx => {
    if (!tx.date) return false;
    
    // Chuyển string YYYY-MM-DD thành mảng số [YYYY, MM, DD]
    const parts = tx.date.split("-");
    if (parts.length < 3) return false;

    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);

    // So sánh (Lưu ý: input month là 1-12)
    return y === year && m === month;
  });
}

/**
 * 4. DÒNG TIỀN THEO TUẦN (Weekly Cashflow)
 * Dùng cho biểu đồ cột (Bar Chart)
 * Lưu ý: Input transactions CẦN là danh sách ĐÃ lọc theo tháng
 * @param {Transaction[]} transactions
 * @returns {{ labels: string[], income: number[], expense: number[] }}
 */
export function getWeeklyCashflow(transactions = []) {
  // Khởi tạo khung dữ liệu cho 5 tuần (vì 1 tháng tối đa trải dài qua 5-6 tuần)
  const weeks = {
    "Tuần 1": { income: 0, expense: 0 },
    "Tuần 2": { income: 0, expense: 0 },
    "Tuần 3": { income: 0, expense: 0 },
    "Tuần 4": { income: 0, expense: 0 },
    "Tuần 5": { income: 0, expense: 0 }, 
  };

  transactions.forEach(tx => {
    if (!tx.date) return;

    // Lấy ngày (DD) từ chuỗi YYYY-MM-DD
    const day = parseInt(tx.date.split("-")[2]); 
    
    // Tính toán xem ngày đó thuộc tuần mấy (chia 7 làm tròn lên)
    // VD: Ngày 1-7 -> Tuần 1, Ngày 8-14 -> Tuần 2
    let weekIndex = Math.ceil(day / 7); 
    
    // Xử lý trường hợp tháng có ngày 29, 30, 31 (vẫn gộp vào tuần 5 cho gọn biểu đồ)
    if (weekIndex > 5) weekIndex = 5;

    const key = `Tuần ${weekIndex}`;

    if (weeks[key]) {
      const amount = Number(tx.amount) || 0;
      weeks[key][tx.type] += amount;
    }
  });

  // Chuyển đổi object thành các mảng dữ liệu để Chart.js dễ đọc
  const labels = Object.keys(weeks); // ["Tuần 1", "Tuần 2", ...]
  
  return {
    labels,
    income: labels.map(w => weeks[w].income),
    expense: labels.map(w => weeks[w].expense)
  };
}