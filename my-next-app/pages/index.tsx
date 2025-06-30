import React from 'react';
import Image from 'next/image';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import styles from '../styles/styles.module.css';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { profiles } from '../profiles';

const myAvatar = profiles.find(p => p.name === '임승원');
const favorites = profiles.filter(p => p.name === '한윤석');
const friends = profiles.filter(p => ['이동연', '김희용', '박준형', 'DongYeon'].includes(p.name));

export default function Home() {
  const profile = useSelector((state: RootState) => state.profile);
  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div className={styles.headerContent}>
            <Image src="/logo.png" alt="logo" width={60} height={60} />
            <div className={styles.iconGroup}>
              <FiSearch size={26} />
              <div className={styles.iconWithBadge}>
                <IoNotificationsOutline size={26} />
                <span className={styles.plusBadge}>+</span>
              </div>
              <div className={styles.iconWithBadge}>
                <FaUser size={26} />
                <span className={styles.plusBadge}>+</span>
              </div>
              <FiSettings size={26} />
            </div>
          </div>
          <div className={styles.grayLine} />
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain}>
          {/* 나의 아바타 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>나의 아바타</h4>
            {myAvatar && (
              <Link href={`/profile/${myAvatar.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.avatarWrap}>
                    <Image src={myAvatar.img} alt={myAvatar.name} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{myAvatar.name}</span>
                </div>
              </Link>
            )}
          </div>
          {/* 즐겨찾기 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>즐겨찾기</h4>
            {favorites.map(friend => (
              <Link href={`/profile/${friend.name}`} key={friend.name} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.avatarWrap}>
                    <Image src={friend.img} alt={friend.name} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{friend.name}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* 친구 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>친구</h4>
            {friends.map(friend => (
              <Link href={`/profile/${friend.name}`} key={friend.name} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.friendRow}>
                  <div className={styles.avatarWrap}>
                    <Image src={friend.img} alt={friend.name} width={56} height={56} className={styles.avatarImg} />
                  </div>
                  <span className={styles.friendName}>{friend.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 