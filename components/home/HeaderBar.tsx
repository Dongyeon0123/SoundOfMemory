import React from 'react';
import styles from '../../styles/styles.module.css';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import Link from 'next/link';

const ICON_SIZE = 20;

type HeaderBarProps = {
  userId: string | null;
  pendingRequestsCount: number;
  onLogout: () => void;
  onSearchClick: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  userId,
  pendingRequestsCount,
  onLogout,
  onSearchClick,
}) => {
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
          <div className={styles.icon} style={{ marginTop: 30 }}>
            <FiSearch
              size={ICON_SIZE}
              color="#222"
              style={{ cursor: 'pointer' }}
              onClick={onSearchClick}
            />
            <IoNotificationsOutline size={ICON_SIZE} color="#222" />
            <Link
              href="/friend/requests"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <FaUser size={ICON_SIZE} color="#222" style={{ cursor: 'pointer' }} />
              {pendingRequestsCount > 0 && (
                <div className={styles.badge}>
                  {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                </div>
              )}
            </Link>
            <FiSettings size={ICON_SIZE} color="#222" />
          </div>

          {/* 로그인/로그아웃 */}
          {userId ? (
            <button onClick={onLogout} style={{
                background: '#fff',
                color: '#636AE8',
                border: '1.5px solid #636AE8',
                borderRadius: 6,
                padding: '6px 18px',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                marginRight: 8
              }}>
              로그아웃
            </button>
          ) : (
            <Link href="/register/login">
              <button style={{
                    background: '#fff',
                    color: '#636AE8',
                    border: '1.5px solid #636AE8',
                    borderRadius: 6,
                    padding: '6px 18px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginRight: 8
                  }}>로그인</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;