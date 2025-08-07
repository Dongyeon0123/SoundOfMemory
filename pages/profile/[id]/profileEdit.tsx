import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { fetchProfileById, updateProfileField, fetchUserChatTopics, fetchSelectedChatTopics, updateChatTopicInformation, deleteChatTopic } from '../../../types/profiles';
import type { Profile, ChatTopic } from '../../../types/profiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { uploadProfileImage } from '../../../client/uploadProfileImage';

import styles from '../../../styles/styles.module.css';
import profileStyles from '../../../styles/profile.module.css';

import SuccessFailModal from '../../../components/profile/modal/SuccessFailModal';
import SocialModal from '../../../components/profile/modal/SocialModal';
import ChatTopicModal from '../../../components/profile/modal/ChatTopicModal';
import BackgroundModal from '../../../components/profile/modal/BackgroundModal';

import { FiEdit2, FiCamera, FiFolder, FiTrash2 } from 'react-icons/fi';

const DEFAULT_BACKGROUND_URL = 'https://firebasestorage.googleapis.com/v0/b/numeric-vehicle-453915-j9/o/header_images%2Fbackground3.png?alt=media&token=32951da6-22aa-4406-aa18-116e16828dc1';

type SocialLink = { type: string; url: string };

const SOCIAL_FIELDS = [ 
  { key: 'number', label: '전화번호', placeholder: '전화번호 입력', inputType: 'text', baseUrl: '' },
  { key: 'email', label: '이메일', placeholder: '이메일 주소 입력', inputType: 'text', baseUrl: '' },
  { key: 'personUrl', label: '개인 웹사이트', placeholder: '전체 URL을 입력하세요', inputType: 'text', baseUrl: '' },
  { key: 'youtubeUrl', label: 'YouTube', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.youtube.com/@' },
  { key: 'facebookUrl', label: 'Facebook', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.facebook.com/' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.instagram.com/' },
  { key: 'twitterUrl', label: '트위터', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://x.com/' },
  { key: 'bandUrl', label: '밴드', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.band.us/' },
  { key: 'linkedinUrl', label: '링크드인', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.linkedin.com/in/' },
  { key: 'githubUrl', label: '깃허브', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://github.com/' },
  { key: 'cafeUrl', label: '카페', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://cafe.naver.com/' },
  { key: 'notionUrl', label: '노션', placeholder: '전체 URL을 입력하세요', inputType: 'text', baseUrl: '' },
  { key: 'tiktokUrl', label: '틱톡', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.tiktok.com/' },
  { key: 'blogUrl', label: '블로그', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://blog.naver.com/' },
  { key: 'behanceUrl', label: '비잔스', placeholder: '사용자명 입력', inputType: 'text', baseUrl: 'https://www.behance.net/' },
];

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
  const [showChatTopicModal, setShowChatTopicModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic | null>(null);

  // 소셜 링크들 배열로 관리
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // 채팅 주제 데이터
  const [chatTopics, setChatTopics] = useState<ChatTopic[]>([]);
  
  // 선택된 채팅 주제들 (체크된 것들)
  const [selectedChatTopics, setSelectedChatTopics] = useState<string[]>([]);

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
      
      // 채팅 주제 데이터도 함께 불러오기
      fetchUserChatTopics(id).then(topics => {
        setChatTopics(topics);
      });
      
      // 선택된 채팅 주제 불러오기
      fetchSelectedChatTopics(id).then(selectedTopics => {
        setSelectedChatTopics(selectedTopics);
      });
    }
  }, [id]);

  // 프로필 로딩 후 기존 tag 필드를 selectedChatTopics에 반영하고, 없는 주제는 chatTopics에 추가
  useEffect(() => {
    if (profile && profile.tag && profile.tag.length > 0) {
      console.log('기존 tag 필드 데이터:', profile.tag);
      setSelectedChatTopics(prev => {
        // 기존 selectedChatTopics와 profile.tag를 합치되 중복 제거
        const combined = [...new Set([...prev, ...profile.tag])];
        console.log('combined selectedChatTopics:', combined);
        return combined;
      });

      // 기존 tag 필드에 있지만 chatTopics에 없는 주제들을 chatTopics에 추가
      const existingTopicNames = chatTopics.map(topic => topic.topicName);
      const missingTopics = profile.tag.filter(tag => !existingTopicNames.includes(tag));
      
      if (missingTopics.length > 0) {
        console.log('chatTopics에 없는 기존 태그들:', missingTopics);
        const newTopics: ChatTopic[] = missingTopics.map(topicName => ({
          topicName,
          information: [] // 빈 배열로 초기화
        }));
        
        setChatTopics(prev => [...prev, ...newTopics]);
      }
    }
  }, [profile, chatTopics]);

  const SOCIAL_KEYS = SOCIAL_FIELDS.map(f => f.key);

  // 1) 초기 프로필 데이터에서 socialLinks 객체를 배열로 변환
  useEffect(() => {
    console.log('프로필 로딩 시 profile:', profile);
    if (profile && socialLinks.length === 0) { // socialLinks가 비어있을 때만 초기화
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
    } else if (!profile) {
      setSocialLinks([]);
      setSelectedSocial([]);
    }
  }, [profile, socialLinks.length]);

  // 프로필 필드 업데이트 헬퍼
  const handleUpdateProfileField = (field: keyof Profile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // 소셜 링크 배열 내 URL 변경 시
  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 11자리 이하로 제한
    if (numbers.length <= 11) {
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      }
    }
    
    // 11자리 초과시 마지막 11자리만 사용
    const limitedNumbers = numbers.slice(-11);
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
  };

  const handleSocialLinkChange = (idx: number, newUrl: string) => {
    setSocialLinks(prev => {
      const clone = [...prev];
      const link = clone[idx];
      const field = SOCIAL_FIELDS.find(f => f.key === link.type);
      
      let processedUrl = newUrl.trim();
      
      // 전화번호인 경우 포맷팅 적용
      if (link.type === 'number') {
        processedUrl = formatPhoneNumber(newUrl);
        clone[idx] = { ...link, url: processedUrl };
      } else if (field?.baseUrl && processedUrl) {
        // 기본 URL이 있는 경우 (소셜 미디어)
        if (processedUrl.startsWith('http://') || processedUrl.startsWith('https://')) {
          // 이미 전체 URL인 경우 그대로 사용
          clone[idx] = { ...link, url: processedUrl };
        } else {
          // 사용자명만 입력한 경우 기본 URL과 결합
          clone[idx] = { ...link, url: field.baseUrl + processedUrl };
        }
      } else {
        // 기본 URL이 없는 경우 (이메일, 개인 웹사이트, 노션)
        clone[idx] = { ...link, url: processedUrl };
      }
      
      return clone;
    });
  };

  // 프로필 이미지 변경 핸들러
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // 파일 확장자 확인
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
          alert('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.');
          return;
        }

        // 파일 크기 확인 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
          alert('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.');
          return;
        }

        // 이미지 업로드 및 Firestore 업데이트
        const downloadURL = await uploadProfileImage(file);
        
        // 로컬 상태 업데이트
        if (profile) {
          setProfile({
            ...profile,
            img: downloadURL
          });
        }
        
        console.log('프로필 이미지 업로드 완료. UI가 업데이트되었습니다.');
      } catch (error) {
        console.error('프로필 이미지 업로드 실패:', error);
        
        // 더 자세한 에러 메시지 표시
        let errorMessage = '이미지 업로드에 실패했습니다.';
        if ((error as any).code === 'storage/unauthorized') {
          errorMessage = '업로드 권한이 없습니다. 로그인 상태를 확인해주세요.';
        } else if ((error as any).code === 'storage/quota-exceeded') {
          errorMessage = '저장 공간이 부족합니다.';
        } else if ((error as any).code === 'storage/network-request-failed') {
          errorMessage = '네트워크 연결을 확인해주세요.';
        } else if ((error as any).message) {
          errorMessage = `업로드 실패: ${(error as any).message}`;
        }
        
        alert(errorMessage);
      }
    }
  };

  // 채팅 주제 체크/해제 핸들러
  const handleToggleChatTopic = (topicName: string) => {
    setSelectedChatTopics(prev => {
      const newSelected = prev.includes(topicName) 
        ? prev.filter(topic => topic !== topicName)
        : [...prev, topicName];
      return newSelected;
    });
  };

  // 폴더 아이콘 클릭 핸들러
  const handleFolderClick = (topic: ChatTopic, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소의 onClick 이벤트 방지
    setSelectedTopic(topic);
    setShowChatTopicModal(true);
  };

  // 채팅 주제 삭제 핸들러 (확인 없이 바로 삭제)
  const handleDeleteTopic = async (topicName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소의 onClick 이벤트 방지
    
    if (!profile?.id) return;
    
    try {
      // Firebase에서 채팅 주제 삭제
      await deleteChatTopic(profile.id, topicName);
      
      // 로컬 상태에서 삭제
      setChatTopics(prev => prev.filter(topic => topic.topicName !== topicName));
      setSelectedChatTopics(prev => prev.filter(topic => topic !== topicName));
      
    } catch (error) {
      console.error('채팅 주제 삭제 실패:', error);
    }
  };

  // 배경 이미지 선택 핸들러
  const handleBackgroundSelect = (backgroundUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        backgroundImg: backgroundUrl
      });
    }
  };

  // 저장 함수: socialLinks 배열 → 객체 변환 후 저장
  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
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
      
      // AI 인사말이 비어있으면 기본값 설정 (사용자 이름 포함)
      const aiIntro = profile.aiIntro?.trim() || `안녕! 나는 ${profile.name || '개인 AI 아바타 비서'}야. 궁금한거 있으면 물어봐!`;
      
      const updateData = {
        ...profile,
        socialLinks: socialLinksObject,
        aiIntro: aiIntro,
        // 선택된 채팅 주제를 tag 필드에 저장
        tag: selectedChatTopics,
      };
      
      // 선택된 채팅 주제도 함께 저장 (기존 기능 유지)
      console.log('프로필 저장 시 selectedChatTopics:', selectedChatTopics);


      for (const topic of chatTopics) {
        await updateChatTopicInformation(profile.id, topic.topicName, topic.information);
      }
  
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
          <div
            style={{
              width: '100%',
              height: '120px',
              background: '#f2f3fa',
              position: 'relative',
              padding: 0,
              marginBottom: 0,
            }}
          >
            <img
              src={profile?.backgroundImg || DEFAULT_BACKGROUND_URL}
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
              onClick={() => setShowBackgroundModal(true)}
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
              {/* 파일 업로드 input (숨김) */}
              <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfileImageChange}
              />
              {/* 프로필 편집 카메라 아이콘 */}
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
                onClick={() => document.getElementById('profileImageInput')?.click()}
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

          {/* 채팅 주제 관리 그룹 */}
          <div className={profileStyles.profileLine}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>채팅 주제 관리</div>
            </div>

            <div className={profileStyles.inputGroup}>
              {chatTopics.length === 0 ? (
                // 채팅 주제가 없는 경우 안내 메시지
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
                  채팅 주제를 추가해보세요!<br />
                  <span style={{ fontSize: 13, color: "#b0b2c3" }}>
                    내 아바타와 채팅하면 채팅 주제가 쌓이게 됩니다!
                  </span>
                </div>
              ) : (
                // 채팅 주제가 있을 때 목록 렌더링
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatTopics.map((topic, index) => (
                    <div
                      key={topic.topicName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: '#f8f8fb',
                        borderRadius: 10,
                        border: '1px solid #e8e8f0',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleToggleChatTopic(topic.topicName)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: '#222', marginBottom: 4 }}>
                            {topic.topicName}
                          </div>
                          <div style={{ fontSize: 13, color: '#666' }}>
                            {topic.information.length}개의 항목
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: '2px solid #636AE8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: selectedChatTopics.includes(topic.topicName) ? '#636AE8' : 'transparent',
                        }}>
                          {selectedChatTopics.includes(topic.topicName) && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <FiFolder 
                          size={20} 
                          color="#666" 
                          style={{ cursor: 'pointer' }} 
                          onClick={(e) => handleFolderClick(topic, e)}
                        />
                        <FiTrash2 
                          size={20} 
                          color="#ff4757" 
                          style={{ cursor: 'pointer', marginLeft: 8 }} 
                          onClick={(e) => handleDeleteTopic(topic.topicName, e)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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

        <ChatTopicModal
          visible={showChatTopicModal}
          topicName={selectedTopic?.topicName || ''}
          information={selectedTopic?.information || []}
          userId={profile?.id || ''}
          onClose={() => {
            setShowChatTopicModal(false);
            setSelectedTopic(null);
          }}
          onInformationChange={(updatedInformation) => {
            // 선택된 주제의 정보를 업데이트
            if (selectedTopic) {
              const updatedTopics = chatTopics.map(topic => 
                topic.topicName === selectedTopic.topicName 
                  ? { ...topic, information: updatedInformation }
                  : topic
              );
              setChatTopics(updatedTopics);
            }
          }}
        />

        <BackgroundModal
          visible={showBackgroundModal}
          currentBackground={profile?.backgroundImg}
          onClose={() => setShowBackgroundModal(false)}
          onSelect={handleBackgroundSelect}
        />
      </div>
    </div>
  );
};

export default ProfileEditPage;