# 🌍 Trippio - Nền Tảng Đặt Vé Du Lịch Trực Tuyến

Trippio là một nền tảng đặt vé du lịch đa dịch vụ toàn diện, cho phép người dùng đặt khách sạn, vé di chuyển, và vé tham quan/giải trí. Dự án được xây dựng với Next.js 15, React 19, và tích hợp AI Travel Assistant sử dụng Google Gemini.

## 🚀 Công Nghệ Sử Dụng

- **Framework**: Next.js 15.4.1 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 4, Shadcn UI
- **Authentication**: NextAuth.js 4.24, Google OAuth
- **State Management**: React Context API
- **Database ORM**: Prisma 6.12.0
- **HTTP Client**: Axios 1.12.2
- **AI Integration**: Google Generative AI (Gemini)
- **Maps**: React Google Maps API
- **Charts**: ApexCharts
- **Animations**: Framer Motion
- **Code Quality**: ESLint, Prettier, Husky

## ✨ Tính Năng Chính

### Người Dùng

- 🏨 **Đặt Khách Sạn**: Tìm kiếm, xem chi tiết, đặt phòng khách sạn
- 🚗 **Đặt Vé Di Chuyển**: Xe bus, tàu hỏa, máy bay với nhiều tuyến đường
- 🎭 **Đặt Vé Show/Giải Trí**: Đặt vé các sự kiện, tour du lịch
- 🛒 **Giỏ Hàng**: Quản lý giỏ hàng với nhiều dịch vụ
- 💳 **Thanh Toán Trực Tuyến**: Tích hợp VNPay, PayOS
- 📱 **Quản Lý Đơn Hàng**: Xem lịch sử, chi tiết đơn hàng
- ⭐ **Đánh Giá & Review**: Đánh giá dịch vụ đã sử dụng
- 🤖 **AI Travel Assistant**: Chat với AI để được tư vấn du lịch
- 🔐 **Xác Thực Người Dùng**: Đăng ký/đăng nhập với Email hoặc Google OAuth

### Admin Dashboard

- 📊 **Thống Kê & Báo Cáo**: Dashboard với biểu đồ doanh thu
- 🏢 **Quản Lý Dịch Vụ**: CRUD cho Hotel, Transport, Show
- 👥 **Quản Lý Người Dùng**: Quản lý tài khoản người dùng
- 📦 **Quản Lý Đơn Hàng**: Xử lý, cập nhật trạng thái đơn hàng
- 💬 **Quản Lý Review**: Duyệt và quản lý đánh giá

### Staff Dashboard

- 📋 **Xử Lý Đơn Hàng**: Xác nhận, hoàn thành đơn hàng
- 🔍 **Tra Cứu**: Tìm kiếm thông tin đơn hàng nhanh

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js 18.x hoặc 20.x
- npm hoặc yarn hoặc pnpm
- Git

### Cài Đặt Dependencies

```bash
# Clone repository
git clone <repository-url>
cd TRIPPIO_FE

# Cài đặt dependencies
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### Cấu Hình Environment Variables

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường:

```env
# Google OAuth2 Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google Gemini AI (Optional - for Travel Assistant)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### Chạy Development Server

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 🏗️ Cấu Trúc Dự Án

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages (login, register)
│   ├── (site)/                  # Public pages
│   │   ├── homepage/           # Trang chủ
│   │   ├── hotel/              # Trang khách sạn
│   │   ├── transport/          # Trang vận chuyển
│   │   ├── show/               # Trang show/giải trí
│   │   ├── cart/               # Giỏ hàng
│   │   ├── payment/            # Thanh toán
│   │   ├── my-orders/          # Đơn hàng của tôi
│   │   └── account/            # Tài khoản
│   ├── admin/                   # Admin dashboard
│   ├── staff/                   # Staff dashboard
│   ├── travel-assistant/        # AI Travel Assistant
│   ├── confirmation/            # Payment confirmation
│   └── api/                     # API routes
├── components/                   # React components
│   ├── layout/                 # Layout components (Header, Footer)
│   ├── ui/                     # Shadcn UI components
│   ├── hotel/                  # Hotel-related components
│   ├── transport/              # Transport-related components
│   ├── show/                   # Show-related components
│   ├── cart/                   # Cart components
│   └── auth/                   # Authentication components
├── lib/                         # Utility libraries
│   ├── api.ts                  # API client
│   ├── auth.ts                 # Authentication helpers
│   ├── cart.ts                 # Cart management
│   ├── payment.ts              # Payment integration
│   ├── ai.ts                   # AI integration
│   └── timezone.ts             # Timezone utilities (UTC+7)
├── data/                        # Data types and mock data
├── hook/                        # Custom React hooks
└── utils/                       # Utility functions
```

## 🔧 Scripts Có Sẵn

```bash
# Development
npm run dev              # Chạy dev server với Turbopack
npm run build           # Build production
npm run start           # Chạy production server

# Code Quality
npm run lint            # Chạy ESLint
npm run format          # Format code với Prettier
npm run format:check    # Check code formatting

# Type Checking
npm run types:check     # Check TypeScript types
npm run types:generate  # Generate type declarations
```

## 🔐 Authentication Flow

1. Người dùng đăng nhập qua Email/Password hoặc Google OAuth
2. Backend trả về JWT token
3. Token được lưu trong localStorage
4. Mỗi request API gửi token trong Authorization header
5. Token được tự động refresh khi hết hạn

## 💳 Payment Integration

- **VNPay**: Cổng thanh toán chính cho người dùng Việt Nam
- **PayOS**: Cổng thanh toán dự phòng
- Hỗ trợ thanh toán qua QR code
- Webhook để xử lý callback thanh toán tự động

## 🤖 AI Travel Assistant

Sử dụng Google Gemini AI để:

- Tư vấn điểm đến du lịch
- Gợi ý lịch trình
- Trả lời câu hỏi về dịch vụ
- Hỗ trợ đặt vé thông minh

## 🌏 Timezone Management

Tất cả thời gian trong ứng dụng được hiển thị theo múi giờ **UTC+7 (Vietnam Time)**. Xem `src/lib/timezone.ts` để biết thêm chi tiết.

## 📱 Responsive Design

- Mobile-first approach
- Responsive cho mọi kích thước màn hình
- Touch-friendly UI components

## 🧪 Testing & Quality

- ESLint cho code linting
- Prettier cho code formatting
- TypeScript cho type safety
- Husky pre-commit hooks
- Lint-staged cho staged files

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod
```

### Docker

```bash
# Build Docker image
docker build -t trippio-fe .

# Run container
docker run -p 3000:3000 trippio-fe
```

### Standalone Build

```bash
npm run build
npm run start
```

## 📝 Environment Variables

| Variable                       | Description            | Example                          |
| ------------------------------ | ---------------------- | -------------------------------- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `NEXT_PUBLIC_API_URL`          | Backend API URL        | `http://localhost:5000`          |
| `GOOGLE_GEMINI_API_KEY`        | Google Gemini API Key  | `AIza...`                        |

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Copyright © 2025 Trippio Team

## 🔗 Links

- **Backend Repository**: [Trippio Backend](../Exe201/TripioBE/Trippio-main)
- **API Documentation**: Check backend README for API docs
- **Live Demo**: TBD

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub repository.
