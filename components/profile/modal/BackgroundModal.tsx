import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../../../types/firebase';
import { getAuth } from 'firebase/auth';
import styles from '../../../styles/profile.module.css';

const DEFAULT_BACKGROUND_URL = 'https://firebasestorage.googleapis.com/v0/b/numeric-vehicle-453915-j9/o/header_images%2Fbackground3.png?alt=media&token=32951da6-22aa-4406-aa18-116e16828dc1';

interface BackgroundModalProps {
  visible: boolean;
  currentBackground?: string;
  onClose: () => void;
  onSelect: (backgroundUrl: string) => void;
}

const BackgroundModal: React.FC<BackgroundModalProps> = ({
  visible,
  currentBackground,
  onClose,
  onSelect,
}) => {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackground, setSelectedBackground] = useState<string>(
    currentBackground || DEFAULT_BACKGROUND_URL
  );

  // Firebase Storage에서 배경 이미지들 불러오기
  useEffect(() => {
    const fetchBackgroundImages = async () => {
      if (!visible) return;
      
      setLoading(true);
      try {
        console.log('Firebase Storage 초기화 확인:', storage);
        const imageUrls: string[] = [];
        
        // background1부터 background6까지 PNG 파일 불러오기
        console.log('배경 이미지 로딩 시작...');
        
        for (let i = 1; i <= 6; i++) {
          try {
            const imageRef = ref(storage, `header_images/background${i}.png`);
            const url = await getDownloadURL(imageRef);
            imageUrls.push(url);
            console.log(`배경 이미지 ${i} 로딩 성공:`, url);
          } catch (error) {
            console.warn(`배경 이미지 ${i} 로딩 실패:`, error);
          }
        }
        
        console.log(`총 ${imageUrls.length}개의 배경 이미지 로딩 완료`);
        setBackgroundImages(imageUrls);
      } catch (error) {
        console.error('배경 이미지 로딩 실패:', error);
        console.error('에러 상세:', {
          code: (error as any).code,
          message: (error as any).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBackgroundImages();
  }, [visible]);

  const handleBackgroundClick = (imageUrl: string) => {
    setSelectedBackground(imageUrl);
  };

  const handleCustomImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // 파일 확장자 확인
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
        alert('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 확인 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.');
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      // Storage에 업로드
      const timestamp = Date.now();
      const storageRef = ref(storage, `background_images/${user.uid}/custom_${timestamp}`);
      const snapshot = await uploadBytes(storageRef, file);
      
      // 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(storageRef);
      
      // 업로드된 이미지를 선택된 배경으로 설정
      setSelectedBackground(downloadURL);
      console.log('커스텀 배경 이미지 업로드 성공:', downloadURL);
      
    } catch (error) {
      console.error('배경 이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedBackground) {
      onSelect(selectedBackground);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '24px 24px 16px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#222',
          }}>
            배경 이미지 선택
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* 콘텐츠 */}
        <div style={{
          padding: '20px 24px',
          overflow: 'auto',
          flex: 1,
        }}>
          {/* 설명 텍스트 */}
          <div style={{
            marginBottom: '20px',
            textAlign: 'center',
            color: '#888',
            fontSize: '14px',
            lineHeight: '1.4',
          }}>
            아름다운 파노라마 이미지로 나만의 배경을 꾸며보세요.<br />
            추천 화면 비율은 5:1입니다.
          </div>

          {/* 내 배경 이미지 업로드 섹션 */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            background: '#fafafa',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#222',
              }}>
                내 배경 이미지
              </span>
              <label style={{
                color: '#636AE8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>+ Add New</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleCustomImageUpload}
                />
              </label>
            </div>
            
            {/* 현재 배경 이미지 미리보기 */}
            <div style={{
              width: '100%',
              aspectRatio: '5/1',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #e0e0e0',
              background: '#f5f5f5',
            }}>
              <img
                src={selectedBackground}
                alt="현재 선택된 배경"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* 추천 배경 제목 */}
          <div style={{
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#222',
          }}>
            추천 배경
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
            }}>
              <div className="spinner" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '14px', color: '#666' }}>
                배경 이미지를 불러오는 중...
              </div>
            </div>
          ) : backgroundImages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666',
            }}>
              사용 가능한 배경 이미지가 없습니다.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '12px',
              width: '100%',
            }}>
              {backgroundImages.map((imageUrl, index) => (
                <div
                  key={index}
                  onClick={() => handleBackgroundClick(imageUrl)}
                  style={{
                    position: 'relative',
                    aspectRatio: '5/1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedBackground === imageUrl ? '3px solid #636AE8' : '2px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`배경 이미지 ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {selectedBackground === imageUrl && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#636AE8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedBackground}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              background: selectedBackground ? '#636AE8' : '#ccc',
              color: 'white',
              cursor: selectedBackground ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundModal;