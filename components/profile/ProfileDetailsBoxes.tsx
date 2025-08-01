import React from 'react';
import styles from '../../styles/styles.module.css';
import mbtiStyles from '../../styles/MbtiModal.module.css';
import { FiEdit2 } from 'react-icons/fi';

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
      {isMyProfile && (
        <FiEdit2
          size={20}
          color="#000"
          className={mbtiStyles.mbtiEditIcon}
          onClick={onEdit}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>
  );
}

// 2) 소개 박스
interface ProfileIntroduceBoxProps {
  introduce?: string;
  isMyProfile: boolean;
  onEdit: () => void;
}

export function ProfileIntroduceBox({ introduce, isMyProfile, onEdit }: ProfileIntroduceBoxProps) {
  return (
    <div
      className={styles.introduceBox}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: 10 }}
    >
      <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>소개</span>
      <span style={{ fontSize: 15, color: '#888', fontWeight: 500, marginTop: 12 }}>
        {introduce || '소개를 작성해보세요 !'}
      </span>
      {isMyProfile && (
        <FiEdit2
          size={20}
          color="#000"
          style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
          onClick={onEdit}
        />
      )}
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
}

export function ProfileHistoryBox({ history, isMyProfile, onEdit }: ProfileHistoryBoxProps) {
  return (
    <div className={styles.historyBox} style={{ position: 'relative' }}>
      <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>이력</span>
      {isMyProfile && (
        <FiEdit2
          size={20}
          color="#000"
          style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
          onClick={onEdit}
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
                justifyContent: 'space-between',
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
}

export function ProfileCareerBox({ career, isMyProfile, onEdit }: ProfileCareerBoxProps) {
  return (
    <div className={styles.historyBox} style={{ position: 'relative', marginTop: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 18, color: '#222', fontWeight: 600 }}>경력</span>
      {isMyProfile && (
        <FiEdit2
          size={20}
          color="#000"
          style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
          onClick={onEdit}
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
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>{c.org}</span>
                <span style={{ color: '#9095A0FF', fontWeight: 500, fontSize: 14, marginTop: 6, marginBottom: 6 }}>
                  {c.dept}
                </span>
                <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginTop: 2 }}>
                  {c.period}
                  <span style={{ color: '#000', fontSize: 13, fontWeight: 600 }}>{c.months}개월</span>
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