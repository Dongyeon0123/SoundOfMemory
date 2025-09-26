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
import TokenExhaustedModal from '../../components/TokenExhaustedModal';

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
  
  // 토큰 부족 모달 상태
  const [showTokenExhaustedModal, setShowTokenExhaustedModal] = useState(false);

  const [profileInfo, setProfileInfo] = useState<{ id: string; name: string; img: string; tag?: string[]; aiIntro?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 실패/취소 시 마지막 사용자 메시지를 제거하기 위한 유틸
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

    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      const trimmedAiIntro = profileInfo?.aiIntro?.trim();
      const userAiIntro = (trimmedAiIntro && trimmedAiIntro.length > 0) ? trimmedAiIntro : null;
      const defaultAiIntro = '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!';

      if (docSnap.exists()) {
        const raw = docSnap.data();
        let arr: any[] = Array.isArray(raw?.messages) ? raw.messages : [];

        // 0번 인덱스에 '원하는' 인삿말(사용자 설정 우선)을 보장하고,
        // 기본 인삿말/사용자 인삿말의 중복을 모두 제거
        const desiredIntro = userAiIntro || defaultAiIntro;
        const hasUserIntro = !!userAiIntro; // 사용자 인삿말 준비 여부
        const isIntroCandidate = (m: any) => {
          if (typeof m === 'string') return m === desiredIntro || m === defaultAiIntro || (!!userAiIntro && m === userAiIntro);
          return m && m.sender === 'ai' && (
            m.content === desiredIntro || m.content === defaultAiIntro || (!!userAiIntro && m.content === userAiIntro)
          );
        };

        if (Array.isArray(arr)) {
          const hasDesiredAtZero = arr.length > 0 && (
            (typeof arr[0] === 'string' && arr[0] === desiredIntro) ||
            (typeof arr[0] === 'object' && arr[0]?.sender === 'ai' && arr[0]?.content === desiredIntro)
          );

          // 사용자 인삿말이 아직 준비되지 않았다면 기본 인삿말로 재정렬/저장을 하지 않음
          let toSave = arr;
          if (hasUserIntro) {
            // 중복 인삿말 전체 제거
            const filtered = arr.filter((m: any, idx: number) => !isIntroCandidate(m) || idx === 0);
            // 만약 0번이 원하는 인삿말이 아니면 0번에 원하는 인삿말을 추가
            toSave = filtered;
            if (!hasDesiredAtZero) {
              // 0번이 다른 메시지거나 다른 인삿말이라면, 모든 인삿말 제거 후 prepend
              const removedAllIntros = arr.filter((m: any) => !isIntroCandidate(m));
              toSave = [desiredIntro, ...removedAllIntros];
            } else {
              // 0번이 이미 원하는 인삿말이면, 0번을 제외한 나머지에서 인삿말 후보 제거
              toSave = [filtered[0], ...filtered.slice(1).filter((m: any) => !isIntroCandidate(m))];
            }
          }

          // 변경사항이 있을 때만 저장
          const changed = JSON.stringify(arr) !== JSON.stringify(toSave);
          if (changed) {
            setDoc(chatDocRef, { messages: toSave }, { merge: false }).catch((e) => console.error('인삿말 정렬 저장 실패:', e));
            arr = toSave;
          }
        }

        if (arr.length > 0) {
          // 서버 메시지를 그대로 맵핑하여 사용
          const mapped: Message[] = arr.map((msg: any, index: number) => {
            if (typeof msg === 'string') {
              return {
                id: `msg_${index}`,
                content: msg,
                sender: index % 2 === 1 ? 'user' : 'ai',
                timestamp: new Date(),
              };
            }
            return {
              id: msg.id || `msg_${index}`,
              content: msg.content,
              sender: msg.sender || (index % 2 === 1 ? 'user' : 'ai'),
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            };
          });
          // 문서에 0번 인삿말을 이미 보장했으므로 클라이언트에서 별도 prepend 불필요
          const withIntro = mapped;

          // 낙관적 메시지가 아직 서버에 반영되지 않았다면 잠시 유지
          const lastLocal = messagesRef.current[messagesRef.current.length - 1];
          const hasPendingLocalUser = lastLocal && lastLocal.sender === 'user' && isWaitingForReply;
          const existsInMapped = hasPendingLocalUser
            ? withIntro.some(m => m.sender === 'user' && m.content === lastLocal.content)
            : false;
          if (hasPendingLocalUser && !existsInMapped) {
            setMessages([...withIntro, lastLocal]);
          } else {
            setMessages(withIntro);
          }
        } else {
          // 문서는 있으나 비어있음: 사용자 인삿말이 준비된 경우에만 저장/표시
          if (userAiIntro) {
            const introToShow = userAiIntro;
            setDoc(chatDocRef, { messages: [introToShow] }, { merge: false })
              .catch((e) => console.error('빈 문서 인삿말 저장 실패:', e));
            setMessages([{ id: 'ai_intro', content: introToShow, sender: 'ai', timestamp: new Date() }]);
          } else {
            // 사용자 인삿말이 아직 없으면 깜빡임 방지를 위해 기본 인삿말도 표시하지 않음
            setMessages([]);
          }
        }
      } else {
        // 문서가 없으면 사용자 인삿말이 준비된 경우에만 생성
        if (userAiIntro) {
          const introToShow = userAiIntro;
          setDoc(chatDocRef, { messages: [introToShow] }, { merge: false })
            .catch((e) => console.error('최초 문서 인삿말 저장 실패:', e));
          setMessages([{ id: 'ai_intro', content: introToShow, sender: 'ai', timestamp: new Date() }]);
        } else {
          // 사용자 인삿말이 아직 없으면 표시/생성을 지연하여 깜빡임 방지
          setMessages([]);
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
  
    // 낙관적 업데이트: 내 메시지를 즉시 화면에 추가 (스냅샷 오면 대체)
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

      // 내 아바타인 경우: 서버 저장이 지연/누락될 수 있어 즉시 Firestore에 사용자 메시지를 append
      if (isAvatarMine) {
        try {
          const snap = await getDoc(chatDocRef);
          const arr: any[] = Array.isArray(snap.data()?.messages) ? snap.data()!.messages : [];
          const last = arr[arr.length - 1];
          const isSameAsLast = typeof last === 'string' ? last === text : (last && last.content === text && last.sender === 'user');
          if (!isSameAsLast) {
            const toSave = [...arr, text]; // 문자열로 저장해 기존 포맷 유지
            await setDoc(chatDocRef, { messages: toSave }, { merge: false });
          }
        } catch (e) {
          console.warn('내 아바타 사용자 메시지 즉시 저장 실패(무시):', e);
        }
      }

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
            console.log('서버 응답 오류:', response.status, json);
            // 토큰 부족 에러 체크 (402 Payment Required 포함)
            if (json?.error?.includes('토큰') || json?.error?.includes('token') || 
                json?.message?.includes('토큰') || json?.message?.includes('token') ||
                response.status === 429 || response.status === 402) {
              console.log('토큰 부족 에러 감지, 모달 표시');
              setShowTokenExhaustedModal(true);
              return; // 토큰 부족이면 다른 엔드포인트 시도하지 않음
            }
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
      // 응답 본문은 무시하고 Firestore 스냅샷 갱신으로만 렌더
      if (data?.response) setLastSendTime(Date.now());
    } catch (error: any) {
      if (error.name !== "AbortError") {
        alert("메시지 전송 실패: " + error.message);
        // 실패 시 방금 추가한 내 메시지 롤백
        setMessages(prev => removeLastUserMessage(prev));
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
      // 전송 취소 시 마지막 내 메시지 제거
      setMessages(prev => removeLastUserMessage(prev));
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
      
      {/* 토큰 부족 모달 */}
      <TokenExhaustedModal
        isOpen={showTokenExhaustedModal}
        onClose={() => setShowTokenExhaustedModal(false)}
        onUpgrade={() => {
          // 프리미엄 업그레이드 로직 (추후 구현)
          console.log('프리미엄 업그레이드');
          setShowTokenExhaustedModal(false);
        }}
      />
    </div>
  );
};

export default Chat;
