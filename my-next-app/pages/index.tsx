import React, { useEffect, useState } from 'react';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import styles from '../styles/styles.module.css';
import Link from 'next/link';
import { fetchProfiles, fetchProfileById, Profile } from '../profiles';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const ICON_SIZE = 20;

const Home: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isCardMode, setIsCardMode] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const profile = await fetchProfileById(user.uid);
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

  // Firestore에서 불러온 데이터로 favorites, friends 분류
  const favorites: Profile[] = profiles.filter(p => p.id === '3');
  const friends: Profile[] = profiles.filter(p => ['2', '4', '5', '6'].includes(p.id));

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
                <Link href="/friend-requests" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FaUser size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} />
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
                    <img src={friend.img} alt={friend.name} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{friend.name}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* 친구 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>친구</h4>
            {friends.map(friend => (
              <Link href={`/profile/${friend.id}`} key={friend.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.HomeAvatarWrap}>
                    <img src={friend.img} alt={friend.name} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{friend.name}</span>
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
                .filter(p => search && p.name && p.name.includes(search))
                .map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 8px', borderRadius: 10, background: '#f7f8fa', transition: 'background 0.18s', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.background = '#e6eaff'}
                    onMouseOut={e => e.currentTarget.style.background = '#f7f8fa'}
                  >
                    <img src={p.img} alt={p.name} width={40} height={40} style={{ borderRadius: '50%', border: '2px solid #eee', background: '#fff' }} />
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#222' }}>{p.name}</span>
                    <button
                      style={{
                        marginLeft: 'auto', background: '#636AE8', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)', transition: 'background 0.18s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#4850E4'}
                      onMouseOut={e => e.currentTarget.style.background = '#636AE8'}
                      // onClick={...친구추가 로직}
                    >
                      친구추가
                    </button>
                  </div>
                ))}
              {search && profiles.filter(p => p.name && p.name.includes(search)).length === 0 && (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 18, fontWeight: 600 }}>검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;