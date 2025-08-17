import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from '../../styles/onboarding/completionSection.module.css';
import { setProfileField } from '../../types/profiles';

interface CompletionSectionProps {
  userName: string;
  avatarName: string;
  onBack: () => void;
}

export default function CompletionSection({ userName, avatarName, onBack }: CompletionSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // 현재 로그인된 사용자 ID 가져오기
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // 컴포넌트 마운트 시 자동으로 저장 시작
  useEffect(() => {
    if (userId) {
      handleAutoSave();
    }
  }, [userId]);

  const handleAutoSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // 로그인된 사용자의 ID를 사용하여 프로필 정보 저장
      await setProfileField(userId, {
        name: userName,
        aiIntro: `안녕 나는 ${userName}의 개인 AI비서야. 궁금한거 있으면 물어봐!`,
        img: '/char.png', // 기본 이미지
        backgroundImg: '/background.png' // 기본 배경 이미지
      });
      
      setSaveStatus('success');
      
      // 2초 후 홈으로 이동
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      console.error('파이어베이스 저장 실패:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.completionContent}>
      {/* 헤더 - 뒤로가기 버튼과 진행상황 바 */}
      <div className={styles.header}>
        <button 
          onClick={onBack} 
          className={styles.backButton}
          disabled={isSaving}
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
        
        {/* 저장 상태 표시 */}
        {saveStatus === 'saving' && (
          <div className={styles.savingStatus}>
            <p>파이어베이스에 저장 중...</p>
          </div>
        )}
        
        {saveStatus === 'success' && (
          <div className={styles.successStatus}>
            <p>✅ 저장 완료! 홈으로 이동합니다...</p>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className={styles.errorStatus}>
            <p>❌ 저장 실패. 다시 시도해주세요.</p>
            <button 
              onClick={handleAutoSave}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
