'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './profile.css';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  birthDate: string;
  gender: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    birthDate: '',
    gender: 'Nam',
  });

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profileData = JSON.parse(userProfile);
      setProfile(profileData);
      setFormData(profileData);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(formData));
    localStorage.setItem('profileName', formData.firstName);
    setProfile(formData);
    setIsEditing(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('profileName');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  if (!profile) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="loading">Đang tải thông tin...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

      <div style={{ height: '100px' }}></div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">{profile.firstName.charAt(0).toUpperCase()}</div>
          </div>
          <h1>Hồ sơ cá nhân</h1>
          <p>Quản lý thông tin cá nhân của bạn</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <ul className="sidebar-menu">
              <li className="active">Thông tin cá nhân</li>
              <li>Đặt chỗ của tôi</li>
              <li>Danh sách giao dịch</li>
              <li>Thông báo giá vé</li>
            </ul>
          </div>

          <div className="profile-main">
            <div className="profile-section">
              <div className="section-header">
                <h2>Cài đặt hồ sơ</h2>
                <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên đầy đủ</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Thành phố cư trú</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="TP HCM"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="nguyenvana@gmail.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="0123456789"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Tài khoản đã liên kết</h3>
                  <div className="linked-accounts">
                    <div className="account-item">
                      <span className="account-icon">📘</span>
                      <span>Facebook</span>
                      <button className="link-btn">Liên kết</button>
                    </div>
                    <div className="account-item">
                      <span className="account-icon">🔍</span>
                      <span>Google</span>
                      <button className="link-btn">Liên kết</button>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSave}>
                      Lưu thay đổi
                    </button>
                  </div>
                )}

                <div className="logout-section">
                  <button className="logout-btn" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
