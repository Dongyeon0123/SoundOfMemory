import React, { useEffect, useState } from 'react';
import styles from '../styles/styles.module.css';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import {
  fetchProfiles,
  fetchProfileById,
  fetchFriends,
  getReceivedFriendRequests,
  hasSentFriendRequest,
  sendFriendRequest,
  cleanupDuplicateFriendRequests
} from '../types/profiles';

import type { Profile } from '../types/profiles';

import HeaderBar from '../components/home/HeaderBar';
import MyAvatar from '../components/home/MyAvatar';
import FriendsSection from '../components/home/FriendsSection';
import SearchModal from '../components/home/SearchModal';
import FullScreenToggleButton from '../components/home/FullscreenToggleButton';
import NotificationModal from '../components/NotificationModal'; // 공통 컴포넌트

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

  // 인증 상태 감지
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

  // 모든 프로필 불러오기
  useEffect(() => {
    fetchProfiles().then(setProfiles);
  }, []);

  // 전역으로 중복 정리 함수 등록 (개발용)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).cleanupDuplicateFriendRequests = cleanupDuplicateFriendRequests;
    }
  }, []);

  // 친구요청 개수
  useEffect(() => {
    if (userId) {
      const loadPendingRequests = async () => {
        try {
          const requests = await getReceivedFriendRequests(userId);
          const pendingCount = requests.filter(req => req.status === 'pending').length;
          setPendingRequestsCount(pendingCount);
        } catch (err) {
          console.error('친구요청 불러오기 실패', err);
        }
      };

      loadPendingRequests();
      const interval = setInterval(loadPendingRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // 친구 및 요청 상태 확인
  useEffect(() => {
    if (!userId || profiles.length === 0) return;

    const loadFriendsAndRequests = async () => {
      const currentFriends = await fetchFriends(userId);
      setFriends(currentFriends);

      const friendIds = new Set(currentFriends.map(f => f.friendId));
      const requestedSet = new Set<string>();

      for (const profile of profiles) {
        if (profile.id === userId || friendIds.has(profile.id)) continue;
        const hasRequested = await hasSentFriendRequest(userId, profile.id);
        if (hasRequested) {
          requestedSet.add(profile.id);
        }
      }

      setRequestedUsers(requestedSet);
    };

    loadFriendsAndRequests();
    const interval = setInterval(loadFriendsAndRequests, 5000);
    return () => clearInterval(interval);
  }, [userId, profiles]);

  const favorites = friends.filter(f => f.favorite);
  const normalFriends = friends.filter(f => !f.favorite);

  // 친구요청 보내기
  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!userId) {
      setSuccessModal({ show: true, message: '로그인이 필요합니다.', type: 'error' });
      return;
    }

    if (sendingRequests.has(targetUserId)) return;

    setSendingRequests(prev => new Set(prev).add(targetUserId));
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const idToken = await currentUser?.getIdToken();

      const response = await fetch('https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/sendFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: userId,
          targetId: targetUserId
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessModal({ show: true, message: '친구요청이 전송되었습니다!', type: 'success' });
        setRequestedUsers(prev => new Set(prev).add(targetUserId));
      } else {
        setSuccessModal({ show: true, message: result.message || '친구요청 실패', type: 'error' });
      }
    } catch (error) {
      console.error('요청 실패:', error);
      setSuccessModal({ show: true, message: '오류가 발생했습니다.', type: 'error' });
    } finally {
      setSendingRequests(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
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
        {/* 카드/풀화면 버튼 */}
        <FullScreenToggleButton
          isCardMode={isCardMode}
          onToggle={() => setIsCardMode(prev => !prev)}
        />

        {/* 헤더 */}
        <HeaderBar
          userId={userId}
          pendingRequestsCount={pendingRequestsCount}
          onLogout={async () => {
            const auth = getAuth();
            await signOut(auth);
            window.location.reload();
          }}
          onSearchClick={() => setShowSearchModal(true)}
        />

        {/* 본문 */}
        <div className={styles.scrollMain} style={{ paddingTop: 10 }}>
          <MyAvatar loading={loading} userId={userId} myProfile={myProfile} />
          <FriendsSection title="즐겨찾기" friends={favorites} />
          <FriendsSection title="친구" friends={normalFriends} />
        </div>
      </div>

      {/* 검색 모달 */}
      <SearchModal
        visible={showSearchModal}
        search={search}
        setSearch={setSearch}
        profiles={profiles}
        userId={userId}
        requestedUsers={requestedUsers}
        sendingRequests={sendingRequests}
        onClose={() => setShowSearchModal(false)}
        onRequest={handleSendFriendRequest}
      />

      {/* 성공/오류 모달 */}
      <NotificationModal
        show={successModal.show}
        message={successModal.message}
        type={successModal.type}
        onClose={() =>
          setSuccessModal({ show: false, message: '', type: 'success' })
        }
      />
    </div>
  );
};

export default Home;