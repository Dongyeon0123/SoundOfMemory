import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { FiX, FiDownload, FiShare, FiClock } from 'react-icons/fi';
import styles from '../../../styles/styles.module.css';
import { saveTempToken, generateQRToken } from '../../../types/profiles';

interface QRCodeModalProps {
  visible: boolean;
  profileUrl: string;
  userName: string;
  userId: string;
  usePermamentToken?: boolean; // 영구 토큰 사용 여부
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  profileUrl,
  userName,
  userId,
  usePermamentToken = false,
  onClose,
}) => {
  const [tempToken, setTempToken] = useState<string>('');
  const [permanentToken, setPermanentToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 영구 QR 토큰 생성
  const generatePermanentToken = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const result = await generateQRToken(userId);
      if (result) {
        setPermanentToken(result.token);
      }
    } catch (error) {
      console.error('영구 토큰 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 임시 토큰 생성 및 저장
  const generateNewToken = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15) + 
                   Date.now().toString();
      
      // Firebase에 임시 토큰 저장 (1분 유효)
      await saveTempToken(userId, token);
      setTempToken(token);
      setTimeLeft(60);
    } catch (error) {
      console.error('토큰 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 컴포넌트가 열릴 때 토큰 생성
  useEffect(() => {
    if (visible && userId) {
      if (usePermamentToken) {
        generatePermanentToken();
      } else {
        generateNewToken();
      }
    }
  }, [visible, userId, usePermamentToken]);

  // 1분 타이머 및 토큰 갱신 (임시 토큰만)
  useEffect(() => {
    if (!visible || usePermamentToken) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          generateNewToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, usePermamentToken]); // tempToken 의존성 제거

  if (!visible) return null;

  // QR 코드 URL 생성
  const qrUrl = usePermamentToken 
    ? (permanentToken ? `${typeof window !== 'undefined' ? window.location.origin : 'https://soundofmemory.com'}/p/${permanentToken}` : profileUrl)
    : (tempToken ? `${typeof window !== 'undefined' ? window.location.origin : 'https://soundofmemory.com'}/profile/temp/${tempToken}` : profileUrl);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `${userName}_QR.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}의 프로필`,
          text: `${userName}의 프로필을 확인해보세요!`,
          url: profileUrl,
        });
      } catch (err) {
        console.log('공유 실패:', err);
        // 공유 실패 시 클립보드로 복사
        navigator.clipboard.writeText(tempUrl);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } else {
      // Web Share API 지원하지 않는 경우 클립보드로 복사
      navigator.clipboard.writeText(tempUrl);
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
            {isGenerating && (
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
                <div style={{ fontSize: 14, color: '#666' }}>토큰 생성 중...</div>
              </div>
            )}
            <QRCode
              id="qr-code-svg"
              value={qrUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
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
            <div style={{ marginBottom: 12 }}>
              QR 코드를 스캔하여<br />
              프로필 페이지로 이동하세요
            </div>
            {!usePermamentToken && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: timeLeft <= 10 ? '#ffebee' : '#f8f8fb',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                color: timeLeft <= 10 ? '#e53e3e' : '#666',
                border: `1px solid ${timeLeft <= 10 ? '#ffcdd2' : '#e8e8f0'}`,
              }}>
                <FiClock size={14} />
                {timeLeft}초 후 갱신
              </div>
            )}
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