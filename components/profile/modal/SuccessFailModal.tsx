import React from 'react';

interface SuccessFailModalProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

function SuccessFailModal({ show, message, type, onClose }: SuccessFailModalProps) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: '32px 24px',
        maxWidth: 320,
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}>
        {/* 아이콘 */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: type === 'success' ? '#E8F5E8' : '#FFEBEE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          {type === 'success' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12M12 16H12.01" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#F44336" strokeWidth="2"/>
            </svg>
          )}
        </div>
        {/* 메시지 */}
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#222',
          marginBottom: 24,
          lineHeight: 1.4,
        }}>
          {message}
        </div>
        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          style={{
            background: type === 'success' ? '#636AE8' : '#F44336',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default SuccessFailModal;
