import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { makeStore } from '../types/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchProfileById } from '../types/profiles';
import Head from 'next/head';
import SplashScreen from '../components/SplashScreen';

function MyApp({ Component, pageProps }: AppProps) {
  const store = makeStore();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 온보딩 페이지, test-onboarding, 게스트 프로필 페이지, QR 토큰 페이지, 프로필 페이지에서는 검사하지 않음
      if (router.pathname === '/profile/Onboarding' || 
          router.pathname === '/test-onboarding' || 
          router.pathname.startsWith('/guest-profile/') ||
          router.pathname.startsWith('/p/') ||
          router.pathname.startsWith('/q/') ||
          router.pathname === '/qr-redirect' ||
          router.pathname.startsWith('/profile/')) {
        setIsAuthChecked(true);
        return;
      }
      
      if (user) {
        const profile = await fetchProfileById(user.uid);
        if (!profile || !profile.name) {
          router.replace('/test-onboarding');
        }
      } else {
        // 로그인 상태가 아니라면 로그인페이지로 이동
        if (router.pathname !== '/register/login') {
          router.replace('/register/login');
        }
      }
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, [router.pathname]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // 스플래시 화면이 끝나고 인증 체크가 완료된 후에만 컴포넌트 렌더링
  if (showSplash || !isAuthChecked) {
    return (
      <Provider store={store}>
        <Head>
          <title>SoundOfMemory</title>
          <meta name="description" content="AI와 함께하는 소리 기반 메모리 서비스" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/logo.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=S-Core+Dream:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
        </Head>
        
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <Head>
        <title>SoundOfMemory</title>
        <meta name="description" content="AI와 함께하는 소리 기반 메모리 서비스" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=S-Core+Dream:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
      </Head>
      
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp; 