import React from 'react';
import styles from '../styles/styles.module.css';
import { useRouter } from 'next/router';
import { FiSettings } from 'react-icons/fi';

const FriendRequests: React.FC = () => {
  const router = useRouter();
  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        <div className={styles.fixedHeader}>
          <div className={styles.headerContent} style={{ position: 'relative', justifyContent: 'center' }}>
            {/* 왼쪽 상단 뒤로가기 버튼 */}
            <button
              onClick={() => router.back()}
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
            <span style={{ fontWeight: 700, fontSize: 18, textAlign: 'center' }}>친구 요청</span>
            {/* 오른쪽 환경설정 버튼 */}
            <button
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
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <img src="/char.png" alt="캐릭터" style={{ width: 120, height: 120, marginBottom: 16 }} />
          <span style={{ color: '#888', fontSize: 16 }}>아직 친구 요청이 없습니다.</span>
        </div>
      </div>
    </div>
  );
};

export default FriendRequests; 