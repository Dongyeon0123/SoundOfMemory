import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/testOnboarding.module.css';
import indexStyles from '../styles/styles.module.css'; // index 페이지 스타일 참조

export default function TestOnboarding() {
  const [step, setStep] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [cursorBlinkCount, setCursorBlinkCount] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [name, setName] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0); // 현재 줄 인덱스
  const [showLines, setShowLines] = useState<boolean[]>([]); // 각 줄 표시 상태
  const [currentTextPhase, setCurrentTextPhase] = useState<'first' | 'second' | 'complete'>('first'); // 현재 텍스트 단계
  const [showFirstContinueButton, setShowFirstContinueButton] = useState(false); // 첫 번째 다음 버튼
  const [showSecondContinueButton, setShowSecondContinueButton] = useState(false); // 두 번째 다음 버튼
  const [isTransitioning, setIsTransitioning] = useState(false); // 텍스트 전환 중 상태
  const [isTyping, setIsTyping] = useState(false); // 타이핑 중 상태 (애니메이션 중복 방지)
  const [lastNameLength, setLastNameLength] = useState(0); // 이전 이름 길이 (애니메이션 중복 방지)
  const router = useRouter();

  const firstText = "안녕하세요!\n저는 모리입니다!";
  const secondText = "당신에게 딱 맞는\nAI를 생성하기 위해\n몇 가지 궁금한 게 있어요!";

  // 각 줄을 개별적으로 표시하는 애니메이션
  useEffect(() => {
    if (step === 0) {
      // 상태 초기화
      setCurrentTextPhase('first');
      setCurrentLineIndex(0);
      setCursorBlinkCount(0);
      setShowLines([]);
      setIsTransitioning(false);
      setShowFirstContinueButton(false);
      setShowSecondContinueButton(false);
      
      const timer = setTimeout(() => setShowTyping(true), 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
        }, 800); // 각 줄마다 800ms 후에 나타남
        
        return () => clearTimeout(timer);
      } else {
        // 모든 줄이 나타난 후 잠시 대기
        if (cursorBlinkCount < 3) {
          const timer = setTimeout(() => {
            setCursorBlinkCount(prev => prev + 1);
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          // 첫 번째 텍스트가 완료되면 자동으로 두 번째 텍스트로 전환
          console.log('첫 번째 텍스트 완료, 두 번째 텍스트로 전환 시작');
          setIsTransitioning(true);
          
          // 안전장치: 1초 후에도 전환이 안 되면 강제로 전환
          const transitionTimer = setTimeout(() => {
            console.log('전환 타이머 실행');
            setCurrentTextPhase('second');
            setCurrentLineIndex(0);
            setCursorBlinkCount(0);
            setIsTransitioning(false);
          }, 1000);
          
          // 추가 안전장치: 3초 후에도 전환이 안 되면 강제로 전환
          const fallbackTimer = setTimeout(() => {
            console.log('폴백 타이머 실행 - 강제 전환');
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
      console.log('두 번째 텍스트 애니메이션 시작');
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
        // 모든 줄이 나타난 후 잠시 대기
        if (cursorBlinkCount < 3) {
          const timer = setTimeout(() => {
            setCursorBlinkCount(prev => prev + 1);
          }, 500);
          return () => clearTimeout(timer);
        } else {
          // 두 번째 다음 버튼 표시
          console.log('두 번째 텍스트 완료, 버튼 표시');
          setShowSecondContinueButton(true);
        }
      }
    }
  }, [currentTextPhase, currentLineIndex, secondText, cursorBlinkCount, firstText, isTransitioning]);

  // 이름 입력 완료 핸들러
  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep(2); // AI 아바타 이름 입력 단계로 이동
    }
  };

  // AI 아바타 이름 입력 완료 핸들러
  const handleAvatarNameSubmit = () => {
    if (name.trim()) { // 이름 입력 후 아바타 이름 입력
      setStep(3); // 완료 단계로 이동
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.push('/');
    }
  };

  // 첫 번째 다음 버튼 클릭 핸들러
  const handleFirstContinue = () => {
    setIsTransitioning(true);
    setShowFirstContinueButton(false);
    
    // 부드러운 페이드 아웃 애니메이션
    setTimeout(() => {
      setCurrentTextPhase('second');
      setCurrentLineIndex(0);
      setCursorBlinkCount(0);
      setIsTransitioning(false);
    }, 800); // 페이드 아웃 시간을 800ms로 증가
  };

  // 두 번째 다음 버튼 클릭 핸들러
  const handleSecondContinue = () => {
    setStep(1); // 이름 입력 단계로 이동
  };

  return (
    <div className={indexStyles.fullContainer}>
      <div className={`${indexStyles.centerCard} ${indexStyles.cardMode}`}>
        {step === 0 ? (
          // 첫 번째 단계: 인사말 + 계속하기
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
        ) : step === 1 ? (
          // 두 번째 단계: 이름 입력
          <div className={styles.nameInputContent}>
            {/* 헤더 - 뒤로가기 버튼과 진행상황 바 */}
            <div className={styles.header}>
              <button 
                onClick={handleBack} 
                className={styles.backButton}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className={styles.progressBar}>
                <div className={styles.progressContainer}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(1 / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 메인 콘텐츠 */}
            <div className={styles.content}>
              {/* mori.png 이미지 */}
              <img 
                src="/mori.png" 
                alt="모리" 
                className={`${styles.moriImage} ${name.trim() ? styles.filled : ''}`}
                style={{
                  // 타이핑 중일 때만 애니메이션 실행
                  transition: isTyping ? 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
                }}
              />
              
              {/* 제목과 부제목 */}
              <h1 className={styles.title}>이름을 알려주세요!</h1>
              
              {/* 이름 입력 폼 */}
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    const newValue = e.target.value;
                    setName(newValue);
                    
                    // 타이핑 중일 때만 애니메이션 실행 (중복 방지)
                    if (!isTyping) {
                      setIsTyping(true);
                      setTimeout(() => setIsTyping(false), 100); // 100ms 후 타이핑 상태 해제
                    }
                  }}
                  placeholder="내 이름 입력하기"
                  className={styles.input}
                  maxLength={20}
                  autoFocus
                />
                {name && (
                  <button 
                    className={styles.clearButton}
                    onClick={() => setName('')}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <p className={styles.subtitle}>신뢰할 수 있는 커뮤니티를 만들어가요</p>
              
              {/* 다음 버튼 */}
              <button 
                className={styles.nextButton}
                onClick={handleNameSubmit}
                disabled={!name.trim()}
              >
                다음
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          // 세 번째 단계: AI 아바타 이름 입력
          <div className={styles.nameInputContent}>
            {/* 헤더 - 뒤로가기 버튼과 진행상황 바 */}
            <div className={styles.header}>
              <button 
                onClick={handleBack} 
                className={styles.backButton}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className={styles.progressBar}>
                <div className={styles.progressContainer}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(3 / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 메인 콘텐츠 */}
            <div className={styles.content}>
              {/* mori.png 이미지 */}
              <img 
                src="/mori.png" 
                alt="모리" 
                className={`${styles.moriImage} ${name.trim() ? styles.filled : ''}`}
                style={{
                  // 타이핑 중일 때만 애니메이션 실행
                  transition: isTyping ? 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
                }}
              />
              
              {/* 제목과 부제목 */}
              <h1 className={styles.title}>저의 이름을 지어주세요!</h1>
              
              {/* AI 아바타 이름 입력 폼 */}
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    const newValue = e.target.value;
                    setName(newValue);
                    
                    // 타이핑 중일 때만 애니메이션 실행 (중복 방지)
                    if (!isTyping) {
                      setIsTyping(true);
                      setTimeout(() => setIsTyping(false), 100); // 100ms 후 타이핑 상태 해제
                    }
                  }}
                  placeholder="AI 아바타 이름 입력하기"
                  className={styles.input}
                  maxLength={20}
                  autoFocus
                />
                {name && (
                  <button 
                    className={styles.clearButton}
                    onClick={() => setName('')}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <p className={styles.subtitle}>다른 사람과 소통할 AI의 이름이에요.</p>
              
              {/* 다음 버튼 */}
              <button 
                className={styles.nextButton}
                onClick={handleAvatarNameSubmit}
                disabled={!name.trim()}
              >
                다음
              </button>
            </div>
          </div>
        ) : (
          // 네 번째 단계: 완료 메시지
          <div className={styles.completionContent}>
            <h1 className={styles.title}>완료되었습니다!</h1>
            <p className={styles.subtitle}>사용자 이름: {name}</p>
            <p className={styles.subtitle}>AI 아바타 이름: {name}</p> {/* 아바타 이름은 이름과 동일 */}
          </div>
        )}
      </div>
    </div>
  );
}