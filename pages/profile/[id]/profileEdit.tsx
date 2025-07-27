import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { fetchProfileById, updateProfileField } from '../../../types/profiles';
import type { Profile } from '../../../types/profiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import styles from '../../../styles/styles.module.css';
import profileStyles from '../../../styles/profile.module.css';

import SuccessFailModal from '../../../components/profile/modal/SuccessFailModal';

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

  // 저장 로직
  const handleSaveProfile = async () => {
    // 이후 확장 시, 값 저장 구현
    setModal({ show: true, message: "프로필이 성공적으로 저장되었습니다.", type: "success" });
  };

  // 권한 or 로딩 처리
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

  if (!profile) {
    return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;
  }

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 상단 헤더(뒤로가기 + 저장 버튼) */}
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
                display: 'flex',
                alignItems: 'flex-start',
                padding: 0,
                margin: 0,
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
                  display: 'block'
                }}
              />
            </div>
          )}
          {/* 프로필 이미지 + 이름 / 직업 입력 박스 */}
          <div className={profileStyles.profileLine}>
            {/* 프로필 이미지 */}
            <div className={profileStyles.profileImageWrapper}>
              <img
                src={profile.img || '/chat/profile.png'}
                alt={profile.name}
              />
            </div>

            {/* 이름, 직업 입력 그룹 */}
            <div className={profileStyles.inputGroup}>
              {/* 이름 레이블 */}
              <label htmlFor="nameInput" className={profileStyles.inputLabel}>이름</label>
              {/* 이름 인풋 */}
              <input
                id="nameInput"
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => prev ? { ...prev, name: e.target.value } : prev)}
                placeholder="이름을 입력하세요"
                className={profileStyles.inputField}
              />

              {/* 직업 레이블 */}
              <label htmlFor="descInput" className={profileStyles.inputLabel} style={{ marginTop: 16 }}>
                직업
              </label>
              {/* 직업 인풋 */}
              <input
                id="descInput"
                type="text"
                value={profile.desc}
                onChange={e => setProfile(prev => prev ? { ...prev, desc: e.target.value } : prev)}
                placeholder="직업을 입력해주세요"
                className={profileStyles.inputField}
              />

              {/* AI 소개 레이블 */}
              <label htmlFor="aiIntroInput" className={profileStyles.inputLabel} style={{ marginTop: 16 }}>
                AI 인사말
              </label>
              {/* AI 소개 인풋 */}
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

          <div className={profileStyles.profileLine}>
            <div className={profileStyles.inputGroup}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>소셜링크</div>
              <label htmlFor="numberInput" className={profileStyles.inputLabel}>전화번호</label>
              <input
                id="numberInput"
                type="text"
                value={profile.number}
                onChange={e => setProfile(prev => prev ? { ...prev, number: e.target.value } : prev)}
                placeholder="전화번호 입력"
                className={profileStyles.inputField}
              />

              <label htmlFor="emailInput" className={profileStyles.inputLabel}>이메일</label>
              <input
                id="emailInput"
                type="text"
                value={profile.email}
                onChange={e => setProfile(prev => prev ? { ...prev, email: e.target.value } : prev)}
                placeholder="전화번호 입력"
                className={profileStyles.inputField}
              />

              <label htmlFor="personUrlInput" className={profileStyles.inputLabel}>개인주소</label>
              <input
                id="personUrlInput"
                type="text"
                value={profile.personUrl}
                onChange={e => setProfile(prev => prev ? { ...prev, personUrl: e.target.value } : prev)}
                placeholder="개인 웹사이트 url 입력"
                className={profileStyles.inputField}
              />
              
              <label htmlFor="youtubeUrlInput" className={profileStyles.inputLabel}>유튜브주소</label>
              <input
                id="youtubeUrlInput"
                type="text"
                value={profile.youtubeUrl}
                onChange={e => setProfile(prev => prev ? { ...prev, youtubeUrl: e.target.value } : prev)}
                placeholder="개인 웹사이트 url 입력"
                className={profileStyles.inputField}
              />
            </div>
          </div>
        </div>
        
  
        {/* 나머지 편집박스들 (MBTI, 소개 등)은 이전처럼 추가 가능 */}
        {/* ...생략... */}
        
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  return { props: {} };
}

export default ProfileEditPage;