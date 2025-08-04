import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { verifyTempToken } from '../../../types/profiles';
import styles from '../../../styles/styles.module.css';

const TempProfilePage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      if (!token || typeof token !== 'string') {
        setError('잘못된 토큰입니다.');
        setLoading(false);
        return;
      }

      try {
        const userId = await verifyTempToken(token);
        
        if (userId) {
          // 유효한 토큰이면 실제 프로필 페이지로 리다이렉트
          router.replace(`/profile/${userId}`);
        } else {
          setError('토큰이 만료되었거나 유효하지 않습니다.');
          setLoading(false);
        }
      } catch (error) {
        console.error('토큰 검증 중 오류:', error);
        setError('토큰 검증 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    verifyAndRedirect();
  }, [token, router]);

  if (loading) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 400,
          gap: 20 
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e8e8f0',
            borderTop: '3px solid #636AE8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ fontSize: 16, color: '#666' }}>
            QR 코드를 확인하는 중...
          </div>
          
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 400,
          gap: 20,
          textAlign: 'center'
        }}>
          <div style={{
            width: 80,
            height: 80,
            backgroundColor: '#ffebee',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                fill="#e53e3e"
              />
              <path d="M15 9H9v6h6V9z" fill="#e53e3e" />
            </svg>
          </div>
          
          <div>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: '#e53e3e', 
              margin: '0 0 12px 0' 
            }}>
              QR 코드 오류
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: '#666', 
              lineHeight: 1.5, 
              margin: '0 0 24px 0' 
            }}>
              {error}
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#636AE8',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5A61D9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#636AE8';
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export async function getServerSideProps() {
  return { props: {} };
}

export default TempProfilePage;