import React, { useState } from 'react';
import { useRouter } from 'next/router';

const TestQRMiddleware: React.FC = () => {
  const [shortId, setShortId] = useState('');
  const router = useRouter();

  const handleTestRedirect = () => {
    if (shortId) {
      // QR 코드 URL로 이동하여 미들웨어 테스트
      window.location.href = `/q/${shortId}`;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>QR 미들웨어 테스트</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Short ID 입력:
          <input
            type="text"
            value={shortId}
            onChange={(e) => setShortId(e.target.value)}
            placeholder="예: nrLTfky4PMCkCIfVCHh9"
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </label>
      </div>

      <button 
        onClick={handleTestRedirect}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        QR 리다이렉트 테스트
      </button>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>테스트 방법:</h3>
        <ol>
          <li>위에 Short ID를 입력하세요 (예: nrLTfky4PMCkCIfVCHh9)</li>
          <li>"QR 리다이렉트 테스트" 버튼을 클릭하세요</li>
          <li>미들웨어가 /q/{shortId}를 /guest-profile/사용자ID로 리다이렉트하는지 확인하세요</li>
          <li>게스트 프로필 페이지에 로그인 없이 접근할 수 있는지 확인하세요</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h3>예상 결과:</h3>
        <ul>
          <li>URL이 /q/{shortId}에서 /guest-profile/사용자ID?from=qr&source={shortId}로 변경됩니다</li>
          <li>로그인 모달이 표시되지 않습니다</li>
          <li>게스트 프로필 페이지가 정상적으로 로드됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default TestQRMiddleware;
