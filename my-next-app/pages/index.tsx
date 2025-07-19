import React, { useEffect, useState } from 'react';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import styles from '../styles/styles.module.css';
import Link from 'next/link';
import { fetchProfiles, fetchProfileById, Profile, sendFriendRequest, getReceivedFriendRequests, hasSentFriendRequest, cleanupDuplicateFriendRequests, fetchFriends, toggleFavorite } from '../profiles';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import NotificationModal from '../components/NotificationModal';
import { useRouter } from 'next/router';

const ICON_SIZE = 20;

const Home: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isCardMode, setIsCardMode] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [requestedUsers, setRequestedUsers] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Firebase Auth 사용자:', user);
        console.log('Firebase Auth UID:', user.uid);
        setUserId(user.uid);
        const profile = await fetchProfileById(user.uid);
        console.log('가져온 프로필:', profile);
        setMyProfile(profile);
      } else {
        setUserId(null);
        setMyProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProfiles().then(setProfiles);
  }, []);

  // 전역에서 중복 정리 함수 사용 가능하도록 설정 (개발용)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).cleanupDuplicateFriendRequests = cleanupDuplicateFriendRequests;
      console.log('중복 친구요청 정리 함수가 전역에서 사용 가능합니다: window.cleanupDuplicateFriendRequests()');
    }
  }, []);

  // 친구요청 개수 가져오기
  useEffect(() => {
    if (userId) {
      const loadPendingRequests = async () => {
        try {
          console.log('친구요청 개수 조회 시작:', userId);
          const requests = await getReceivedFriendRequests(userId);
          console.log('받은 친구요청들:', requests);
          const pendingCount = requests.filter(req => req.status === 'pending').length;
          console.log('대기 중인 친구요청 개수:', pendingCount);
          setPendingRequestsCount(pendingCount);
        } catch (error) {
          console.error('친구요청 개수 로딩 실패:', error);
        }
      };
      
      loadPendingRequests();
      // 실시간 업데이트를 위해 주기적으로 체크 (5초마다)
      const interval = setInterval(loadPendingRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // 친구요청 상태 확인
  useEffect(() => {
    if (userId && profiles.length > 0) {
      const checkRequestStatus = async () => {
        console.log('친구요청 상태 확인 시작');
        const requestedSet = new Set<string>();
        
        for (const profile of profiles) {
          if (profile.id !== userId) {
            // 보낸 친구요청이 있는지 확인 (pending 상태만)
            const hasRequested = await hasSentFriendRequest(userId, profile.id);
            console.log(`사용자 ${profile.name}(${profile.id})에게 보낸 요청:`, hasRequested);
            
            if (hasRequested) {
              requestedSet.add(profile.id);
            }
          }
        }
        
        console.log('요청 완료된 사용자들:', Array.from(requestedSet));
        setRequestedUsers(requestedSet);
      };
      
      checkRequestStatus();
      
      // 실시간 업데이트를 위해 주기적으로 체크 (10초마다)
      const interval = setInterval(checkRequestStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [userId, profiles]);

  useEffect(() => {
    if (userId) {
      fetchFriends(userId).then(setFriends);
    }
  }, [userId]);

  const favorites = friends.filter(f => f.favorite);
  const normalFriends = friends.filter(f => !f.favorite);

  // 친구요청 보내기 함수
  const handleSendFriendRequest = async (targetUserId: string) => {
    console.log('친구요청 보내기 시작:', { userId, targetUserId });
    
    if (!userId) {
      setSuccessModal({ show: true, message: '로그인이 필요합니다.', type: 'error' });
      return;
    }

    if (sendingRequests.has(targetUserId)) {
      return; // 이미 요청 중이면 중복 방지
    }

    setSendingRequests(prev => new Set(prev).add(targetUserId));

    try {
      console.log('Cloud Function 호출:', { fromUserId: userId, toUserId: targetUserId });
      
      // Firebase Auth 토큰 가져오기
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('사용자 인증 정보가 없습니다.');
      }
      
      const idToken = await currentUser.getIdToken();
      console.log('Firebase ID 토큰 획득 완료');
      
      // Cloud Function 호출
      const response = await fetch('https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/sendFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: userId,        // 요청하는 사람
          targetId: targetUserId // 받는사람
        }),
      });

      const result = await response.json();
      console.log('Cloud Function 응답:', result);
      
      if (response.ok && result.success) {
        setSuccessModal({ show: true, message: '친구요청이 전송되었습니다!', type: 'success' });
        // 요청 완료된 유저를 requestedUsers에 추가
        setRequestedUsers(prev => new Set(prev).add(targetUserId));
        console.log('친구요청 상태 업데이트 완료:', targetUserId);
      } else {
        setSuccessModal({ show: true, message: result.message || '친구요청 전송에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      console.error('친구요청 전송 오류:', error);
      setSuccessModal({ show: true, message: '친구요청 전송 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  return (
    <div className={styles.fullContainer}>
      <div
        className={
          isCardMode
            ? `${styles.centerCard} ${styles.cardMode}`
            : styles.centerCard
        }
        style={{ position: 'relative', overflow: 'visible' }}
      >
        {/* 카드/풀화면 전환 버튼 */}
        <button
          onClick={() => setIsCardMode((v) => !v)}
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            zIndex: 100,
            background: '#636AE8',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            fontWeight: 700,
            fontSize: 17,
            cursor: 'pointer',
            boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)',
            transition: 'background 0.18s',
            letterSpacing: '-1px',
          }}
        >
          {isCardMode ? '풀화면으로' : '카드형으로'}
        </button>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div className={styles.headerContent}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="logo" width={60} height={60} />
            </Link>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
              <div className={styles.icon} style={{ marginTop: 30 }}>
                <FiSearch size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} onClick={() => setShowSearchModal(true)} />
                <IoNotificationsOutline size={ICON_SIZE} color="#222" />
                <Link href="/friend/requests" style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                  <FaUser size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} />
                  {pendingRequestsCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      background: '#FF4757',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      border: '2px solid #fff',
                      minWidth: 18,
                    }}>
                      {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                    </div>
                  )}
                </Link>
                <FiSettings size={ICON_SIZE} color="#222" />
              </div>
              {userId ? (
                <button
                  onClick={async () => {
                    const auth = getAuth();
                    await signOut(auth);
                    window.location.reload();
                  }}
                  style={{
                    background: '#fff',
                    color: '#636AE8',
                    border: '1.5px solid #636AE8',
                    borderRadius: 6,
                    padding: '6px 18px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginTop: 2
                  }}
                >
                  로그아웃
                </button>
              ) : (
                <Link href="/register/login" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      background: '#fff',
                      color: '#636AE8',
                      border: '1.5px solid #636AE8',
                      borderRadius: 6,
                      padding: '6px 18px',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      marginTop: 10
                    }}
                  >
                    로그인
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain} style={{ paddingTop: 10 }}>
          {/* 나의 아바타 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle} style={{ marginBottom: 8 }}>나의 아바타</h4>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#636AE8', margin: 24 }}>불러오는 중...</div>
            ) : userId && myProfile ? (
              <Link href={`/profile/${myProfile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.HomeAvatarWrap}>
                    <img src={myProfile.img} alt={myProfile.name} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{myProfile.name}</span>
                </div>
              </Link>
            ) : (
              <div style={{ textAlign: 'center', color: '#888', margin: 24, fontSize: 16 }}>
                로그인 후 나의 아바타가 표시됩니다. <Link href="/register/login" style={{ color: '#636AE8', textDecoration: 'underline', marginLeft: 4 }}>로그인 하러가기</Link>
              </div>
            )}
          </div>
          {/* 즐겨찾기 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>즐겨찾기</h4>
            {favorites.map(friend => (
              <Link href={`/profile/${friend.id}`} key={friend.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.HomeAvatarWrap}>
                    <img src={friend.friendAvatar} alt={friend.friendName} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{friend.friendName}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* 친구 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>친구</h4>
            {normalFriends.map(friend => (
              <Link href={`/profile/${friend.id}`} key={friend.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.HomeAvatarWrap}>
                    <img src={friend.friendAvatar} alt={friend.friendName} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{friend.friendName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* 검색 모달을 카드 바깥, 전체 화면에 렌더링 */}
      {showSearchModal && (
        <div style={{
          position: 'fixed',
          left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(99,106,232,0.08)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, padding: '32px 28px 24px 28px', minWidth: 340, boxShadow: '0 8px 32px 0 rgba(99,106,232,0.13)', display: 'flex', flexDirection: 'column', gap: 18,
            maxWidth: '80%', width: '80%', position: 'relative',
          }}>
            <img src="/char.png" alt="캐릭터" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 8px auto', display: 'block', boxShadow: '0 2px 8px 0 rgba(99,106,232,0.10)' }} />
            <div style={{ textAlign: 'center', color: '#636AE8', fontWeight: 800, fontSize: 18, marginBottom: 6, letterSpacing: '-1px' }}>
              친구를 찾아보세요!
            </div>
            <button onClick={() => { setShowSearchModal(false); setSearch(''); }}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#636AE8', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}
              aria-label="닫기"
            >×</button>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#636AE8', textAlign: 'center', letterSpacing: '-1px', marginBottom: 8 }}>유저 검색</h3>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이름을 입력하세요"
              style={{ fontSize: 17, padding: '13px 14px', borderRadius: 10, border: '2px solid #636AE8', marginBottom: 8, outline: 'none', boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)', fontWeight: 500, color: '#222', background: '#f7f8fa', transition: 'border 0.18s' }}
              autoFocus
            />
            <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profiles
                .filter(p => search && p.name && p.name.includes(search) && p.id !== userId) // 나 자신 제외
                .map(p => (
                  <div key={p.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 8px', borderRadius: 10, background: '#f7f8fa', transition: 'background 0.18s', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.background = '#e6eaff'}
                    onMouseOut={e => e.currentTarget.style.background = '#f7f8fa'}
                    onClick={e => {
                      // 버튼 클릭 시에는 프로필 이동 막기
                      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                      router.push(`/profile/${p.id}`);
                      setShowSearchModal(false);
                    }}
                  >
                    <img src={p.img} alt={p.name} width={40} height={40} style={{ borderRadius: '50%', border: '2px solid #eee', background: '#fff' }} />
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#222' }}>{p.name}</span>
                    <button
                      style={{
                        marginLeft: 'auto', 
                        background: requestedUsers.has(p.id) ? '#E0E0E0' : '#636AE8', 
                        color: requestedUsers.has(p.id) ? '#666' : '#fff', 
                        border: 'none', 
                        borderRadius: 7, 
                        padding: '7px 18px', 
                        fontWeight: 700, 
                        fontSize: 15, 
                        cursor: requestedUsers.has(p.id) ? 'default' : 'pointer', 
                        boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)', 
                        transition: 'background 0.18s',
                        opacity: requestedUsers.has(p.id) ? 0.7 : 1,
                        pointerEvents: requestedUsers.has(p.id) ? 'none' : 'auto',
                      }}
                      onMouseOver={e => {
                        if (!requestedUsers.has(p.id)) {
                          e.currentTarget.style.background = '#4850E4';
                        }
                      }}
                      onMouseOut={e => {
                        if (!requestedUsers.has(p.id)) {
                          e.currentTarget.style.background = '#636AE8';
                        }
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        if (!requestedUsers.has(p.id)) handleSendFriendRequest(p.id);
                      }}
                      disabled={sendingRequests.has(p.id) || requestedUsers.has(p.id)}
                    >
                      {sendingRequests.has(p.id) ? '요청중...' : 
                       requestedUsers.has(p.id) ? '요청됨' : '친구추가'}
                    </button>
                  </div>
                ))}
              {search && profiles.filter(p => p.name && p.name.includes(search) && p.id !== userId).length === 0 && (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 18, fontWeight: 600 }}>검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 성공/실패 모달 */}
      <NotificationModal
        show={successModal.show}
        message={successModal.message}
        type={successModal.type}
        onClose={() => setSuccessModal({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
};

export default Home;