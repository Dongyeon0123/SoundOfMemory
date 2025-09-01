import React from 'react';
import styles from '../styles/couponResultModal.module.css';

interface CouponResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    success: boolean;
    message: string;
    couponCode?: string;
  } | null;
}

export default function CouponResultModal({ isOpen, onClose, result }: CouponResultModalProps) {
  if (!isOpen || !result) return null;

  const getIcon = () => {
    if (result.success) {
      return '🎉';
    }
    
    if (result.message.includes('이미 사용한 쿠폰')) {
      return '⚠️';
    } else if (result.message.includes('소진')) {
      return '❌';
    } else if (result.message.includes('유효하지 않은')) {
      return '🚫';
    } else {
      return '❌';
    }
  };

  const getTitle = () => {
    if (result.success) {
      return '쿠폰 등록 성공!';
    }
    
    if (result.message.includes('이미 사용한 쿠폰')) {
      return '쿠폰 사용 완료';
    } else if (result.message.includes('소진')) {
      return '쿠폰 소진';
    } else if (result.message.includes('유효하지 않은')) {
      return '유효하지 않은 쿠폰';
    } else {
      return '쿠폰 등록 실패';
    }
  };

  const getButtonText = () => {
    if (result.success) {
      return '확인';
    } else {
      return '다시 시도';
    }
  };

  const handleButtonClick = () => {
    if (result.success) {
      onClose();
    } else {
      onClose();
      // 실패 시 입력 필드 포커스 등의 추가 동작 가능
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.icon}>{getIcon()}</div>
          <h2 className={styles.title}>{getTitle()}</h2>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.message}>{result.message}</p>
          {result.couponCode && (
            <div className={styles.couponInfo}>
              <span className={styles.label}>쿠폰 코드:</span>
              <span className={styles.code}>{result.couponCode}</span>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.button} ${result.success ? styles.successButton : styles.errorButton}`}
            onClick={handleButtonClick}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
