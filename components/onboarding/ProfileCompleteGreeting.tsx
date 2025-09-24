import React, { useState, useEffect } from 'react';
import styles from '../../styles/onboarding/greetingSection.module.css';

interface ProfileCompleteGreetingProps {
  onContinue: () => void;
}

export default function ProfileCompleteGreeting({ onContinue }: ProfileCompleteGreetingProps) {
  const [showTyping, setShowTyping] = useState(false);
  const [cursorBlinkCount, setCursorBlinkCount] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showLines, setShowLines] = useState<boolean[]>([]);
  const [currentTextPhase, setCurrentTextPhase] = useState<'first' | 'second' | 'complete'>('first');
  const [showFirstContinueButton, setShowFirstContinueButton] = useState(false);
  const [showSecondContinueButton, setShowSecondContinueButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const firstText = "좋아요!\n프로필 정보 입력이 끝났어요!";
  const secondText = "당신에게 딱 맞는\nAI를 생성하기 위해\n몇 가지 궁금한 게 있어요!";

  // 첫 번째 텍스트 애니메이션 - 한 줄씩 표시
  useEffect(() => {
    if (showTyping && currentTextPhase === 'first') {
      const lines = firstText.split('\n');
      
      if (currentLineIndex < lines.length) {
        const timer = setTimeout(() => {
          setShowLines(prev => {
            const newShowLines = [...prev];
            newShowLines[currentLineIndex] = true;
            return newShowLines;
          });
          setCurrentLineIndex(prev => prev + 1);
        }, 800);
        
        return () => clearTimeout(timer);
      } else {
        if (cursorBlinkCount < 3) {
          const timer = setTimeout(() => {
            setCursorBlinkCount(prev => prev + 1);
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          setIsTransitioning(true);
          
          const transitionTimer = setTimeout(() => {
            setCurrentTextPhase('second');
            setCurrentLineIndex(0);
            setCursorBlinkCount(0);
            setIsTransitioning(false);
          }, 1000);
          
          const fallbackTimer = setTimeout(() => {
            setCurrentTextPhase('second');
            setCurrentLineIndex(0);
            setCursorBlinkCount(0);
            setIsTransitioning(false);
          }, 3000);
          
          return () => {
            clearTimeout(transitionTimer);
            clearTimeout(fallbackTimer);
          };
        }
      }
    }
  }, [showTyping, currentLineIndex, firstText, cursorBlinkCount, currentTextPhase]);

  // 두 번째 텍스트 애니메이션 - 한 줄씩 표시
  useEffect(() => {
    if (currentTextPhase === 'second' && !isTransitioning) {
      const lines = secondText.split('\n');
      
      if (currentLineIndex < lines.length) {
        const timer = setTimeout(() => {
          setShowLines(prev => {
            const newShowLines = [...prev];
            newShowLines[currentLineIndex + firstText.split('\n').length] = true;
            return newShowLines;
          });
          setCurrentLineIndex(prev => prev + 1);
        }, 800);
        
        return () => clearTimeout(timer);
      } else {
        // 두 번째 텍스트가 모두 표시된 후 바로 버튼 표시
        console.log('두 번째 텍스트 완료, 버튼 표시');
        setShowSecondContinueButton(true);
      }
    }
  }, [currentTextPhase, currentLineIndex, secondText, firstText, isTransitioning]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 디버깅: 상태 확인
  useEffect(() => {
    console.log('ProfileCompleteGreeting 상태:', {
      currentTextPhase,
      currentLineIndex,
      showSecondContinueButton,
      showTyping
    });
  }, [currentTextPhase, currentLineIndex, showSecondContinueButton, showTyping]);

  const handleFirstContinue = () => {
    setIsTransitioning(true);
    setShowFirstContinueButton(false);
    
    // 첫 번째 텍스트가 부드럽게 사라진 후 두 번째 텍스트로 전환
    setTimeout(() => {
      setCurrentTextPhase('second');
      setCurrentLineIndex(0);
      setCursorBlinkCount(0);
      setIsTransitioning(false);
    }, 1000);
  };

  const handleSecondContinue = () => {
    console.log('시작하기 버튼 클릭됨, onContinue 호출');
    onContinue();
  };

  return (
    <div className={styles.onboardingContent}>
      
      {/* 모리 이미지 */}
      <img 
        src="/WhiteMori.png" 
        alt="모리" 
        className={styles.character}
      />
      
      {/* 첫 번째 인사말 */}
      {showTyping && currentTextPhase === 'first' && (
        <div className={styles.greeting}>
          <div className={`${styles.greetingText} ${isTransitioning ? styles.transitioning : ''}`}>
            {firstText.split('\n').map((line, index) => (
              <div 
                key={index} 
                className={`${styles.greetingLine} ${showLines[index] ? styles.visible : ''}`}
              >
                {showLines[index] ? line : ''}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 두 번째 인사말 */}
      {currentTextPhase === 'second' && (
        <div className={styles.greetingSecond}>
          <div className={`${styles.greetingText} ${!isTransitioning ? styles.fadeIn : ''}`}>
            {secondText.split('\n').map((line, index) => (
              <div 
                key={`second-${index}`} 
                className={`${styles.greetingLine} ${showLines[index + firstText.split('\n').length] ? styles.visible : ''}`}
              >
                {showLines[index + firstText.split('\n').length] ? line : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {showFirstContinueButton && (
        <button 
          onClick={handleFirstContinue}
          className={styles.continueButton}
        >
          계속하기
        </button>
      )}

      {showSecondContinueButton && (
        <button 
          onClick={handleSecondContinue}
          className={styles.continueButton}
        >
          시작하기
        </button>
      )}
    </div>
  );
}
