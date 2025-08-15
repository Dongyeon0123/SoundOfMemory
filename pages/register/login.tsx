import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithCustomToken } from 'firebase/auth';
import { useRouter } from 'next/router';
import { IoChatbubble } from 'react-icons/io5';
import cardStyles from '../../styles/styles.module.css';
import styles from '../../styles/login.module.css';

// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        // 환경 변수에서 키를 가져오기
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        
        console.log('환경 변수에서 가져온 카카오 키:', kakaoKey);
        console.log('카카오 키 길이:', kakaoKey?.length);
        console.log('카카오 SDK 존재 여부:', !!window.Kakao);
        
        if (!kakaoKey) {
          console.error('카카오 JavaScript 키가 설정되지 않았습니다. 환경 변수에 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY를 설정해주세요.');
          return;
        }
        
        try {
          // 이미 초기화되었는지 확인
          if (!window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
            console.log("Kakao init 성공:", window.Kakao.isInitialized());
          } else {
            console.log("Kakao 이미 초기화됨");
          }
        } catch (error) {
          console.error("Kakao init 실패:", error);
        }
      } else {
        console.log('카카오 SDK가 아직 로드되지 않았습니다.');
      }
    };

    // SDK가 로드될 때까지 대기
    const timer = setInterval(() => {
      if (typeof window !== 'undefined' && window.Kakao) {
        clearInterval(timer);
        initKakao();
      }
    }, 100);

    // 10초 후 타임아웃
    setTimeout(() => {
      clearInterval(timer);
      if (typeof window !== 'undefined' && !window.Kakao) {
        console.error('카카오 SDK 로드 타임아웃');
      }
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        router.push('/');
      }
    } catch (error) {
      console.error('Google 로그인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setLoading(true);
      
      console.log('카카오 로그인 시작');
      console.log('Kakao 객체 존재:', !!window.Kakao);
      console.log('Kakao 초기화 상태:', window.Kakao?.isInitialized?.());
      
      if (!window.Kakao) {
        throw new Error('카카오 SDK가 로드되지 않았습니다.');
      }
      
      if (!window.Kakao.isInitialized()) {
        throw new Error('카카오 SDK가 초기화되지 않았습니다. 페이지를 새로고침해보세요.');
      }

      // 1) Kakao 로그인(동의 항목은 콘솔에서 활성화한 범위만 요청)
      await new Promise((resolve, reject) => {
        window.Kakao.Auth.login({
          scope: "profile_nickname,profile_image", // 필요 시 조정
          success: resolve,
          fail: reject,
        });
      });

      // 2) access_token 확보
      const accessToken = window.Kakao.Auth.getAccessToken();
      if (!accessToken) throw new Error("카카오 액세스 토큰을 가져올 수 없습니다.");

      // 3) 서버(Function)에 전달 → custom token 수신
      const FUNCTIONS_URL = "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/createFirebaseToken";
      
      const resp = await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.error("서버 에러:", data);
        throw new Error(data.error || "서버 에러");
      }

      // 4) Firebase 로그인
      const auth = getAuth();
      const result = await signInWithCustomToken(auth, data.token);
      console.log("Firebase 로그인 성공:", result.user?.uid);

      // 5) 라우팅
      router.push('/');
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      alert("카카오 로그인에 실패했습니다. 설정(도메인/Redirect/키)을 다시 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.centerCard} ${styles.cardMode}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <div className={styles.contentWrapper}>
          <img src="/BlueLogo.png" alt="서비스 로고" className={styles.logo} />
          <h1 className={styles.title}>자신을 기록하고<br></br>타인과 소통하세요.</h1>
          <div className={styles.subtitle}>
            AI 대화형 스마트 명함 서비스
          </div>
          <button
            onClick={handleGoogleLogin}
            className={styles.loginButton}
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.googleIcon}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? '진행 중...' : 'Sign in with Google'}
          </button>
          
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className={styles.kakaoLoginButton}
            disabled={loading}
          >
            <IoChatbubble size={24} className={styles.kakaoIcon} />
            {loading ? '진행 중...' : '카카오로 시작하기'}
          </button>
          
          {/* 이용약관 및 개인정보처리방침 */}
          <div className={styles.termsContainer}>
            <a 
              href="/terms" 
              className={styles.termsLink}
              onClick={(e) => {
                e.preventDefault();
                // 이용약관 페이지로 이동하는 로직 추가
                console.log('이용약관 페이지로 이동');
              }}
            >
              이용약관
            </a>
            <span className={styles.termsDivider}>|</span>
            <a 
              href="/privacy" 
              className={styles.termsLink}
              onClick={(e) => {
                e.preventDefault();
                // 개인정보처리방침 페이지로 이동하는 로직 추가
                console.log('개인정보처리방침 페이지로 이동');
              }}
            >
              개인정보처리방침
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 