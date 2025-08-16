import React from 'react';
import styles from '../../styles/onboarding/completionSection.module.css';

interface CompletionSectionProps {
  userName: string;
  avatarName: string;
  onBack: () => void;
}

export default function CompletionSection({ userName, avatarName, onBack }: CompletionSectionProps) {
  return (
    <div className={styles.completionContent}>
      {/* 헤더 - 뒤로가기 버튼과 진행상황 바 */}
      <div className={styles.header}>
        <button 
          onClick={onBack} 
          className={styles.backButton}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className={styles.progressBar}>
          <div className={styles.progressContainer}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(3 / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        <h1 className={styles.title}>완료되었습니다!</h1>
        <p className={styles.subtitle}>사용자 이름: {userName}</p>
        <p className={styles.subtitle}>AI 아바타 이름: {avatarName}</p>
      </div>
    </div>
  );
}
