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

import { FiEdit2, FiCamera } from 'react-icons/fi';

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

  // 1) 초기 프로필 데이터에서 socialLinks 객체를 배열로 변환
  useEffect(() => {
    console.log('프로필 로딩 시 profile:', profile);
    if (profile) {
      console.log('profile.socialLinks:', profile.socialLinks);
      if (profile.socialLinks) {
        // socialLinks 객체에서 값이 있는 것만 배열로 변환
        const arr = SOCIAL_FIELDS
          .filter(f => profile.socialLinks && profile.socialLinks[f.key as keyof typeof profile.socialLinks])
          .map(f => ({
            type: f.key,
            url: profile.socialLinks![f.key as keyof typeof profile.socialLinks] || '',
          }));
        console.log('socialLinks 객체에서 변환된 배열:', arr);
        setSocialLinks(arr);
        setSelectedSocial(arr.map(item => item.type));
      } else {
        // 기존 방식 (개별 필드에서 읽기)
        const arr = SOCIAL_FIELDS
          .filter(f => {
            const value = profile[f.key as keyof Profile];
            return value && typeof value === 'string' && value.trim() !== '';
          })
          .map(f => ({
            type: f.key,
            url: (profile[f.key as keyof Profile] as string) || '',
          }));
        console.log('개별 필드에서 변환된 배열:', arr);
        setSocialLinks(arr);
        setSelectedSocial(arr.map(item => item.type));
      }
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

  // 저장 함수: socialLinks 배열 → 객체 변환 후 저장
  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      console.log('저장 전 socialLinks:', socialLinks);
      
      const socialLinksObject = socialLinks.reduce((acc, { type, url }) => {
        acc[type] = url;
        return acc;
      }, {} as Record<string, string>);
  
      // 선택되지 않은 소셜은 ''로 만들어서 서버 반영
      SOCIAL_KEYS.forEach(key => {
        if (!socialLinks.find(l => l.type === key)) {
          socialLinksObject[key] = '';
        }
      });
      
      console.log('저장할 socialLinksObject:', socialLinksObject);
      // AI 인사말이 비어있으면 기본값 설정
      const aiIntro = profile.aiIntro?.trim() || "안녕! 정말 반가워! 무슨 얘기를 해볼까?";
      console.log('저장할 aiIntro:', aiIntro);
      
      const updateData = {
        ...profile,
        socialLinks: socialLinksObject,
        aiIntro: aiIntro,
      };
      
      console.log('최종 저장 데이터:', updateData);
  
      await updateProfileField(profile.id, updateData);
      setModal({ show: true, message: '프로필이 성공적으로 저장되었습니다.', type: 'success' });
      setShowSocialModal(false);
      
      // 저장 후 프로필 페이지로 돌아가기
      setTimeout(() => {
        router.push(`/profile/${profile.id}`);
      }, 1500);
    } catch (e: any) {
      console.error('저장 중 오류:', e);
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
            <button onClick={handleSaveProfile} className={profileStyles.editSaveButton}>
              저장
            </button>
          </div>
        </div>

        <div className={`${styles.scrollMain} ${styles.scrollMainProfile}`}>

          {/* 백그라운드 이미지 */}
          {profile?.backgroundImg && (
            <>
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  background: '#f2f3fa',
                  position: 'relative',
                  padding: 0,
                  marginBottom: 0,
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
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: 6,
                marginBottom: 24,
              }}>
                <button
                  type="button"
                  aria-label="배경 이미지 편집"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#222',
                    padding: '4px 10px 4px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  onClick={() => alert('배경 편집 기능!')}
                >
                  <span style={{
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    marginRight: 6,
                  }}>
                    배경 편집
                  </span>
                  <FiCamera size={16} />
                </button>
              </div>
            </>
          )}

          {/* 프로필 이미지 및 정보 입력 */}
          <div className={profileStyles.profileLine}>
            <div className={profileStyles.profileImageWrapper} style={{ position: 'relative' }}>
              {/* 프로필 이미지 */}
              <img
                src={profile.img || '/chat/profile.png'}
                alt={profile.name}
                style={{
                  width: "90px", height: "90px", objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              {/* 프로필 편집 카메라 아이콘 - 버튼 배경 투명화 */}
              <button
                type="button"
                aria-label="프로필 이미지 편집"
                style={{
                  position: "absolute",
                  right: -4,
                  bottom: -4,
                  background: "transparent",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "none",
                  cursor: "pointer",
                  padding: 0,
                  outline: "none",
                  zIndex: 1000000000,
                }}
                onClick={() => alert("프로필 이미지 편집 기능!")}
              >
                <FiCamera size={20} color="#222" />
              </button>
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
                value={profile.aiIntro || ""}
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
              {socialLinks.length === 0 ? (
                // 소셜링크가 하나도 없는 경우 안내 메시지
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  fontSize: 15,
                  padding: '34px 18px 28px 18px',
                  letterSpacing: '0.01em',
                  fontWeight: 400,
                  background: '#f8f8fb',
                  borderRadius: 10,
                  border: "1px dashed #d3d3e7",
                }}>
                  소셜링크를 넣어보세요!<br />
                  <span style={{ fontSize: 13, color: "#b0b2c3" }}>
                    상단의 <FiEdit2 style={{verticalAlign: 'middle', margin: '0 3px 3px 0'}} /> 아이콘을 눌러 플랫폼을 선택할 수 있습니다.
                  </span>
                </div>
              ) : (
                // 소셜링크가 있을 때 입력필드 렌더링
                socialLinks.map((link, idx) => (
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
                ))
              )}
            </div>
          </div>
        </div>

        <SocialModal
          visible={showSocialModal}
          initialSelectedKeys={selectedSocial}
          onClose={() => setShowSocialModal(false)}
                      onSave={(keys) => {
              console.log('SocialModal onSave keys:', keys);
              setSelectedSocial(keys);

              // 선택된 소셜링크만 socialLinks로 동기화
              const updatedSocialLinks = keys.map(key => {
                const prev = socialLinks.find(item => item.type === key);
                return { type: key, url: prev?.url ?? '' };
              });
              console.log('updatedSocialLinks:', updatedSocialLinks);
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