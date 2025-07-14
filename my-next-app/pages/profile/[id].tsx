import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/styles.module.css';
import mbtiStyles from '../../styles/MbtiModal.module.css';
import introStyles from '../../styles/IntroduceModal.module.css';
import { fetchProfileById, updateProfileField } from '../../profiles';
import type { Profile } from '../../profiles';
import { FiEdit2, FiPhone, FiAtSign } from 'react-icons/fi';
import { MdDocumentScanner, MdReport, MdNotificationsActive, MdBlock } from 'react-icons/md';
import { BiQrScan } from 'react-icons/bi';
import { FaChrome, FaYoutube, FaStar } from 'react-icons/fa';
import HistoryModal from './HistoryModal';
import CareerModal from './CareerModal';
import Link from 'next/link';

const ICON_SIZE = 24;

// MBTI Modal
const MBTI_LETTERS = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['P', 'J'],
];

function MBTIModal({ currentMBTI, onClose, onSave }: {
  currentMBTI: string | undefined;
  onClose: () => void;
  onSave: (mbti: string) => void;
}) {
  const initial = MBTI_LETTERS.map((pair, idx) =>
    currentMBTI && currentMBTI[idx] ? currentMBTI[idx] : pair[0]
  );
  const [selection, setSelection] = useState<string[]>(initial);

  const handleSelect = (groupIdx: number, letter: string) => {
    const next = [...selection];
    next[groupIdx] = letter;
    setSelection(next);
  };

  const handleSave = () => {
    onSave(selection.join(''));
    onClose();
  };

  return (
    <div className={mbtiStyles.mbtiModalOverlay}>
      <div className={mbtiStyles.mbtiModalContent}>
        <h2 className={mbtiStyles.mbtiModalTitle}>MBTI 선택</h2>
        {MBTI_LETTERS.map((pair, idx) => (
          <div key={idx} className={mbtiStyles.mbtiOptionGroup}>
            {pair.map(letter => (
              <button
                key={letter}
                onClick={() => handleSelect(idx, letter)}
                className={
                  mbtiStyles.mbtiOptionButton +
                  (selection[idx] === letter ? ` ${mbtiStyles.selected}` : '')
                }
                style={selection[idx] === letter ? {
                  border: '2px solid #636AE8FF',
                  background: '#636AE8FF',
                  color: '#fff'
                } : undefined}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div className={mbtiStyles.mbtiModalActions}>
          <button
            className={mbtiStyles.mbtiModalButton}
            onClick={onClose}
          >취소</button>
          <button
            className={`${mbtiStyles.mbtiModalButton} ${mbtiStyles.save}`}
            onClick={handleSave}
          >저장</button>
        </div>
      </div>
    </div>
  );
}

// 소개(자기소개) Modal
function IntroduceModal({
  currentIntroduce,
  onClose,
  onSave,
}: {
  currentIntroduce: string | undefined;
  onClose: () => void;
  onSave: (intro: string) => void;
}) {
  const [value, setValue] = useState(currentIntroduce ?? '');

  const handleSave = () => {
    onSave(value.trim());
    onClose();
  };

  return (
    <div className={introStyles.introModalOverlay}>
      <div className={introStyles.introModalContent}>
        <h2 className={introStyles.introModalTitle}>소개 입력</h2>
        <textarea
          className={introStyles.introTextarea}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="자기소개를 입력하세요!"
        />
        <div className={introStyles.introModalActions}>
          <button
            className={introStyles.introModalButton}
            onClick={onClose}
          >취소</button>
          <button
            className={`${introStyles.introModalButton} ${introStyles.save}`}
            onClick={handleSave}
          >저장</button>
        </div>
      </div>
    </div>
  );
}

const MY_PROFILE_ID = 'Bo65F6bzKnaJlZhLpheqY5kN2gT2';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showMBTIModal, setShowMBTIModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);

  useEffect(() => {
    console.log("id:", id);
    if (typeof id === "string") {
      fetchProfileById(id).then(profile => {
        setProfile(profile);
        console.log("파이어베이스에서 불러온 데이터:", profile);
      });
    }
  }, [id]);

  // 모달 관련 상태 (profile 데이터 기반)
  const [mbti, setMbti] = useState<string | undefined>(undefined);
  const [introduce, setIntroduce] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<any[]>([]);
  const [career, setCareer] = useState<any[]>([]);

  // profile이 바뀔 때마다 상태 동기화
  useEffect(() => {
    setMbti(profile?.mbti);
    setIntroduce(profile?.introduce);
    setHistory(profile?.history ?? []);
    setCareer(profile?.career ?? []);
  }, [profile]);

  // 삭제 함수
  const handleDeleteHistory = (idx: number) => setHistory(prev => prev.filter((_, i) => i !== idx));
  const handleDeleteCareer = (idx: number) => setCareer(prev => prev.filter((_, i) => i !== idx));

  // Firestore 동기화용 onSave 핸들러
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

  const isMyProfile = id === MY_PROFILE_ID;

  if (!profile) return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div
            className={styles.headerContent}
            style={{ position: 'relative', justifyContent: 'center' }}
          >
            {/* 뒤로가기 버튼 */}
            <button
              onClick={() => router.back()}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                height: 40,
                width: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="뒤로가기"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 가운데 프로필 텍스트 */}
            <span style={{ fontWeight: 700, fontSize: 18, textAlign: 'center' }}>프로필</span>
            {/* 오른쪽 아이콘들 (내 프로필/타인 프로필 분기) */}
            {isMyProfile ? (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 40
                }}
              >
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="프로필 편집"
                >
                  <FiEdit2 size={ICON_SIZE} color="#222" />
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="카메라 스캔"
                >
                  <MdDocumentScanner size={ICON_SIZE} color="#222" />
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '10px',
                  }}
                  aria-label="QR코드"
                >
                  <BiQrScan size={ICON_SIZE} color="#222" />
                </button>
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 40
                }}
              >
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="차단"
                >
                  <MdBlock size={ICON_SIZE} color="#B0BEC5" />
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="즐겨찾기"
                >
                  <FaStar size={ICON_SIZE} color="#FFD700" />
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '10px',
                  }}
                  aria-label="신고"
                >
                  <MdNotificationsActive size={ICON_SIZE} color="#E53935" />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain + ' ' + styles.scrollMainProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={styles.mainHeader}>
          <div className={styles.bgImgWrap}>
            {profile.backgroundImg && (
              <img
                src={profile.backgroundImg}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: 'inherit' }}
              />
            )}
          </div>
              <div className={styles.avatarWrap}>
              {profile.img && (
                <img
                  src={profile.img}
                  alt={profile.name}
                  width={100}
                  height={100}
                  className={styles.avatarImg}
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                />
              )}
            </div>
          </div>
            <div style={{ marginTop: 0, textAlign: 'center' }}>
              <div className={styles.friendName} style={{ fontSize: 22 }}>{profile.name}</div>
              <div style={{ marginTop: 12, color: '#9095A0FF', fontSize: 16 }}>{profile.desc}</div>
              <div
                style={{
                  marginTop: 12,
                  color: '#636AE8FF',
                  fontSize: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 14,
                  textAlign: 'center'
                }}
              >
                {profile.tag.map((t, i) => (
                  <span key={i}>#{t}</span>
                ))}
              </div>
            </div>
            {/* 버튼 영역: 내 프로필이면 대화하기, 타인이면 친구추가 */}
            <div>
              {isMyProfile ? (
                <Link href={`/chat/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <button className={styles.chatButton}>대화하기</button>
                </Link>
              ) : (
                <button className={styles.chatButton}>친구추가</button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 16 }}>
              <div className={styles.profileIcons}>
                <FiPhone size={28} color="#000" style={{ cursor: 'pointer' }} />
              </div>
              <div className={styles.profileIcons}>
                <FiAtSign size={28} color="#000" style={{ cursor: 'pointer' }} />
              </div>
              <div className={styles.profileIcons}>
                <FaChrome size={28} color="#000" style={{ cursor: 'pointer' }} />
              </div>
              <div className={styles.profileIcons}>
                <FaYoutube size={28} color="#FF0000" style={{ cursor: 'pointer' }} />
              </div>
            </div>
            {/* MBTI 박스: 내 프로필만 편집 가능 */}
            <div className={`${styles.mbtiBox} ${mbtiStyles.mbtiBox}`} style={{ marginTop: 15 }}>
              <span className={mbtiStyles.mbtiBoxTitle}>MBTI</span>
              <span className={mbtiStyles.mbtiBoxContent}>{mbti || 'MBTI가 입력되지 않았습니다.'}</span>
              {isMyProfile && (
                <FiEdit2
                  size={20}
                  color="#000"
                  className={mbtiStyles.mbtiEditIcon}
                  onClick={() => setShowMBTIModal(true)}
                />
              )}
            </div>
            {isMyProfile && showMBTIModal && (
              <MBTIModal
                currentMBTI={mbti}
                onClose={() => setShowMBTIModal(false)}
                onSave={handleSaveMbti}
              />
            )}
            {/* 소개 박스: 내 프로필만 편집 가능 */}
            <div className={styles.introduceBox} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: 10 }}>
              <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>소개</span>
              <span style={{ fontSize: 15, color: '#888', fontWeight: 500, marginTop: 12 }}>{introduce || '소개를 작성해보세요 !'}</span>
              {isMyProfile && (
                <FiEdit2
                  size={20}
                  color="#000"
                  style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
                  onClick={() => setShowIntroModal(true)}
                />
              )}
            </div>
            {isMyProfile && showIntroModal && (
              <IntroduceModal
                currentIntroduce={introduce}
                onClose={() => setShowIntroModal(false)}
                onSave={handleSaveIntroduce}
              />
            )}
            {/* 이력 박스: 내 프로필만 편집 가능 */}
            <div className={styles.historyBox} style={{ position: 'relative' }}>
              <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>이력</span>
              {isMyProfile && (
                <FiEdit2
                  size={20}
                  color="#000"
                  style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
                  onClick={() => setShowHistoryModal(true)}
                />
              )}
              <div style={{ marginTop: 12, color: '#888', fontWeight: 500, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {history && history.length > 0 ? (
                  history.map((h, i) => (
                    <div
                      key={i}
                      className={styles.historyContent}
                      style={{
                        background: '#f6f8ff',
                        borderRadius: 12,
                        boxShadow: '0 1px 6px 0 rgba(99,106,232,0.07)',
                        padding: '15px 16px 13px 16px',
                        marginBottom: 8,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>{h.school}</span>
                        <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginTop: 6 }}>{h.period}</span>
                      </div>
                      <span
                        style={{
                          color: '#636AE8FF',
                          fontWeight: 500,
                          fontSize: 13,
                          background: '#fff',
                          border: '1px solid rgb(170, 170, 170)',
                          borderRadius: 8,
                          padding: '8px 4px',
                          marginLeft: 16,
                          display: 'inline-block',
                          minWidth: 64,
                          textAlign: 'center'
                        }}
                      >
                        {h.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <span>이력이 없습니다.</span>
                )}
              </div>
            </div>
            {isMyProfile && (
              <HistoryModal
                open={showHistoryModal}
                items={history}
                onClose={() => setShowHistoryModal(false)}
                onSave={handleSaveHistory}
              />
            )}
            {/* 경력 박스: 내 프로필만 편집 가능 */}
            <div className={styles.historyBox} style={{ position: 'relative', marginTop: 10, marginBottom: 10, }}>
              <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>경력</span>
              {isMyProfile && (
                <FiEdit2
                  size={20}
                  color="#000"
                  style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
                  onClick={() => setShowCareerModal(true)}
                />
              )}
              <div style={{ marginTop: 12, color: '#888', fontWeight: 500, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {career && career.length > 0 ? (
                  career.map((c, i) => (
                    <div
                      key={i}
                      className={styles.historyContent}
                      style={{
                        background: '#f6f8ff',
                        borderRadius: 12,
                        boxShadow: '0 1px 6px 0 rgba(99,106,232,0.07)',
                        padding: '15px 16px 13px 16px',
                        marginBottom: 8,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>{c.org}</span>
                        <span style={{ color: '#9095A0FF', fontWeight: 500, fontSize: 14, marginTop: 6, marginBottom: 6, }}>{c.dept}</span>
                        <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginTop: 2 }}>
                          {c.period}
                          <span style={{ color: '#000', fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{c.months}개월</span>
                        </span>
                      </div>
                      <span
                        style={{
                          color: '#636AE8FF',
                          fontWeight: 500,
                          fontSize: 13,
                          background: '#fff',
                          border: '1px solid rgb(170, 170, 170)',
                          borderRadius: 8,
                          padding: '8px 4px',
                          marginLeft: 16,
                          display: 'inline-block',
                          minWidth: 64,
                          textAlign: 'center'
                        }}
                      >
                        {c.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <span>경력이 없습니다.</span>
                )}
              </div>
            </div>
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
    </div>
  );
};

export async function getServerSideProps() {
  return { props: {} };
}

export default ProfilePage;