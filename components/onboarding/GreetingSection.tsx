import React, { useState, useEffect } from 'react';
import styles from '../../styles/onboarding/greetingSection.module.css';

interface GreetingSectionProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function GreetingSection({ onContinue, onBack }: GreetingSectionProps) {
  const [showTyping, setShowTyping] = useState(false);
  const [cursorBlinkCount, setCursorBlinkCount] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showLines, setShowLines] = useState<boolean[]>([]);
  const [currentTextPhase, setCurrentTextPhase] = useState<'first' | 'second' | 'complete'>('first');
  const [showFirstContinueButton, setShowFirstContinueButton] = useState(false);
  const [showSecondContinueButton, setShowSecondContinueButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const firstText = "안녕하세요!\n저는 모리입니다!";
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
        if (cursorBlinkCount < 3) {
          const timer = setTimeout(() => {
            setCursorBlinkCount(prev => prev + 1);
          }, 500);
          return () => clearTimeout(timer);
        } else {
          setShowSecondContinueButton(true);
        }
      }
    }
  }, [currentTextPhase, currentLineIndex, secondText, cursorBlinkCount, firstText, isTransitioning]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFirstContinue = () => {
    setIsTransitioning(true);
    setShowFirstContinueButton(false);
    
    setTimeout(() => {
      setCurrentTextPhase('second');
      setCurrentLineIndex(0);
      setCursorBlinkCount(0);
      setIsTransitioning(false);
    }, 800);
  };

  const handleSecondContinue = () => {
    onContinue();
  };

  return (
    <div className={styles.onboardingContent}>
      {/* 뒤로가기 버튼 */}
      <button 
        onClick={onBack} 
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
      {currentTextPhase === 'second' && (
        <div className={styles.greetingSecond}>
          <div className={`${styles.greetingText} ${isTransitioning ? styles.fadeIn : ''}`}>
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

      {/* 첫 번째 다음 버튼 */}
      {showFirstContinueButton && (
        <button 
          onClick={handleFirstContinue}
          className={styles.continueButton}
        >
          계속하기
        </button>
      )}

      {/* 두 번째 다음 버튼 */}
      {showSecondContinueButton && (
        <button 
          onClick={handleSecondContinue}
          className={styles.continueButton}
        >
          계속하기
        </button>
      )}
    </div>
  );
}
