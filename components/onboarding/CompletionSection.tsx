import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from '../../styles/onboarding/completionSection.module.css';
import { setProfileField, updateChatTopicInformation } from '../../types/profiles';
import ProfileImage from './ProfileImage';

interface CompletionSectionProps {
  userName: string;
  avatarName: string;
  selectedInterests: Set<string>;
  onBack: () => void;
}

export default function CompletionSection({ userName, avatarName, selectedInterests, onBack }: CompletionSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [hasProfileImage, setHasProfileImage] = useState(false);
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

  const handleImageSelect = (file: File) => {
    setSelectedProfileImage(file);
    setHasProfileImage(true);
  };

  const handleComplete = async () => {
    if (!userId) return;

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // 로그인된 사용자의 ID를 사용하여 프로필 정보 저장
      await setProfileField(userId, {
        name: userName,
        aiIntro: `안녕 나는 ${userName}의 개인 AI비서야. 궁금한거 있으면 물어봐!`,
        img: selectedProfileImage ? URL.createObjectURL(selectedProfileImage) : '/char.png', // 선택된 이미지 또는 기본 이미지
        backgroundImg: '/background.png', // 기본 배경 이미지
        tag: Array.from(selectedInterests) // 선택된 관심사들을 tag 필드에 저장
      });

      // chatData 컬렉션에 각 관심사를 문서명으로 하는 문서들 생성
      for (const interest of selectedInterests) {
        await updateChatTopicInformation(userId, interest, []);
      }
      
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
              style={{ width: `${(4 / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        {/* 프로필 이미지 등록 컴포넌트 */}
        <ProfileImage 
          onImageSelect={handleImageSelect}
          currentImage={selectedProfileImage ? URL.createObjectURL(selectedProfileImage) : undefined}
          onImageStatusChange={(hasImage) => {
            setHasProfileImage(hasImage);
          }}
        />
        
        {/* 완료 버튼 */}
        <button 
          onClick={handleComplete}
          className={`${styles.completeButton} ${!hasProfileImage ? styles.disabled : ''}`}
          disabled={isSaving || !hasProfileImage}
        >
          {isSaving ? '저장 중...' : !hasProfileImage ? '프로필 이미지를 등록해주세요' : '완료'}
        </button>
        
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
              onClick={handleComplete}
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
