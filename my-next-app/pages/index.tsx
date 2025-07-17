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
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div className={styles.headerContent}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="logo" width={60} height={60} />
            </Link>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              {userId && (
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
                    marginRight: 8
                  }}
                >
                  로그아웃
                </button>
              )}
              <div className={styles.icon}>
                <FiSearch size={ICON_SIZE} color="#222" />
                <IoNotificationsOutline size={ICON_SIZE} color="#222" />
                <Link href="/friend-requests" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FaUser size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} />
                </Link>
                <FiSettings size={ICON_SIZE} color="#222" />
              </div>
            </div>
          </div>
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain}>
          {/* 나의 아바타 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>나의 아바타</h4>
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
              <div style={{ textAlign: 'center', color: '#888', margin: 24 }}>
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
    </div>
  );
};

export default Home;