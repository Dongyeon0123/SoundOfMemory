import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import cardStyles from "../../styles/styles.module.css";
import styles from "../../styles/chat.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  setInput,
  setMessages,
  setProMode,
  Message,
} from "../../chat";
import { fetchProfileById } from "../../profiles";
import { FiSend, FiX } from 'react-icons/fi';
import { doc, onSnapshot, updateDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Chat = () => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { messages, input, isProMode } = useSelector((state: RootState) => state.chat);
  const { id } = router.query;
  const [profileInfo, setProfileInfo] = useState<{ id: string; name: string; img: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [showNoChatModal, setShowNoChatModal] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setInput(""));
  }, [dispatch]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserId(user.uid);
      else setCurrentUserId(null);
    });
    return () => unsubscribe();
  }, []);

  // 상대방 프로필 정보 불러오기
  useEffect(() => {
    if (typeof id === "string") {
      fetchProfileById(id).then((profile) => {
        if (profile) {
          setProfileInfo({ id: profile.id, name: profile.name, img: profile.img });
        }
      });
    }
  }, [id]);

  const safeId = Array.isArray(id) ? id[0] : id;

  // **핵심 수정**: Function과 동일한 경로로 Firestore 구독
  useEffect(() => {
    if (!currentUserId || typeof safeId !== "string") {
      console.log('구독 조건 미충족', { currentUserId, id });
      return;
    }
    
    setLoading(true);
    
    // Function과 동일한 경로: users/{userId}/chats/{targetId}_avatar_chat
    const chatDocRef = doc(db, "users", currentUserId, "chats", `${safeId}_avatar_chat`);
    
    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      console.log('onSnapshot fired', { exists: docSnap.exists() });
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const messagesArray = data.messages || [];
        console.log('messages from Firestore:', messagesArray);
        
        // 문자열 배열 또는 객체 배열 모두 지원
        // 짝수/홀수 인덱스 + 마지막만 user로 강제
        const msgs: Message[] = messagesArray.map((item: string, index: number) => {
          let sender: "user" | "ai";
          if (messagesArray.length % 2 === 1 && index === messagesArray.length - 1) {
            sender = "user";
          } else {
            sender = index % 2 === 0 ? "user" : "ai";
          }
          return {
            id: `msg_${index}`,
            content: item,
            sender,
            timestamp: new Date(),
          };
        });
        
        console.log('converted messages:', msgs);
        dispatch(setMessages(msgs));
      } else {
        console.log('채팅 문서가 존재하지 않음');
        dispatch(setMessages([]));
      }
      
      setLoading(false);
    }, (error) => {
      console.error('onSnapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId, safeId, dispatch, input, lastSentMessage]);

  // 메시지 스크롤 맨 아래로
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 로딩 완료 시 스크롤 맨 아래로
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [loading, messages.length]);

  // textarea 높이 자동 조절
  useEffect(() => {
    handleResize();
  }, [input]);

  useEffect(() => {
    if (!loading && messages.length === 0) {
      setShowNoChatModal(true);
      const timer = setTimeout(() => setShowNoChatModal(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, messages]);

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

  // 메시지 전송 및 Firestore에 저장
  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || !profileInfo?.id || !currentUserId || typeof safeId !== "string") return;
    setLastSentMessage(text);
    // Firestore 경로: users/{userId}/chats/{targetId}_avatar_chat
    const chatDocRef = doc(db, "users", currentUserId, "chats", `${safeId}_avatar_chat`);
    let messagesArr: string[] = [];
    try {
      // 기존 messages 배열 불러오기
      const docSnap = await getDoc(chatDocRef);
      if (docSnap.exists() && Array.isArray(docSnap.data().messages)) {
        messagesArr = docSnap.data().messages;
      }
      messagesArr = [...messagesArr, text];
      await setDoc(chatDocRef, { messages: messagesArr }, { merge: true });
    } catch (e) {
      console.error('Firestore 저장 에러:', e);
      alert('채팅 저장 실패: ' + (e.message || e));
      return;
    }
    dispatch(setInput(""));
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsWaitingForReply(true);

    // AbortController 생성
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const endpoint = isProMode
        ? "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarpaid"
        : "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarfree";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profileInfo.id,
          message: text,
        }),
        signal: controller.signal,
      });
      console.log("POST 응답 status:", response.status);
      const data = await response.json().catch(() => null);
      console.log("POST 응답 body:", data);
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
      // AI 응답 메시지를 Firestore에 저장 (string[]에 추가)
      if (data && data.response) {
        // 여기서 messagesArr를 재사용!
        messagesArr = [...messagesArr, data.response];
        await setDoc(chatDocRef, { messages: messagesArr }, { merge: true });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("요청이 취소되었습니다.");
      } else {
        console.error("서버 전송 실패:", error);
        alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsWaitingForReply(false);
      setAbortController(null);
    }
  };

  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();
      setIsWaitingForReply(false);
      setAbortController(null);
      dispatch(setInput("")); // input 값 비우기
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  console.log('messages state:', messages);

  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard}>
        {/* 헤더 */}
        <div className={styles.header}>
          <button
            onClick={() => router.back()}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
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
          <div className={styles.title}>Sound Of Memory</div>
        </div>

        {/* 프로필 섹션 */}
        <div className={styles.profileSection}>
          <img
            src={profileInfo?.img || "/chat/profile.png"}
            alt={`${profileInfo?.name || "프로필"} 프로필`}
          />
          <div className={styles.profileName}>
            {profileInfo?.name || ""}
            <span style={{fontSize: 14, color: '#999'}}><br/>AI</span>
          </div>
          <div className={styles.toggleWrap}>
            <div
              className={`${styles.toggle} ${isProMode ? styles.on : ""}`}
              onClick={toggleProMode}
            />
            <div className={styles.label}>
              {isProMode ? "PRO Mode ON" : "PRO Mode OFF"}
            </div>
          </div>
        </div>

        {/* 그레이 구분선 */}
        <div style={{ width: '100%', height: '1px', background: '#e0e0e0' }} />

        {/* 메시지 섹션 */}
        <div className={styles.messageSection}>
          {loading ? (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 200 
            }}>
              <div className="spinner" style={{ marginBottom: 18 }} />
              <div style={{ fontSize: 16, color: '#636AE8', fontWeight: 600 }}>
                메시지를 불러오는 중입니다...
              </div>
            </div>
          ) : messages.length === 0 ? (
            null
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              const isAI = msg.sender === "ai";
              const msgTypeClass = isAI ? styles.bot : styles.user;
              
              return (
                <div key={msg.id} className={`${styles.msgWrapper} ${msgTypeClass}`}>
                  <div className={styles.name}>
                    {isAI ? profileInfo?.name : "You"}
                  </div>
                  <div className={styles.bubble}>{typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}</div>
                </div>
              );
            })
          )}
          
          {isWaitingForReply && (
            <div className={styles.typingIndicator}>
              <div className={styles.wave}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {showNoChatModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              padding: '36px 48px', 
              fontSize: 20, 
              fontWeight: 700, 
              color: '#636AE8', 
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)' 
            }}>
              채팅을 시작해보세요
            </div>
          </div>
        )}

        {/* 입력 섹션 */}
        <div className={styles.inputSection}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            placeholder="메시지를 입력하세요."
            onChange={(e) => dispatch(setInput(e.target.value))}
            onInput={handleResize}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={500}
            disabled={isWaitingForReply}
          />
          <button
            className={styles.button}
            onClick={isWaitingForReply ? cancelMessage : () => sendMessage()}
            aria-label={isWaitingForReply ? "취소" : "전송"}
            disabled={!input.trim() && !isWaitingForReply}
            type="button"
            style={{
              borderRadius: isWaitingForReply ? '8px' : '50%',
              transition: 'all 0.2s ease',
            }}
          >
            {isWaitingForReply ? (
              <FiX className="icon" style={{ color: '#fff' }} />
            ) : (
              <FiSend className="icon" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
