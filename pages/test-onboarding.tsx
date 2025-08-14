import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/testOnboarding.module.css';
import globalStyles from '../styles/styles.module.css';

export default function TestOnboarding() {
  const [step, setStep] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorBlinkCount, setCursorBlinkCount] = useState(0);
  const [showSecondText, setShowSecondText] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showThirdText, setShowThirdText] = useState(false);
  const router = useRouter();

  const firstText = "안녕하세요!\n저는 모리입니다!";
  const secondText = "당신에게 딱 맞는\nAI를 생성하기 위해\n몇 가지 궁금한 게 있어요!";
  const thirdText = "간단한 질문에 답해주시면\n맞춤형 AI를 만들어드릴게요!";

  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setShowTyping(true), 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 첫 번째 텍스트 애니메이션
  useEffect(() => {
    if (showTyping && currentIndex < firstText.length) {
      const timer = setTimeout(() => {
        setDisplayText(firstText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else if (showTyping && currentIndex >= firstText.length) {
      // 첫 번째 텍스트 완성 후 잠시 대기
      if (cursorBlinkCount < 3) {
        const timer = setTimeout(() => {
          setCursorBlinkCount(cursorBlinkCount + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // 잠시 대기 후 두 번째 텍스트 시작
        setShowSecondText(true);
        setCurrentIndex(0);
        setCursorBlinkCount(0);
      }
    }
  }, [showTyping, currentIndex, firstText, cursorBlinkCount]);

  // 두 번째 텍스트 애니메이션
  useEffect(() => {
    if (showSecondText && currentIndex < secondText.length) {
      const timer = setTimeout(() => {
        setDisplayText(secondText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else if (showSecondText && currentIndex >= secondText.length) {
      // 두 번째 텍스트 완성 후 잠시 대기
      if (cursorBlinkCount < 3) {
        const timer = setTimeout(() => {
          setCursorBlinkCount(cursorBlinkCount + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // 잠시 대기 후 계속하기 버튼 표시
        setShowContinueButton(true);
      }
    }
  }, [showSecondText, currentIndex, secondText, cursorBlinkCount]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.push('/');
    }
  };

  // 계속하기 버튼 클릭 핸들러
  const handleContinue = () => {
    setShowThirdText(true);
    setCurrentIndex(0);
    setCursorBlinkCount(0);
    setShowContinueButton(false);
  };

  // 각 줄을 개별적으로 애니메이션
  const renderAnimatedText = (text: string, lineIndex: number) => {
    const lines = text.split('\n');
    if (lineIndex >= lines.length) return '';
    
    const currentLine = lines[lineIndex];
    const totalCharsBefore = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);
    const charsInCurrentLine = Math.max(0, currentIndex - totalCharsBefore);
    
    if (charsInCurrentLine <= 0) return '';
    
    return currentLine.slice(0, charsInCurrentLine);
  };

  // 현재 표시할 텍스트 결정
  const getCurrentText = () => {
    if (showThirdText) {
      return thirdText;
    } else if (showSecondText) {
      return secondText;
    }
    return firstText;
  };

  return (
    <div className={globalStyles.fullContainer}>
      <div className={globalStyles.centerCard}>
        <div className={styles.onboardingContent}>
          {/* 뒤로가기 버튼 */}
          <button 
            onClick={handleBack} 
            className={styles.backButton}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 모리 이미지 */}
          <img 
            src="/WhiteMori.png" 
            alt="모리" 
            className={styles.character}
          />
          
          {/* 인사말 */}
          <div className={styles.greeting}>
            {showTyping && (
              <div className={styles.greetingText}>
                {getCurrentText().split('\n').map((line, index) => (
                  <div key={index} className={styles.greetingLine}>
                    {renderAnimatedText(getCurrentText(), index)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 계속하기 버튼 */}
          {showContinueButton && (
            <button 
              onClick={handleContinue}
              className={styles.continueButton}
            >
              계속하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
