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
          <img
            src="/chat/leftArrow.png"
            className={styles.backIcon}
            onClick={() => router.back()}
            alt="뒤로가기"
          />
          <div className={styles.title}>Sound Of Memory</div>
        </div>

        {/* 프로필 섹션 */}
        <div className={styles.profileSection}>
          <img
            src={profileInfo?.img || "/chat/profile.png"}
            alt={`${profileInfo?.name || "프로필"} 프로필`}
          />
          <div className={styles.name}>{profileInfo?.name || ""}</div>
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

        {/* 메시지 섹션 */}
        <div className={styles.messageSection}>
          {loading ? (
            <div className={styles.loading}>메시지를 불러오는 중입니다...</div>
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
            placeholder="오늘 남은 메시지 개수 : [ N ] 개"
            onChange={(e) => dispatch(setInput(e.target.value))}
            onInput={handleResize}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={500}
          />
          <img
            src="/chat/send.png"
            className={styles.sendIcon}
            onClick={() => sendMessage()}
            alt="전송"
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;