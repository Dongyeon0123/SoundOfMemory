import React from 'react';
import styles from '../../styles/styles.module.css';
import mbtiStyles from '../../styles/MbtiModal.module.css';
import { FiEdit2 } from 'react-icons/fi';
import { BsSuitDiamondFill } from 'react-icons/bs';

// 1) MBTI 박스
interface ProfileMBTIBoxProps {
  mbti?: string;
  isMyProfile: boolean;
  onEdit: () => void;
}

export function ProfileMBTIBox({ mbti, isMyProfile, onEdit }: ProfileMBTIBoxProps) {
  return (
    <div className={`${styles.mbtiBox} ${mbtiStyles.mbtiBox}`} style={{ marginTop: 15 }}>
      <span className={mbtiStyles.mbtiBoxTitle}>MBTI</span>
      <span className={mbtiStyles.mbtiBoxContent}>{mbti || 'MBTI가 입력되지 않았습니다.'}</span>
    </div>
  );
}

// 2) 소개 박스
interface ProfileIntroduceBoxProps {
  introduce?: string;
  isMyProfile: boolean;
  onEdit: () => void;
  obscured?: boolean;
}

export function ProfileIntroduceBox({ introduce, isMyProfile, onEdit, obscured = false }: ProfileIntroduceBoxProps) {
  return (
    <div
      className={styles.introduceBox}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: 10 }}
    >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BsSuitDiamondFill size={16} color="#257EFE" style={{ position: 'relative', top: 1 }} />
                <span style={{ fontSize: 17, color: '#222', fontWeight: 600, lineHeight: '18px', position: 'relative', top: 2.5, marginBottom: 5 }}>소개</span>
              </div>
              <span style={{ fontSize: 14, color: '#888', fontWeight: 400, marginTop: 12, lineHeight: '1.6', filter: obscured ? 'blur(4px)' : 'none' }}>
        {introduce || '소개를 작성해보세요 !'}
      </span>
    </div>
  );
}

// 3) 이력 박스
interface HistoryItem {
  school: string;
  period: string;
  role: string;
}

interface ProfileHistoryBoxProps {
  history: HistoryItem[];
  isMyProfile: boolean;
  onEdit: () => void;
  obscured?: boolean;
}

export function ProfileHistoryBox({ history, isMyProfile, onEdit, obscured = false }: ProfileHistoryBoxProps) {
  return (
    <div className={styles.historyBox} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BsSuitDiamondFill size={16} color="#257EFE" style={{ position: 'relative', top: 1 }} />
        <span style={{ fontSize: 17, color: '#222', fontWeight: 600, lineHeight: '18px', position: 'relative', top: 2.5, marginBottom: 5 }}>이력</span>
      </div>
      <div style={{ marginTop: 12, color: '#888', fontWeight: 600, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', filter: obscured ? 'blur(4px)' : 'none' }}>
        {history && history.length > 0 ? (
          history.map((h, i) => (
            <div
              key={i}
              className={styles.historyContent}
              style={{
                background: '#fff',
                borderRadius: 24,
                boxShadow: '0 1px 6px 0 rgba(99,106,232,0.07)',
                padding: '15px 16px 13px 16px',
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: '#222', fontWeight: 400, fontSize: 15 }}>{h.school}</span>
                <span style={{ color: '#888', fontWeight: 400, fontSize: 12, marginTop: 6 }}>{h.period}</span>
              </div>
              <span
                style={{
                  color: '#000',
                  fontWeight: 500,
                  fontSize: 12,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                  padding: '8px 4px',
                  marginLeft: 16,
                  display: 'inline-block',
                  minWidth: 64,
                  textAlign: 'center',
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
  );
}

// 4) 경력 박스
interface CareerItem {
  org: string;
  dept: string;
  period: string;
  months: number;
  role: string;
}

interface ProfileCareerBoxProps {
  career: CareerItem[];
  isMyProfile: boolean;
  onEdit: () => void;
  obscured?: boolean;
}

export function ProfileCareerBox({ career, isMyProfile, onEdit, obscured = false }: ProfileCareerBoxProps) {
  return (
    <div className={styles.historyBox} style={{ position: 'relative', marginTop: 10, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BsSuitDiamondFill size={16} color="#257EFE" style={{ position: 'relative', top: 1 }} />
        <span style={{ fontSize: 17, color: '#222', fontWeight: 600, lineHeight: '18px', position: 'relative', top: 2.5, marginBottom: 5 }}>경력</span>
      </div>
      <div style={{ marginTop: 12, color: '#888', fontWeight: 500, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', filter: obscured ? 'blur(4px)' : 'none' }}>
        {career && career.length > 0 ? (
          career.map((c, i) => (
            <div
              key={i}
              className={styles.historyContent}
              style={{
                background: '#fff',
                borderRadius: 24,
                boxShadow: '0 1px 6px 0 rgba(99,106,232,0.07)',
                padding: '15px 16px 13px 16px',
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: '#222', fontWeight: 400, fontSize: 15, marginTop: 6 }}>{c.org}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 4 }}>
                  <span style={{ color: '#9095A0FF', fontWeight: 400, fontSize: 13 }}>{c.dept}</span>
                  <span style={{ color: '#888', fontSize: 12, fontWeight: 500 }}>{c.months}개월</span>
                </div>
                <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}>
                  {c.period}
                </span>
              </div>
              <span
                style={{
                  color: '#000',
                  fontWeight: 500,
                  fontSize: 12,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                  padding: '8px 4px',
                  marginLeft: 16,
                  display: 'inline-block',
                  minWidth: 64,
                  textAlign: 'center',
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
  );
}