import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiTrash2 } from 'react-icons/fi';
import styles from '../../../styles/styles.module.css';

interface ChatTopicModalProps {
  visible: boolean;
  topicName: string;
  information: string[];
  onClose: () => void;
}

const ChatTopicModal: React.FC<ChatTopicModalProps> = ({
  visible,
  topicName,
  information,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInformation, setFilteredInformation] = useState<string[]>(information);

  useEffect(() => {
    if (information) {
      const filtered = information.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInformation(filtered);
    }
  }, [searchTerm, information]);

  const handleDeleteItem = (index: number) => {
    const newInformation = [...information];
    newInformation.splice(index, 1);
    // 여기서 실제 데이터베이스 업데이트 로직을 추가할 수 있습니다
    console.log('항목 삭제:', index);
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{
        width: '90vw',
        maxWidth: '600px',
        height: '80vh',
        maxHeight: '700px',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid #e8e8f0',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div style={{ fontSize: 20, fontWeight: 600, color: '#222' }}>
            {topicName}
          </div>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilteredInformation(information);
            }}
            style={{
              background: '#636AE8',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: 'white',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 6,
            }}
          >
            모두 지우기
          </button>
        </div>

        {/* 검색 입력 */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e8e8f0',
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 48px 16px 20px',
                border: '1px solid #e8e8f0',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
              }}
            />
            <FiSearch
              size={20}
              color="#666"
              style={{
                position: 'absolute',
                right: 16,
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* 정보 목록 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
        }}>
          {filteredInformation.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#888',
              fontSize: 16,
              padding: '60px 20px',
            }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredInformation.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    background: '#f8f8fb',
                    borderRadius: 12,
                    border: '1px solid #e8e8f0',
                    fontSize: 16,
                    color: '#222',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ flex: 1, marginRight: 16 }}>
                    {item}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffebee';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <FiTrash2 size={18} color="#e53e3e" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTopicModal; 