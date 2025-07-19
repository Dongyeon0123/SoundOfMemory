import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { makeStore } from '../store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchProfileById } from '../profiles';

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
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp; 