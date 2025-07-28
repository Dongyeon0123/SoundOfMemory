import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { fetchProfileById, updateProfileField } from '../../../types/profiles';
import type { Profile } from '../../../types/profiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import styles from '../../../styles/styles.module.css';
import profileStyles from '../../../styles/profile.module.css';

import SuccessFailModal from '../../../components/profile/modal/SuccessFailModal';
import SocialModal from '../../../components/profile/modal/SocialModal';

import { FiEdit2 } from 'react-icons/fi';

const ICON_SIZE = 24;

const ProfileEditPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [modal, setModal] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const [showSocialModal, setShowSocialModal] = useState(false);

  // 권한 체크
  const isMyProfile = myUid && id === myUid;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setMyUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof id === 'string') {
      setLoading(true);
      fetchProfileById(id).then(profileObj => {
        setProfile(profileObj);
        setLoading(false);
      });
    }
  }, [id]);

  // 각각 소셜 링크 필드만 추출해 선택 배열로 변환 (초기값)
  const initialSelectedSocial = React.useMemo(() => {
    if (!profile) return [];
    return Object.entries(profile)
      .filter(([key, value]) => key.endsWith('Url') || key === 'email')
      .filter(([key, value]) => !!value)
      .map(([key]) => key);
  }, [profile]);

  // 저장 시 소셜모달에서 선택한 링크 키 목록
  const [selectedSocial, setSelectedSocial] = useState<string[]>(initialSelectedSocial);

  // 초기값 세팅 (선택 상태 동기화)
  useEffect(() => {
    setSelectedSocial(initialSelectedSocial);
  }, [initialSelectedSocial]);

  // 개별 필드용 상태 추천(생략: profile 직접 값 사용도 가능)
  // 혹은 필요하면 각 필드별 분리 상태 관리

  // Profile 객체 업데이트 헬퍼 (필드와 값 동기화)
  const handleUpdateProfileField = (field: keyof Profile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // 저장 함수 (모달에서 선택한 소셜 링크 키를 기준으로 빈 값은 ''로 세팅)
  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      // SocialLinks 중 선택한 것만 실제 프로필 필드 유지, 나머지는 빈 문자열 처리
      const updatedSocialFields = Object.keys(profile).reduce((acc, key) => {
        if ((key.endsWith('Url') || key === 'email') && !selectedSocial.includes(key)) {
          acc[key] = ''; // 선택하지 않은 소셜 링크는 빈 값으로
        }
        return acc;
      }, {} as Partial<Profile>);

      await updateProfileField(profile.id, {
        ...profile,
        ...updatedSocialFields,
      });

      setModal({ show: true, message: '프로필이 성공적으로 저장되었습니다.', type: 'success' });
      setShowSocialModal(false);
    } catch (e: any) {
      setModal({ show: true, message: '프로필 저장 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  if (!isMyProfile) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard} style={{ padding: 24, textAlign: 'center', color: '#E53935' }}>
          <h2>접근 권한이 없습니다.</h2>
          <p>본인만 자신의 프로필을 수정할 수 있습니다.</p>
          {id && (
            <Link href={`/profile/${id}`}>
              <span style={{ color: '#636AE8', textDecoration: 'underline', cursor: 'pointer' }}>
                프로필 페이지로 돌아가기
              </span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
          }}>
            <div className="spinner" style={{ marginBottom: 18 }} />
            <div style={{ fontSize: 18, color: '#636AE8', fontWeight: 600 }}>로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 상단 헤더 */}
        <div className={profileStyles.profileFixedHeader}>
          <div style={{ position: 'relative', justifyContent: 'center', display: 'flex', alignItems: 'center', height: 120 }}>
            <button
              onClick={() => router.back()}
              style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              aria-label="뒤로가기"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{ fontWeight: 700, fontSize: 18 }}>프로필 편집</span>
            <button
              onClick={handleSaveProfile}
              style={{
                position: 'absolute', right: 16, top: '50%',
                transform: 'translateY(-50%)',
                background: '#636AE8', color: '#fff', border: 'none', borderRadius: 6,
                padding: '7px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer'
              }}
            >
              저장
            </button>
          </div>
        </div>

        <div className={`${styles.scrollMain} ${styles.scrollMainProfile}`}>
          {/* 헤더 바로 아래 : 배경 이미지 */}
          {profile?.backgroundImg && (
            <div
              style={{
                width: '100%',
                height: '100px',
                background: '#f2f3fa',
                position: 'relative',
                padding: 0,
                marginBottom: 30,
              }}
            >
              <img
                src={profile.backgroundImg}
                alt="배경 이미지"
                style={{
                  width: '100%',
                  height: '100%',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
          </div>          
          )}

          {/* 프로필 이미지 + 이름 / 직업 / AI 소개 입력 박스 */}
          <div className={profileStyles.profileLine}>
            <div className={profileStyles.profileImageWrapper}>
              <img
                src={profile.img || '/chat/profile.png'}
                alt={profile.name}
              />
            </div>

            <div className={profileStyles.inputGroup}>
              {/* 이름 */}
              <label htmlFor="nameInput" className={profileStyles.inputLabel}>이름</label>
              <input
                id="nameInput"
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => prev ? { ...prev, name: e.target.value } : prev)}
                placeholder="이름을 입력하세요"
                className={profileStyles.inputField}
              />

              {/* 직업 */}
              <label htmlFor="descInput" className={profileStyles.inputLabel} style={{ marginTop: 16 }}>
                직업
              </label>
              <input
                id="descInput"
                type="text"
                value={profile.desc}
                onChange={e => setProfile(prev => prev ? { ...prev, desc: e.target.value } : prev)}
                placeholder="직업을 입력해주세요"
                className={profileStyles.inputField}
              />

              {/* AI 소개 */}
              <label htmlFor="aiIntroInput" className={profileStyles.inputLabel} style={{ marginTop: 16 }}>
                AI 인사말
              </label>
              <input
                id="aiIntroInput"
                type="text"
                value={profile.aiIntro}
                onChange={e => setProfile(prev => prev ? { ...prev, aiIntro: e.target.value } : prev)}
                placeholder="AI 소개말을 입력해주세요."
                className={profileStyles.inputField}
              />
            </div>
          </div>

          {/* 소셜링크 그룹 — 연필 아이콘과 모달 띄우기 */}
          <div className={profileStyles.profileLine}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>소셜링크</div>
              <FiEdit2 size={24} color="#222" style={{ cursor: 'pointer' }} onClick={() => setShowSocialModal(true)} />
            </div>

            {/* 소셜 인풋들은 선택된 링크에 따라 conditionally 렌더링하거나 기본 UI 유지 */}
            {/* 예를 들어, 단순히 모두 보여줄 수도 있음 */}

            {/* 전화번호 */}
            <label htmlFor="numberInput" className={profileStyles.inputLabel}>전화번호</label>
            <input
              id="numberInput"
              type="text"
              value={profile.number || ''}
              onChange={e => setProfile(prev => prev ? { ...prev, number: e.target.value } : prev)}
              placeholder="전화번호 입력"
              className={profileStyles.inputField}
            />

            {/* 이메일 */}
            <label htmlFor="emailInput" className={profileStyles.inputLabel}>이메일</label>
            <input
              id="emailInput"
              type="text"
              value={profile.email || ''}
              onChange={e => setProfile(prev => prev ? { ...prev, email: e.target.value } : prev)}
              placeholder="이메일 입력"
              className={profileStyles.inputField}
            />

            {/* 개인 주소 */}
            <label htmlFor="personUrlInput" className={profileStyles.inputLabel}>개인주소</label>
            <input
              id="personUrlInput"
              type="text"
              value={profile.personUrl || ''}
              onChange={e => setProfile(prev => prev ? { ...prev, personUrl: e.target.value } : prev)}
              placeholder="개인 웹사이트 URL 입력"
              className={profileStyles.inputField}
            />

            {/* 유튜브 주소 */}
            <label htmlFor="youtubeUrlInput" className={profileStyles.inputLabel}>유튜브주소</label>
            <input
              id="youtubeUrlInput"
              type="text"
              value={profile.youtubeUrl || ''}
              onChange={e => setProfile(prev => prev ? { ...prev, youtubeUrl: e.target.value } : prev)}
              placeholder="유튜브 URL 입력"
              className={profileStyles.inputField}
            />
          </div>
        </div>

        <SuccessFailModal
          show={modal.show}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal({ ...modal, show: false })}
        />

        <SocialModal
          visible={showSocialModal}
          initialSelectedKeys={[] /* 초기 선택 상태 필요 시 profile 소셜 필드 기반으로 세팅해 주세요 */}
          onClose={() => setShowSocialModal(false)}
          onSave={(selectedKeys) => {
            // 선택한 소셜 링크 키 배열을 기반으로 profile 상태 update 가능
            // 예) 선택한 키가 아닌 필드는 '', 값 클리어 처리 등 필요시 구현
            console.log('선택된 소셜링크:', selectedKeys);
            setShowSocialModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default ProfileEditPage;