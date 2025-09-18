import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiShare } from 'react-icons/fi';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import styles from '../../../styles/styles.module.css';
import { getMyQrData, PrivateQrData } from '../../../lib/firebaseApi';

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
  const [qrData, setQrData] = useState<PrivateQrData | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasQrData, setHasQrData] = useState<boolean>(false);

  // QR 데이터 조회 (백엔드에서 생성된 데이터만 읽기)
  const loadMyQrData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await getMyQrData(userId);
      if (result) {
        setQrData(result);
        setHasQrData(true);
        console.log('QR 데이터 로드 성공:', result.shortId);
        console.log('Deep Link:', result.qrDeepLink);
        console.log('전체 QR 데이터:', result); // 디버깅용
        
        // Firebase Storage에서 QR 이미지 불러오기
        // qrImageUrl이 있으면 사용하고, 없으면 기본 경로 사용
        const imagePath = result.qrImageUrl || `qr_images/${userId}/qr.png`;
        await loadQRImageFromStorage(imagePath);
      } else {
        console.log('QR 데이터가 아직 생성되지 않았습니다');
        setHasQrData(false);
      }
    } catch (error) {
      console.error('QR 데이터 로드 실패:', error);
      setHasQrData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Storage에서 QR 이미지 불러오기
  const loadQRImageFromStorage = async (imageUrl: string | undefined) => {
    try {
      // imageUrl이 없거나 빈 문자열인 경우
      if (!imageUrl) {
        console.log('QR 이미지 URL이 없습니다');
        setQrImageUrl('');
        return;
      }

      // 이미 URL이 완전한 경우 그대로 사용
      if (imageUrl.startsWith('http')) {
        setQrImageUrl(imageUrl);
        console.log('QR 이미지 URL 설정:', imageUrl);
        return;
      }
      
      // gs:// URL인 경우 다운로드 URL로 변환
      const storage = getStorage();
      const qrImageRef = ref(storage, imageUrl);
      
      // Firebase Storage에서 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(qrImageRef);
      setQrImageUrl(downloadURL);
      console.log('QR 이미지 URL 설정:', downloadURL);
    } catch (error) {
      console.error('QR 이미지 불러오기 실패:', error);
      setQrImageUrl('');
    }
  };

  // 컴포넌트가 열릴 때 QR 데이터 로드
  useEffect(() => {
    if (visible && userId) {
      loadMyQrData();
    }
  }, [visible, userId]);

  if (!visible) return null;


  const handleDownload = () => {
    if (qrImageUrl) {
      // QR 코드 이미지 다운로드
      const link = document.createElement('a');
      link.download = `${userName}_QR.png`;
      link.href = qrImageUrl;
      link.click();
    } else if (qrData?.qrDeepLink) {
      // 이미지가 없으면 deepLink를 텍스트 파일로 저장
      const blob = new Blob([qrData.qrDeepLink], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${userName}_QR_Link.txt`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    const shareUrl = qrData?.qrDeepLink || profileUrl;
    
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
                <div style={{ fontSize: 14, color: '#666' }}>QR 링크 생성 중...</div>
              </div>
            )}
            {hasQrData && qrData ? (
              qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt={`${userName}님의 QR 코드`}
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    // 이미지 로드 실패 시 대체 텍스트 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="
                          width: 200px;
                          height: 200px;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          background-color: #f8f9fa;
                          border: 2px dashed #636AE8;
                          border-radius: 12px;
                          padding: 20px;
                          gap: 12px;
                        ">
                          <div style="
                            font-size: 24px;
                            font-weight: 600;
                            color: #636AE8;
                            text-align: center;
                            word-break: break-all;
                          ">
                            ${qrData.shortId}
                          </div>
                          <div style="
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                            line-height: 1.4;
                          ">
                            QR 이미지를 불러올 수 없습니다<br />
                            위 코드를 NFC/QR에 인코딩하세요
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div style={{
                  width: 200,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed #636AE8',
                  borderRadius: 12,
                  padding: 20,
                  gap: 12,
                }}>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#636AE8',
                    textAlign: 'center',
                    wordBreak: 'break-all',
                  }}>
                    {qrData.shortId}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#636AE8',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    fontWeight: 500,
                  }}>
                    QR 코드를 생성하는 중...<br />
                    <span style={{ color: '#8B94A5', fontSize: 11 }}>
                      잠시만 기다려주세요
                    </span>
                  </div>
                </div>
              )
            ) : !isLoading && !hasQrData ? (
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
                <div>QR 데이터가 없습니다</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  백엔드에서 QR 데이터를 생성 중입니다
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
                QR 데이터를 불러오는 중...
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