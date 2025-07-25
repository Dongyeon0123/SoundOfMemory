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
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 200
      }}>
        <div className="spinner" style={{ marginBottom: 18 }} />
        <div style={{ fontSize: 16, color: '#636AE8', fontWeight: 600 }}>
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
              {isAI ? profileInfo?.name : "You"}
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
      <div className={styles.typingIndicator}>
        <div className={styles.wave}>
          <div className={styles.dot}></div>
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