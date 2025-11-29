import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiSearch, FiSettings, FiX } from 'react-icons/fi';
import { IoNotificationsOutline, IoPersonOutline } from 'react-icons/io5';
import { RiMenu3Line } from 'react-icons/ri';
import styles from '../../styles/hamburgerMenu.module.css';

const ICON_SIZE = 22;

type HamburgerMenuProps = {
  userId: string | null;
  pendingRequestsCount: number;
  unreadAnnouncementsCount: number;
  onSearchClick: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  userId,
  pendingRequestsCount,
  unreadAnnouncementsCount,
  onSearchClick,
  isOpen: externalIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const router = useRouter();

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const handleSearchClick = () => {
    setIsOpen(false);
    onSearchClick();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 오버레이 */}
      <div className={styles.overlay} onClick={() => setIsOpen(false)} />

      {/* 사이드 메뉴 */}
      <div className={`${styles.sideMenu} ${styles.open}`}>
        {/* 닫기 버튼 */}
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <FiX size={24} color="#222" />
        </button>

        {/* 메뉴 아이템들 */}
        <div className={styles.menuItems}>
          <button className={styles.menuItem} onClick={handleSearchClick}>
            <FiSearch size={ICON_SIZE} color="#222" />
            <span>검색</span>
          </button>

          <Link href="/notifications" className={styles.menuItem} onClick={() => setIsOpen(false)}>
            <div className={styles.menuItemContent}>
              <IoNotificationsOutline size={ICON_SIZE} color="#222" />
              <span>알림</span>
              {unreadAnnouncementsCount > 0 && (
                <div className={styles.badge}>
                  {unreadAnnouncementsCount > 9 ? '9+' : unreadAnnouncementsCount}
                </div>
              )}
            </div>
          </Link>

          <Link href="/friend/requests" className={styles.menuItem} onClick={() => setIsOpen(false)}>
            <div className={styles.menuItemContent}>
              <IoPersonOutline size={ICON_SIZE} color="#222" />
              <span>친구 요청</span>
              {pendingRequestsCount > 0 && (
                <div className={styles.badge}>
                  {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                </div>
              )}
            </div>
          </Link>

          <button className={styles.menuItem} onClick={handleSettingsClick}>
            <FiSettings size={ICON_SIZE} color="#222" />
            <span>설정</span>
          </button>

          {!userId && (
            <Link href="/register/login" className={styles.loginButton} onClick={() => setIsOpen(false)}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;

