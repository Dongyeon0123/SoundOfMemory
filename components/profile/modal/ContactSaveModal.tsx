import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ContactSaveModalProps {
  visible: boolean;
  onClose: () => void;
}

const ContactSaveModal: React.FC<ContactSaveModalProps> = ({ visible, onClose }) => {
  if (!visible) return null;

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
        position: 'relative',
      }}>
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IoClose size={20} />
        </button>

        {/* 아이콘 */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#FFEBEE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="#F44336" strokeWidth="2"/>
          </svg>
        </div>

        {/* 메시지 */}
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#222',
          marginBottom: 24,
          lineHeight: 1.4,
        }}>
          상대방이 연락처를 기입하지 않았습니다.
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          style={{
            background: '#636AE8',
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
};

export default ContactSaveModal;

