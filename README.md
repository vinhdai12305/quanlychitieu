# 💰 Money Keeper - Ứng dụng Quản lý Chi tiêu Cá nhân

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/Status-Production-blue?style=for-the-badge" alt="Status"/>
</p>

<p align="center">
  <strong> Được phát triển bởi : |Hoàng Tùng|Huy Bảo|Vĩnh Đại|Quang Hân|Thành An|Tuấn Bảo|
</p>

<p align="center">
  <strong>🌐 Demo: </strong><a href="https://vinhdai12305.github.io/quanlychitieu/">https://vinhdai12305.github.io/quanlychitieu/</a>
</p>

---

## 📖 Giới thiệu Dự án

**Money Keeper** là một ứng dụng web quản lý tài chính cá nhân được phát triển nhằm giúp người dùng theo dõi, kiểm soát và tối ưu hóa việc chi tiêu hàng ngày. Ứng dụng được xây dựng với giao diện hiện đại, trực quan và dễ sử dụng, cho phép người dùng ghi chép các khoản thu nhập, chi tiêu, thiết lập ngân sách và xem báo cáo tài chính chi tiết.

Trong bối cảnh kinh tế hiện đại, việc quản lý tài chính cá nhân ngày càng trở nên quan trọng. Money Keeper ra đời như một giải pháp toàn diện, giúp người dùng:

- 📊 **Nắm bắt tình hình tài chính** thông qua dashboard trực quan với biểu đồ thống kê
- 💸 **Ghi chép giao dịch** thu nhập và chi tiêu một cách nhanh chóng, thuận tiện
- 🎯 **Thiết lập và theo dõi ngân sách** theo từng danh mục chi tiêu
- 📈 **Phân tích xu hướng** chi tiêu qua các báo cáo chi tiết theo thời gian
- ☁️ **Đồng bộ dữ liệu** trên đám mây, truy cập mọi lúc mọi nơi

---

## 🎯 Mục tiêu Dự án

### Mục tiêu Tổng quát
Xây dựng một ứng dụng web quản lý chi tiêu cá nhân hoàn chỉnh, đáp ứng nhu cầu theo dõi và kiểm soát tài chính của người dùng Việt Nam.

### Mục tiêu Cụ thể

| STT | Mục tiêu | Mô tả |
|-----|----------|-------|
| 1 | **Quản lý giao dịch** | Cho phép thêm, sửa, xóa các khoản thu nhập và chi tiêu với đầy đủ thông tin (số tiền, danh mục, ngày, ghi chú) |
| 2 | **Phân loại thông minh** | Hệ thống danh mục chi tiêu/thu nhập đa dạng, phù hợp với thói quen người Việt |
| 3 | **Thiết lập ngân sách** | Cho phép đặt hạn mức chi tiêu theo từng danh mục và theo tháng |
| 4 | **Báo cáo trực quan** | Cung cấp biểu đồ thống kê (dòng tiền, phân loại chi tiêu) giúp người dùng dễ dàng nắm bắt tình hình tài chính |
| 5 | **Đa tiền tệ** | Hỗ trợ hiển thị và chuyển đổi giữa VND và USD với tỉ giá cập nhật theo thời gian thực |
| 6 | **Bảo mật dữ liệu** | Xác thực người dùng qua Firebase Authentication, mỗi người dùng chỉ xem được dữ liệu của mình |
| 7 | **Responsive Design** | Giao diện tương thích tốt trên nhiều kích thước màn hình (Desktop, Tablet) |

---

## 🔍 Phạm vi Dự án

### Phạm vi Chức năng

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONEY KEEPER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Xác thực  │  │  Dashboard  │  │  Giao dịch  │              │
│  │  (Auth)     │  │ (Tổng quan) │  │ (Thu/Chi)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Ngân sách  │  │   Báo cáo   │  │   Cài đặt   │              │
│  │  (Budget)   │  │  (Report)   │  │  (Settings) │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

#### Các module chính:

| Module | Chức năng |
|--------|-----------|
| **Xác thực (Authentication)** | Đăng ký, đăng nhập, đăng xuất, đổi mật khẩu |
| **Tổng quan (Dashboard)** | Hiển thị tổng thu/chi/số dư, biểu đồ dòng tiền theo tuần, biểu đồ phân loại chi tiêu, danh sách giao dịch gần đây |
| **Chi tiêu (Expense)** | Quản lý các khoản chi với đầy đủ CRUD, lọc theo tháng/danh mục, tìm kiếm, phân trang |
| **Thu nhập (Income)** | Quản lý các khoản thu với chức năng tương tự Chi tiêu |
| **Ngân sách (Budget)** | Tạo/sửa/xóa ngân sách theo danh mục, theo dõi tiến độ chi tiêu so với hạn mức |
| **Báo cáo (Report)** | Biểu đồ phân tích xu hướng thu chi theo ngày trong tháng |
| **Cài đặt (Settings)** | Quản lý hồ sơ cá nhân, avatar, đổi mật khẩu, chọn đơn vị tiền tệ |

### Phạm vi Kỹ thuật

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript ES6+ Modules
- **Backend**: Firebase (Firestore Database, Authentication, Storage)
- **Build Tool**: Vite
- **Deployment**: GitHub Pages
- **API bên ngoài**: ExchangeRate-API (tỉ giá tiền tệ)

### Ngoài Phạm vi

- ❌ Ứng dụng mobile native (iOS/Android)
- ❌ Kết nối ngân hàng tự động
- ❌ Xuất báo cáo PDF/Excel
- ❌ Chế độ offline hoàn toàn
- ❌ Đa ngôn ngữ (hiện chỉ hỗ trợ tiếng Việt)

---

## 👥 Đối tượng Sử dụng

### Đối tượng Chính

| Nhóm | Đặc điểm | Nhu cầu |
|------|----------|---------|
| **Sinh viên** | Thu nhập hạn chế, cần quản lý chi tiêu chặt chẽ | Theo dõi chi tiêu hàng ngày, đặt ngân sách cho từng danh mục |
| **Người đi làm** | Thu nhập ổn định, nhiều khoản chi tiêu đa dạng | Phân tích xu hướng chi tiêu, lập kế hoạch tài chính |
| **Hộ gia đình** | Quản lý tài chính chung, nhiều nguồn thu/chi | Tổng quan tài chính, báo cáo theo tháng |

### Yêu cầu Đối với Người dùng

- ✅ Có thiết bị kết nối internet (máy tính, tablet)
- ✅ Có tài khoản email để đăng ký
- ✅ Nhu cầu quản lý tài chính cá nhân

---

## ✨ Tính năng Nổi bật

### 1. Dashboard Trực quan
- Thẻ thống kê tổng thu nhập, chi tiêu, số dư
- Biểu đồ cột dòng tiền theo tuần
- Biểu đồ tròn phân loại chi tiêu
- Bảng giao dịch gần đây

### 2. Quản lý Giao dịch Thông minh
- Thêm nhanh giao dịch qua modal
- Phân loại tự động với 9 danh mục chi tiêu và 5 danh mục thu nhập
- Lọc theo tháng, danh mục
- Tìm kiếm theo ghi chú
- Phân trang danh sách

### 3. Hệ thống Ngân sách
- Tạo ngân sách theo danh mục
- Theo dõi % đã chi so với hạn mức
- Cảnh báo khi gần/vượt ngân sách
- Quản lý theo tháng

### 4. Chuyển đổi Tiền tệ
- Hỗ trợ VND và USD
- Tỉ giá cập nhật tự động từ API
- Toggle nhanh trên header

### 5. Bảo mật & Đồng bộ
- Xác thực Firebase Authentication
- Dữ liệu lưu trữ an toàn trên Firestore
- Realtime sync giữa các thiết bị

---

## 🛠️ Công nghệ Sử dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| HTML5 | - | Cấu trúc trang |
| JavaScript | ES6+ | Logic xử lý |
| Tailwind CSS | 4.x | Styling |
| Chart.js | Latest | Biểu đồ |
| Material Symbols | - | Icons |

### Backend & Database
| Công nghệ | Mục đích |
|-----------|----------|
| Firebase Firestore | NoSQL Database |
| Firebase Authentication | Xác thực người dùng |
| Firebase Storage | Lưu trữ avatar |
| Firebase Analytics | Theo dõi hành vi |

### Build & Deploy
| Công nghệ | Mục đích |
|-----------|----------|
| Vite 7.x | Build tool |
| GitHub Pages | Hosting |

---

## 🚀 Hướng dẫn Cài đặt

### Yêu cầu Hệ thống
- Node.js >= 18.x
- npm >= 9.x
- Trình duyệt hiện đại (Chrome, Firefox, Edge)

### Các bước Cài đặt

```bash
# 1. Clone repository
git clone https://github.com/vinhdai12305/quanlychitieu.git
cd quanlychitieu

# 2. Cài đặt dependencies
npm install

# 3. Chạy môi trường development
npm run dev

# 4. Truy cập ứng dụng
# Mở trình duyệt và truy cập: http://localhost:5173
```

### Build Production

```bash
# Build ứng dụng
npm run build

# Preview bản build
npm run preview
```

---

## 📂 Cấu trúc Dự án

```
quanlychitieu/
├── 📄 index.html                    # Trang Dashboard (Tổng quan)
├── 📄 vite.config.js                # Cấu hình Vite multi-page
├── 📄 package.json                  # Dependencies
│
├── 📁 src/
│   ├── 📁 adapters/                 # Adapter Pattern
│   │   └── transactionAdapter.js    # Chuẩn hoá dữ liệu Firestore
│   │
│   ├── 📁 charts/                   # Chart.js components
│   │   ├── cashflowWeeklyChart.js
│   │   ├── expensePieChart.js
│   │   └── incomeExpenseBarChart.js
│   │
│   ├── 📁 components/               # HTML components
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── transaction-modal.html
│   │
│   ├── 📁 css/
│   │   └── style.css                # Global styles
│   │
│   ├── 📁 firebase/                 # Firebase services
│   │   ├── firebase.config.js       # Cấu hình Firebase
│   │   ├── auth.js                  # Authentication logic
│   │   ├── authGuard.js             # Route protection
│   │   └── firestore.service.js     # CRUD operations
│   │
│   ├── 📁 js/                       # Page logic
│   │   ├── dashboard.js
│   │   ├── expense.js
│   │   ├── income.js
│   │   ├── budget.js
│   │   ├── report.js
│   │   ├── settings.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── categoryUtils.js         # Category mapping EN→VN
│   │   ├── headerLoader.js          # Dynamic header loading
│   │   ├── toast.js                 # Custom notifications
│   │   └── transaction-modal.js     # Add transaction modal
│   │
│   ├── 📁 page/                     # HTML pages
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── expense.html
│   │   ├── income.html
│   │   ├── budget.html
│   │   ├── report.html
│   │   └── settings.html
│   │
│   ├── 📁 repositories/             # Repository Pattern
│   │   └── transactionRepository.js
│   │
│   └── 📁 services/                 # Business logic
│       ├── currencyService.js       # Chuyển đổi tiền tệ
│       ├── chartData.service.js
│       └── transactionAnalytics.service.js
│
└── 📁 public/                       # Static assets
    └── imgs/
```

---

## 📊 Đánh giá Dự án

### Những điểm Đã đạt được ✅

| Tiêu chí | Đánh giá | Ghi chú |
|----------|----------|---------|
| **Chức năng cốt lõi** | ⭐⭐⭐⭐⭐ | Đầy đủ CRUD cho giao dịch, ngân sách |
| **Giao diện người dùng** | ⭐⭐⭐⭐⭐ | Hiện đại, responsive, trực quan |
| **Biểu đồ thống kê** | ⭐⭐⭐⭐ | Đa dạng, dễ hiểu |
| **Bảo mật** | ⭐⭐⭐⭐ | Xác thực Firebase, phân quyền dữ liệu |
| **Hiệu năng** | ⭐⭐⭐⭐ | Load nhanh, realtime sync |
| **Code quality** | ⭐⭐⭐⭐ | Modular, sử dụng design patterns |
<img width="1854" height="900" alt="image" src="https://github.com/user-attachments/assets/930a9eed-09dd-402c-be8b-d8a6cd368531" />

### Điểm mạnh 💪

1. **Kiến trúc rõ ràng**: Áp dụng Adapter Pattern, Service Layer, tách biệt UI và Logic
2. **Realtime Sync**: Sử dụng Firestore `onSnapshot()` để cập nhật UI tức thì
3. **Trải nghiệm người dùng**: Toast notifications, loading states, animations mượt mà
4. **Đa tiền tệ**: Tích hợp API tỉ giá thời gian thực
5. **Category Normalization**: Hỗ trợ đa ngôn ngữ cho danh mục (EN↔VN)

### Hạn chế ⚠️

1. **Chưa có chế độ Offline**: Cần kết nối internet để sử dụng
2. **Chưa hỗ trợ Mobile native**: Chỉ responsive trên browser
3. **Chưa có báo cáo nâng cao**: Chưa xuất PDF/Excel
4. **Đơn ngôn ngữ**: Hiện chỉ hỗ trợ tiếng Việt

---

## 🔮 Hướng Phát triển

### Cải thiện Trải nghiệm 

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| 📱 Progressive Web App (PWA) | Hỗ trợ cài đặt như app, hoạt động offline | Cao |
| 📊 Xuất báo cáo PDF/Excel | Export dữ liệu để lưu trữ, in ấn | Cao |
| 🔔 Thông báo nhắc nhở | Nhắc ghi chép giao dịch, cảnh báo ngân sách | Trung bình |

### Mở rộng Tính năng

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| 🎯 Mục tiêu tiết kiệm | Đặt mục tiêu và theo dõi tiến độ | Cao |
| 📈 Dự báo chi tiêu | AI phân tích xu hướng và dự báo | Trung bình |
| 👥 Chia sẻ gia đình | Quản lý tài chính nhóm/gia đình | Trung bình |

### Nâng cấp Platform

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| 📱 Mobile App (React Native) | Ứng dụng native cho iOS/Android | Cao |
| 🏦 Kết nối ngân hàng | Tự động đồng bộ giao dịch từ tài khoản ngân hàng | Trung bình |
| 🌍 Đa ngôn ngữ | Hỗ trợ English, tiếng Việt | Thấp |
| 🤖 AI Assistant | Chatbot tư vấn tài chính | Thấp |

## 👨‍💻 Tác giả

### 👥 Đội ngũ Phát triển (Nhóm 1 23SE - VNUK )

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

| Thành viên | Tỷ lệ | Vai trò chính |
|------------|-------|---------------|
| **Hoàng Tùng** | ~23% | Backend Lead + Core + Deploy |
| **Huy Bảo** | ~17% | DevOps & Visualization |
| **Quang Hân** | ~15% | Core Feature Transaction |
| **Vĩnh Đại** | ~15% | UI Lead |
| **Thành An** | ~15% | Budget Module |
| **Tuấn Bảo** | ~15% | Settings & Analytics |

---

## � Kết luận

Qua quá trình thực hiện dự án **Money Keeper**, nhóm chúng em đã có cơ hội áp dụng những kiến thức đã học vào thực tế, từ việc phân tích yêu cầu, thiết kế kiến trúc hệ thống, đến triển khai và hoàn thiện sản phẩm. Dự án không chỉ giúp chúng em nâng cao kỹ năng lập trình web với các công nghệ hiện đại như **JavaScript ES6+**, **Firebase**, **Tailwind CSS** và **Vite**, mà còn rèn luyện khả năng làm việc nhóm, quản lý thời gian và giải quyết vấn đề.

### Những điều đã học được:

- 🔥 **Kiến trúc phần mềm**: Áp dụng các design patterns (Adapter, Service Layer, Repository) để xây dựng codebase dễ bảo trì và mở rộng
- ☁️ **Cloud Services**: Làm việc với Firebase ecosystem (Firestore, Authentication, Storage, Analytics)
- 📊 **Data Visualization**: Tích hợp Chart.js để trực quan hóa dữ liệu tài chính
- 🎨 **UI/UX Design**: Thiết kế giao diện responsive, hiện đại với Tailwind CSS
- 🚀 **CI/CD**: Triển khai ứng dụng lên GitHub Pages với quy trình build tự động

### Hướng phát triển bản thân:

Dự án này là bước đệm quan trọng giúp các thành viên trong nhóm tự tin hơn khi tiếp cận các dự án thực tế trong tương lai. Chúng em sẽ tiếp tục học hỏi, cải thiện sản phẩm và áp dụng những bài học kinh nghiệm vào các dự án tiếp theo.

### 🙏 Lời cảm ơn

Chúng em xin gửi lời cảm ơn chân thành nhất đến anh ** Hữu Quyền ** là người thầy, người hướng dẫn đã luôn đồng hành, hỗ trợ và chỉ dạy tận tình trong suốt quá trình thực hiện dự án. Nhờ có sự hướng dẫn của anh, chúng em đã vượt qua nhiều khó khăn, thử thách và hoàn thiện được sản phẩm Money Keeper như ngày hôm nay.

> *"Thành công không đến từ việc làm một mình, mà đến từ sự hợp tác và hướng dẫn của những người đi trước."*

Cảm ơn anh đã tin tưởng và tạo điều kiện để chúng em phát triển! 

---

<p align="center">
  <i>Cảm ơn bạn đã quan tâm đến Money Keeper! Nếu thấy dự án hữu ích, hãy để lại một ⭐️ trên GitHub nhé!</i>
</p>

<p align="center">
  <strong>Money Keeper</strong> - Kiểm soát tài chính, kiến tạo tương lai 💰
</p>
