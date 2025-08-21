import React from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { MdDocumentScanner, MdNotificationsActive, MdBlock } from 'react-icons/md';
import { BiQrScan } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import styles from '../../styles/profile.module.css';

const ICON_SIZE = 24;

interface ProfileHeaderProps {
  isMyProfile: boolean;
  onBack: () => void;
  isFriend: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEditProfile: () => void;
  onScan: () => void;
  onShowQR: () => void;
  onBlock: () => void;
  onReport: () => void;
}

function ProfileHeader({
  isMyProfile,
  onBack,
  isFriend,
  isFavorite,
  onToggleFavorite,
  onEditProfile,
  onScan,
  onShowQR,
  onBlock,
  onReport,
}: ProfileHeaderProps) {
  return (
    <div style={{ position: 'relative', justifyContent: 'center', display: 'flex', alignItems: 'center', height: 120 }}>
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
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
          justifyContent: 'center',
        }}
        aria-label="뒤로가기"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 중앙 타이틀 */}
      <span className={styles.headerTitle} style={{ fontWeight: 700, fontSize: 17, textAlign: 'center' }}>프로필</span>

      {/* 오른쪽 아이콘 그룹 */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 40,
          marginRight: '10px',
        }}
      >
        {isMyProfile ? (
          <>
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="프로필 편집"
              onClick={onEditProfile}
            >
              <FiEdit2 size={ICON_SIZE} color="#222" />
            </button>
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="카메라 스캔"
              onClick={onScan}
            >
              <MdDocumentScanner size={ICON_SIZE} color="#222" />
            </button>
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="QR코드"
              onClick={onShowQR}
            >
              <BiQrScan size={ICON_SIZE} color="#222" />
            </button>
          </>
        ) : (
          <>
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="차단"
              onClick={onBlock}
            >
              <MdBlock size={ICON_SIZE} color="#222" />
            </button>
            {isFriend && (
              <button
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="즐겨찾기"
                onClick={onToggleFavorite}
              >
                <FaStar size={ICON_SIZE} color={isFavorite ? '#FFD700' : '#D3D3D3'} />
              </button>
            )}
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="신고"
              onClick={onReport}
            >
              <MdNotificationsActive size={ICON_SIZE} color="#E53935" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;