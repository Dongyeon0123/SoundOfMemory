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
} from "../../chat";
import { fetchProfileById } from "../../profiles";
import { FiSend } from 'react-icons/fi';

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
  
    dispatch(addMessage(text));
    dispatch(setInput(""));
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsWaitingForReply(true);
  
    try {
      const response = await fetch(
        "https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/myavatarfree",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profileInfo.id,
            message: text,
          }),
        }
      );
      // 응답 상태와 결과를 콘솔에 출력
      console.log("POST 응답 status:", response.status);
      const data = await response.json().catch(() => null);
      console.log("POST 응답 body:", data);
    } catch (error) {
      console.error("서버 전송 실패:", error);
    } finally {
      setIsWaitingForReply(false);
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
                justifyContent: 'center'
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
          <div style={{ width: '100%', height: '1px', background: '#e0e0e0' }} />
          {loading ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <div className="spinner" style={{ marginBottom: 18 }} />
              <div style={{ fontSize: 16, color: '#636AE8', fontWeight: 600 }}>메시지를 불러오는 중입니다...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.loading}>채팅 내역이 없습니다.</div>
          ) : (
            messages.map((msg, idx) => {
              const isBot = idx % 2 === 1;
              const msgTypeClass = isBot ? styles.bot : styles.user;
              return (
                <div key={idx} className={`${styles.msgWrapper} ${msgTypeClass}`}>
                  <div className={styles.name}>{isBot ? profileInfo?.name : "You"}</div>
                  <div className={styles.bubble}>{msg}</div>
                </div>
              );
            })
          )}
          {isWaitingForReply && (
            <div className={styles.typingIndicator}><span /></div>
          )}
          <div ref={scrollRef} />
        </div>

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
          />
          <button
            className={styles.button}
            onClick={() => sendMessage()}
            aria-label="전송"
            disabled={!input.trim()}
            type="button"
          >
            <FiSend className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;