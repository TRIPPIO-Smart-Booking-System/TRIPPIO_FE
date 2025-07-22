'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#2a4f4f] text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Cột 1: Logo riêng - to hơn rõ rệt */}
        <div className="col-span-1 flex items-start">
          <Image
            src="/TripIoLogo.png"
            alt="Trippio Logo"
            width={220} // tăng lên từ 160 → 220
            height={120}
            className="object-contain"
          />
        </div>

        {/* Cột 2: Về Trippio + mạng xã hội */}
        <div className="col-span-1">
          <ul className="space-y-1 text-sm mb-6">
            <li>• Cách đặt chỗ</li>
            <li>• Liên hệ chúng tôi</li>
            <li>• Trợ giúp</li>
            <li>• Tuyển dụng</li>
            <li>• Về chúng tôi</li>
          </ul>
          <p className="text-sm font-semibold mb-1">Theo dõi chúng tôi trên</p>
          <ul className="space-y-1 text-sm">
            <li>• Facebook</li>
            <li>• Instagram</li>
            <li>• TikTok</li>
            <li>• Youtube</li>
            <li>• Telegram</li>
          </ul>
        </div>

        {/* Cột 3–4: Sản phẩm */}
        <div className="col-span-1">
          <h3 className="text-sm font-semibold mb-3">Sản phẩm</h3>
          <ul className="space-y-1 text-sm">
            <li>• Khách sạn</li>
            <li>• Vé máy bay</li>
            <li>• Vé xe khách</li>
            <li>• Đưa đón sân bay</li>
            <li>• Cho thuê xe</li>
            <li>• Hoạt động & Vui chơi</li>
            <li>• Du thuyền</li>
            <li>• Biệt thự</li>
            <li>• Căn hộ</li>
          </ul>
        </div>

        {/* Cột 5: Trợ giúp */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold mb-3">Trợ giúp</h3>
          <ul className="space-y-1 text-sm">
            <li>• Trung tâm trợ giúp</li>
            <li>• Câu hỏi thường gặp</li>
            <li>• Chính sách Bảo mật</li>
            <li>• Chính sách về cookie</li>
            <li>• Điều khoản sử dụng</li>
            <li>• Quản lý thiết lập cookie</li>
            <li>• Đạo luật Dịch vụ số (EU)</li>
            <li>• Nguyên tắc và báo cáo nội dung</li>
            <li>• Tuyên bố về Đạo luật Nô lệ Hiện đại</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-black text-center text-xs text-gray-300 py-4 px-4">
        Công ty TNHH Trippio Việt Nam. Mã số ĐN: 0123456789. Tòa nhà An Phú, 117–119 Lý Chính Thắng,
        P Võ Thị Sáu, Q3, TP HCM
        <br />
        Copyright © 2025 Trippio. All rights reserved
      </div>
    </footer>
  );
}
