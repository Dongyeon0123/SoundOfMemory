import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { verifyQRToken } from '../../types/profiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from '../../styles/styles.module.css';

const QRTokenPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Firebase 인증 상태 확인 (기존 인증 체크 우회)
  useEffect(() => {
    const auth = getAuth();
    
    // 즉시 현재 인증 상태 확인
    const currentUser = auth.currentUser;
    console.log('QR 토큰 페이지 - 즉시 인증 상태:', currentUser ? `로그인됨 (${currentUser.uid})` : '로그인 안됨');
    setCurrentUser(currentUser);
    setIsAuthChecked(true);

    // 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('QR 토큰 페이지 - 인증 상태 변경:', user ? `로그인됨 (${user.uid})` : '로그인 안됨');
      setCurrentUser(user);
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      if (!token || typeof token !== 'string') {
        setError('잘못된 QR 코드입니다.');
        setLoading(false);
        return;
      }

      if (!isAuthChecked) {
        // 인증 상태 확인이 완료될 때까지 대기
        console.log('인증 상태 확인 대기 중...');
        return;
      }

      console.log('인증 상태 확인 완료. 현재 사용자:', currentUser ? `로그인됨 (${currentUser.uid})` : '로그인 안됨');

      try {
        console.log('QR 토큰 해석 시작:', token);
        const userId = await verifyQRToken(token);
        
        if (userId) {
          console.log('토큰 해석 성공, userId:', userId, '로그인 상태:', !!currentUser);
          // 로그인 상태에 따라 다른 프로필 페이지로 리다이렉트
          if (currentUser) {
            // 로그인한 사용자 → 일반 프로필 페이지
            console.log('로그인 사용자 → 일반 프로필로 리다이렉트');
            router.replace(`/profile/${userId}`);
          } else {
            // 로그인하지 않은 사용자 → 게스트 프로필 페이지
            console.log('게스트 사용자 → 게스트 프로필로 리다이렉트');
            router.replace(`/guest-profile/${userId}`);
          }
        } else {
          console.log('토큰 해석 실패');
          setError('QR 코드가 유효하지 않거나 만료되었습니다.');
          setLoading(false);
        }
      } catch (error) {
        console.error('QR 토큰 검증 중 오류:', error);
        setError('QR 코드 검증 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    verifyAndRedirect();
  }, [token, router, isAuthChecked, currentUser]);

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
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" 
                fill="#e53e3e"
              />
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

export default QRTokenPage;
