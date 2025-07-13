import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import cardStyles from "../../styles/styles.module.css";
import styles from "../../styles/chat.module.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  setInput,
  addMessage,
  setProMode,
  setProfile,
  setMessages,
  setChat,
  fetchChatById,
} from "../../chat";
import { fetchProfileById } from "../../profiles";

const Chat = () => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { profile, messages, input, isProMode } = useSelector(
    (state: RootState) => state.chat
  );
  const { id } = router.query;
  const [profileInfo, setProfileInfo] = useState<{
    id: string;
    name: string;
    img: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore에서 프로필/채팅 데이터 불러오기
  useEffect(() => {
    if (typeof id === "string") {
      setLoading(true);
      // 프로필 정보(users 컬렉션)
      fetchProfileById(id).then((profile) => {
        if (profile) {
          setProfileInfo({
            id: profile.id,
            name: profile.name,
            img: profile.img,
          });
        }
      });
      // 채팅 메시지(chats 컬렉션)
      fetchChatById(id).then((data) => {
        if (data) {
          dispatch(setChat(data));
        }
        setLoading(false);
      });
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

  const toggleProMode = () => {
    dispatch(setProMode(!isProMode));
  };

  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text) return;
    dispatch(addMessage(text));
    dispatch(setInput(""));
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    // 예시: 0.5초 후 봇 메시지 자동 추가
    setTimeout(() => {
      dispatch(addMessage("오! 그건 정말 흥미로운 질문이야."));
    }, 500);
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
                  <div className={styles.name}>
                    {isBot ? profile : "You"}
                  </div>
                  <div className={styles.bubble}>{msg}</div>
                </div>
              );
            })
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