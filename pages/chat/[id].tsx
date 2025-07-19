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
  addMessage,
  subscribeChatById,
  Message,
} from "../../chat";
import { fetchProfileById } from "../../profiles";
import { FiSend, FiX } from 'react-icons/fi';

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

  // 프로필 및 실시간 채팅 리스닝
  useEffect(() => {
    if (typeof id === "string") {
      setLoading(true);
      fetchProfileById(id).then((profile) => {
        if (profile) {
          setProfileInfo({ id: profile.id, name: profile.name, img: profile.img });
        }
      });
      // 실시간 리스닝 등록
      const unsubscribe = subscribeChatById(id, (msgs) => {
        dispatch(setMessages(msgs));
        setLoading(false);
      }, () => {
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id, dispatch]);

  // 메시지 스크롤 맨 아래로
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // PRO 모드 토글
  const toggleProMode = () => {
    dispatch(setProMode(!isProMode));
  };

  // 메시지 전송 및 Firestore에 저장
  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || !profileInfo?.id) return;
  
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
    };
    dispatch(addMessage(userMessage));
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
      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profileInfo.id,
            message: text,
          }),
          signal: controller.signal,
        }
      );
      // 응답 상태와 결과를 콘솔에 출력
      console.log("POST 응답 status:", response.status);
      const data = await response.json().catch(() => null);
      console.log("POST 응답 body:", data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("요청이 취소되었습니다.");
      } else {
        console.error("서버 전송 실패:", error);
      }
    } finally {
      setIsWaitingForReply(false);
      setAbortController(null);
    }
  };

  // 메시지 전송 취소
  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();
      setIsWaitingForReply(false);
      setAbortController(null);
    }
  };

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
          <div className={styles.profileName}>{profileInfo?.name || ""}
            <span style={{fontSize: 14, color: '#999'}}><br></br>AI</span>
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
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <div className="spinner" style={{ marginBottom: 18 }} />
              <div style={{ fontSize: 16, color: '#636AE8', fontWeight: 600 }}>메시지를 불러오는 중입니다...</div>
            </div>
          ) : messages.length === 0 ? (
            null
          ) : (
            messages.map((msg) => {
              const isBot = msg.sender === 'ai';
              const msgTypeClass = isBot ? styles.bot : styles.user;
              return (
                <div key={msg.id} className={`${styles.msgWrapper} ${msgTypeClass}`}>
                  <div className={styles.name}>{isBot ? profileInfo?.name : "You"}</div>
                  <div className={styles.bubble}>{msg.content}</div>
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
            <div style={{ background: '#fff', borderRadius: 12, padding: '36px 48px', fontSize: 20, fontWeight: 700, color: '#636AE8', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
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