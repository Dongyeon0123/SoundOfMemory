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

  const [profileInfo, setProfileInfo] = useState<{ id: string; name: string; img: string } | null>(null);
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
        if (profile) setProfileInfo({ id: profile.id, name: profile.name, img: profile.img });
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
      sender: msg?.sender || (index % 2 === 0 ? 'user' : 'ai'),
      timestamp: new Date(),
    }));
  };

  useEffect(() => {
    if (!currentUserId || typeof safeId !== "string") return;
    const chatDocRef = getChatDocRef();
    if (!chatDocRef) return;

    setLoading(true);

    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const msgs = parseMessages(docSnap.data());
        dispatch(setMessages(msgs));
      } else {
        dispatch(setMessages([]));
      }
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [currentUserId, safeId, dispatch]);

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
      sendMessage();
    }
  };

  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard}>
  
        <ChatHeader title="Sound Of Memory" />
  
        <ProfileSection
          name={profileInfo?.name || ""}
          img={profileInfo?.img}
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
          onSend={() => sendMessage()}
          onCancel={cancelMessage}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
};

export default Chat;
