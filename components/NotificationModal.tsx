import React from 'react';

interface NotificationModalProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '370px',
        height: '780px',
        background: '#fff', 
        borderRadius: 20, 
        padding: '40px', 
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: type === 'success' ? '#636AE8' : '#FF4757',
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
          }}>
            {type === 'success' ? '✓' : '✕'}
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700, color: '#222', marginBottom: 12,
          }}>
            {type === 'success' ? '성공!' : '알림'}
          </div>
          <div style={{
            fontSize: 18, color: '#666', lineHeight: 1.5, maxWidth: '280px',
          }}>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: type === 'success' ? '#636AE8' : '#FF4757',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 32px',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            transition: 'background 0.18s',
            width: '100%',
            maxWidth: '280px',
          }}
          onMouseOver={e => e.currentTarget.style.background = type === 'success' ? '#4850E4' : '#e63946'}
          onMouseOut={e => e.currentTarget.style.background = type === 'success' ? '#636AE8' : '#FF4757'}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;