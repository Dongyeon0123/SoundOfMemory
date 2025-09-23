import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../types/firebase';
import cardStyles from '../../styles/styles.module.css';
import styles from '../../styles/chat.module.css';
import ChatHeader from '../../components/chat/ChatHeader';
import ProfileSection from '../../components/chat/ProfileSection';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import GuestLimitModal from '../../components/chat/GuestLimitModal';
import { getOrCreateGuestId } from '../../lib/guest';
import { fetchProfileById } from '../../types/profiles';

export default function GuestChatPage() {
  const router = useRouter();
  const { ownerId } = router.query;
  const [guestId, setGuestId] = useState<string>('');
  const [messages, setMessages] = useState<{ id: string; content: string; sender: 'user' | 'ai'; timestamp: Date }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profileInfo, setProfileInfo] = useState<{ id: string; name: string; img: string; tag?: string[]; aiIntro?: string } | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const GUEST_MESSAGE_LIMIT = 5;

  const chatDocPath = () => {
    if (!ownerId || typeof ownerId !== 'string' || !guestId) return null;
    return doc(db, 'users', ownerId, 'guestchat', `${guestId}_avatar_chat`);
  };

  // 인증 상태 구독 - guestId = auth.uid 사용
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setGuestId(user.uid);
      } else {
        // 인증되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/register/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 소유자 프로필 로드 (이름/사진/태그/aiIntro)
  useEffect(() => {
    const loadOwnerProfile = async () => {
      if (!ownerId || typeof ownerId !== 'string') return;
      try {
        const profile = await fetchProfileById(ownerId);
        if (profile) {
          setProfileInfo({
            id: profile.id || ownerId,
            name: profile.name || '사용자',
            img: profile.img || '',
            tag: profile.tag || [],
            aiIntro: (profile.aiIntro && String(profile.aiIntro).trim().length > 0)
              ? String(profile.aiIntro).trim()
              : '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!'
          });
        } else {
          // 프로필이 없는 경우에도 기본 정보로 설정
          setProfileInfo({
            id: ownerId,
            name: '사용자',
            img: '',
            tag: [],
            aiIntro: '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!'
          });
        }
      } catch (e) {
        // 에러가 발생해도 기본 정보로 설정
        setProfileInfo({
          id: ownerId,
          name: '사용자',
          img: '',
          tag: [],
          aiIntro: '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!'
        });
      }
    };
    loadOwnerProfile();
  }, [ownerId]);

  // 게스트 채팅방 초기화: 문서 생성 및 AI 인사말 저장
  useEffect(() => {
    const initializeGuestChat = async () => {
      if (!ownerId || typeof ownerId !== 'string' || !guestId) {
        return;
      }

      // 인증 상태 확인
      const auth = getAuth();
      if (!auth.currentUser) {
        return;
      }

      const ref = chatDocPath();
      if (!ref) {
        return;
      }

      try {
        
        // 문서 존재 여부 확인
        const docSnap = await getDoc(ref);
        
        if (!docSnap.exists()) {
          
          // 소유자 프로필에서 aiIntro 가져오기
          let aiIntro = '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!';
          if (profileInfo?.aiIntro) {
            aiIntro = profileInfo.aiIntro;
          } else {
            // profileInfo가 아직 로드되지 않은 경우 직접 조회
            try {
              const ownerProfile = await fetchProfileById(ownerId);
              if (ownerProfile?.aiIntro && String(ownerProfile.aiIntro).trim().length > 0) {
                aiIntro = String(ownerProfile.aiIntro).trim();
              }
            } catch (e) {
            }
          }
          
          // 새 문서 생성 및 AI 인사말을 index 0에 저장
          await setDoc(ref, {
            messages: [aiIntro], // index 0: AI 인사말
            createdAt: new Date(),
            guestId: guestId,
            ownerId: ownerId
          });
        } else {
        }
      } catch (error) {
        // 초기화 실패 시 로컬 인사말이라도 표시
        if (profileInfo?.aiIntro) {
          setMessages([{ id: 'ai_intro', content: profileInfo.aiIntro, sender: 'ai', timestamp: new Date() }]);
        }
      }
    };

    // guestId가 설정된 후에만 초기화 실행
    if (guestId) {
      initializeGuestChat();
    }
  }, [ownerId, guestId, profileInfo?.aiIntro]);

  // 리스너: Firestore 문서 변경 감지
  useEffect(() => {
    if (!ownerId || typeof ownerId !== 'string' || !guestId) {
      return;
    }

    // 인증 상태 확인
    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }

    const ref = chatDocPath();
    if (!ref) {
      return;
    }

    setLoading(true);
    
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const messagesArray = data?.messages || [];
        
        const arr = messagesArray
          .filter((c: any) => c && (typeof c === 'string' ? c.trim() : c?.content?.trim()))
          .map((c: any, idx: number) => {
            // 올바른 인덱싱: 0=AI 인사말, 1=사용자, 2=AI, 3=사용자, 4=AI, ...
            let sender: 'user' | 'ai' = 'ai';
            if (idx === 0) {
              sender = 'ai'; // index 0: AI 인사말
            } else if (idx % 2 === 1) {
              sender = 'user'; // index 1, 3, 5...: 사용자 메시지
            } else {
              sender = 'ai'; // index 2, 4, 6...: AI 답변
            }
            
            return {
              id: `msg_${idx}`,
              content: typeof c === 'string' ? c.trim() : (c?.content?.trim() || ''),
              sender,
              timestamp: new Date(),
            };
          });

        // 중복 메시지 제거: Firestore 데이터를 우선으로 하되, 로컬에만 있는 최신 메시지는 유지
        const currentLocalMessages = messages.filter(msg => msg.id.startsWith('user_'));
        const firestoreUserMessages = arr.filter(msg => msg.sender === 'user');
        
        // Firestore에 있는 사용자 메시지가 더 많으면 Firestore 데이터 사용, 아니면 현재 로컬 상태 유지
        if (firestoreUserMessages.length >= currentLocalMessages.length) {
        } else {
          // 로컬 데이터가 더 최신이면 Firestore 데이터를 로컬 데이터로 교체
          const aiMessages = arr.filter(msg => msg.sender === 'ai');
          const combinedMessages = [...aiMessages, ...currentLocalMessages];
          setMessages(combinedMessages);
          setLoading(false);
          return;
        }

        // 사용자 메시지 개수 계산 (AI 인사말 제외)
        const userMessageCount = arr.filter(msg => msg.sender === 'user').length;
        setMessageCount(userMessageCount);
        
        setMessages(arr);
      } else {
        // 로컬로만 인삿말 표시
        const aiIntro = profileInfo?.aiIntro || '안녕! 나는 개인 AI 아바타 비서야. 궁금한거 있으면 물어봐!';
        setMessages([{ id: 'ai_intro', content: aiIntro, sender: 'ai', timestamp: new Date() }]);
      }
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }, (err) => {
      setLoading(false);
      // 리스너 실패 시 로컬 인사말이라도 표시
      if (profileInfo?.aiIntro) {
        setMessages([{ id: 'ai_intro', content: profileInfo.aiIntro, sender: 'ai', timestamp: new Date() }]);
      }
    });
    return () => unsub();
  }, [ownerId, guestId, profileInfo?.aiIntro]);

  // guestId가 로드된 후 리스너 재시작을 위한 별도 useEffect
  useEffect(() => {
    if (guestId) {
    }
  }, [guestId]);

  const handleResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !ownerId || typeof ownerId !== 'string' || !guestId) return;

    // 횟수 제한 체크
    if (messageCount >= GUEST_MESSAGE_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setIsWaitingForReply(true);
    
    // 로컬 상태에 사용자 메시지 즉시 추가 (UI 반응성 향상)
    const userMessage = { id: `user_${Date.now()}`, content: text, sender: 'user' as const, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // 인증 상태 확인
      const auth = getAuth();
      if (!auth.currentUser) {
        setIsWaitingForReply(false);
        return;
      }

      // Firestore에 사용자 메시지 저장
      const ref = chatDocPath();
      if (ref) {
        try {
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
            const currentMessages = docSnap.data().messages || [];
            // 사용자 메시지를 배열에 추가
            const updatedMessages = [...currentMessages, text];
            await setDoc(ref, { messages: updatedMessages });
          }
        } catch (firestoreError) {
        }
      }

      // POST JSON 방식으로 전송 (AI 답변을 위해)
      const url = 'https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/guestchat/guest';
      const payload = { ownerId, guestId, message: text };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseText = await res.text().catch(() => '');
      
      if (res.ok) {
        try {
          // AI 응답을 JSON으로 파싱
          const responseData = JSON.parse(responseText);
          if (responseData.response) {
            // AI 응답을 Firestore에 저장 시도
            const ref = chatDocPath();
            if (ref) {
              try {
                const docSnap = await getDoc(ref);
                if (docSnap.exists()) {
                  const currentMessages = docSnap.data().messages || [];
                  // AI 응답을 배열에 추가
                  const updatedMessages = [...currentMessages, responseData.response];
                  await setDoc(ref, { messages: updatedMessages });
                }
              } catch (firestoreError) {
                // Firestore 저장 실패해도 로컬 상태에 AI 응답 추가
                const aiMessage = { id: `ai_${Date.now()}`, content: responseData.response, sender: 'ai' as const, timestamp: new Date() };
                setMessages(prev => [...prev, aiMessage]);
              }
            } else {
              // ref가 없어도 로컬 상태에 AI 응답 추가
              const aiMessage = { id: `ai_${Date.now()}`, content: responseData.response, sender: 'ai' as const, timestamp: new Date() };
              setMessages(prev => [...prev, aiMessage]);
            }
          }
        } catch (parseError) {
          // 파싱 실패해도 로컬 상태에 AI 응답 추가
          if (responseText) {
            const aiMessage = { id: `ai_${Date.now()}`, content: responseText, sender: 'ai' as const, timestamp: new Date() };
            setMessages(prev => [...prev, aiMessage]);
          }
        }
      } else {
        
        // 429 에러 (체험 횟수 소진) 처리
        if (res.status === 429) {
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.code === 'GUEST_TRIAL_EXPIRED') {
              setShowLimitModal(true);
              return;
            }
          } catch (parseError) {
          }
        }
      }
    } catch (e) {
    } finally {
      setIsWaitingForReply(false);
    }
  };

  const handleSignUp = () => {
    router.push('/register/login');
  };

  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard}>
        <ChatHeader title="Sound Of Memory" />
        <ProfileSection
          name={profileInfo?.name || '사용자'}
          img={profileInfo?.img}
          tag={profileInfo?.tag}
          isProMode={false}
          showProToggle={false}
          onToggleProMode={() => {}}
        />
        <div style={{ width: '100%', height: '1px', background: '#e0e0e0' }} />
        <MessageList
          loading={loading}
          messages={messages}
          isWaitingForReply={isWaitingForReply}
          profileInfo={profileInfo ? { id: profileInfo.id, name: profileInfo.name, img: profileInfo.img } : undefined}
          scrollRef={scrollRef}
          profileName={profileInfo?.name || ''}
        />
        <ChatInput
          input={input}
          onInputChange={setInput}
          onResize={handleResize}
          onKeyDown={() => {}}
          disabled={isWaitingForReply || messageCount >= GUEST_MESSAGE_LIMIT}
          isWaitingForReply={isWaitingForReply}
          onSend={sendMessage}
          onCancel={() => {}}
          textareaRef={textareaRef}
        />

        {/* 게스트 제한 모달 */}
        <GuestLimitModal
          visible={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onSignUp={handleSignUp}
        />
      </div>
    </div>
  );
}
