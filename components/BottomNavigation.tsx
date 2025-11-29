import React from 'react';
import { useRouter } from 'next/router';
import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { MdOutlineLibraryBooks, MdLibraryBooks } from 'react-icons/md';
import { IoShareSocialOutline, IoShareSocial } from 'react-icons/io5';
import { IoChatbubblesOutline, IoChatbubbles } from 'react-icons/io5';
import { BsPerson, BsPersonFill } from 'react-icons/bs';
import styles from '../styles/bottomNavigation.module.css';

interface BottomNavigationProps {
  currentPath?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPath }) => {
  const router = useRouter();
  const activePath = currentPath || router.pathname;

  const navItems = [
    {
      label: '홈',
      path: '/',
      icon: AiFillHome,
      activeIcon: AiFillHome,
    },
    {
      label: '메모리',
      path: '/memory',
      icon: MdLibraryBooks,
      activeIcon: MdLibraryBooks,
    },
    {
      label: '',
      path: '/share',
      icon: IoShareSocial,
      activeIcon: IoShareSocial,
      isSpecial: true, // 공유 버튼 특별 표시
    },
    {
      label: '채팅',
      path: '/chat',
      icon: IoChatbubbles,
      activeIcon: IoChatbubbles,
    },
    {
      label: '마이페이지',
      path: '/mypage',
      icon: BsPersonFill,
      activeIcon: BsPersonFill,
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = activePath === item.path;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <button
            key={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.isSpecial ? styles.special : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon 
              className={styles.icon} 
              size={24}
            />
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;

