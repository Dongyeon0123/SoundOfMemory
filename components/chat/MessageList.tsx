import React from 'react';
import ReactMarkdown from 'react-markdown';
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
        <div style={{ fontSize: 11, color: '#636AE8', fontWeight: 500 }}>
          메시지를 불러오는 중입니다...
        </div>
      </div>
    ) : messages.length === 0 ? null : (
      messages.map((msg) => {
        const isAI = msg.sender === 'ai';
        const msgTypeClass = isAI ? styles.bot : styles.user;
        
        // 디버깅용 로그
        console.log('Message:', { 
          id: msg.id, 
          sender: msg.sender, 
          isAI, 
          content: msg.content?.substring(0, 50) + '...' 
        });
        return (
          <div key={msg.id} className={`${styles.msgWrapper} ${msgTypeClass}`}>
            <div className={styles.name}>
              {isAI ? (profileInfo?.name || "AI") : "You"}
            </div>
            <div className={styles.bubble}>
              {isAI ? (
                <>
                  <ReactMarkdown
                    remarkPlugins={[]}
                    rehypePlugins={[]}
                    components={{
                    // 코드 블록 스타일링
                    code: ({ node, inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <code 
                            style={{
                              backgroundColor: '#f4f4f4',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontFamily: 'monospace',
                              fontSize: '0.9em'
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre
                          style={{
                            backgroundColor: '#f4f4f4',
                            padding: '12px',
                            borderRadius: '6px',
                            overflow: 'auto',
                            margin: '8px 0'
                          }}
                        >
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    // 리스트 스타일링
                    ul: ({ children }) => (
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {children}
                      </ol>
                    ),
                    // 제목 스타일링
                    h1: ({ children }) => (
                      <h1 style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '8px 0' }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '6px 0' }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{ fontSize: '1em', fontWeight: 'bold', margin: '4px 0' }}>
                        {children}
                      </h3>
                    ),
                    // 강조 텍스트
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 'bold' }}>
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em style={{ fontStyle: 'italic' }}>
                        {children}
                      </em>
                    ),
                    // 링크
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#636AE8', 
                          textDecoration: 'underline' 
                        }}
                      >
                        {children}
                      </a>
                    ),
                    // 인용문
                    blockquote: ({ children }) => (
                      <blockquote 
                        style={{
                          borderLeft: '4px solid #636AE8',
                          paddingLeft: '12px',
                          margin: '8px 0',
                          fontStyle: 'italic',
                          color: '#666'
                        }}
                      >
                        {children}
                      </blockquote>
                    ),
                    // 단락 처리
                    p: ({ children }) => (
                      <p style={{ margin: '8px 0', lineHeight: '1.6' }}>
                        {children}
                      </p>
                    ),
                    // 줄바꿈 처리
                    br: () => <br />,
                    // 텍스트 처리
                    text: ({ children }) => {
                      if (typeof children === 'string') {
                        // 연속된 줄바꿈을 <br>로 변환
                        return children.split('\n').map((line, index, array) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < array.length - 1 && <br />}
                          </React.Fragment>
                        ));
                      }
                      return children;
                    }
                  }}
                >
                  {(() => {
                    const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
                    
                    // 마크다운 코드 블록 제거
                    let processedContent = content;
                    
                    // ```markdown ... ``` 패턴 제거
                    processedContent = processedContent.replace(/```markdown\s*\n?([\s\S]*?)\n?```/g, '$1');
                    
                    // ``` ... ``` 패턴 제거 (일반 코드 블록)
                    processedContent = processedContent.replace(/```\s*\n?([\s\S]*?)\n?```/g, '$1');
                    
                    // 줄바꿈 정규화 (연속된 줄바꿈을 단일 줄바꿈으로)
                    processedContent = processedContent.replace(/\n{3,}/g, '\n\n');
                    
                    // 공백 정규화
                    processedContent = processedContent.replace(/[ \t]+/g, ' ');
                    
                    return processedContent;
                  })()}
                </ReactMarkdown>
                </>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(
                      typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
                    )
                  }}
                />
              )}
            </div>
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