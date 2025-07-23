import React from 'react';
import styles from '../../styles/styles.module.css'; // CSS 모듈 사용

type Props = {
  isCardMode: boolean;
  onToggle: () => void;
};

const FullScreenToggleButton: React.FC<Props> = ({ isCardMode, onToggle }) => {
  return (
    <button
      className={styles.fullscreenToggle}
      onClick={onToggle}
      aria-label="화면 모드 전환"
    >
      {isCardMode ? '풀화면으로' : '카드형으로'}
    </button>
  );
};

export default FullScreenToggleButton;