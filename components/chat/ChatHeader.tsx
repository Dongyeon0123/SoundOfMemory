import React from 'react';
import styles from '../../styles/chat.module.css';
import { useRouter } from 'next/router';

type ChatHeaderProps = {
  title: string;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  const router = useRouter();
  return (
    <div className={styles.header}>
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
          justifyContent: 'center',
        }}
        aria-label="뒤로가기"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default ChatHeader;