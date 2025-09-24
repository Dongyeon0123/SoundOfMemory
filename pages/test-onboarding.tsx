import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from '../styles/testOnboarding.module.css';
import indexStyles from '../styles/styles.module.css';
import GreetingSection from '../components/onboarding/GreetingSection';
import NameInputSection from '../components/onboarding/NameInputSection';
import InterestsSection from '../components/onboarding/InterestsSection';
import CompletionSection from '../components/onboarding/CompletionSection';
import ProfileCompleteGreeting from '../components/onboarding/ProfileCompleteGreeting';
import FinalGreeting from '../components/onboarding/FinalGreeting';

export default function TestOnboarding() {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 인증 상태 확인 및 보호
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/register/login');
        return;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 디버깅: step 상태 확인
  useEffect(() => {
    console.log('Step 변경됨:', step);
  }, [step]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading) {
    return (
      <div className={indexStyles.fullContainer}>
        <div className={`${indexStyles.centerCard} ${indexStyles.cardMode}`}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }


  // 첫 번째 단계 완료 (인사말)
  const handleGreetingComplete = () => {
    setStep(1);
  };

  // 두 번째 단계 완료 (사용자 이름 입력)
  const handleUserNameComplete = (name: string) => {
    setUserName(name);
    setStep(2);
  };

  // 세 번째 단계 완료 (AI 아바타 이름 입력)
  const handleAvatarNameComplete = (name: string) => {
    setAvatarName(name);
    setStep(3);
  };

  // 네 번째 단계 완료 (관심사 선택)
  const handleInterestsComplete = (interests: Set<string>) => {
    setSelectedInterests(interests);
    setStep(4);
  };

  // 프로필 이미지 선택 핸들러
  const handleProfileImageSelect = (file: File) => {
    setSelectedProfileImage(file);
  };

  // 다섯 번째 단계 완료 (프로필 완료 축하)
  const handleProfileCompleteGreeting = () => {
    console.log('handleProfileCompleteGreeting 호출됨, 현재 step:', step);
    console.log('Step 6으로 이동 시도');
    setStep(6);
    console.log('setStep(6) 호출 완료');
  };

  // 최종 단계 완료 (최종 greeting 및 데이터 저장)
  const handleFinalGreetingComplete = () => {
    // 온보딩 완료 후 test-chat으로 이동
    router.push('/test-chat');
  };

  return (
    <div className={indexStyles.fullContainer}>
      <div className={`${indexStyles.centerCard} ${indexStyles.cardMode}`}>
        {step === 0 && (
          <GreetingSection 
            onContinue={handleGreetingComplete}
          />
        )}
        
        {step === 1 && (
          <NameInputSection
            onContinue={handleUserNameComplete}
            step={1}
            title="이름을 알려주세요!"
            subtitle="신뢰할 수 있는 커뮤니티를 만들어가요"
            placeholder="내 이름 입력하기"
          />
        )}
        
        {step === 2 && (
          <NameInputSection
            onContinue={handleAvatarNameComplete}
            step={2}
            title="저의 이름을 지어주세요!"
            subtitle="다른 사람과 소통할 AI의 이름이에요."
            placeholder="AI 아바타 이름 입력하기"
          />
        )}
        
        {step === 3 && (
          <InterestsSection
            onContinue={handleInterestsComplete}
          />
        )}
        
        {step === 4 && (
          <CompletionSection
            userName={userName}
            avatarName={avatarName}
            selectedInterests={selectedInterests}
            onNext={() => setStep(5)}
            onImageSelect={handleProfileImageSelect}
          />
        )}

        {step === 5 && (
          <ProfileCompleteGreeting 
            onContinue={handleProfileCompleteGreeting}
          />
        )}

        {step === 6 && (
          <FinalGreeting 
            onComplete={handleFinalGreetingComplete}
            userName={userName}
            avatarName={avatarName}
            selectedInterests={selectedInterests}
            selectedProfileImage={selectedProfileImage}
          />
        )}
      </div>
    </div>
  );
}