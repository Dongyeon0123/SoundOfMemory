import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { makeStore } from '../store';

function MyApp({ Component, pageProps }: AppProps) {
  const store = makeStore();
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp; 