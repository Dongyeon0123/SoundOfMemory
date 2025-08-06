import React from 'react';
import { useRouter } from 'next/router';

interface LoginRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  actionName: string; // "친구 추가", "차단", "즐겨찾기" 등
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  visible,
  onClose,
  actionName
}) => {
  const router = useRouter();

  const handleLoginClick = () => {
    onClose();
    router.push('/register/login');
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '320px',
        padding: '32px 24px 24px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        {/* 아이콘 */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#636AE8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
              fill="white"
            />
          </svg>
        </div>

        {/* 제목 */}
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#222',
        }}>
          로그인이 필요합니다
        </h3>

        {/* 설명 */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.4',
        }}>
          <strong>{actionName}</strong> 기능을 사용하시려면<br />
          로그인이 필요합니다.
        </p>

        {/* 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            취소
          </button>
          <button
            onClick={handleLoginClick}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#636AE8',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;