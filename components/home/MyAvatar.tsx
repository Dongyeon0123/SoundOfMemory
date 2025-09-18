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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            margin: 24,
            padding: 20,
            border: '1px solid #EEEFFB',
            borderRadius: 12,
            background: '#FAFBFF',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: '#E8EAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#636AE8',
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            🙂
          </div>
          <div style={{ fontWeight: 700, color: '#2B2C34', fontSize: 16 }}>
            로그인이 필요합니다
          </div>
          <div style={{ color: '#6B7280', fontSize: 14 }}>
            로그인하면 나의 아바타가 표시돼요.
          </div>
          <Link
            href="/register/login"
            style={{
              marginTop: 4,
              background: '#636AE8',
              color: '#FFFFFF',
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(99, 106, 232, 0.25)'
            }}
          >
            로그인 하러 가기
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyAvatar;