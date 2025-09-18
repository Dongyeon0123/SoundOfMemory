import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { fetchProfileById, updateProfileField, fetchFriends, toggleFavorite, fetchUserChatTopics, fetchSelectedChatTopics } from '../../types/profiles';
import type { Profile, ChatTopic } from '../../types/profiles';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

import styles from '../../styles/styles.module.css';
import profileStyles from '../../styles/profile.module.css';

import MBTIModal from '../../components/profile/modal/MBTIModal';
import IntroduceModal from '../../components/profile/modal/IntroduceModal';
import HistoryModal from '../../components/profile/modal/HistoryModal';
import CareerModal from '../../components/profile/modal/CareerModal';
import SuccessFailModal from '../../components/profile/modal/SuccessFailModal';
import QRCodeModal from '../../components/profile/modal/QRCodeModal';
import LoginRequiredModal from '../../components/profile/modal/LoginRequiredModal';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileImages from '../../components/profile/ProfileImages';
import ProfileBasicInfo from '../../components/profile/ProfileBasicInfo';
import ProfileActionButton from '../../components/profile/ProfileActionButton';
import ProfileLinks from '../../components/profile/ProfileLinks';
import {
  ProfileMBTIBox,
  ProfileIntroduceBox,
  ProfileHistoryBox,
  ProfileCareerBox,
} from '../../components/profile/ProfileDetailsBoxes';

const ICON_SIZE = 24;

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUid, setMyUid] = useState<string | null>(null);

  const [isFriend, setIsFriend] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // 모달 상태
  const [showMBTIModal, setShowMBTIModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalAction, setLoginModalAction] = useState('');

  // 성공/실패 모달 상태
  const [modal, setModal] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // 프로필 상세 상태
  const [mbti, setMbti] = useState<string | undefined>(undefined);
  const [introduce, setIntroduce] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<any[]>([]);
  const [career, setCareer] = useState<any[]>([]);

  // 채팅 주제 데이터
  const [chatTopics, setChatTopics] = useState<ChatTopic[]>([]);
  
  // 선택된 채팅 주제들
  const [selectedChatTopics, setSelectedChatTopics] = useState<string[]>([]);

  // 내 프로필 여부
  const isMyProfile = myUid && id === myUid;

  // 파이어베이스 인증 구독 및 내 UID 설정
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setMyUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // 프로필 수정 페이지로 이동
  const handleEditProfile = () => {
    if (myUid === id && typeof id === 'string') {
      router.push(`/profile/${id}/profileEdit`);
    } else {
      setModal({ show: true, message: '자신의 프로필만 수정할 수 있습니다.', type: 'error' });
    }
  };  

  // 프로필 데이터 로딩
  useEffect(() => {
    if (typeof id === 'string') {
      setLoading(true);
      fetchProfileById(id).then((profile) => {
        setProfile(profile);
        setLoading(false);
      });
      
      // 채팅 주제 데이터도 함께 불러오기
      fetchUserChatTopics(id).then(topics => {
        setChatTopics(topics);
      });
      
      // 선택된 채팅 주제 불러오기
      fetchSelectedChatTopics(id).then(selectedTopics => {
        console.log('fetchSelectedChatTopics 결과:', selectedTopics);
        setSelectedChatTopics(selectedTopics);
      }).catch(error => {
        console.error('fetchSelectedChatTopics 에러:', error);
        setSelectedChatTopics([]);
      });
    }
  }, [id]);

  // 친구 및 즐겨찾기 상태 조회 (본인 프로필 제외)
  useEffect(() => {
    if (myUid && id && typeof id === 'string' && myUid !== id) {
      fetchFriends(myUid).then((friends) => {
        const friend = friends.find((f) => f.friendId === id);
        setIsFriend(!!friend);
        setIsFavorite(!!friend && !!friend.favorite);
      });
    }
  }, [myUid, id]);

  // 프로필 상태 변화에 따른 상세 상태 값 동기화
  useEffect(() => {
    setMbti(profile?.mbti);
    setIntroduce(profile?.introduce);
    setHistory(profile?.history ?? []);
    setCareer(profile?.career ?? []);
  }, [profile]);

  // 선택된 채팅 주제만 태그에 추가
  const combinedTags = React.useMemo(() => {
    console.log('selectedChatTopics:', selectedChatTopics);
    console.log('profile.tag:', profile?.tag);
    
    // 기존 tag 필드와 선택된 채팅 주제를 합침
    const existingTags = profile?.tag || [];
    const chatTopicTags = selectedChatTopics || [];
    
    // 중복 제거하여 합치기
    const allTags = [...new Set([...existingTags, ...chatTopicTags])];
    console.log('combinedTags:', allTags);
    
    return allTags;
  }, [selectedChatTopics, profile?.tag]);

  // 로그인 체크 함수
  const requireLogin = (actionName: string) => {
    if (!myUid) {
      setLoginModalAction(actionName);
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // 친구 요청 전송 핸들러
  const handleSendFriendRequest = async () => {
    if (!requireLogin('친구 추가')) return;
    if (!myUid || !id || typeof id !== 'string') return;
    setRequesting(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setModal({ show: true, message: '로그인이 필요합니다.', type: 'error' });
        setRequesting(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(
        'https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/sendFriendRequest',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            userId: myUid,
            targetId: id,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setRequestSent(true);
        setModal({ show: true, message: '친구요청이 전송되었습니다!', type: 'success' });
      } else {
        if (result.message === 'Friend request already exists') {
          setModal({ show: true, message: '이미 친구 요청을 보낸 대상입니다.', type: 'error' });
        } else {
          setModal({ show: true, message: result.message || '친구요청 실패', type: 'error' });
        }
      }
    } catch (e: any) {
      setModal({ show: true, message: e?.message || '친구요청 전송 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async () => {
    if (!requireLogin('즐겨찾기')) return;
    if (!myUid || !id || typeof id !== 'string') return;
    try {
      await toggleFavorite(myUid, id, !isFavorite);
      setIsFavorite(!isFavorite);
    } catch (e) {
      setModal({ show: true, message: '즐겨찾기 변경 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  // Firestore 업데이트 핸들러들
  const handleSaveMbti = (newMbti: string) => {
    setMbti(newMbti);
    if (profile) updateProfileField(profile.id, { mbti: newMbti });
  };
  const handleSaveIntroduce = (newIntro: string) => {
    setIntroduce(newIntro);
    if (profile) updateProfileField(profile.id, { introduce: newIntro });
  };
  const handleSaveHistory = (newHistory: any[]) => {
    setHistory(newHistory);
    if (profile) updateProfileField(profile.id, { history: newHistory });
  };
  const handleSaveCareer = (newCareer: any[]) => {
    setCareer(newCareer);
    if (profile) updateProfileField(profile.id, { career: newCareer });
  };

  if (loading)
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard}>
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              background: '#ffffff',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* 배경 애니메이션 */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(99, 106, 232, 0.1) 0%, transparent 70%)',
              animation: 'pulse 3s ease-in-out infinite'
            }} />
            
            {/* 메인 로딩 컨텐츠 */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24
            }}>
              {/* 커스텀 스피너 */}
              <div style={{
                position: 'relative',
                width: 80,
                height: 80
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '4px solid rgba(99, 106, 232, 0.1)',
                  borderTop: '4px solid #636AE8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  width: 'calc(100% - 16px)',
                  height: 'calc(100% - 16px)',
                  border: '2px solid rgba(99, 106, 232, 0.1)',
                  borderTop: '2px solid #257EFE',
                  borderRadius: '50%',
                  animation: 'spin 1.5s linear infinite reverse'
                }} />
              </div>
              
              {/* 로딩 텍스트 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{ 
                  fontSize: 20, 
                  color: '#636AE8', 
                  fontWeight: 700,
                  letterSpacing: '-0.5px'
                }}>
                  프로필을 불러오는 중
                </div>
                <div style={{
                  fontSize: 14,
                  color: '#8B94A5',
                  fontWeight: 500
                }}>
                  잠시만 기다려주세요...
                </div>
              </div>
              
              {/* 점 애니메이션 */}
              <div style={{
                display: 'flex',
                gap: 4
              }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: '#636AE8',
                      borderRadius: '50%',
                      animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* CSS 애니메이션 */}
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.1); opacity: 0.8; }
              }
              @keyframes bounce {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1.2); opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      </div>
    );

  if (!profile) return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={profileStyles.profileFixedHeader}>
          <ProfileHeader
            isMyProfile={!!isMyProfile}
            onBack={() => router.back()}
            isFriend={isFriend}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onEditProfile={handleEditProfile}
            onScan={() => {
              /* 필요 시 구현 */
            }}
            onShowQR={() => setShowQRModal(true)}
            onEditMBTI={() => setShowMBTIModal(true)}
            onEditIntroduce={() => setShowIntroModal(true)}
            onEditHistory={() => setShowHistoryModal(true)}
            onEditCareer={() => setShowCareerModal(true)}
            onBlock={() => {
              if (requireLogin('차단')) {
                // 차단 로직 구현
                console.log('차단 기능 구현 필요');
              }
            }}
            onReport={() => {
              if (requireLogin('신고')) {
                // 신고 로직 구현
                console.log('신고 기능 구현 필요');
              }
            }}
          />
        </div>

        {/* 본문 */}
        <div className={`${styles.scrollMain} ${styles.scrollMainProfile}`}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ProfileImages 
              backgroundImg={profile.backgroundImg} 
              img={profile.img} 
              name={profile.name}
              desc={profile.desc}
              mbti={mbti}
              tag={combinedTags}
            />

            {/* ProfileBasicInfo는 반투명 카드로 이동하여 제거 */}

            <ProfileLinks socialLinks={profile.socialLinks} />

            <ProfileActionButton
              isMyProfile={!!isMyProfile}
              isFriend={isFriend}
              requestSent={requestSent}
              requesting={requesting}
              profileId={profile.id}
              onSendFriendRequest={handleSendFriendRequest}
            />

            {/* 대화하기와 소개 사이 그레이 라인 */}
            <div className={styles.grayLine} style={{ marginTop: 30, marginBottom: 20, width: '95%', height: 2 }}></div>

            {/* MBTI는 반투명 카드로 이동하여 제거 */}

            <ProfileIntroduceBox
              introduce={introduce}
              isMyProfile={!!isMyProfile}
              onEdit={() => setShowIntroModal(true)}
            />
            {isMyProfile && showIntroModal && (
              <IntroduceModal
                currentIntroduce={introduce}
                onClose={() => setShowIntroModal(false)}
                onSave={handleSaveIntroduce}
              />
            )}

            <ProfileHistoryBox history={history} isMyProfile={!!isMyProfile} onEdit={() => setShowHistoryModal(true)} />
            {isMyProfile && (
              <HistoryModal
                open={showHistoryModal}
                items={history}
                onClose={() => setShowHistoryModal(false)}
                onSave={handleSaveHistory}
              />
            )}

            <ProfileCareerBox career={career} isMyProfile={!!isMyProfile} onEdit={() => setShowCareerModal(true)} />
            {isMyProfile && (
              <CareerModal
                open={showCareerModal}
                items={career}
                onClose={() => setShowCareerModal(false)}
                onSave={handleSaveCareer}
              />
            )}
          </div>
        </div>
      </div>

      {/* 성공/실패 모달 */}
      <SuccessFailModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, show: false })}
      />

      {/* QR 코드 모달 */}
      <QRCodeModal
        visible={showQRModal}
        profileUrl={typeof window !== 'undefined' ? window.location.href : `https://soundofmemory.com/profile/${id}`}
        userName={profile?.name || '사용자'}
        userId={profile?.id || ''}
        onClose={() => setShowQRModal(false)}
      />

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        visible={showLoginModal}
        actionName={loginModalAction}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export async function getServerSideProps() {
  return { props: {} };
}

export default ProfilePage;
