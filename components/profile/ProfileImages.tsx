import React from 'react';
import styles from '../../styles/styles.module.css';

interface ProfileImagesProps {
  backgroundImg?: string;
  img?: string;
  name?: string;
}

function ProfileImages({ backgroundImg, img, name }: ProfileImagesProps) {
  return (
    <div className={styles.mainHeader}>
      <div className={styles.bgImgWrap}>
        {backgroundImg && (
          <img
            src={backgroundImg}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: 'inherit' }}
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
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        )}
      </div>
    </div>
  );
}

export default ProfileImages;