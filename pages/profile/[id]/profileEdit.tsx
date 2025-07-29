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

type SocialLink = { type: string; url: string };

const SOCIAL_FIELDS = [
  { key: 'number', label: '전화번호', placeholder: '전화번호 입력', inputType: 'text' },
  { key: 'email', label: '이메일', placeholder: 'ex) soundofmemory.gmail.com', inputType: 'text' },
  { key: 'personUrl', label: '개인 웹사이트', placeholder: '커스텀 URL을 입력하세요', inputType: 'text' },
  { key: 'youtubeUrl', label: 'YouTube', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'facebookUrl', label: 'Facebook', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'twitterUrl', label: '트위터', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'bandUrl', label: '밴드', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'linkedinUrl', label: '링크드인', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'githubUrl', label: '깃허브', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'cafeUrl', label: '카페', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'notionUrl', label: '노션', placeholder: '전체 URL을 입력하세요', inputType: 'text' },
  { key: 'tiktokUrl', label: '틱톡', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'blogUrl', label: '블로그', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
  { key: 'behanceUrl', label: '비잔스', placeholder: '사용자명 또는 프로필 URL을 입력하세요', inputType: 'text' },
];

// 소셜 링크 배열 → 객체 변환하여 Firestore 저장용
function socialLinksArrayToObj(links: SocialLink[]) {
  return links.reduce((acc, { type, url }) => {
    acc[type] = url;
    return acc;
  }, {} as Record<string, string>);
}

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

  // 소셜 링크들 배열로 관리
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // 모달에서 선택된 소셜 플랫폼 키 배열
  const initialSelectedSocial = React.useMemo(() => {
    if (!profile) return [];
    return Object.entries(profile)
      .filter(([key, value]) => (key.endsWith('Url') || key === 'email' || key === 'number') && !!value)
      .map(([key]) => key);
  }, [profile]);

  const [selectedSocial, setSelectedSocial] = useState<string[]>(initialSelectedSocial);

  useEffect(() => {
    setSelectedSocial(initialSelectedSocial);
  }, [initialSelectedSocial]);

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

  const SOCIAL_KEYS = SOCIAL_FIELDS.map(f => f.key);

  // 1) 초기 프로필 데이터에서 값이 있는 소셜key만 추출해서 상태화
  useEffect(() => {
    if (profile) {
      // 값 있는 것만 남기기
      const arr = SOCIAL_FIELDS
        .filter(f => (profile[f.key as keyof Profile] ?? "") !== "")
        .map(f => ({
          type: f.key,
          url: (profile[f.key as keyof Profile] as string) || '',
        }));
      setSocialLinks(arr);
      setSelectedSocial(arr.map(item => item.type));
    } else {
      setSocialLinks([]);
      setSelectedSocial([]);
    }
  }, [profile]);

  // 프로필 필드 업데이트 헬퍼
  const handleUpdateProfileField = (field: keyof Profile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // 소셜 링크 배열 내 URL 변경 시
  const handleSocialLinkChange = (idx: number, newUrl: string) => {
    setSocialLinks(prev => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], url: newUrl };
      return clone;
    });
  };

  // 저장 함수: socialLinks 배열 → 필드별 객체 변환 후 저장
  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const socialFieldsObject = socialLinks.reduce((acc, { type, url }) => {
        acc[type] = url;
        return acc;
      }, {} as Record<string, string>);
  
      // 선택되지 않은 소셜은 ''로 만들어서 서버 반영
      SOCIAL_KEYS.forEach(key => {
        if (!socialLinks.find(l => l.type === key)) {
          socialFieldsObject[key] = '';
        }
      });
  
      await updateProfileField(profile.id, {
        ...profile,
        ...socialFieldsObject,
      });
      setModal({ show: true, message: '프로필이 성공적으로 저장되었습니다.', type: 'success' });
      setShowSocialModal(false);
      // 최신 상태 로드 필요시 fetchProfileById(profile.id).then(setProfile);
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

          {/* 백그라운드 이미지 */}
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

          {/* 프로필 이미지 및 정보 입력 */}
          <div className={profileStyles.profileLine}>
            <div className={profileStyles.profileImageWrapper}>
              <img src={profile.img || '/chat/profile.png'} alt={profile.name} />
            </div>

            <div className={profileStyles.inputGroup}>
              <label htmlFor="nameInput" className={profileStyles.inputLabel}>이름</label>
              <input
                id="nameInput"
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => prev ? { ...prev, name: e.target.value } : prev)}
                placeholder="이름을 입력하세요"
                className={profileStyles.inputField}
              />

              <label htmlFor="descInput" className={profileStyles.inputLabel} style={{ marginTop: 16 }}>직업</label>
              <input
                id="descInput"
                type="text"
                value={profile.desc}
                onChange={e => setProfile(prev => prev ? { ...prev, desc: e.target.value } : prev)}
                placeholder="직업을 입력해주세요"
                className={profileStyles.inputField}
              />

              <label htmlFor="aiIntroInput" className={profileStyles.inputLabel} style={{ marginTop: 16 }}>AI 인사말</label>
              <input
                id="aiIntroInput"
                type="text"
                value={profile.aiIntro}
                onChange={e => setProfile(prev => prev ? { ...prev, aiIntro: e.target.value } : prev)}
                placeholder="안녕! 정말 반가워! 무슨 얘기를 해볼까?"
                className={profileStyles.inputField}
              />
            </div>
          </div>

          {/* 소셜링크 그룹 */}
          <div className={profileStyles.profileLine}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>소셜링크</div>
              <FiEdit2 size={24} color="#222" style={{ cursor: 'pointer' }} onClick={() => setShowSocialModal(true)} />
            </div>

            <div className={profileStyles.inputGroup}>
              {socialLinks.map((link, idx) => (
                <React.Fragment key={link.type}>
                  <label htmlFor={`${link.type}Input`} className={profileStyles.inputLabel}>
                    {SOCIAL_FIELDS.find(f => f.key === link.type)?.label}
                  </label>
                  <input
                    id={`${link.type}Input`}
                    type="text"
                    value={link.url}
                    onChange={e => handleSocialLinkChange(idx, e.target.value)}
                    placeholder={SOCIAL_FIELDS.find(f => f.key === link.type)?.placeholder}
                    className={profileStyles.inputField}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <SocialModal
          visible={showSocialModal}
          initialSelectedKeys={selectedSocial}
          onClose={() => setShowSocialModal(false)}
          onSave={(keys) => {
            setSelectedSocial(keys);

            // 선택된 소셜링크만 socialLinks로 동기화
            const updatedSocialLinks = keys.map(key => {
              const prev = socialLinks.find(item => item.type === key);
              return { type: key, url: prev?.url ?? '' };
            });
            setSocialLinks(updatedSocialLinks);
            setShowSocialModal(false);
          }}
        />

        <SuccessFailModal
          show={modal.show}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal({ ...modal, show: false })}
        />
      </div>
    </div>
  );
};

export default ProfileEditPage;