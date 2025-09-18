import React, { useState } from 'react';
import styles from '../../styles/styles.module.css';
import ImageModal from './modal/ImageModal';

const DEFAULT_BACKGROUND_URL = 'https://firebasestorage.googleapis.com/v0/b/numeric-vehicle-453915-j9/o/header_images%2Fbackground3.png?alt=media&token=32951da6-22aa-4406-aa18-116e16828dc1';

interface ProfileImagesProps {
  backgroundImg?: string;
  img?: string;
  name?: string;
  desc?: string;
  mbti?: string;
  tag?: string[];
}

function ProfileImages({ backgroundImg, img, name, desc, mbti, tag }: ProfileImagesProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const handleImageClick = () => {
    if (img) {
      setIsImageModalOpen(true);
    }
  };

  return (
    <>
      <div className={styles.mainHeader}>
        <div className={styles.bgImgWrap}>
          <img
            src={backgroundImg || DEFAULT_BACKGROUND_URL}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectPosition: 'center',
              opacity: backgroundLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
            onLoad={() => setBackgroundLoaded(true)}
            onError={() => setBackgroundLoaded(true)}
          />
          {/* W-B 로고 */}
          <img
            src="/W-B.png"
            alt="W-B Logo"
            style={{
              position: 'absolute',
              top: 5,
              left: 5,
              width: 50,
              height: 50,
              opacity: 0.8,
              zIndex: 3
            }}
          />
        </div>
        {/* 반투명 카드 */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(3px)',
          borderRadius: 20,
          padding: '15px',
          width: '85%',
          minHeight: 130,
          boxShadow: '0 10px 36px rgba(0, 0, 0, 0.14)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            {img && (
              <img
                src={img}
                alt={name}
                width={70}
                height={70}
                style={{ 
                  objectFit: 'cover', 
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.3s ease',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  flexShrink: 0,
                  opacity: profileLoaded ? 1 : 0
                }}
                onClick={handleImageClick}
                onLoad={() => setProfileLoaded(true)}
                onError={() => setProfileLoaded(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            )}
            <div style={{ flex: 1, position: 'relative' }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: 15, 
                fontWeight: 700, 
                color: '#1F2937',
                marginBottom: 2
              }}>
                {name || '사용자'}
              </h2>
              {(desc || mbti) && (
                <p style={{ 
                  margin: 0, 
                  fontSize: 12, 
                  color: '#4B5563',
                  fontWeight: 600,
                  marginTop: 5,
                }}>
                  {(desc || '').trim()} {(desc && mbti) ? ' | ' : ''} {(mbti || '').trim()}
                </p>
              )}
            </div>
          </div>
          
          {/* 태그: 카드 오른쪽 아래 작게 표시 */}
          {tag && tag.length > 0 && (
            <div style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              maxWidth: '65%'
            }}>
              {tag.map((t, index) => (
                <span key={index} style={{
                  background: 'rgba(88, 88, 88, 0.4)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: 14,
                  fontSize: 10,
                  fontWeight: 400,
                  whiteSpace: 'nowrap'
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={img || ''}
        altText={`${name}의 프로필 이미지`}
      />
    </>
  );
}

export default ProfileImages;