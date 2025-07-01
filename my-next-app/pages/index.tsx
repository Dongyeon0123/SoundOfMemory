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

const myAvatar = profiles.find(p => p.id === '1');
const favorites = profiles.filter(p => p.id === '3');
const friends = profiles.filter(p => ['2', '4', '5', '6'].includes(p.id));

const ICON_SIZE = 20;

export default function Home() {
  const profile = useSelector((state: RootState) => state.profile);
  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div className={styles.headerContent}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo.png" alt="logo" width={60} height={60} />
            </Link>
            <div className={styles.icon}>
                <FiSearch size={ICON_SIZE} color="#222" />
                <IoNotificationsOutline size={ICON_SIZE} color="#222" />
                <FaUser size={ICON_SIZE} color="#222" />
                <FiSettings size={ICON_SIZE} color="#222" />
            </div>
          </div>
          <div className={`${styles.grayLine} ${styles.grayLineWithMargin}`} />
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain}>
          {/* 나의 아바타 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>나의 아바타</h4>
            {myAvatar && (
              <Link href={`/profile/${myAvatar.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
              <Link href={`/profile/${friend.id}`} key={friend.id} style={{ textDecoration: 'none', color: 'inherit' }}>
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
              <Link href={`/profile/${friend.id}`} key={friend.id} style={{ textDecoration: 'none', color: 'inherit' }}>
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