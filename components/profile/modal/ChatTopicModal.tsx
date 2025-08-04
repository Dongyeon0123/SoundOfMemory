import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiTrash2 } from 'react-icons/fi';
import styles from '../../../styles/styles.module.css';
import { updateChatTopicInformation } from '../../../types/profiles';

interface ChatTopicModalProps {
  visible: boolean;
  topicName: string;
  information: string[];
  userId: string;
  onClose: () => void;
  onInformationChange?: (updatedInformation: string[]) => void;
}

const ChatTopicModal: React.FC<ChatTopicModalProps> = ({
  visible,
  topicName,
  information,
  userId,
  onClose,
  onInformationChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localInformation, setLocalInformation] = useState<string[]>([]);
  const [filteredInformation, setFilteredInformation] = useState<{item: string, originalIndex: number}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // information 배열을 역순으로 정렬하고 로컬 상태에 저장
  useEffect(() => {
    const reversed = [...information].reverse();
    setLocalInformation(reversed);
  }, [information]);

  useEffect(() => {
    const filtered = localInformation
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => item.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredInformation(filtered);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  }, [searchTerm, localInformation]);

  // 현재 페이지의 항목들 계산
  const totalPages = Math.ceil(filteredInformation.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInformation.slice(startIndex, endIndex);

  const handleDeleteItem = async (originalIndex: number) => {
    const newInformation = [...localInformation];
    newInformation.splice(originalIndex, 1);
    setLocalInformation(newInformation);
    
    // 즉시 데이터베이스에 업데이트
    try {
      // localInformation이 역순이므로 다시 원래 순서로 뒤집어서 저장
      const updatedInformation = [...newInformation].reverse();
      await updateChatTopicInformation(userId, topicName, updatedInformation);
      
      // 부모 컴포넌트에도 변경사항 알림
      if (onInformationChange) {
        onInformationChange(updatedInformation);
      }
      
      console.log('데이터베이스에서 항목 삭제 완료:', originalIndex);
    } catch (error) {
      console.error('항목 삭제 실패:', error);
      // 에러 발생 시 로컬 상태 복원
      setLocalInformation([...localInformation]);
    }
    
    // 현재 페이지에 항목이 없으면 이전 페이지로 이동
    const newFilteredLength = newInformation
      .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      .length;
    const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage);
    
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClose = () => {
    // 모달을 닫을 때 변경된 정보를 부모 컴포넌트에 전달
    if (onInformationChange) {
      // localInformation을 다시 원래 순서로 뒤집어서 전달
      const updatedInformation = [...localInformation].reverse();
      onInformationChange(updatedInformation);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{
        width: '90vw',
        maxWidth: '600px',
        height: '80vh',
        maxHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* 헤더 - 고정 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid #e8e8f0',
          flexShrink: 0,
        }}>
          <button
            onClick={handleClose}
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
              setLocalInformation([...information].reverse());
              setCurrentPage(1);
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

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* 검색 입력 */}
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid #e8e8f0',
            flexShrink: 0,
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
            padding: '24px 32px',
            overflowY: 'auto',
          }}>
            {currentItems.length === 0 ? (
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
                {currentItems.map(({ item, originalIndex }, index) => {
                  return (
                    <div
                      key={`${originalIndex}-${item}`}
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
                        onClick={() => handleDeleteItem(originalIndex)}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{
              padding: '20px 32px',
              borderTop: '1px solid #e8e8f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    background: currentPage === page ? '#636AE8' : 'transparent',
                    border: currentPage === page ? 'none' : '1px solid #e8e8f0',
                    color: currentPage === page ? 'white' : '#666',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: currentPage === page ? 600 : 400,
                    minWidth: 32,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== page) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== page) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTopicModal; 