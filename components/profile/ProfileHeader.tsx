import React, { useState, useRef, useEffect } from 'react';
import { FiEdit2, FiMoreVertical } from 'react-icons/fi';
import { MdDocumentScanner, MdNotificationsActive, MdBlock } from 'react-icons/md';
import { BiQrScan } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import styles from '../../styles/profile.module.css';

const ICON_SIZE = 24;

interface ProfileHeaderProps {
  isMyProfile: boolean;
  isGuest?: boolean; // 게스트 모드 여부
  onBack: () => void;
  isFriend: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEditProfile: () => void;
  onScan: () => void;
  onShowQR: () => void;
  onBlock: () => void;
  onReport: () => void;
  onEditMBTI?: () => void;
  onEditIntroduce?: () => void;
  onEditHistory?: () => void;
  onEditCareer?: () => void;
}

function ProfileHeader({
  isMyProfile,
  isGuest = false,
  onBack,
  isFriend,
  isFavorite,
  onToggleFavorite,
  onEditProfile,
  onScan,
  onShowQR,
  onBlock,
  onReport,
  onEditMBTI,
  onEditIntroduce,
  onEditHistory,
  onEditCareer,
}: ProfileHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 80, padding: '-0 5px', paddingTop: 30 }}>
      {/* 게스트 모드가 아닐 때만 뒤로가기 버튼 표시 */}
      {!isGuest && (
        <button
          onClick={onBack}
          style={{
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
      )}

      {/* 중앙 타이틀 */}
      <span className={styles.headerTitle} style={{ fontWeight: 700, fontSize: 17, textAlign: 'center', flex: 1 }}>
        {isMyProfile ? '내 프로필' : '프로필'}
      </span>

      {/* 게스트 모드가 아닐 때만 오른쪽 드롭다운 메뉴 표시 */}
      {!isGuest && (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
            aria-label="메뉴"
          >
            <FiMoreVertical size={ICON_SIZE} color="#222" />
          </button>

          {/* 드롭다운 메뉴 */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 60,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '8px 0',
                minWidth: 160,
                zIndex: 1000,
                border: '1px solid #f0f0f0',
              }}
            >
              {isMyProfile ? (
                <>
                  <button
                    onClick={() => {
                      onEditProfile();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <FiEdit2 size={18} color="#222" />
                    프로필 편집
                  </button>
                  <button
                    onClick={() => {
                      onScan();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <MdDocumentScanner size={18} color="#222" />
                    QR 스캔
                  </button>
                  <button
                    onClick={() => {
                      onShowQR();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <BiQrScan size={18} color="#222" />
                    내 QR코드
                  </button>

                  {/* 편집 하위 항목 */}
                  <div style={{ height: 1, background: '#F2F3F7', margin: '4px 0' }} />
                  <button
                    onClick={() => {
                      onEditMBTI && onEditMBTI();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <span style={{ width: 18, textAlign: 'center' }}>🔤</span>
                    MBTI 수정
                  </button>
                  <button
                    onClick={() => {
                      onEditIntroduce && onEditIntroduce();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <span style={{ width: 18, textAlign: 'center' }}>✏️</span>
                    소개 수정
                  </button>
                  <button
                    onClick={() => {
                      onEditHistory && onEditHistory();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <span style={{ width: 18, textAlign: 'center' }}>📜</span>
                    이력 수정
                  </button>
                  <button
                    onClick={() => {
                      onEditCareer && onEditCareer();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <span style={{ width: 18, textAlign: 'center' }}>🏢</span>
                    경력 수정
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onBlock();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#333',
                    }}
                  >
                    <MdBlock size={18} color="#222" />
                    차단하기
                  </button>
                  {isFriend && (
                    <button
                      onClick={() => {
                        onToggleFavorite();
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 14,
                        color: '#333',
                      }}
                    >
                      <FaStar size={18} color={isFavorite ? '#FFD700' : '#D3D3D3'} />
                      {isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onReport();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#E53935',
                    }}
                  >
                    <MdNotificationsActive size={18} color="#E53935" />
                    신고하기
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;