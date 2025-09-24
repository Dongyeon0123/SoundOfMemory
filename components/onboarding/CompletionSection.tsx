import React, { useState, useEffect } from 'react';
import styles from '../../styles/onboarding/completionSection.module.css';
import ProfileImage from './ProfileImage';

interface CompletionSectionProps {
  userName: string;
  avatarName: string;
  selectedInterests: Set<string>;
  onNext: () => void;
  onImageSelect: (file: File) => void;
}

export default function CompletionSection({ userName, avatarName, selectedInterests, onNext, onImageSelect }: CompletionSectionProps) {
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [hasProfileImage, setHasProfileImage] = useState(false);

  // 디버깅: props 확인
  useEffect(() => {
    console.log('CompletionSection props:', { userName, avatarName, selectedInterests, onNext });
    console.log('onNext type:', typeof onNext);
    console.log('onNext function:', onNext);
  }, [userName, avatarName, selectedInterests, onNext]);

  const handleImageSelect = (file: File) => {
    setSelectedProfileImage(file);
    setHasProfileImage(true);
    // 상위 컴포넌트로 이미지 선택 전달
    onImageSelect(file);
  };

  const handleComplete = () => {
    // 프로필 이미지가 선택되었는지만 확인하고 바로 다음 단계로 이동
    if (hasProfileImage) {
      console.log('handleComplete called, onNext:', onNext);
      if (typeof onNext === 'function') {
        onNext();
      } else {
        console.error('onNext is not a function:', onNext);
      }
    }
  };

  return (
    <div className={styles.completionContent}>
      {/* 헤더 - 진행상황 바 */}
      <div className={styles.header}>
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
          disabled={!hasProfileImage}
        >
          {!hasProfileImage ? '프로필 이미지를 등록해주세요' : '완료'}
        </button>
      </div>
    </div>
  );
}
