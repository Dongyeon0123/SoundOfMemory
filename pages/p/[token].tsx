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
  const [isProcessing, setIsProcessing] = useState(false);

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
        //
        // 인증 상태 확인이 완료될 때까지 대기
        console.log('인증 상태 확인 대기 중...');
        return;
      }

      // 중복 실행 방지
      if (isProcessing) {
        console.log('이미 처리 중입니다. 중복 실행 방지.');
        return;
      }

      setIsProcessing(true);
      console.log('인증 상태 확인 완료. 현재 사용자:', currentUser ? `로그인됨 (${currentUser.uid})` : '로그인 안됨');

      try {
        console.log('QR 토큰 해석 시작:', token);
        const userId = await verifyQRToken(token);
        
        if (userId) {
          console.log('토큰 해석 성공, userId:', userId, '로그인 상태:', !!currentUser);
          
          // QR 스캔은 실제 userId로 리다이렉트 (한 번만 호출되도록)
          console.log('QR 스캔 → 게스트 프로필로 리다이렉트 (실제 userId:', userId, ')');
          router.replace(`/guest-profile/${userId}?from=qr&token=${token}`);
        } else {
          console.log('토큰 해석 실패');
          setError('QR 코드가 유효하지 않거나 만료되었습니다.');
          setLoading(false);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('QR 토큰 검증 중 오류:', error);
        setError('QR 코드 검증 중 오류가 발생했습니다.');
        setLoading(false);
        setIsProcessing(false);
      }
    };

    verifyAndRedirect();
  }, [token, router, isAuthChecked, currentUser, isProcessing]);

  if (loading) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 400,
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 배경 애니메이션 */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(99, 106, 232, 0.1) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite'
          }} />
          
          {/* 메인 로딩 컨텐츠 */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24
          }}>
            {/* 커스텀 스피너 */}
            <div style={{
              position: 'relative',
              width: 80,
              height: 80
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '4px solid rgba(99, 106, 232, 0.1)',
                borderTop: '4px solid #636AE8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                width: 'calc(100% - 16px)',
                height: 'calc(100% - 16px)',
                border: '2px solid rgba(99, 106, 232, 0.1)',
                borderTop: '2px solid #257EFE',
                borderRadius: '50%',
                animation: 'spin 1.5s linear infinite reverse'
              }} />
            </div>
            
            {/* 로딩 텍스트 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}>
              <div style={{ 
                fontSize: 20, 
                color: '#636AE8', 
                fontWeight: 700,
                letterSpacing: '-0.5px'
              }}>
                QR 코드를 확인하는 중
              </div>
              <div style={{
                fontSize: 14,
                color: '#8B94A5',
                fontWeight: 500
              }}>
                잠시만 기다려주세요...
              </div>
            </div>
            
            {/* 점 애니메이션 */}
            <div style={{
              display: 'flex',
              gap: 4
            }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: '#636AE8',
                    borderRadius: '50%',
                    animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* CSS 애니메이션 */}
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
              40% { transform: scale(1.2); opacity: 1; }
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
