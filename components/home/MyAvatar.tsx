import React from 'react';
import Link from 'next/link';
import styles from '../../styles/styles.module.css';

type Props = {
  loading: boolean;
  userId: string | null;
  myProfile: {
    id: string;
    name: string;
    img?: string;
  } | null;
};

const MyAvatar: React.FC<Props> = ({ loading, userId, myProfile }) => {
  return (
    <div className={styles.sectionBlock}>
      <h4 className={styles.sectionTitle} style={{ marginBottom: 8 }}>나의 아바타</h4>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#636AE8', margin: 24 }}>
          불러오는 중...
        </div>
      ) : userId && myProfile ? (
        <Link href={`/profile/${myProfile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.friendRow}>
            <div className={styles.HomeAvatarWrap}>
              <img
                src={myProfile.img || '/chat/profile.png'}
                alt={myProfile.name}
                width={56}
                height={56}
                className={styles.avatarImg}
              />
            </div>
            <span className={styles.friendName}>{myProfile.name}</span>
          </div>
        </Link>
      ) : (
        <div style={{ textAlign: 'center', color: '#888', margin: 24, fontSize: 16 }}>
          로그인 후 나의 아바타가 표시됩니다.
          <Link href="/register/login" style={{ color: '#636AE8', textDecoration: 'underline', marginLeft: 4 }}>
            로그인 하러가기
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyAvatar;