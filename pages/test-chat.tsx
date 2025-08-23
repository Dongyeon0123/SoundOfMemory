import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import styles from '../styles/onboarding/testChat.module.css';
import indexStyles from '../styles/styles.module.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  type: 'subjective' | 'objective';
  question: string;
  options?: QuestionOption[];
}

export default function TestChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(12);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 질문 목록
  const questions: Question[] = [
    {
      type: "subjective",
      question: "요즘 가장 흥미를 느끼거나 많은 시간을 쏟고 있는 분야가 뭔가요?"
    },
    {
      type: "objective",
      question: "새로운 사람을 만나는 자리가 에너지를 채워주나요?",
      options: [
        {"id": "a", "text": "에너지를 얻는다"},
        {"id": "b", "text": "피곤하다"}
      ]
    },
    {
      type: "subjective",
      question: "평소 어떤 취미나 관심사가 있나요?"
    },
    {
      type: "objective",
      question: "어떤 음악을 좋아하나요?",
      options: [
        {"id": "a", "text": "팝/록"},
        {"id": "b", "text": "클래식/재즈"},
        {"id": "c", "text": "힙합/R&B"},
        {"id": "d", "text": "K-pop"}
      ]
    },
    {
      type: "subjective",
      question: "좋아하는 영화나 드라마 장르가 있나요?"
    },
    {
      type: "objective",
      question: "여행을 좋아하나요?",
      options: [
        {"id": "a", "text": "매우 좋아한다"},
        {"id": "b", "text": "좋아한다"},
        {"id": "c", "text": "보통이다"},
        {"id": "d", "text": "별로다"}
      ]
    },
    {
      type: "subjective",
      question: "어떤 책을 주로 읽나요?"
    },
    {
      type: "objective",
      question: "운동이나 스포츠를 좋아하나요?",
      options: [
        {"id": "a", "text": "매우 좋아한다"},
        {"id": "b", "text": "좋아한다"},
        {"id": "c", "text": "보통이다"},
        {"id": "d", "text": "별로다"}
      ]
    },
    {
      type: "subjective",
      question: "어떤 사람과 대화하는 것을 즐기나요?"
    },
    {
      type: "objective",
      question: "앞으로 이루고 싶은 목표가 있나요?",
      options: [
        {"id": "a", "text": "구체적인 목표가 있다"},
        {"id": "b", "text": "대략적인 계획이 있다"},
        {"id": "c", "text": "아직 모르겠다"}
      ]
    },
    {
      type: "subjective",
      question: "스트레스를 받을 때 어떻게 해소하나요?"
    },
    {
      type: "subjective",
      question: "자신을 한 문장으로 표현한다면?"
    }
  ];

  // 초기 메시지 설정
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      text: '안녕하세요! 저는 모리입니다. 사용자님에 대해 더 자세히 알아보고 싶어요. 몇 가지 질문을 드릴게요.',
      isUser: false,
      timestamp: new Date()
    };
    
    const firstQuestion: Message = {
      id: '2',
      text: questions[0].question,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([initialMessage, firstQuestion]);
    setCurrentQuestion(questions[0]);
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 사용자 입력 감지
  useEffect(() => {
    if (inputValue.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [inputValue]);

  // 객관식 옵션 선택 처리
  const handleOptionSelect = async (option: QuestionOption) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option.text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // AI 응답 시뮬레이션
    await simulateAIResponse(option.text);
  };

  // AI 응답 시뮬레이션
  const simulateAIResponse = async (userMessage: string) => {
    setIsAIResponding(true);
    setIsTyping(true);
    
    // 타이핑 효과를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let aiResponse = '';
    let shouldIncrementStep = false;
    
    // 현재 단계에 따른 응답
    if (currentStep < questions.length) {
      aiResponse = questions[currentStep].question;
      shouldIncrementStep = true;
    } else {
      aiResponse = '완벽해요! 이제 사용자님에 대해 충분히 알게 되었어요. 온보딩이 완료되었습니다! 🎉';
      shouldIncrementStep = true;
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
      setCurrentQuestion(questions[currentStep]);
    }
    
    setIsTyping(false);
    setIsAIResponding(false);
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

  // 현재 질문이 객관식인지 확인
  const isCurrentQuestionObjective = currentQuestion?.type === 'objective';

  return (
    <div className={indexStyles.fullContainer}>
      <div className={indexStyles.centerCard}>
        {/* 헤더 */}
        <div className={styles.header}>
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
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
          
          {/* 객관식 옵션 표시 */}
          {currentQuestion?.type === 'objective' && currentQuestion.options && (
            <div className={styles.optionsContainer}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  className={styles.optionButton}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAIResponding}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
          
          {/* 타이핑 표시 (사용자 쪽에 표시) */}
          {isTyping && (
            <div className={`${styles.msgWrapper} ${styles.user}`}>
              <div className={styles.name}>You</div>
              <div className={styles.typingIndicator}>
                <div className={styles.wave}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 제목 */}
        <div className={styles.chatTitle}>
          기본 정체성을 확인해요 ({currentStep}/{totalSteps})
        </div>
        
        {/* 입력 영역 (주관식일 때만 표시) */}
        {currentQuestion?.type === 'subjective' && (
          <div className={styles.inputSection}>
            <textarea
              className={styles.textarea}
              value={inputValue}
              placeholder="구체적으로 작성할수록 성격이 정확해져요."
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              maxLength={500}
              disabled={isAIResponding}
            />
            <button
              className={styles.button}
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isAIResponding}
              type="button"
              style={{
                borderRadius: '50%',
                transition: 'all 0.2s ease',
              }}
            >
              <FiSend className="icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
