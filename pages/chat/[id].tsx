import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import cardStyles from "../../styles/styles.module.css";
import styles from "../../styles/chat.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import { setInput, setMessages, setProMode, Message } from "../../types/chat";
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
  const { messages, input, isProMode } = useSelector((state: RootState) => state.chat);
  const { id } = router.query;
  
  // 중복 전송 방지를 위한 디바운싱
  const [lastSendTime, setLastSendTime] = useState(0);

  const [profileInfo, setProfileInfo] = useState<{ id: string; name: string; img: string; tag?: string[]; aiIntro?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [showNoChatModal, setShowNoChatModal] = useState(false);
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

  const parseMessages = (data: any): Message[] => {
    const messagesArray = data?.messages || [];
    return messagesArray.map((msg: any, index: number) => ({
      id: `msg_${index}`,
      content: typeof msg === "string" ? msg : msg.content,
      sender: msg?.sender || (index % 2 === 1 ? 'user' : 'ai'),
      timestamp: new Date(),
    }));
  };

    useEffect(() => {
    if (!currentUserId || typeof safeId !== "string") return;
    const chatDocRef = getChatDocRef();
    if (!chatDocRef) return;

    setLoading(true);

    const unsubscribe = onSnapshot(chatDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const msgs = parseMessages(docSnap.data());
        dispatch(setMessages(msgs));
      } else {
        dispatch(setMessages([]));
        
        // profileInfo가 로딩된 후에만 AI 인사말 생성
        if (profileInfo) {
          // aiIntro가 비어있거나 사용자가 입력하지 않았을 때만 기본 메시지 사용
          const trimmedAiIntro = profileInfo.aiIntro?.trim();
          const aiIntro = trimmedAiIntro && trimmedAiIntro.length > 0 
            ? trimmedAiIntro 
            : `안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!`;
          
          const aiMessage = {
            id: `ai_intro_${Date.now()}`,
            content: aiIntro,
            sender: 'ai' as const,
            timestamp: new Date(),
          };
          
          // AI 인사말을 Firebase에 저장 (merge 대신 overwrite 사용)
          try {
            await setDoc(chatDocRef, {
              messages: [aiMessage.content],
              lastUpdated: new Date(),
            });
          } catch (error) {
            console.error('AI 인사말 저장 중 오류:', error);
          }
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

  useEffect(() => {
    const modalKey = `noChatModalShown_${safeId}`;
    const alreadyShown = typeof window !== 'undefined' ? localStorage.getItem(modalKey) : null;
    if (!loading && messages.length === 0 && !alreadyShown) {
      setShowNoChatModal(true);
      if (typeof window !== 'undefined') localStorage.setItem(modalKey, "true");
      const timer = setTimeout(() => setShowNoChatModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, messages.length, safeId]);

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
  
    // 사용자 메시지는 Redux store에만 저장하고, AI 응답 후에 한 번에 Firestore에 저장
    // 이렇게 하면 중복 저장을 방지할 수 있습니다
    
    dispatch(setInput(""));
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  
    const controller = new AbortController();
    setAbortController(controller);
  
    try {
      const isAvatarMine = currentUserId === profileInfo?.id;
  
      const endpoint = isAvatarMine
        ? isProMode
          ? "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarpaid"
          : "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarfree"
        : "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/otherchat";
  
      const requestBody = isAvatarMine
        ? { userId: profileInfo?.id || safeId, message: text } // 내 아바타
        : { userId: currentUserId, targetId: profileInfo?.id || safeId, message: text }; // 타인
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
      if (data?.response) {
        // AI 응답을 받은 후에 사용자 메시지와 AI 응답을 함께 저장
        try {
          const docSnap = await getDoc(chatDocRef);
          let messagesArr: string[] = [];
          if (docSnap.exists() && Array.isArray(docSnap.data().messages)) {
            messagesArr = docSnap.data().messages;
          }
          // 사용자 메시지와 AI 응답을 함께 추가
          messagesArr = [...messagesArr, text, data.response];
          await setDoc(chatDocRef, { messages: messagesArr }, { merge: true });
          // 전송 성공 시 디바운싱 시간 업데이트
          setLastSendTime(Date.now());
        } catch (e) {
          console.error("AI 응답 저장 실패:", e);
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        alert("메시지 전송 실패: " + error.message);
        // AI 응답 실패 시 마지막 내 메시지 제거
        const newMessages = removeLastUserMessage(messages);
        dispatch(setMessages(newMessages));
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
      const newMessages = removeLastUserMessage(messages);
      dispatch(setMessages(newMessages));
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
  
        {showNoChatModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff', borderRadius: 12, padding: '36px 48px',
              fontSize: 20, fontWeight: 700, color: '#636AE8',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
            }}>
              채팅을 시작해보세요
            </div>
          </div>
        )}
  
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
