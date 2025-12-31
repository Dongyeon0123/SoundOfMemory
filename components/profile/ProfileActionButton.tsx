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
  const [showFileOptions, setShowFileOptions] = React.useState(false);

  const handleFileUpload = (type: 'video' | 'image' | 'pdf') => {
    const input = document.createElement('input');
    input.type = 'file';
    
    if (type === 'video') {
      input.accept = 'video/*';
    } else if (type === 'image') {
      input.accept = 'image/*';
    } else if (type === 'pdf') {
      input.accept = 'application/pdf';
    }
    
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        console.log(`${type} 파일 선택:`, file);
        // TODO: 파일 업로드 로직 구현
      }
    };
    input.click();
    setShowFileOptions(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      {isGuest ? (
        // 게스트 프로필에서의 분기 로직
        <>
          {showFriendButton ? (
            // case1: 로그인 O, 친구 O → "AI와 대화하기" 버튼
            isFriend ? (
              <button className={styles.chatButton} onClick={onStartFriendChat} style={{ width: '80%' }}>
                AI와 대화하기
              </button>
            ) : (
              // case2: 로그인 O, 친구 X → "친구요청" 버튼
              requestSent ? (
                <button className={styles.chatButton} disabled style={{ width: '80%' }}>
                  요청됨
                </button>
              ) : (
                <button className={styles.chatButton} onClick={onSendFriendRequest} disabled={requesting} style={{ width: '80%' }}>
                  {requesting ? '요청중...' : '친구추가'}
                </button>
              )
            )
          ) : (
            // case3: 로그인 X 또는 익명 → "AI와 대화하기(게스트)" 버튼
            <button className={styles.chatButton} onClick={onStartGuestChat} style={{ width: '80%' }}>
              AI와 대화하기{isAnonymous ? '(게스트)' : ''}
            </button>
          )}
        </>
      ) : isMyProfile ? (
        <>
          <Link href={`/chat/${profileId}`} style={{ textDecoration: 'none', color: 'inherit', width: '80%' }}>
            <button className={styles.chatButton} style={{ width: '100%' }}>AI와 대화하기</button>
          </Link>
          
          {/* 파일 추가 버튼 */}
          <button
            onClick={() => setShowFileOptions(!showFileOptions)}
            style={{
              width: '80%',
              padding: '80px 20px',
              background: '#D9D9D9',
              border: 'none',
              borderRadius: 16,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#C0C0C0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#D9D9D9';
            }}
          >
            영상, 이미지, PDF 추가하기
          </button>

          {/* 파일 타입 선택 옵션 */}
          <div
            style={{
              maxHeight: showFileOptions ? '100px' : '0',
              opacity: showFileOptions ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.3s ease, opacity 0.3s ease',
              width: '80%',
            }}
          >
            <div style={{
              display: 'flex',
              gap: 8,
              width: '100%',
            }}>
              <button
                onClick={() => handleFileUpload('video')}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: '#fff',
                  border: '1px solid #E5E8EB',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#636AE8',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8F9FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                영상
              </button>
              <button
                onClick={() => handleFileUpload('image')}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: '#fff',
                  border: '1px solid #E5E8EB',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#636AE8',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8F9FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                이미지
              </button>
              <button
                onClick={() => handleFileUpload('pdf')}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: '#fff',
                  border: '1px solid #E5E8EB',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#636AE8',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8F9FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                PDF
              </button>
            </div>
          </div>
        </>
      ) : isFriend ? (
        <Link href={`/chat/${profileId}`} style={{ textDecoration: 'none', color: 'inherit', width: '80%' }}>
          <button className={styles.chatButton} style={{ width: '100%' }}>AI와 대화하기</button>
        </Link>
      ) : requestSent ? (
        <button className={styles.chatButton} disabled style={{ width: '80%' }}>
          요청됨
        </button>
      ) : (
        <button className={styles.chatButton} onClick={onSendFriendRequest} disabled={requesting} style={{ width: '80%' }}>
          {requesting ? '요청중...' : '친구추가'}
        </button>
      )}
    </div>
  );
}

export default ProfileActionButton;