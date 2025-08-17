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
import { getAnnouncementsWithReadStatus } from '../types/announcements';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../types/firebase';

import type { Profile } from '../types/profiles';

import HeaderBar from '../components/home/HeaderBar';
import MyAvatar from '../components/home/MyAvatar';
import FriendsSection from '../components/home/FriendsSection';
import SearchModal from '../components/home/SearchModal';
import FullScreenToggleButton from '../components/home/FullScreenToggleButton';
import NotificationModal from '../components/NotificationModal';

const Home: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isCardMode, setIsCardMode] = useState(true); // 기본값을 true로 변경
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [requestedUsers, setRequestedUsers] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<any[]>([]);

  const router = useRouter();

  // 화면 크기에 따라 카드 모드 자동 설정
  useEffect(() => {
    const handleResize = () => {
      // 모든 화면 크기에서 카드형 유지
      setIsCardMode(true);
    };

    // 초기 설정
    handleResize();
    
    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 인증 상태 감지
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const profile = await fetchProfileById(user.uid);
        setMyProfile(profile);
        
        // 프로필이 없거나 온보딩이 완료되지 않은 경우 온보딩 페이지로 리다이렉트
        if (!profile || !profile.name || profile.desc === '@온보딩사용자') {
          router.push('/test-onboarding');
          return;
        }
        
        // 온보딩이 완료된 경우에만 홈 페이지 표시
        if (profile.desc === '@온보딩완료' || profile.desc !== '@온보딩사용자') {
          setLoading(false);
        }
      } else {
        setUserId(null);
        setMyProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 모든 프로필 실시간 불러오기
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const profilesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Profile[];
      setProfiles(profilesData);
    }, (error) => {
      console.error("프로필 실시간 업데이트 실패:", error);
    });

    return () => unsubscribe();
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

  // 읽지 않은 알림 개수
  useEffect(() => {
    if (userId) {
      const loadUnreadAnnouncements = async () => {
        try {
          const announcements = await getAnnouncementsWithReadStatus(userId);
          const unreadCount = announcements.filter(announcement => !announcement.isRead).length;
          setUnreadAnnouncementsCount(unreadCount);
        } catch (err) {
          console.error('알림 개수 불러오기 실패', err);
        }
      };

      loadUnreadAnnouncements();
      const interval = setInterval(loadUnreadAnnouncements, 10000); // 10초마다 업데이트
      return () => clearInterval(interval);
    }
  }, [userId]);

  // 친구 및 요청 상태 확인
  useEffect(() => {
    if (!userId || profiles.length === 0) return;

    const loadFriendsAndRequests = async () => {
      const currentFriends = await fetchFriends(userId);
      
      // 친구 데이터에 프로필 정보 추가
      const friendsWithProfiles = currentFriends.map(friend => {
        const profile = profiles.find(p => p.id === friend.friendId);
        return {
          ...friend,
          friendName: profile?.name || friend.friendName || 'Unknown',
          friendAvatar: profile?.img || friend.friendAvatar || '/chat/profile.png',
        };
      });
      
      setFriends(friendsWithProfiles);

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
      if (!currentUser) {
        setSuccessModal({ show: true, message: '인증 정보가 없습니다. 다시 로그인 해주세요.', type: 'error' });
        return;
      }
      const idToken = await currentUser.getIdToken();

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
        console.error('친구요청 실패:', result);
        setSuccessModal({ show: true, message: result.message || '친구요청 실패', type: 'error' });
      }
    } catch (error) {
      console.error('요청 실패:', error);
      setSuccessModal({ show: true, message: error?.message || '오류가 발생했습니다.', type: 'error' });
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
          unreadAnnouncementsCount={unreadAnnouncementsCount}
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
          <FriendsSection title="즐겨찾기" friends={favorites} loading={loading} />
          <FriendsSection title="친구" friends={normalFriends} loading={loading} />
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