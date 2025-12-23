<<<<<<< Updated upstream
# quanlychitieu# Money Keeper


## Công nghệ
- HTML, Tailwind CSS
- Chart.js
- Firebase
- Vite
- GitHub Pages

## Demo
https://vinhdai12305.github.io/quanlychitieu/
=======
1. Mục tiêu của module này

Module này được xây dựng nhằm tách hoàn toàn phần xử lý dữ liệu ra khỏi phần vẽ chart.

Module chịu trách nhiệm:

Kết nối Firebase Firestore

Lấy dữ liệu giao dịch (transactions)

Chuẩn hoá dữ liệu (adapter)

Tính toán dữ liệu cho:

Pie Chart – Chi tiêu theo danh mục

Bar Chart – Tổng thu / tổng chi

Weekly Cashflow Chart – Dòng tiền theo tuần

👉 Người làm chart:

KHÔNG cần biết Firebase

KHÔNG xử lý logic dữ liệu

CHỈ cần gọi hàm và render chart

2. Cấu trúc thư mục liên quan

src/
├── firebase/
│   ├── firebase.config.js        # Firebase config & Firestore instance
│   └── firestore.service.js      # CRUD Firestore (LOW LEVEL)
│
├── adapters/
│   └── transactionAdapter.js     # Chuẩn hoá dữ liệu Firestore ↔ App
│
├── repositories/
│   └── transactionRepository.js  # Lấy transaction từ Firestore
│
├── services/
│   ├── transactionAnalytics.service.js # Logic tính toán
│   └── chartData.service.js            # API DUY NHẤT cho Chart
│
├── charts/
│   ├── expensePieChart.js
│   ├── incomeExpenseBarChart.js
│   └── cashflowWeeklyChart.js
│
└── main.js                        # Demo / test

3. Data Contract (CỰC KỲ QUAN TRỌNG)

3.1 Transaction Object (App sử dụng)

Tất cả các hàm LUÔN trả về format này:

{
  id: string,
  type: "income" | "expense",
  category: string,
  amount: number,
  date: "YYYY-MM-DD",
  note: string
}

3.2 Firestore Document (Backend)

{
  type: "income" | "expense",
  category: string,
  amount: number,
  date: Timestamp,
  note: string,
  createdAt: Timestamp
}

Adapter đã lo việc chuyển Timestamp → string

4. Luồng dữ liệu (KHÔNG ĐƯỢC PHÁ VỠ)

Firestore
   ↓
firestore.service.js
   ↓
transactionAdapter.js
   ↓
transactionRepository.js
   ↓
transactionAnalytics.service.js
   ↓
chartData.service.js   ← CHART CHỈ DÙNG FILE NÀY

5. API DÀNH CHO NGƯỜI LÀM CHART (QUAN TRỌNG NHẤT)

👉 Chỉ import duy nhất file này

import {
  getPieChartData,
  getBarChartData,
  getWeeklyCashflowData
} from "./src/services/chartData.service.js";

6. Các hàm có thể sử dụng

6.1 Pie Chart – Chi tiêu theo danh mục

const pieData = await getPieChartData(year, month);

Vi du: 

const pieData = await getPieChartData(2025, 2);
console.log(pieData);

Output

{
  "Ăn uống": 2500000,
  "Mua sắm": 4700000,
  "Đi lại": 2070000,
  "Y tế": 5000000
}

6.2 Bar Chart – Tổng thu / tổng chi

const barData = await getBarChartData(year, month);

Output 

{
  income: 97150000,
  expense: 46170000
}

Dùng cho Bar Chart

const labels = ["Income", "Expense"];
const values = [barData.income, barData.expense];

6.3 Weekly Cashflow – Dòng tiền theo tuần

const weeklyData = await getWeeklyCashflowData(year, month);

vi dụ

const weeklyData = await getWeeklyCashflowData(year, month);
>>>>>>> Stashed changes
