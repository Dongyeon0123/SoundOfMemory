import React from 'react';
import styles from '../styles/styles.module.css';

interface TokenExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

const TokenExhaustedModal: React.FC<TokenExhaustedModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>토큰이 부족합니다</h2>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.tokenExhaustedIcon}>
            <div className={styles.tokenIcon}>🪙</div>
          </div>
          
          <p className={styles.tokenExhaustedMessage}>
            오늘의 채팅 토큰을 모두 사용했습니다.
            <br />
            내일 다시 이용하거나
            <br />
            프리미엄으로 업그레이드하세요!
          </p>
          
          <div className={styles.tokenExhaustedInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>무료 사용량:</span>
              <span className={styles.infoValue}>일 10회</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>프리미엄 사용량:</span>
              <span className={styles.infoValue}>무제한</span>
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.modalButtonSecondary}
            onClick={onClose}
          >
            나중에 하기
          </button>
          {onUpgrade && (
            <button 
              className={styles.modalButtonPrimary}
              onClick={onUpgrade}
            >
              프리미엄 업그레이드
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenExhaustedModal;
