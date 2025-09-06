import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiShare } from 'react-icons/fi';
import styles from '../../../styles/styles.module.css';
import { getExistingQRToken } from '../../../types/profiles';

interface QRCodeModalProps {
  visible: boolean;
  profileUrl: string;
  userName: string;
  userId: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  profileUrl,
  userName,
  userId,
  onClose,
}) => {
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [qrToken, setQrToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);

  // Firebase에서 기존 QR 토큰과 이미지 조회
  const loadExistingQRToken = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await getExistingQRToken(userId);
      if (result) {
        setQrToken(result.token);
        setQrImageUrl(result.qrImageUrl);
        setHasToken(true);
        console.log('QR 토큰 로드 성공:', result.token);
        console.log('QR 이미지 URL:', result.qrImageUrl);
      } else {
        console.log('해당 사용자의 QR 토큰이 없습니다');
        setHasToken(false);
      }
    } catch (error) {
      console.error('QR 토큰 로드 실패:', error);
      setHasToken(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트가 열릴 때 기존 QR 토큰 로드
  useEffect(() => {
    if (visible && userId) {
      loadExistingQRToken();
    }
  }, [visible, userId]);

  if (!visible) return null;


  const handleDownload = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.download = `${userName}_QR.png`;
      link.href = qrImageUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    const shareUrl = qrToken ? `https://www.soundofmemory.io/p/${qrToken}` : profileUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}의 프로필`,
          text: `${userName}의 프로필을 확인해보세요!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('공유 실패:', err);
        // 공유 실패 시 클립보드로 복사
        navigator.clipboard.writeText(shareUrl);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } else {
      // Web Share API 지원하지 않는 경우 클립보드로 복사
      navigator.clipboard.writeText(shareUrl);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90vw',
          maxWidth: '400px',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid #e8e8f0',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
            QR 코드
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
            }}
          >
            <FiX size={24} color="#666" />
          </button>
        </div>

        {/* QR 코드 영역 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          gap: 24,
        }}>
          <div style={{
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e8e8f0',
            position: 'relative',
          }}>
            {isLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}>
                <div style={{ fontSize: 14, color: '#666' }}>QR 이미지 로딩 중...</div>
              </div>
            )}
            {hasToken && qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="QR Code"
                style={{ 
                  width: 200, 
                  height: 200,
                  objectFit: 'contain'
                }}
              />
            ) : !isLoading && !hasToken ? (
              <div style={{
                width: 200,
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                fontSize: 14,
                textAlign: 'center',
                padding: 20,
                gap: 10,
              }}>
                <div>QR 코드가 없습니다</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  관리자에게 QR 코드 생성을 요청하세요
                </div>
              </div>
            ) : (
              <div style={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f8fb',
                color: '#666',
                fontSize: 14,
              }}>
                QR 코드를 불러오는 중...
              </div>
            )}
          </div>
          
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: 14,
            lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 600, color: '#222', marginBottom: 8 }}>
              {userName}의 프로필
            </div>
            <div>
              QR 코드를 스캔하여<br />
              프로필 페이지로 이동하세요
            </div>
          </div>

          {/* 버튼들 */}
          <div style={{
            display: 'flex',
            gap: 12,
            width: '100%',
            maxWidth: 280,
          }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                backgroundColor: '#f8f8fb',
                border: '1px solid #e8e8f0',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: '#444',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f5';
                e.currentTarget.style.borderColor = '#d0d0d8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f8fb';
                e.currentTarget.style.borderColor = '#e8e8f0';
              }}
            >
              <FiDownload size={16} />
              다운로드
            </button>
            
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                backgroundColor: '#636AE8',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: 'white',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5A61D9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#636AE8';
              }}
            >
              <FiShare size={16} />
              공유하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;