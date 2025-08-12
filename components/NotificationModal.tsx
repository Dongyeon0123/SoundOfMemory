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
        background: '#fff', borderRadius: 18, padding: '32px 28px 24px 28px', minWidth: 320, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: '90%', position: 'relative',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: type === 'success' ? '#636AE8' : '#FF4757',
            color: '#fff',
            fontSize: 24,
            fontWeight: 700,
          }}>
            {type === 'success' ? '✓' : '✕'}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: '#222', marginBottom: 8,
          }}>
            {type === 'success' ? '성공!' : '알림'}
          </div>
          <div style={{
            fontSize: 16, color: '#666', lineHeight: 1.4,
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
            borderRadius: 10,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.18s',
            marginTop: 8,
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