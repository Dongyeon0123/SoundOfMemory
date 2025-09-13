import React from 'react';
import styles from '../../styles/styles.module.css';
import Link from 'next/link';

interface ProfileActionButtonProps {
  isMyProfile: boolean;
  isGuest?: boolean; // 게스트 모드 여부
  isFriend: boolean;
  requestSent: boolean;
  requesting: boolean;
  profileId: string;
  onSendFriendRequest: () => void;
  onStartFriendChat?: () => void;
  onStartGuestChat?: () => void;
  showFriendButton?: boolean;
  isAnonymous?: boolean | null;
}

function ProfileActionButton({
  isMyProfile,
  isGuest = false,
  isFriend,
  requestSent,
  requesting,
  profileId,
  onSendFriendRequest,
  onStartFriendChat,
  onStartGuestChat,
  showFriendButton = false,
  isAnonymous,
}: ProfileActionButtonProps) {
  return (
    <div>
      {isGuest ? (
        // 게스트 프로필에서의 분기 로직
        <>
          {showFriendButton ? (
            // case1: 로그인 O, 친구 O → "대화하기" 버튼
            isFriend ? (
              <button className={styles.chatButton} onClick={onStartFriendChat}>
                대화하기
              </button>
            ) : (
              // case2: 로그인 O, 친구 X → "친구요청" 버튼
              requestSent ? (
                <button className={styles.chatButton} disabled>
                  요청됨
                </button>
              ) : (
                <button className={styles.chatButton} onClick={onSendFriendRequest} disabled={requesting}>
                  {requesting ? '요청중...' : '친구추가'}
                </button>
              )
            )
          ) : (
            // case3: 로그인 X 또는 익명 → "대화하기(게스트)" 버튼
            <button className={styles.chatButton} onClick={onStartGuestChat}>
              대화하기{isAnonymous ? '(게스트)' : ''}
            </button>
          )}
        </>
      ) : isMyProfile ? (
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