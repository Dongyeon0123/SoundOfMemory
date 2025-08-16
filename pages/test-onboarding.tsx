import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/testOnboarding.module.css';
import indexStyles from '../styles/styles.module.css';
import GreetingSection from '../components/onboarding/GreetingSection';
import NameInputSection from '../components/onboarding/NameInputSection';
import InterestsSection from '../components/onboarding/InterestsSection';
import CompletionSection from '../components/onboarding/CompletionSection';

export default function TestOnboarding() {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const router = useRouter();

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.push('/');
    }
  };

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

  return (
    <div className={indexStyles.fullContainer}>
      <div className={`${indexStyles.centerCard} ${indexStyles.cardMode}`}>
        {step === 0 && (
          <GreetingSection 
            onContinue={handleGreetingComplete}
            onBack={handleBack}
          />
        )}
        
        {step === 1 && (
          <NameInputSection
            onContinue={handleUserNameComplete}
            onBack={handleBack}
            step={2}
            title="이름을 알려주세요!"
            subtitle="신뢰할 수 있는 커뮤니티를 만들어가요"
            placeholder="내 이름 입력하기"
          />
        )}
        
        {step === 2 && (
          <NameInputSection
            onContinue={handleAvatarNameComplete}
            onBack={handleBack}
            step={3}
            title="저의 이름을 지어주세요!"
            subtitle="다른 사람과 소통할 AI의 이름이에요."
            placeholder="AI 아바타 이름 입력하기"
          />
        )}
        
        {step === 3 && (
          <InterestsSection
            onContinue={handleInterestsComplete}
            onBack={handleBack}
          />
        )}
        
        {step === 4 && (
          <CompletionSection
            userName={userName}
            avatarName={avatarName}
          />
        )}
      </div>
    </div>
  );
}