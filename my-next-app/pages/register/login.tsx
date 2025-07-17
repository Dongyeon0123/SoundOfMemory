import { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import cardStyles from '../../styles/styles.module.css';
import styles from '../../styles/styles.module.css';
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
      <div className={cardStyles.centerCard}>
        <div className={styles.scrollMain}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>로그인</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto' }}>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
              style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: 12, borderRadius: 4, background: '#636AE8', color: '#fff', border: 'none', fontWeight: 600 }} disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <button
            onClick={handleGoogleLogin}
            style={{
              width: 360,
              maxWidth: '100%',
              margin: '16px auto 0 auto',
              padding: '14px 0',
              borderRadius: 6,
              background: '#fff',
              color: '#222',
              border: '1.5px solid #636AE8',
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 22, height: 22, marginRight: 8 }} />
            {loading ? '진행 중...' : '구글 계정으로 로그인'}
          </button>
          {message && <div style={{ marginTop: 16, color: '#636AE8', textAlign: 'center' }}>{message}</div>}
          {error && <div style={{ marginTop: 16, color: 'red', textAlign: 'center' }}>{error}</div>}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            계정이 없으신가요?{' '}
            <Link href="/register" style={{ color: '#636AE8', textDecoration: 'underline' }}>회원가입</Link>
          </div>
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