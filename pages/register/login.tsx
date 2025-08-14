import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/router';
import cardStyles from '../../styles/styles.module.css';
import styles from '../../styles/login.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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