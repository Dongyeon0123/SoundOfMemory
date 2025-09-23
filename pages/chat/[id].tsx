import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import cardStyles from "../../styles/styles.module.css";
import styles from "../../styles/chat.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import { setInput, setMessages, setProMode, addMessage, Message } from "../../types/chat";
import { fetchProfileById } from "../../types/profiles";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../types/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import ChatHeader from '../../components/chat/ChatHeader';
import ProfileSection from '../../components/chat/ProfileSection';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';

const Chat = () => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { input, isProMode } = useSelector((state: RootState) => state.chat);
  const { id } = router.query;
  
  // 게스트 채팅과 동일하게 useState 사용
  const [messages, setMessagesState] = useState<Message[]>([]);
  // 최신 메시지 상태를 참조하기 위한 ref
  const messagesRef = useRef<Message[]>([]);
  
  // setMessages 함수를 래핑하여 ref도 함께 업데이트
  const setMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof newMessages === 'function') {
      setMessagesState(prev => {
        const updated = newMessages(prev);
        messagesRef.current = updated;
        return updated;
      });
    } else {
      setMessagesState(newMessages);
      messagesRef.current = newMessages;
    }
  };
  
  // 중복 전송 방지를 위한 디바운싱
  const [lastSendTime, setLastSendTime] = useState(0);

  const [profileInfo, setProfileInfo] = useState<{ id: string; name: string; img: string; tag?: string[]; aiIntro?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 마지막 내 메시지를 삭제하는 함수
  const removeLastUserMessage = (msgs: Message[]): Message[] => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === 'user') {
        return [...msgs.slice(0, i), ...msgs.slice(i + 1)];
      }
    }
    return msgs;
  };

  useEffect(() => {
    dispatch(setInput(""));
  }, [dispatch]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

      useEffect(() => {
    if (typeof id === "string") {
      fetchProfileById(id).then(profile => {
          
          if (profile) {
            
            // Firebase에서 가져온 데이터의 구조를 안전하게 처리
            console.log('원본 profile:', profile);
            console.log('profile.name:', profile.name);
            console.log('profile.name 타입:', typeof profile.name);
            
            const profileInfoData = {
              id: profile.id || id, 
              name: profile.name || '사용자', 
              img: profile.img || '',
              tag: profile.tag || [],
              aiIntro: profile.aiIntro || ''
            };
            console.log('설정할 profileInfoData:', profileInfoData);
            setProfileInfo(profileInfoData);
          } else {
            console.log('프로필이 null입니다');
          }
        }).catch(error => {
          console.error('프로필 로딩 실패:', error);
        });
    }
  }, [id]);

  const safeId = Array.isArray(id) ? id[0] : id;

  const getChatDocRef = () => {
    if (!currentUserId || typeof safeId !== "string") {
      console.warn("→ getChatDocRef: 인증되지 않았거나 safeId 문제");
      return null;
    }
    return doc(db, "users", currentUserId, "chats", `${safeId}_avatar_chat`);
  };


    useEffect(() => {
    if (!currentUserId || typeof safeId !== "string") return;
    const chatDocRef = getChatDocRef();
    if (!chatDocRef) return;

    setLoading(true);

    const unsubscribe = onSnapshot(chatDocRef, async (docSnap) => {
      const trimmedAiIntro = profileInfo?.aiIntro?.trim();
      const userAiIntro = (trimmedAiIntro && trimmedAiIntro.length > 0) ? trimmedAiIntro : null;
      const defaultAiIntro = '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!';

      if (docSnap.exists()) {
        const raw = docSnap.data();
        const arr: any[] = Array.isArray(raw?.messages) ? raw.messages : [];

        // 1) 문서는 있는데 메시지가 비어있으면 인삿말을 index 0으로 저장
        if (arr.length === 0) {
          const introToSave = userAiIntro || defaultAiIntro;
          try {
            await setDoc(chatDocRef, { messages: [introToSave] }, { merge: false });
            return; // 저장 후 다음 스냅샷에서 렌더
          } catch (e) {
            console.error('인삿말 초기 저장 실패:', e);
          }
        }

        // 2) 서버 저장 메시지는 사용하지 않고, 서버의 AI 인사말만 사용
        const introToShow = userAiIntro || defaultAiIntro;
        const introMessage = { id: 'ai_intro', content: introToShow, sender: 'ai' as const, timestamp: new Date() };

        // 로컬에만 유지되는 사용자/AI 메시지들 (인사말 제외)
        const localNonIntroMessages = messagesRef.current.filter(m => m.id !== 'ai_intro');

        // 최종 메시지: 서버 AI 인사말 + 로컬 메시지들
        const finalMessages = [introMessage, ...localNonIntroMessages];
        setMessages(finalMessages);
      } else {
        // 0) 문서가 없으면 생성하며 인삿말을 index 0으로 저장
        const introToSave = userAiIntro || defaultAiIntro;
        try {
          await setDoc(chatDocRef, { messages: [introToSave] }, { merge: false });
          return; // 저장 후 다음 스냅샷에서 렌더
        } catch (e) {
          console.error('인삿말로 최초 문서 생성 실패:', e);
          // 실패 시 인삿말만 UI 표시
          setMessages([{ id: 'ai_intro', content: introToSave, sender: 'ai' as const, timestamp: new Date() }]);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase 리스너 오류:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId, safeId, dispatch, profileInfo]);

  useEffect(() => {
    if (messages.length > 0 || isWaitingForReply) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages, isWaitingForReply]);

  useEffect(() => { handleResize(); }, [input]);

  // 처음 대화 안내 모달은 사용하지 않음

  const handleResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const toggleProMode = () => {
    dispatch(setProMode(!isProMode));
  };

  const sendMessage = async (msg?: string) => {
    // 1. 이미 전송 중이면 중복 전송 방지
    if (isWaitingForReply) {
      console.log('이미 전송 중입니다. 중복 전송을 방지합니다.');
      return;
    }
    
    // 2. 디바운싱: 1초 내 중복 전송 방지
    const now = Date.now();
    if (now - lastSendTime < 1000) {
      console.log('너무 빠른 전송입니다. 1초 후 다시 시도해주세요.');
      return;
    }
    
    // 3. 입력값 검증
    const text = (msg ?? input).trim();
    if (!text || !profileInfo?.id || !currentUserId || typeof safeId !== "string") {
      console.log('전송 조건이 충족되지 않았습니다.');
      return;
    }
    
    // 4. 즉시 전송 중 상태로 변경하여 중복 전송 방지
    setIsWaitingForReply(true);
    
    // 5. 전송 시도 시간 기록 (디바운싱용)
    setLastSendTime(now);
    
    const chatDocRef = getChatDocRef();
    if (!chatDocRef) {
      setIsWaitingForReply(false); // 에러 시 상태 복구
      return;
    }
  
    // 게스트 채팅과 동일한 방식: 사용자 메시지를 로컬 상태에 추가
    const userMessage = { 
      id: `user_${Date.now()}`, 
      content: text, 
      sender: 'user' as const, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    dispatch(setInput(""));
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  
    const controller = new AbortController();
    setAbortController(controller);
  
    try {
      const isAvatarMine = !!currentUserId && (currentUserId === (profileInfo?.id || "") || currentUserId === (typeof safeId === 'string' ? safeId : ""));

      const endpointCandidates = isAvatarMine
        ? (
            isProMode
              ? [
                  "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarpaid",
                  "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatar",
                ]
              : [
                  "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarfree",
                  "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatar",
                ]
          )
        : ["https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/otherchat"];

      const requestBody = isAvatarMine
        ? { userId: profileInfo?.id || safeId, message: text }
        : { userId: currentUserId, targetId: profileInfo?.id || safeId, message: text };

      // 내 아바타인 경우: 서버가 사용자 메시지를 저장하므로 클라이언트에서는 저장하지 않음

      let lastError: any = null;
      let ok = false;
      let data: any = null;
      for (const endpoint of endpointCandidates) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
          if (response.status === 404) {
            console.warn("엔드포인트 404 → 다음 후보 시도:", endpoint);
            lastError = new Error("404 Not Found");
            continue;
          }
          const json = await response.json().catch(() => null);
          if (!response.ok) {
            lastError = new Error(`서버 응답 오류: ${response.status}`);
            continue;
          }
          data = json;
          ok = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!ok) throw lastError || new Error("요청 실패");
      if (data?.response) {
        // 일반 채팅: 서버가 AI 응답을 저장하므로 클라이언트에서는 로컬에만 추가
        const aiMessage = { 
          id: `ai_${Date.now()}`, 
          content: data.response, 
          sender: 'ai' as const, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, aiMessage]);
        setLastSendTime(Date.now());
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        alert("메시지 전송 실패: " + error.message);
        // AI 응답 실패 시 마지막 내 메시지 제거
        const newMessages = removeLastUserMessage([...messagesRef.current, userMessage]);
        setMessages(newMessages);
      }
    } finally {
      setIsWaitingForReply(false);
      setAbortController(null);
    }
  };  

  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsWaitingForReply(false);
      // 전송 중 메시지 취소 시 마지막 내 메시지도 제거
      const newMessages = removeLastUserMessage(messagesRef.current);
      setMessages(newMessages);
      dispatch(setInput(""));
    }
  };

  useEffect(() => {
    return () => {
      abortController?.abort();
      setIsWaitingForReply(false);
      setAbortController(null);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation(); // 이벤트 전파 차단
      
      // 이미 전송 중이거나 입력이 비어있으면 무시
      if (isWaitingForReply || !input.trim()) {
        return false;
      }
      
      sendMessage();
      return false; // 추가 안전장치
    }
  };

  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard}>
  
        <ChatHeader title="Sound Of Memory" />
  
        <ProfileSection
          name={profileInfo?.name || "AI"}
          img={profileInfo?.img}
          tag={profileInfo?.tag}
          isProMode={isProMode}
          showProToggle={currentUserId === profileInfo?.id}
          onToggleProMode={toggleProMode}
        />
  
        <div style={{ width: '100%', height: '1px', background: '#e0e0e0' }} />
  
        <MessageList
          loading={loading}
          messages={messages}
          isWaitingForReply={isWaitingForReply}
          profileName={profileInfo?.name ?? ""}
          profileInfo={profileInfo}
          scrollRef={scrollRef}
        />
  
        {/* 처음 대화 안내 오버레이 제거 */}
  
        <ChatInput
          input={input}
          onInputChange={val => dispatch(setInput(val))}
          onResize={handleResize}
          onKeyDown={handleKeyDown}
          disabled={isWaitingForReply}
          isWaitingForReply={isWaitingForReply}
          onSend={() => sendMessage(input)}
          onCancel={cancelMessage}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
};

export default Chat;
