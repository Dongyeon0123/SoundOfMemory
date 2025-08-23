import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import { doc, getDoc, setDoc, collection, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../types/firebase';
import { getAuth } from 'firebase/auth';
import styles from '../styles/onboarding/testChat.module.css';
import indexStyles from '../styles/styles.module.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean; // 타이핑 애니메이션용
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
  const [totalSteps, setTotalSteps] = useState(0); // 동적으로 설정
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();

    // 사용자 답변을 Firebase에 저장
  const saveUserResponse = async (questionIndex: number, response: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('사용자가 로그인되어 있지 않습니다.');
        return;
      }

      console.log('현재 사용자:', user.uid);
      
      // 서브컬렉션 경로: users/{userId}/onboard/response
      const onboardDocRef = doc(db, 'users', user.uid, 'onboard', 'response');
      console.log('📁 저장하려는 경로:', onboardDocRef.path);
      
      // arrayUnion으로 배열에 순서대로 추가
      await setDoc(onboardDocRef, {
        answers: arrayUnion(response),
        lastUpdated: new Date()
      }, { merge: true });
      
      console.log('✅ 답변 저장 완료! 경로:', onboardDocRef.path);

                                                       // 마지막 질문(12번째)인 경우 chatData 업데이트
         if (questionIndex === 12) {
           try {
             // 선택된 관심사들을 tag로 저장
             const interests = response.split(', ').map(item => item.trim()).filter(item => item);
             
             if (interests.length > 0) {
               // 사용자 프로필에 tag로 저장
               const userProfileRef = doc(db, 'users', user.uid);
               await setDoc(userProfileRef, {
                 tag: interests,
                 lastUpdated: new Date()
               }, { merge: true });
               
               console.log('✅ 사용자 프로필에 tag 저장 완료:', interests);
               
               // 각 관심사를 chatData 컬렉션에 문서명으로 저장
               for (const interest of interests) {
                 const chatDataDocRef = doc(db, 'users', user.uid, 'chatData', interest);
                 await setDoc(chatDataDocRef, {
                   createdAt: new Date(),
                   lastUpdated: new Date()
                 }, { merge: true });
               }
               
               console.log('✅ chatData에 관심사들 저장 완료:', interests);
             }
           } catch (chatError) {
             console.error('chatData 업데이트 실패:', chatError);
           }
         }

      console.log(`답변 ${questionIndex} 저장 완료:`, response);
    } catch (error) {
      console.error(`답변 ${questionIndex} 저장 실패:`, error);
      console.error('에러 상세:', error.message);
      console.error('에러 코드:', error.code);
    }
  };

  // 타이핑 애니메이션 함수
  const typeMessage = async (text: string, messageId: string) => {
    const characters = text.split('');
    let currentText = '';
    
    for (let i = 0; i < characters.length; i++) {
      currentText += characters[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: currentText, isTyping: true }
          : msg
      ));
      
      // 문자 간 지연 (더 자연스러운 속도)
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // 타이핑 완료
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isTyping: false }
        : msg
    ));
    
    // 질문이 완료되면 옵션 표시 준비
    if (currentQuestion?.type === 'objective') {
      setIsQuestionReady(true);
    }
  };

  // Firebase에서 질문 불러오기
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const questionsArray: Question[] = [];
      
      // Firebase에서 질문 불러오기 (1-11번까지만)
      for (let i = 1; i <= 11; i++) {
        try {
          const questionDoc = await getDoc(doc(db, 'queryai', `question${i}`));
          
          if (questionDoc.exists()) {
            const questionData = questionDoc.data();
            
            questionsArray.push({
              type: questionData.type,
              question: questionData.question,
              options: questionData.option || questionData.options || []
            });
          } else {
            console.warn(`질문 ${i} 문서가 존재하지 않습니다.`);
          }
        } catch (error) {
          console.error(`질문 ${i} 로드 중 오류:`, error);
          continue;
        }
      }
      
             // 12번째 질문은 chatdata에서 관심사 불러오기
       try {
         const user = auth.currentUser;
         if (user) {
           console.log('🔍 사용자 ID:', user.uid);
           
           // chatData 컬렉션에서 모든 문서(관심사) 불러오기
           const chatDataRef = collection(db, 'users', user.uid, 'chatData');
           const snapshot = await getDocs(chatDataRef);
           
           console.log('🔍 chatData 컬렉션 시도:', chatDataRef.path);
           console.log('📋 찾은 문서 수:', snapshot.size);
           
           if (!snapshot.empty) {
             // 각 문서명을 관심사로 사용
             const interests: string[] = [];
             snapshot.forEach((doc) => {
               const interestName = doc.id; // 문서명이 관심사
               interests.push(interestName);
               console.log('📋 관심사 문서:', interestName);
             });
             
             if (interests.length > 0) {
               // 관심사가 있으면 객관식으로 표시
               const interestOptions = interests.map((interest: string, index: number) => ({
                 id: `interest${index}`,
                 text: interest
               }));
               
               console.log('✅ 객관식 옵션 생성:', interestOptions);
               
               questionsArray.push({
                 type: 'objective',
                 question: '앞에서 관심사들을 알려주셨는데 어떤 분야의 예시가 가장 흥미롭게 들리세요? 베스트 5개만 뽑아주세요',
                 options: interestOptions
               });
             } else {
               console.log('⚠️ 관심사가 비어있음 - 주관식으로 설정');
               questionsArray.push({
                 type: 'subjective',
                 question: '어떤 주제에 대해 대화하고 싶으신가요?'
               });
             }
           } else {
             console.log('⚠️ chatData 컬렉션이 비어있음 - 주관식으로 설정');
             questionsArray.push({
               type: 'subjective',
               question: '어떤 주제에 대해 대화하고 싶으신가요?'
             });
           }
         }
       } catch (error) {
         console.error('❌ 관심사 로드 중 오류:', error);
         questionsArray.push({
           type: 'subjective',
           question: '어떤 주제에 대해 대화하고 싶으신가요?'
         });
       }
      
      if (questionsArray.length > 0) {
        setQuestions(questionsArray);
        setTotalSteps(questionsArray.length);
        setCurrentQuestion(questionsArray[0]);
      } else {
        // 백업으로 기본 질문 사용
        const backupQuestions: Question[] = [
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
          }
        ];
        setQuestions(backupQuestions);
        setTotalSteps(backupQuestions.length);
        setCurrentQuestion(backupQuestions[0]);
      }
    } catch (error) {
      console.error('전체 질문 로딩 중 오류 발생:', error);
      // 오류 발생 시 백업 질문 사용
      const backupQuestions: Question[] = [
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
        }
      ];
      setQuestions(backupQuestions);
      setTotalSteps(backupQuestions.length);
      setCurrentQuestion(backupQuestions[0]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 메시지 설정
  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      const firstQuestion: Message = {
        id: '2',
        text: '', // 빈 텍스트로 시작
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages([firstQuestion]);
      setCurrentQuestion(questions[0]);
      
      // 첫 번째 질문 타이핑 애니메이션 시작
      setTimeout(() => {
        typeMessage(questions[0].question, '2');
      }, 1000); // 1초 후 시작
    }
  }, [questions]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 타이핑 애니메이션 진행 중인지 확인
  const isAnyMessageTyping = messages.some(msg => msg.isTyping);

  // 사용자 입력 감지
  useEffect(() => {
    if (inputValue.length > 0 && !isAnyMessageTyping) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [inputValue, isAnyMessageTyping]);

  // 관심사 선택 처리 (12번째 질문)
  const handleInterestSelect = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        // 이미 선택된 관심사면 제거
        return prev.filter(item => item !== interest);
      } else {
        // 최대 5개까지만 선택 가능
        if (prev.length < 5) {
          return [...prev, interest];
        } else {
          alert('최대 5개까지만 선택할 수 있습니다.');
          return prev;
        }
      }
    });
  };

  // 관심사 선택 완료 처리
  const handleInterestsComplete = async () => {
    if (selectedInterests.length === 0) {
      alert('최소 1개 이상의 관심사를 선택해주세요.');
      return;
    }

    // 선택된 관심사들을 Firebase에 저장
    await saveUserResponse(12, selectedInterests.join(', '));
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `선택된 관심사: ${selectedInterests.join(', ')}`,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // AI 응답 시뮬레이션
    await simulateAIResponse(selectedInterests.join(', '));
  };

  // 일반 객관식 옵션 선택 처리
  const handleOptionSelect = async (option: QuestionOption) => {
    // 12번째 질문(관심사 선택)이 아닌 경우에만 처리
    if (currentStep !== 12) {
      // 사용자 답변을 Firebase에 저장
      await saveUserResponse(currentStep, option.text);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: option.text,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // AI 응답 시뮬레이션
      await simulateAIResponse(option.text);
    }
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
      aiResponse = '좋은 답변이에요! 그럼 다음 질문을 드릴게요.';
      shouldIncrementStep = true;
    } else {
      aiResponse = '완벽해요! 이제 사용자님에 대해 충분히 알게 되었어요. 온보딩이 완료되었습니다! 🎉';
      shouldIncrementStep = true;
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      text: '', // 빈 텍스트로 시작
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // AI 메시지 타이핑 애니메이션 시작
    await typeMessage(aiResponse, aiMessage.id);
    
    // 단계 진행
    if (shouldIncrementStep && currentStep < questions.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      if (nextStep <= questions.length) {
        const nextQuestion = questions[nextStep - 1]; // 배열 인덱스는 0부터 시작
        
        // currentQuestion 즉시 업데이트
        setCurrentQuestion(nextQuestion);
        setIsQuestionReady(false); // 새로운 질문 시작 시 옵션 숨김
        
        // 2초 후에 채팅창 clear하고 다음 질문 표시
        setTimeout(() => {
          // 채팅창 clear하고 다음 질문만 표시
          const nextQuestionMessage: Message = {
            id: Date.now().toString() + '_next',
            text: '', // 빈 텍스트로 시작
            isUser: false,
            timestamp: new Date(),
            isTyping: true
          };
          
          // 기존 메시지들을 모두 제거하고 다음 질문만 표시
          setMessages([nextQuestionMessage]);
          
          // 다음 질문 타이핑 애니메이션 시작
          setTimeout(() => {
            typeMessage(nextQuestion.question, nextQuestionMessage.id);
          }, 500);
        }, 2000); // 2초 후 클리어
      }
    }
    
    setIsTyping(false);
    setIsAIResponding(false);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    // 사용자 답변을 Firebase에 저장
    await saveUserResponse(currentStep, inputValue);
    
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

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className={indexStyles.fullContainer}>
        <div className={indexStyles.centerCard}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>질문을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

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
                style={{ width: `${questions.length > 0 ? (currentStep / questions.length) * 100 : 0}%` }}
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
                  {message.isTyping && <span className={styles.cursor}>|</span>}
                </div>
              </div>
            );
          })}
          
                     {/* 객관식 옵션 표시 */}
           {currentQuestion?.type === 'objective' && 
            currentQuestion.options && 
            currentQuestion.options.length > 0 && 
            messages.length > 0 && 
            messages[messages.length - 1].text === currentQuestion.question && (
             <div className={styles.optionsContainer}>
               {currentStep === 12 ? (
                 // 12번째 질문: 관심사 다중 선택
                 <>
                   <div className={styles.optionsTitle}>원하는 관심사를 선택하세요 (최대 5개):</div>
                   <div className={styles.selectedInterests}>
                     선택된 관심사: {selectedInterests.length > 0 ? selectedInterests.join(', ') : '없음'}
                   </div>
                   {currentQuestion.options.map((option) => (
                     <button
                       key={option.id}
                       className={`${styles.optionButton} ${
                         selectedInterests.includes(option.text) ? styles.selected : ''
                       }`}
                       onClick={() => handleInterestSelect(option.text)}
                       disabled={isAIResponding || isAnyMessageTyping}
                     >
                       {option.text}
                       {selectedInterests.includes(option.text) && ' ✓'}
                     </button>
                   ))}
                   
                 </>
               ) : (
                 // 일반 객관식 질문
                 <>
                   <div className={styles.optionsTitle}>선택하거나 직접 작성하세요:</div>
                   {currentQuestion.options.map((option) => (
                     <button
                       key={option.id}
                       className={styles.optionButton}
                       onClick={() => handleOptionSelect(option)}
                       disabled={isAIResponding || isAnyMessageTyping}
                     >
                       {option.text}
                     </button>
                   ))}
                 </>
               )}
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
          {currentStep <= 2 && "기본 정체성을 확인해요"}
          {currentStep >= 3 && currentStep <= 8 && "성향 및 가치관을 확인해요"}
          {currentStep >= 9 && currentStep <= 11 && "소통 방식을 확인해요"}
          {currentStep === 12 && "마지막 단계"}
          {" "}({currentStep}/{questions.length})
        </div>
        
        {/* 입력 영역 (마지막 질문이 아닐 때만 표시) */}
        {currentQuestion && currentStep !== 12 && (
          <div className={styles.inputSection}>
            <textarea
              className={styles.textarea}
              value={inputValue}
              placeholder={currentQuestion.type === 'subjective' 
                ? "구체적으로 작성할수록 성격이 정확해져요." 
                : "답변을 직접 작성해도 좋아요"
              }
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              maxLength={500}
              disabled={isAIResponding || isAnyMessageTyping}
            />
            <button
              className={styles.button}
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isAIResponding || isAnyMessageTyping}
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
        
        {/* 마지막 질문 완료 버튼 */}
        {currentQuestion && currentStep === 12 && (
          <div className={styles.inputSection}>
            <button
              className={styles.completeButton}
              onClick={handleInterestsComplete}
              disabled={selectedInterests.length === 0 || isAIResponding || isAnyMessageTyping}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: selectedInterests.length > 0 ? '#007AFF' : '#E5E5EA',
                color: selectedInterests.length > 0 ? 'white' : '#8E8E93',
                border: 'none',
                borderRadius: '12px',
                cursor: selectedInterests.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              완료 ({selectedInterests.length}/5)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
