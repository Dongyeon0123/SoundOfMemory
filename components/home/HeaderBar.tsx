import React from 'react';
import styles from '../../styles/styles.module.css';
import Link from 'next/link';
import { RiMenu3Line } from 'react-icons/ri';

type HeaderBarProps = {
  userId: string | null;
  pendingRequestsCount: number;
  unreadAnnouncementsCount: number;
  onLogout: () => void;
  onSearchClick: () => void;
  onMenuClick: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  userId,
  pendingRequestsCount,
  unreadAnnouncementsCount,
  onLogout,
  onSearchClick,
  onMenuClick,
}) => {
  return (
    <div className={styles.fixedHeader} style={{ position: 'relative', zIndex: 100 }}>
      <div className={styles.headerContent}>
        {/* 로고 */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <img src="/logo.png" alt="logo" width={60} height={60} />
        </Link>

        {/* 햄버거 아이콘 */}
        <div style={{ 
          marginLeft: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <button
            onClick={onMenuClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              position: 'relative',
              zIndex: 10,
            }}
            aria-label="메뉴 열기"
          >
            <RiMenu3Line size={24} color="#222" style={{ display: 'block', pointerEvents: 'none' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;