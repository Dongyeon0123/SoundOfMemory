import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/chat.module.css';
import indexStyles from '../styles/styles.module.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function TestChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 메시지 설정
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      text: '안녕하세요! 저는 모리입니다. 사용자님에 대해 더 자세히 알아보고 싶어요. 몇 가지 질문을 드릴게요.',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI 응답 시뮬레이션
  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // 타이핑 효과를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let aiResponse = '';
    let shouldIncrementStep = false;
    
    // 사용자 입력에 따른 AI 응답 로직
    if (userMessage.toLowerCase().includes('이름') || userMessage.toLowerCase().includes('name')) {
      aiResponse = '좋아요! 그럼 다음 질문이에요. 평소 어떤 취미나 관심사가 있나요?';
      shouldIncrementStep = true;
    } else if (userMessage.toLowerCase().includes('취미') || userMessage.toLowerCase().includes('관심사') || userMessage.toLowerCase().includes('hobby')) {
      aiResponse = '흥미롭네요! 그럼 마지막으로, 앞으로 어떤 목표나 계획이 있나요?';
      shouldIncrementStep = true;
    } else if (userMessage.toLowerCase().includes('목표') || userMessage.toLowerCase().includes('계획') || userMessage.toLowerCase().includes('goal')) {
      aiResponse = '완벽해요! 이제 사용자님에 대해 충분히 알게 되었어요. 온보딩이 완료되었습니다! 🎉';
      shouldIncrementStep = true;
    } else {
      aiResponse = '흥미로운 답변이에요! 그럼 다음 질문으로 넘어갈게요. 평소 어떤 음악을 좋아하나요?';
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // 단계 진행
    if (shouldIncrementStep && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
    
    setIsTyping(false);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // AI 응답 시뮬레이션
    await simulateAIResponse(inputValue);
  };

  return (
    <div className={indexStyles.fullContainer}>
      <div className={indexStyles.centerCard}>
        {/* 헤더 */}
        <div className={styles.header}>
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => window.history.back()}
            style={{
              position: 'absolute',
              left: 10,
              top: '43%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: 40,
              width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="뒤로가기"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 진행상황 바 */}
          <div className={styles.progressBar}>
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 프로필 섹션 */}
        <div className={styles.profileSection}>
          <img src="/mori.png" alt="모리" />
          <div className={styles.profileInfo}>
            <div className={styles.name}>모리</div>
            <div className={styles.status}>AI와 대화중이에요</div>
          </div>
        </div>
        
        {/* 구분선 */}
        <div className={styles.divider}></div>
        
        {/* 메시지 영역 */}
        <div className={styles.messageSection}>
          {messages.map((message) => {
            const isAI = !message.isUser;
            const msgTypeClass = isAI ? styles.bot : styles.user;
            return (
              <div key={message.id} className={`${styles.msgWrapper} ${msgTypeClass}`}>
                <div className={styles.name}>
                  {isAI ? "모리" : "You"}
                </div>
                <div className={styles.bubble}>
                  {message.text}
                </div>
              </div>
            );
          })}
          
          {/* 타이핑 표시 */}
          {isTyping && (
            <div className={styles.typingIndicator}>
              <div className={styles.wave}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 입력 영역 */}
        <div className={styles.inputSection}>
          <textarea
            className={styles.textarea}
            value={inputValue}
            placeholder="메시지를 입력하세요."
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={1}
            maxLength={500}
            disabled={isTyping}
          />
          <button
            className={styles.button}
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isTyping}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L2 9L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
