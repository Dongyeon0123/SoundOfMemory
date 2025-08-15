import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

export default function KakaoCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== 카카오 콜백 처리 시작 ===');
        
        // URL 파라미터에서 인가 코드 확인
        const { code, error: kakaoError } = router.query;
        
        if (kakaoError) {
          console.error('카카오 로그인 에러:', kakaoError);
          setError('카카오 로그인에 실패했습니다.');
          setStatus('error');
          return;
        }

        if (!code) {
          console.log('인가 코드가 없음, 대기 중...');
          return;
        }

        console.log('인가 코드 받음:', code);

        // Firebase Functions에 인가 코드 전달하여 토큰 교환
        const FUNCTIONS_URL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
          "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/createFirebaseToken";

        const resp = await fetch(FUNCTIONS_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ 
            authorization_code: code,
            redirect_uri: "http://localhost:3000/auth/kakao/callback"
          }),
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(errorData.error || `서버 에러: ${resp.status}`);
        }

        const data = await resp.json();
        console.log('Firebase Custom Token 받음');

        // Firebase 로그인
        const auth = getAuth();
        const result = await signInWithCustomToken(auth, data.token);
        console.log("Firebase 로그인 성공:", result.user?.uid);

        setStatus('success');
        
        // 홈으로 리다이렉트
        setTimeout(() => {
          router.push('/');
        }, 1000);

      } catch (error: any) {
        console.error('콜백 처리 실패:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>카카오 로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>로그인 실패</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => router.push('/register/login')}
          style={{
            padding: '10px 20px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>로그인 성공!</h2>
      <p>홈으로 이동합니다...</p>
    </div>
  );
}
