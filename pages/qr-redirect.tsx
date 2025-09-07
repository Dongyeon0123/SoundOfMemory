import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { verifyQRToken } from '../types/profiles';

const QRRedirectPage: React.FC = () => {
  const router = useRouter();
  const { shortId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleQRRedirect = async () => {
      if (!shortId || typeof shortId !== 'string') {
        setError('유효하지 않은 QR 코드입니다.');
        setLoading(false);
        return;
      }

      try {
        // 기존 verifyQRToken 함수 사용 (Cloud Function 호출)
        console.log('QR 리다이렉트 시도:', shortId);
        
        const result = await verifyQRToken(shortId);
        console.log('QR 토큰 검증 결과:', result);
        
        if (result) {
          // 게스트 프로필로 리다이렉트
          const destinationUrl = `/guest-profile/${result}?from=qr&source=${shortId}`;
          console.log('리다이렉트 대상:', destinationUrl);
          router.replace(destinationUrl);
          return;
        }
        
        setError('QR 코드를 찾을 수 없습니다.');
        setLoading(false);
      } catch (err) {
        console.error('QR 리다이렉트 오류:', err);
        setError('QR 코드 처리 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    if (shortId) {
      handleQRRedirect();
    }
  }, [shortId, router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '20px' }}>QR 코드를 처리하고 있습니다...</div>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', color: '#e74c3c', marginBottom: '20px' }}>{error}</div>
        <button 
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return null;
};

export default QRRedirectPage;
