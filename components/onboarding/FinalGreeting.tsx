import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { setProfileField, updateChatTopicInformation } from '../../types/profiles';
import { uploadProfileImage } from '../../client/uploadProfileImage';
import styles from '../../styles/onboarding/greetingSection.module.css';

interface FinalGreetingProps {
  onComplete: () => void;
  onBack: () => void;
  userName: string;
  avatarName: string;
  selectedInterests: Set<string>;
  selectedProfileImage: File | null;
}

export default function FinalGreeting({ 
  onComplete, 
  onBack, 
  userName, 
  avatarName, 
  selectedInterests, 
  selectedProfileImage 
}: FinalGreetingProps) {
  const [showTyping, setShowTyping] = useState(false);
  const [currentTextPhase, setCurrentTextPhase] = useState<'first' | 'second' | 'complete'>('first');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [userId, setUserId] = useState<string | null>(null);

  // 현재 로그인된 사용자 ID 가져오기
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 첫 번째 텍스트가 완전히 표시된 후 자동으로 저장 시작
  useEffect(() => {
    if (showTyping) {
      const timer = setTimeout(() => {
        // 3초 후 자동으로 저장 시작
        handleSaveData();
      }, 3000); // 3초 후 자동 전환
      
      return () => clearTimeout(timer);
    }
  }, [showTyping]);

  // 데이터 저장 함수
  const handleSaveData = async () => {
    if (!userId) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      let profileImageUrl = '/char.png'; // 기본 이미지

      // 프로필 이미지가 선택된 경우 Firebase Storage에 업로드
      if (selectedProfileImage) {
        try {
          // 파일 확장자 확인
          const fileExtension = selectedProfileImage.name.split('.').pop()?.toLowerCase();
          if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
            throw new Error('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.');
          }

          // 파일 크기 확인 (5MB 제한)
          if (selectedProfileImage.size > 5 * 1024 * 1024) {
            throw new Error('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.');
          }

          // Firebase Storage에 이미지 업로드
          profileImageUrl = await uploadProfileImage(selectedProfileImage);
          console.log('프로필 이미지 업로드 완료:', profileImageUrl);
        } catch (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          throw new Error(`이미지 업로드 실패: ${(uploadError as any).message}`);
        }
      }

      // 로그인된 사용자의 ID를 사용하여 프로필 정보 저장
      await setProfileField(userId, {
        name: userName,
        aiName: avatarName, // AI 아바타 이름 저장
        aiIntro: `안녕 나는 ${userName}의 개인 AI비서야. 궁금한거 있으면 물어봐!`,
        img: profileImageUrl, // 업로드된 이미지 URL 또는 기본 이미지
        backgroundImg: '/background.png', // 기본 배경 이미지
        tag: Array.from(selectedInterests) // 선택된 관심사들을 tag 필드에 저장
      });

      // chatData 컬렉션에 각 관심사를 문서명으로 하는 문서들 생성
      for (const interest of selectedInterests) {
        await updateChatTopicInformation(userId, interest, []);
      }

      // 저장 완료 후 바로 홈으로 이동
      setSaveStatus('success');
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('데이터 저장 실패:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const firstText = "전세계 AI 프로필들과\n대화를 시작해봐요!";
  const secondText = "필요한 서류 준비 중...";

  return (
    <div className={styles.onboardingContent}>
      {/* 뒤로가기 버튼 */}
      <button 
        onClick={onBack} 
        className={styles.backButton}
        disabled={isSaving}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* twoMori.png 이미지 - 더 크게 하고 위로 올림 */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 1
      }}>
        <img 
          src="/twoMori.png" 
          alt="Two Mori" 
          style={{
            width: '280px',
            height: '280px',
            objectFit: 'contain',
            animation: 'fadeIn 1s ease-out 0.5s both'
          }}
        />
      </div>
      
      {/* 첫 번째 메시지 - twoMori 아래에 표시 (사라지지 않음) */}
      {showTyping && (
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: 'white',
          fontFamily: 'S-Core Dream, sans-serif',
          animation: 'slideInUp 0.8s ease-out 1s both'
        }}>
          <div style={{
            fontSize: '19px',
            fontWeight: '600',
            lineHeight: '1.4',
          }}>
            {firstText.split('\n').map((line, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 두 번째 메시지 - 처음부터 표시되며 애니메이션 추가 */}
      {showTyping && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: 'white',
          fontFamily: 'S-Core Dream, sans-serif',
          animation: 'fadeIn 0.8s ease-out 1.5s both'
        }}>
          <div style={{
            fontSize: '17px',
            fontWeight: '500',
            lineHeight: '1.4',
          }}>
            {secondText}
          </div>
        </div>
      )}
    </div>
  );
}
