import React, { useEffect, useState } from 'react';
import styles from '../styles/splashScreen.module.css';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 3초 후에 부팅화면을 숨김
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // 페이드아웃 애니메이션 후 콜백 실행
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return (
      <div className={`${styles.splashOverlay} ${styles.fadeOut}`}>
        <div className={styles.splashCard}>
          <img
            src="/WhiteLogo.png"
            alt="White Logo"
            className={styles.logo}
          />
          <div className={styles.titleContainer}>
            <div className={styles.titleLine}>
              Sound +f
            </div>
            <div className={`${styles.titleLine} ${styles.second}`}>
              Memory
            </div>
            <div className={styles.subtitle}>
              사운드 오브 메모리
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.splashOverlay}>
      <div className={styles.splashCard}>
        <img
          src="/WhiteLogo.png"
          alt="White Logo"
          className={styles.logo}
        />
        <div className={styles.titleContainer}>
          <div className={styles.titleLine}>
            SOUND +f
          </div>
          <div className={`${styles.titleLine} ${styles.second}`}>
            MEMORY
          </div>
          <div className={styles.subtitle}>
            사운드 오브 메모리
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
