import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#4a5de0';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#586ffb';
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '5rem', color: '#586ffb', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '2rem', color: '#333' }}>Oops! Page not found</h2>
      <p style={{ color: '#666', maxWidth: '400px', marginBottom: '30px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={handleGoToLogin}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundColor: '#586ffb',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease-in-out',
        }}
      >
        Go to Login
      </button>
    </div>
  );
};

export default NotFoundPage;
