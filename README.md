# 💰 Money Keeper - Quản lý Chi tiêu Thông minh

![Project Banner](https://via.placeholder.com/1200x400?text=Money+Keeper+Dashboard)

> **Money Keeper** là ứng dụng web giúp bạn theo dõi thu nhập, kiểm soát chi tiêu và quản lý ngân sách cá nhân một cách hiệu quả, trực quan và dễ dàng.

## ✨ Tính năng Nổi bật

*   **📊 Báo cáo Trực quan**: Biểu đồ thống kê thu chi chi tiết theo tuần, tháng, giúp bạn nắm bắt dòng tiền ngay lập tức.
*   **💸 Quản lý Thu/Chi**: Ghi chép giao dịch nhanh chóng. Phân loại rõ ràng (Ăn uống, Mua sắm, Lương, Thưởng...).
*   **🎯 Lập Ngân sách**: Thiết lập giới hạn chi tiêu cho từng danh mục. Cảnh báo khi bạn tiêu quá tay.
*   **📱 Giao diện Hiện đại**: Thiết kế Responsive, tối ưu cho cả trải nghiệm trên Desktop và Mobile.
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
├── 📁 firebase/       # Cấu hình Firebase & các hàm xử lý DB cấp thấp (Firestore services)
├── 📁 repositories/   # Lớp trung gian lấy dữ liệu từ DB (Data Access Layer)
├── 📁 services/       # Logic nghiệp vụ, tính toán thống kê (Business Logic Layer)
├── 📁 adapters/       # Chuẩn hoá dữ liệu giữa Firestore và Ứng dụng
├── 📁 charts/         # Các component biểu đồ độc lập
├── 📁 page/           # Các trang giao diện (HTML files)
└── 📁 js/             # Logic điều khiển giao diện (Controllers)
```

### Luồng xử lý dữ liệu (Data Flow)

Để đảm bảo tính nhất quán, luồng dữ liệu đi theo một chiều:

`Firestore` ➔ `firestore.service` ➔ `transactionAdapter` ➔ `transactionRepository` ➔ `Analytics Services` ➔ `Chart/UI`

*   **Adapter Pattern**: Dữ liệu từ Firestore (Timestamp, format lạ...) luôn được chuyển đổi về một chuẩn chung của App thông qua `transactionAdapter` trước khi sử dụng.
*   **Separation of Concerns**: Các file vẽ biểu đồ (`charts/*.js`) **chỉ nhận dữ liệu đã xử lý**, không chứa logic tính toán hay gọi API.

## 👨‍💻 Tác giả

Phát triển bởi **[Tên của bạn/Team của bạn]**.

---
*Cảm ơn bạn đã quan tâm đến Money Keeper! Nếu thấy dự án hữu ích, hãy để lại một ⭐️ trên GitHub nhé!*
