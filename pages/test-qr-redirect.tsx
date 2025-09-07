import React, { useState } from 'react';
import { getMyQrData } from '../lib/firebaseApi';
import styles from '../styles/styles.module.css';

const TestQRRedirect: React.FC = () => {
  const [userId, setUserId] = useState('test0907');
  const [shortId, setShortId] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [testShortId, setTestShortId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetQrData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const qrData = await getMyQrData(userId);
      if (qrData) {
        setShortId(qrData.shortId);
        setDeepLink(qrData.qrDeepLink);
        setResult({ type: 'success', message: 'QR 데이터 조회 성공', data: qrData });
      } else {
        setResult({ type: 'error', message: 'QR 데이터가 아직 생성되지 않았습니다' });
      }
    } catch (error) {
      setResult({ type: 'error', message: `오류: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard} style={{ maxWidth: 600, padding: 40 }}>
        <h1 style={{ marginBottom: 30, textAlign: 'center' }}>QR 리다이렉트 테스트</h1>
        
        {/* QR 데이터 조회 */}
        <div style={{ marginBottom: 30, padding: 20, border: '1px solid #e8e8f0', borderRadius: 8 }}>
          <h3 style={{ marginBottom: 15 }}>1. QR 데이터 조회</h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>사용자 ID:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>
          <button
            onClick={handleGetQrData}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#636AE8',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '조회 중...' : 'QR 데이터 조회'}
          </button>
          
          {shortId && (
            <div style={{ marginTop: 15, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
              <div><strong>Short ID:</strong> {shortId}</div>
              <div><strong>Deep Link:</strong> {deepLink}</div>
            </div>
          )}
        </div>

        {/* 미들웨어 테스트 안내 */}
        <div style={{ marginBottom: 30, padding: 20, border: '1px solid #e8e8f0', borderRadius: 8 }}>
          <h3 style={{ marginBottom: 15 }}>2. 미들웨어 테스트</h3>
          <div style={{ marginBottom: 15 }}>
            <p style={{ margin: 0, color: '#666', lineHeight: 1.5 }}>
              위에서 조회된 Deep Link를 브라우저에서 직접 접속해보세요.
              미들웨어가 자동으로 /guest-profile/{userId}?from=qr&source={shortId}로 리다이렉트하는지 확인하세요.
            </p>
          </div>
        </div>

        {/* 결과 표시 */}
        {result && (
          <div style={{
            padding: 15,
            backgroundColor: result.type === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: 4,
            color: result.type === 'success' ? '#155724' : '#721c24'
          }}>
            <div style={{ fontWeight: 500, marginBottom: 5 }}>{result.message}</div>
            {result.data && (
              <pre style={{ 
                margin: 0, 
                fontSize: 12, 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                padding: 8, 
                borderRadius: 4,
                overflow: 'auto'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* 새로운 구조 안내 */}
        <div style={{ marginTop: 30, padding: 20, backgroundColor: '#e3f2fd', borderRadius: 8 }}>
          <h4 style={{ marginBottom: 10 }}>새로운 QR 시스템 구조:</h4>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>백엔드</strong>: onUserDocumentCreate에서 QR 데이터 자동 생성</li>
            <li><strong>프론트엔드</strong>: 생성된 QR 데이터만 조회하여 표시</li>
            <li><strong>미들웨어</strong>: Firestore REST API로 안전한 리다이렉트 처리</li>
            <li><strong>보안</strong>: 클라이언트에서 QR 생성/수정 불가, 읽기 전용</li>
          </ol>
          <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
            * 모든 QR 생성/수정 로직은 백엔드에서 처리되며, 클라이언트는 읽기만 합니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQRRedirect;
