import React from 'react';
import { useRouter } from 'next/router';
import { IoArrowBack, IoNotifications, IoSettings } from 'react-icons/io5';
import { FiSettings } from 'react-icons/fi';
import styles from '../styles/notifications.module.css';

const NotificationsPage: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    // 설정 페이지로 이동하는 로직 추가 가능
    console.log('설정 페이지로 이동');
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerContent} style={{ position: 'relative', justifyContent: 'center' }}>
          {/* 왼쪽 상단 뒤로가기 버튼 */}
          <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: 40,
              width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="뒤로가기"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* 가운데 텍스트 */}
          <span style={{ fontWeight: 700, fontSize: 18, textAlign: 'center' }}>
            알림
          </span>
          {/* 오른쪽 환경설정 버튼 */}
          <button
            onClick={handleSettings}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: 40,
              width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="환경설정"
          >
            <FiSettings size={24} color="#222" />
          </button>
        </div>
        <div className={styles.grayLine} />
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/char.png" alt="캐릭터" style={{ width: 120, height: 120, marginBottom: 16 }} />
          <span style={{ color: '#888', fontSize: 16 }}>받은 알림이 없어요!</span>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
