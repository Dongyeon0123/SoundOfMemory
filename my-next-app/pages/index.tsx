import React from 'react';
import Image from 'next/image';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import styles from '../styles/Home.module.css';

const myAvatar = { name: '임승원', img: '/Selection.png' };
const favorites = [{ name: '한윤석', img: '/Selection-2.png' }];
const friends = [
  { name: '김희용', img: '/Selection-3.png' },
  { name: '박준형', img: '/Selection-4.png' },
  { name: 'DongYeon', img: '/Selection-5.png' },
];

export default function Home() {
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
            <div className={styles.friendRow}>
              <div className={styles.avatarWrap}>
                <Image src={myAvatar.img} alt={myAvatar.name} width={56} height={56} className={styles.avatarImg} />
              </div>
              <span className={styles.friendName}>{myAvatar.name}</span>
            </div>
          </div>
          {/* 즐겨찾기 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>즐겨찾기</h4>
            {favorites.map(friend => (
              <div className={styles.friendRow} key={friend.name}>
                <div className={styles.avatarWrap}>
                  <Image src={friend.img} alt={friend.name} width={56} height={56} className={styles.avatarImg} />
                </div>
                <span className={styles.friendName}>{friend.name}</span>
              </div>
            ))}
          </div>
          {/* 친구 */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>친구</h4>
            {friends.map(friend => (
              <div className={styles.friendRow} key={friend.name}>
                <div className={styles.avatarWrap}>
                  <Image src={friend.img} alt={friend.name} width={56} height={56} className={styles.avatarImg} />
                </div>
                <span className={styles.friendName}>{friend.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 