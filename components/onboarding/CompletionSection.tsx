import React from 'react';
import styles from '../../styles/onboarding/completionSection.module.css';

interface CompletionSectionProps {
  userName: string;
  avatarName: string;
}

export default function CompletionSection({ userName, avatarName }: CompletionSectionProps) {
  return (
    <div className={styles.completionContent}>
      <h1 className={styles.title}>완료되었습니다!</h1>
      <p className={styles.subtitle}>사용자 이름: {userName}</p>
      <p className={styles.subtitle}>AI 아바타 이름: {avatarName}</p>
    </div>
  );
}
