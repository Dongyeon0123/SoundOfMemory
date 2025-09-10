import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../types/firebase';
import cardStyles from '../../styles/styles.module.css';
import styles from '../../styles/chat.module.css';
import ChatHeader from '../../components/chat/ChatHeader';
import ProfileSection from '../../components/chat/ProfileSection';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';
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

  const chatDocPath = () => {
    if (!ownerId || typeof ownerId !== 'string' || !guestId) return null;
    return doc(db, 'users', ownerId, 'guestchat', `${guestId}_avatar_chat`);
  };

  useEffect(() => {
    setGuestId(getOrCreateGuestId());
  }, []);

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
        }
      } catch (e) {
        console.error('게스트 채팅용 프로필 로드 실패:', e);
      }
    };
    loadOwnerProfile();
  }, [ownerId]);

  // 리스너: 문서가 없으면 로컬 인삿말만 표시 (Firestore 쓰기 금지)
  useEffect(() => {
    if (!ownerId || typeof ownerId !== 'string' || !guestId) {
      console.log('리스너 조건 미충족:', { ownerId, guestId });
      return;
    }
    const ref = chatDocPath();
    if (!ref) {
      console.log('chatDocPath가 null');
      return;
    }

    console.log('게스트 채팅 리스너 시작:', ref.path);
    setLoading(true);
    
    // 즉시 문서 존재 여부 확인
    getDoc(ref).then(docSnap => {
      console.log('초기 문서 상태:', docSnap.exists(), docSnap.data());
    }).catch(err => {
      console.error('초기 문서 조회 실패:', err);
    });
    
    const unsub = onSnapshot(ref, (snap) => {
      console.log('Firestore 문서 변경 감지:', snap.exists(), snap.data());
      if (snap.exists()) {
        const data = snap.data();
        const messagesArray = data?.messages || [];
        console.log('메시지 배열:', messagesArray);
        
        const arr = messagesArray.map((c: any, idx: number) => {
          // Firestore 배열에서 실제 sender 정보가 있으면 사용, 없으면 패턴으로 추정
          let sender = 'user';
          if (typeof c === 'object' && c?.sender) {
            sender = c.sender;
          } else {
            // 패턴: 0=사용자, 1=AI, 2=사용자, 3=AI, ...
            sender = idx % 2 === 0 ? 'user' : 'ai';
          }
          
          return {
            id: `msg_${idx}`,
            content: typeof c === 'string' ? c : c?.content || '',
            sender,
            timestamp: new Date(),
          };
        });
        
        // AI 인삿말을 항상 맨 앞에 추가 (중복 방지)
        if (profileInfo?.aiIntro) {
          const hasAiIntro = arr.some(msg => msg.id === 'ai_intro' || msg.content === profileInfo.aiIntro);
          if (!hasAiIntro) {
            const aiIntro = {
              id: 'ai_intro',
              content: profileInfo.aiIntro,
              sender: 'ai' as const,
              timestamp: new Date(),
            };
            arr.unshift(aiIntro);
          }
        }
        
        console.log('파싱된 메시지들:', arr);
        setMessages(arr);
      } else {
        console.log('문서가 존재하지 않음 - 로컬 인삿말 표시');
        // 로컬로만 인삿말 표시
        if (profileInfo?.aiIntro) {
          setMessages([{ id: 'ai_intro', content: profileInfo.aiIntro, sender: 'ai', timestamp: new Date() }]);
        } else {
          setMessages([]);
        }
      }
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }, (err) => {
      console.error('게스트 채팅 리스너 오류:', err);
      setLoading(false);
    });
    return () => unsub();
  }, [ownerId, guestId, profileInfo?.aiIntro]);

  // guestId가 로드된 후 리스너 재시작을 위한 별도 useEffect
  useEffect(() => {
    if (guestId) {
      console.log('guestId 로드 완료:', guestId);
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

    setIsWaitingForReply(true);
    try {
      // 로컬 낙관적 업데이트 (게스트는 Firestore 직접 쓰지 않음)
      setMessages(prev => [...prev, { id: `user_${Date.now()}`, content: text, sender: 'user', timestamp: new Date() }]);
      setInput('');

      // POST JSON 방식으로 전송
      const url = 'https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/guestchat/guest';
      const payload = { ownerId, guestId, message: text };
      
      console.log('guest POST 요청 파라미터:', payload);
      console.log('guest POST 요청 URL:', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseText = await res.text().catch(() => '');
      
      if (res.ok) {
        console.log('guest 전송 성공:', responseText);
      } else {
        console.error('guest 전송 실패:', res.status, responseText);
      }
    } catch (e) {
      console.error('게스트 메시지 전송 실패:', e);
    } finally {
      setIsWaitingForReply(false);
    }
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
          disabled={isWaitingForReply}
          isWaitingForReply={isWaitingForReply}
          onSend={sendMessage}
          onCancel={() => {}}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}
