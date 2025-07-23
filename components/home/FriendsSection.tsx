import React from 'react';
import Link from 'next/link';
import styles from '../../styles/styles.module.css';

type Friend = {
  id: string;
  friendName: string;
  friendAvatar: string;
};

type Props = {
  title: string;
  friends: Friend[];
  loading: boolean;
};

const FriendsSection: React.FC<Props> = ({ title, friends, loading }) => {
  return (
    <div className={styles.sectionBlock}>
      <h4 className={styles.sectionTitle}>{title}</h4>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#636AE8', margin: 24 }}>불러오는 중...</div>
      ) : friends.length === 0 ? (
        <div style={{ color: '#888', padding: '12px 0', fontSize: 14, textAlign: 'center' }}>
          친구가 없습니다.
        </div>
      ) : (
        friends.map(friend => (
          <Link
            href={`/profile/${friend.id}`}
            key={friend.id}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles.friendRow}>
              <div className={styles.HomeAvatarWrap}>
                <img
                  src={friend.friendAvatar || '/chat/profile.png'}
                  alt={friend.friendName}
                  width={56}
                  height={56}
                  className={styles.avatarImg}
                />
              </div>
              <span className={styles.friendName}>{friend.friendName}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default FriendsSection;