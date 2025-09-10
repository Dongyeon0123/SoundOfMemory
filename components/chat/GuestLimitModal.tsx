import React from 'react';
import styles from '../../styles/chat.module.css';

interface GuestLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

const GuestLimitModal: React.FC<GuestLimitModalProps> = ({
  visible,
  onClose,
  onSignUp,
}) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '320px',
        width: '90%',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}>
        {/* X 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>

        {/* 모달 내용 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '16px',
            lineHeight: '1.4',
          }}>
            무료 체험은 최대 5회까지 가능합니다
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '24px',
            lineHeight: '1.5',
          }}>
            더 많은 대화를 원하시면<br />
            회원가입해주세요
          </div>

          {/* 회원가입 버튼 */}
          <button
            onClick={onSignUp}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#636AE8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a5fd4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#636AE8';
            }}
          >
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestLimitModal;
