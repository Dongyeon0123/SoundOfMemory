import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import cardStyles from "../../styles/styles.module.css";
import styles from "../../styles/chat.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import { setInput, setMessages, setProMode, Message, } from "../../types/chat";
import { fetchProfileById } from "../../types/profiles";
import { FiSend, FiX } from 'react-icons/fi';
import { doc, onSnapshot, updateDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../types/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { sanitizeHtml } from "../../types/sanitizeHtml";

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

  // 항상 내 ID 기준 Firestore 경로를 반환하는 helper
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
      sender: msg?.sender || (index % 2 === 0 ? 'user' : 'ai'),
      timestamp: new Date(), // Timestamp는 서버 측에서 관리한다면 toDate().toISOString() 도 가능
    }));
  };  

  // Firestore 구독
  useEffect(() => {
    if (!currentUserId || typeof safeId !== "string") return;
    const chatDocRef = getChatDocRef();
    if (!chatDocRef) return;
  
    setLoading(true);
  
    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const messages = parseMessages(docSnap.data());
        dispatch(setMessages(messages));
      } else {
        dispatch(setMessages([]));
      }
      setLoading(false);
    }, () => setLoading(false));
  
    return () => unsubscribe();
  }, [currentUserId, safeId, dispatch]);
  

  // 메시지 스크롤 맨 아래로
  const scrollLocked = useRef(false);

  useEffect(() => {
    if (
      messages.length > 0 || 
      isWaitingForReply
    ) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages, isWaitingForReply]);  

  // input 변할 때 잠깐 scroll 잠그기
  useEffect(() => {
    scrollLocked.current = true;
    const id = setTimeout(() => {
      scrollLocked.current = false;
    }, 150);
    return () => clearTimeout(id);
  }, [input]);

  // textarea 높이 자동 조절
  useEffect(() => {
    handleResize();
  }, [input]);

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

  // 메시지 전송 및 Firestore에 저장
  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || !profileInfo?.id || !currentUserId || typeof safeId !== "string") return;
  
    const chatDocRef = getChatDocRef();
    if (!chatDocRef) return;
  
    let messagesArr: string[] = [];
    try {
      const docSnap = await getDoc(chatDocRef);
      if (docSnap.exists() && Array.isArray(docSnap.data().messages)) {
        messagesArr = docSnap.data().messages;
      }
      messagesArr = [...messagesArr, text];
      await setDoc(chatDocRef, { messages: messagesArr }, { merge: true });
    } catch (e) {
      alert("채팅 저장 실패: " + (e as any).message);
      return;
    }
  
    dispatch(setInput(""));
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsWaitingForReply(true);
  
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
        ? { userId: profileInfo.id, message: text } // 내 아바타
        : { userId: currentUserId, targetId: profileInfo.id, message: text }; // 타인
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
      if (data?.response) {
        messagesArr = [...messagesArr, data.response];
        await setDoc(chatDocRef, { messages: messagesArr }, { merge: true });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        alert("메시지 전송 실패: " + error.message);
      }
    } finally {
      setIsWaitingForReply(false);
      setAbortController(null);
    }
  };  

  // 메시지 전송 취소
  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();          // 요청 취소
      setAbortController(null);
      setIsWaitingForReply(false);      // 전송 중 상태 해제
      dispatch(setInput(""));           // 입력창 클리어
    }
  };

  // 새로고침/이탈시 전송중 UI 클린업
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
      sendMessage();
    }
  };

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
          {currentUserId === profileInfo?.id && (
            <div className={styles.toggleWrap}>
              <div
                className={`${styles.toggle} ${isProMode ? styles.on : ""}`}
                onClick={toggleProMode}
              />
              <div className={styles.label}>
                {isProMode ? "PRO Mode ON" : "PRO Mode OFF"}
              </div>
            </div>
          )}
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
                  <div
                    className={styles.bubble}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
                      )
                    }}
                  ></div>
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
