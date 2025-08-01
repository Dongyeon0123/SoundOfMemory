import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { makeStore } from '../types/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchProfileById } from '../types/profiles';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const store = makeStore();
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 온보딩 페이지에서는 검사하지 않음
      if (router.pathname === '/profile/Onboarding') return;
      if (user) {
        const profile = await fetchProfileById(user.uid);
        if (!profile) {
          router.replace('/profile/Onboarding');
        }
      }
    });
    return () => unsubscribe();
  }, [router.pathname]);

  return (
    <Provider store={store}>
      <Head>
        <title>SoundOfMemory</title>
        <meta name="description" content="AI와 함께하는 소리 기반 메모리 서비스" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp; 