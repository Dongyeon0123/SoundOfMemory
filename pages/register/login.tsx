import { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../types/firebase';
import cardStyles from '../../styles/styles.module.css';
import { useRouter } from 'next/router';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      setMessage('로그인 성공!');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/');
      }, 1200);
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setMessage('구글 로그인 성공!');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/');
      }, 1200);
    } catch (err: any) {
      setError(err.message || '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <img src="/logo.png" alt="서비스 로고" style={{ width: 80, height: 80, marginBottom: 18, borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(99,106,232,0.10)' }} />
          <h1 style={{ fontWeight: 800, fontSize: 28, color: '#636AE8', marginBottom: 8, letterSpacing: '-1px' }}>Sound Of Memory</h1>
          <div style={{ fontSize: 18, color: '#222', marginBottom: 28, fontWeight: 500, textAlign: 'center', lineHeight: 1.5 }}>
            서비스를 시작해보세요<br />
            구글 계정으로 1초만에 로그인!
          </div>
          <button
            onClick={handleGoogleLogin}
            style={{
              width: 320,
              maxWidth: '100%',
              margin: '0 auto',
              padding: '14px 0',
              borderRadius: 8,
              background: '#fff',
              color: '#222',
              border: '2px solid #636AE8',
              fontWeight: 700,
              fontSize: 17,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px 0 rgba(99,106,232,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              opacity: loading ? 0.6 : 1,
              transition: 'background 0.18s, box-shadow 0.18s',
              position: 'relative',
            }}
            disabled={loading}
            onMouseOver={e => e.currentTarget.style.background = '#f5f7ff'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 24, height: 24, marginRight: 10 }} />
            {loading ? '진행 중...' : '구글 계정으로 로그인'}
          </button>
          {message && <div style={{ marginTop: 18, color: '#636AE8', textAlign: 'center', fontWeight: 600 }}>{message}</div>}
          {error && <div style={{ marginTop: 16, color: 'red', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        </div>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: '36px 48px', fontSize: 20, fontWeight: 700, color: '#636AE8', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 