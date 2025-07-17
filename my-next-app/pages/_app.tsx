import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { makeStore } from '../store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const store = makeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  return (
    <Provider store={store}>
      <div className="centerCardWrap">
        <div className="centerCard" style={{ position: 'relative' }}>
          {loading && (
            <div className="page-loader">
              <div className="spinner" />
            </div>
          )}
          <Component {...pageProps} />
        </div>
      </div>
    </Provider>
  );
}

export default MyApp; 