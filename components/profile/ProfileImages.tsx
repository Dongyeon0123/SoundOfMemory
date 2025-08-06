import React, { useState } from 'react';
import styles from '../../styles/styles.module.css';
import ImageModal from './modal/ImageModal';

const DEFAULT_BACKGROUND_URL = 'https://firebasestorage.googleapis.com/v0/b/numeric-vehicle-453915-j9/o/header_images%2Fbackground3.png?alt=media&token=32951da6-22aa-4406-aa18-116e16828dc1';

interface ProfileImagesProps {
  backgroundImg?: string;
  img?: string;
  name?: string;
}

function ProfileImages({ backgroundImg, img, name }: ProfileImagesProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
              objectPosition: 'center'
            }}
          />
        </div>
        <div className={styles.avatarWrap}>
          {img && (
            <img
              src={img}
              alt={name}
              width={100}
              height={100}
              className={styles.avatarImg}
              style={{ 
                objectFit: 'cover', 
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onClick={handleImageClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
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