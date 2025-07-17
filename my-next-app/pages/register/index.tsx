import { useState } from 'react';
import Link from 'next/link';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import cardStyles from '../../styles/styles.module.css';
import styles from '../../styles/styles.module.css';

export default function Register() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    if (loading) return; // prevent double click
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setMessage('구글 계정으로 회원가입이 완료되었습니다!');
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential' || err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 계정입니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          setError('');
          window.location.href = '/register/login';
        }, 1500);
      } else {
        setError(err.message || '구글 회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard}>
        <div className={styles.scrollMain}>
          <h2 style={{ textAlign: 'center', marginBottom: 32 }}>회원가입</h2>
          <button
            onClick={handleGoogleSignup}
            style={{
              width: 360,
              maxWidth: '100%',
              margin: '0 auto',
              padding: '14px 0',
              borderRadius: 6,
              background: '#fff',
              color: '#222',
              border: '1.5px solid #636AE8',
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)',
              marginBottom: 16,
              position: 'relative',
              transition: 'background 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 22, height: 22, marginRight: 8 }} />
            {loading ? '진행 중...' : '구글 계정으로 회원가입'}
          </button>
          {message && <div style={{ marginTop: 16, color: '#636AE8', textAlign: 'center' }}>{message}</div>}
          {error && <div style={{ marginTop: 16, color: 'red', textAlign: 'center' }}>{error}</div>}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/register/login" style={{ color: '#636AE8', textDecoration: 'underline' }}>로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 