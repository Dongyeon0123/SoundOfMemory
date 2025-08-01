import React, { useState } from 'react';
import styles from '../../styles/styles.module.css';
import ImageModal from './modal/ImageModal';

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
          {backgroundImg && (
            <img
              src={backgroundImg}
              alt={name}
            />
          )}
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