import React from 'react';
import styles from '../../styles/styles.module.css';
import Link from 'next/link';

interface ProfileActionButtonProps {
  isMyProfile: boolean;
  isFriend: boolean;
  requestSent: boolean;
  requesting: boolean;
  profileId: string;
  onSendFriendRequest: () => void;
}

function ProfileActionButton({
  isMyProfile,
  isFriend,
  requestSent,
  requesting,
  profileId,
  onSendFriendRequest,
}: ProfileActionButtonProps) {
  return (
    <div>
      {isMyProfile ? (
        <Link href={`/chat/${profileId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <button className={styles.chatButton}>대화하기</button>
        </Link>
      ) : isFriend ? (
        <Link href={`/chat/${profileId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <button className={styles.chatButton}>대화하기</button>
        </Link>
      ) : requestSent ? (
        <button className={styles.chatButton} disabled>
          요청됨
        </button>
      ) : (
        <button className={styles.chatButton} onClick={onSendFriendRequest} disabled={requesting}>
          {requesting ? '요청중...' : '친구추가'}
        </button>
      )}
    </div>
  );
}

export default ProfileActionButton;