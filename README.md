# 💰 Money Keeper - Quản lý Chi tiêu Thông minh

![Project Banner](https://via.placeholder.com/1200x400?text=Money+Keeper+Dashboard)

> **Money Keeper** là ứng dụng web giúp bạn theo dõi thu nhập, kiểm soát chi tiêu và quản lý ngân sách cá nhân một cách hiệu quả, trực quan và dễ dàng.

## ✨ Tính năng Nổi bật

*   **📊 Báo cáo Trực quan**: Biểu đồ thống kê thu chi chi tiết theo tuần, tháng, giúp bạn nắm bắt dòng tiền ngay lập tức.
*   **💸 Quản lý Thu/Chi**: Ghi chép giao dịch nhanh chóng. Phân loại rõ ràng (Ăn uống, Mua sắm, Lương, Thưởng...).
*   **🎯 Lập Ngân sách**: Thiết lập giới hạn chi tiêu cho từng danh mục. Cảnh báo khi bạn tiêu quá tay.
*   **📱 Giao diện Hiện đại**: Thiết kế Responsive, tối ưu cho trải nghiệm trên Desktop .
*   **☁️ Đồng bộ đám mây**: Dữ liệu được lưu trữ an toàn trên Firebase, truy cập mọi lúc mọi nơi.
*   **🌍 Đa tiền tệ**: Hỗ trợ chuyển đổi tiền tệ linh hoạt (VND/USD) với tỷ giá cập nhật theo thời gian thực.

## 🛠️ Công nghệ Sử dụng

Dự án được xây dựng dựa trên các công nghệ web hiện đại, đảm bảo hiệu năng cao và trải nghiệm mượt mà:

*   **Frontend**: HTML5, JavaScript (ES6+).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Framework CSS ưu việt cho thiết kế nhanh và đẹp.
*   **Build Tool**: [Vite](https://vitejs.dev/) - Tốc độ build siêu tốc.
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth) - Nền tảng backend mạnh mẽ của Google.
*   **Charts**: [Chart.js](https://www.chartjs.org/) - Vẽ biểu đồ đẹp mắt.

## 🚀 Cài đặt và Chạy dự án

Để chạy dự án này trên máy cá nhân, hãy làm theo các bước sau:

1.  **Clone dự án**:
    ```bash
    git clone https://github.com/vinhdai12305/quanlychitieu.git
    cd quanlychitieu
    ```

2.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```

3.  **Chạy môi trường phát triển (Development)**:
    ```bash
    npm run dev
    ```
    Truy cập vào địa chỉ `http://localhost:5173` (hoặc port hiển thị trên terminal) để trải nghiệm.

## 📂 Cấu trúc Dự án & Kiến trúc

Dự án tuân thủ mô hình phân lớp rõ ràng, tách biệt giữa giao diện (UI) và logic xử lý dữ liệu, giúp code dễ bảo trì và mở rộng.

```
src/
├── 📁 adapters/
│   └── transactionAdapter.js     # Chuẩn hoá dữ liệu
├── 📁 assets/                    # Favicon, icons...
├── 📁 charts/
│   ├── cashflowWeeklyChart.js
│   ├── expensePieChart.js
│   └── incomeExpenseBarChart.js
├── 📁 components/
│   ├── dateRangePicker.js
│   ├── footer.html
│   ├── header.html
│   └── transaction-modal.html
├── 📁 css/
│   └── style.css
├── 📁 firebase/
│   ├── auth.js
│   ├── authGuard.js
│   ├── firebase.config.js
│   └── firestore.service.js
├── 📁 js/
│   ├── components/
│   │   └── dateRangePicker.js
│   ├── auth.js
│   ├── budget.js
│   ├── categoryUtils.js
│   ├── confirmModal.js
│   ├── dashboard.js
│   ├── expense.js
│   ├── headerLoader.js
│   ├── income.js
│   ├── login.js
│   ├── logout.js
│   ├── main.js
│   ├── register.js
│   ├── report.js
│   ├── report_logic.js
│   ├── settings.js
│   ├── toast.js
│   ├── transaction-modal.js
├── 📁 page/
│   ├── budget.html
│   ├── expense.html
│   ├── income.html
│   ├── login.html
│   ├── register.html
│   ├── report.html
│   └── settings.html
├── 📁 repositories/
│   └── transactionRepository.js
├── 📁 scripts/
├── 📁 services/
│   ├── chartData.service.js
│   ├── currencyService.js
│   └── transactionAnalytics.service.js
└── 📁 utils/
```

### Luồng xử lý dữ liệu (Data Flow)

Để đảm bảo tính nhất quán, luồng dữ liệu đi theo một chiều:

`Firestore` ➔ `firestore.service` ➔ `transactionAdapter` ➔ `transactionRepository` ➔ `Analytics Services` ➔ `Chart/UI`

*   **Adapter Pattern**: Dữ liệu từ Firestore (Timestamp, format lạ...) luôn được chuyển đổi về một chuẩn chung của App thông qua `transactionAdapter` trước khi sử dụng.
*   **Separation of Concerns**: Các file vẽ biểu đồ (`charts/*.js`) **chỉ nhận dữ liệu đã xử lý**, không chứa logic tính toán hay gọi API.

## 👨‍💻 Tác giả

### 👥 Đội ngũ Phát triển (Nhóm 1)

Dự án được thực hiện bởi sự đóng góp nhiệt huyết của các thành viên, mỗi người đảm nhận các vai trò chuyên biệt để tạo nên một sản phẩm hoàn chỉnh:

| Thành viên | Vai trò & Đóng góp Chính | Chi tiết Công việc |
| :--- | :--- | :--- |
| **Hoàng Tùng** | **Backend Lead, Core Logic & Deployment** | • Thiết kế kiến trúc Backend trên Firebase Firestore.<br>• Xử lý toàn bộ logic dữ liệu, API services (`transactionAnalytics`, `chartData`).<br>• Quản lý quy trình CI/CD và Deploy dự án lên GitHub Pages.<br>• Tối ưu hóa hiệu năng truy vấn và bảo mật dữ liệu. |
| **Huy Bảo** | **DevOps & Visualization** | • Setup dự án Firebase, Authentication và Security Rules.<br>• Tích hợp thư viện Chart.js, xây dựng các biểu đồ phân tích trực quan.<br>• Phát triển trang **Báo cáo (Report)** với các chỉ số chuyên sâu.<br>• Tạo dữ liệu mẫu (Seeding data) để kiểm thử hệ thống. |
| **Vĩnh Đại** | **Frontend (Overview)** | • Phát triển trang **Tổng quan (Dashboard)** với các widget tóm tắt thời gian thực.<br>• Thiết kế Layout chính, Navigation và hệ thống UI Components dùng chung.<br>• Tối ưu hóa giao diện trang chủ và trải nghiệm người dùng (UX) tổng thể. |
| **Quang Hân** | **Frontend (Transaction)** | • Xây dựng module **Thu nhập & Chi tiêu** (CRUD đầy đủ).<br>• Xử lý logic lọc (Filter), tìm kiếm và phân trang cho danh sách giao dịch.<br>• Thiết kế Form nhập liệu thông minh với Validate dữ liệu chặt chẽ.<br>• Xử lý các tương tác người dùng phức tạp trên trang Transaction. |
| **Thành An** | **Frontend (Budget)** | • Phát triển module **Ngân sách (Budget)**.<br>• Xây dựng logic tính toán tiến độ chi tiêu so với hạn mức (Progress tracking).<br>• Thiết kế giao diện cảnh báo khi vượt ngân sách.<br>• Xử lý các Modal thêm/sửa/xóa ngân sách mượt mà. |
| **Tuấn Bảo** | **Frontend (Settings) & Analytics** | • Xây dựng trang **Cài đặt (Settings)** và quản lý hồ sơ người dùng.<br>• Tích hợp Google Analytics để theo dõi hành vi người dùng.<br>• Xử lý tính năng đổi mật khẩu, cập nhật Avatar và thông tin cá nhân.<br>• Quản lý cấu hình tiền tệ và các tùy chọn hệ thống khác. |

### 📊 Đánh giá Đóng góp (Ước tính)

*   **Hoàng Tùng (~25%)**: Backend Lead + Core + Deploy
*   **Huy Bảo    (~15%)**: DevOps & Visualization
*   **Quang Hân  (~15%)**: Core Feature Transaction
*   **Vĩnh Đại   (~15%)**: UI Lead
*   **Thành An   (~15%)**: Budget
*   **Tuấn Bảo   (~15%)**: Settings & Analytics

---
*Cảm ơn bạn đã quan tâm đến Money Keeper! Nếu thấy dự án hữu ích, hãy để lại một ⭐️ trên GitHub nhé!*
