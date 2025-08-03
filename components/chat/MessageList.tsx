import React from 'react';
import styles from '../../styles/chat.module.css';
import { sanitizeHtml } from '../../types/sanitizeHtml';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai' | string;
  timestamp: Date;
};

type ProfileInfo = {
  id: string;
  name: string;
  img: string;
};

type MessageListProps = {
  loading: boolean;
  messages: Message[];
  isWaitingForReply: boolean;
  profileName: string;
  profileInfo?: ProfileInfo | null;
  scrollRef: React.RefObject<HTMLDivElement>;
};

const MessageList: React.FC<MessageListProps> = ({
  loading, messages, isWaitingForReply, profileInfo, scrollRef
}) => (
  <div className={styles.messageSection}>
    {loading ? (
      <div style={{
        width: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '10px 0'
      }}>
        <div className="spinner" style={{ marginBottom: 6, transform: 'scale(0.8)' }} />
        <div style={{ fontSize: 12, color: '#636AE8', fontWeight: 500 }}>
          메시지를 불러오는 중입니다...
        </div>
      </div>
    ) : messages.length === 0 ? null : (
      messages.map((msg) => {
        const isAI = msg.sender === 'ai';
        const msgTypeClass = isAI ? styles.bot : styles.user;
        return (
          <div key={msg.id} className={`${styles.msgWrapper} ${msgTypeClass}`}>
            <div className={styles.name}>
              {isAI ? (profileInfo?.name || "AI") : "You"}
            </div>
            <div
              className={styles.bubble}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
                )
              }}
            />
          </div>
        );
      })
    )}
    {isWaitingForReply && (
      <div className={styles.typingIndicator} style={{ 
        marginTop: messages.length === 0 ? '10px' : '8px',
        marginBottom: messages.length === 0 ? '10px' : '8px'
      }}>
        <div className={styles.wave}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>
    )}
    <div ref={scrollRef} />
  </div>
);

export default MessageList;