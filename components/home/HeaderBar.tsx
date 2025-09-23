import React from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/styles.module.css';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline, IoPersonOutline } from 'react-icons/io5';
import Link from 'next/link';

const ICON_SIZE = 22;

type HeaderBarProps = {
  userId: string | null;
  pendingRequestsCount: number;
  unreadAnnouncementsCount: number;
  onLogout: () => void;
  onSearchClick: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  userId,
  pendingRequestsCount,
  unreadAnnouncementsCount,
  onLogout,
  onSearchClick,
}) => {
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  return (
    <div className={styles.fixedHeader}>
      <div className={styles.headerContent}>
        {/* 로고 */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="logo" width={60} height={60} />
        </Link>

        {/* 아이콘 & 로그인 섹션 */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexDirection: 'column',
          }}
        >
          <div className={styles.icon}>
            <div className={styles.headerIconBtn}>
              <FiSearch
                size={ICON_SIZE}
                color="#222"
                style={{ cursor: 'pointer' }}
                onClick={onSearchClick}
              />
            </div>
            <Link href="/notifications" className={styles.headerIconBtn}>
              <>
                <IoNotificationsOutline size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} />
                {unreadAnnouncementsCount > 0 && (
                  <div className={styles.plusBadge}>
                    <span style={{ marginTop: 1 }}>
                      {unreadAnnouncementsCount > 9 ? '9+' : unreadAnnouncementsCount}
                    </span>
                  </div>
                )}
              </>
            </Link>
            <Link href="/friend/requests" className={styles.headerIconBtn}>
              <>
                <IoPersonOutline size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} />
                {pendingRequestsCount > 0 && (
                  <div className={styles.plusBadge}>
                    <span style={{ marginTop: 1 }}>
                      {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                    </span>
                  </div>
                )}
              </>
            </Link>
            <div className={styles.headerIconBtn}>
              <FiSettings 
                size={ICON_SIZE} 
                color="#222" 
                style={{ cursor: 'pointer' }}
                onClick={handleSettingsClick}
              />
            </div>
          </div>

          {/* 로그인 버튼만 표시 (로그아웃 버튼 제거) */}
          {!userId ? (
            <Link href="/register/login">
              <button style={{
                    background: '#fff',
                    color: '#636AE8',
                    border: '1.5px solid #636AE8',
                    borderRadius: 6,
                    padding: '6px 18px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginRight: 8
                  }}>로그인</button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;