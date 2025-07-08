import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../../styles/styles.module.css';
import mbtiStyles from '../../styles/MbtiModal.module.css';
import introStyles from '../../styles/IntroduceModal.module.css';
import { profiles, Profile } from '../../profiles';
import { FiEdit2, FiPhone, FiAtSign } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import { BiQrScan } from 'react-icons/bi';
import { FaChrome, FaYoutube } from 'react-icons/fa';

const ICON_SIZE = 24;

// MBTI Modal 컴포넌트
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

// 소개(자기소개) Modal 컴포넌트
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

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [showMBTIModal, setShowMBTIModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [mbti, setMbti] = useState<string | undefined>(
    profiles.find((p: Profile) => p.id === id)?.mbti
  );
  const [introduce, setIntroduce] = useState<string | undefined>(
    profiles.find((p: Profile) => p.id === id)?.introduce
  );

  const profile: Profile | undefined = profiles.find((p: Profile) => p.id === id);

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
            {/* 오른쪽 아이콘들 */}
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
          </div>
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain + ' ' + styles.scrollMainProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={styles.mainHeader}>
              <div className={styles.avatarWrap}>
                <Image src={profile.img} alt={profile.name} width={100} height={100} className={styles.avatarImg} />
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
                  <span key={i}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <button className={styles.chatButton}>대화하기</button>
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
            
            {/* MBTI 박스 */}
            <div className={`${styles.mbtiBox} ${mbtiStyles.mbtiBox}`}>
              <span className={mbtiStyles.mbtiBoxTitle}>MBTI</span>
              <span className={mbtiStyles.mbtiBoxContent}>{mbti || 'MBTI가 입력되지 않았습니다.'}</span>
              <FiEdit2
                size={20}
                color="#000"
                className={mbtiStyles.mbtiEditIcon}
                onClick={() => setShowMBTIModal(true)}
              />
            </div>
            {showMBTIModal && (
              <MBTIModal
                currentMBTI={mbti}
                onClose={() => setShowMBTIModal(false)}
                onSave={setMbti}
              />
            )}

            {/* 소개 박스 */}
            <div className={styles.introduceBox} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: 10 }}>
              <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>소개</span>
              <span style={{ fontSize: 15, color: '#888', fontWeight: 500, marginTop: 12 }}>{introduce || '소개를 작성해보세요 !'}</span>
              <FiEdit2
                size={20}
                color="#000"
                style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
                onClick={() => setShowIntroModal(true)}
              />
            </div>
            {showIntroModal && (
              <IntroduceModal
                currentIntroduce={introduce}
                onClose={() => setShowIntroModal(false)}
                onSave={setIntroduce}
              />
            )}

            {/* 이력, 경력 박스 등은 기존 코드 그대로 */}
            <div className={styles.historyBox}>
              <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>이력</span>
              <div style={{ marginTop: 12, color: '#888', fontWeight: 500, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {profile.history && profile.history.length > 0 ? (
                  profile.history.map((h, i) => (
                    <div key={i} className={styles.historyContent} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>{h.school}</span>
                        <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginTop: 2 }}>{h.period}</span>
                      </div>
                      <span className={styles.historyBadge}>{h.role}</span>
                    </div>
                  ))
                ) : (
                  <span>이력이 없습니다.</span>
                )}
              </div>
              <FiEdit2 size={20} color="#000" style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }} />
            </div>
            <div className={styles.historyBox} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: 10 }}>
              <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>경력</span>
              <div style={{ marginTop: 12, color: '#888', fontWeight: 500, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {profile.career && profile.career.length > 0 ? (
                  profile.career.map((c, i) => (
                    <div key={i} className={styles.historyContent} style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>{c.org}</span>
                        <span style={{ color: '#555', fontWeight: 500, fontSize: 14, marginTop: 2 }}>{c.dept}</span>
                        <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginTop: 2 }}>{c.period} {c.months}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className={styles.historyBadge}>{c.role}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span>경력이 없습니다.</span>
                )}
              </div>
              <FiEdit2 size={20} color="#000" style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
