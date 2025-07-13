import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/chat.module.css";

// ✅ 목업 데이터
const mockData = {
  profile: {
    name: "임승원",
    profileUrl: "/chat/profile.png",
  },
  messages: [
    {
      type: "bot",
      text: "안녕! 정말 반가워!! 무슨 얘기를 해볼까?",
    },
    {
      type: "user",
      text: "ㅎㅎㅇ 내 아바타라니 신기한데?? 나에 대해서 뭘 얘기하는거야?",
    },
    {
      type: "user",
      text: "최근에 내가 돈까스를 언제 먹었지??",
    },
    {
      type: "bot",
      text: `돈까스를 먹었던 기억이 나는데, 2025년 5월 1일에 윤석이랑 제주도 연돈에서 맛있게 먹었지!
그때의 분위기나 음식 이야기가 너무 재밌었어.
혹시 그때의 기억이나 특별한 순간이 떠오르는 게 있어? 더 나눠보고 싶네!`,
    },
  ],
};

const Chat = () => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ 상태 정의
  const [profile, setProfile] = useState({ name: "", profileUrl: "" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProMode, setIsProMode] = useState(true);

  // ✅ 목업 데이터 세팅
  useEffect(() => {
    setProfile(mockData.profile);
    setMessages(mockData.messages);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    handleResize();
  }, [input]);

  const handleResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 0) + "px";
    }
  };

  const toggleProMode = () => {
    setIsProMode((prev) => !prev);
  };

  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // ✅ bot 응답도 일단 목업데이터로 처리
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "오! 그건 정말 흥미로운 질문이야." },
      ]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="/chat/leftArrow.png"
          className={styles.backIcon}
          onClick={() => router.back()}
        />
        <div className={styles.title}>Sound Of Memory</div>
      </div>

      <div className={styles.profileSection}>
        <img src={profile.profileUrl} alt={`${profile.name} 프로필`} />
        <div className={styles.name}>{profile.name}</div>
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

      <div className={styles.messageSection}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.msgWrapper} ${styles[msg.type]}`}>
            <div className={styles.name}>
              {msg.type === "bot" ? profile.name : "You"}
            </div>
            <div className={styles.bubble}>{msg.text}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className={styles.inputSection}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={input}
          placeholder="오늘 남은 메시지 개수 : [ N ] 개"
          onChange={(e) => setInput(e.target.value)}
          onInput={handleResize}
          onKeyDown={handleKeyDown}
        />
        <img
          src="/chat/send.png"
          className={styles.sendIcon}
          onClick={() => sendMessage()}
        />
      </div>
    </div>
  );
};

export default Chat;