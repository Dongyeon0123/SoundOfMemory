import React, { useEffect, useState } from 'react';
import styles from '../../styles/styles.module.css';
import { useRouter } from 'next/router';
import { FiSettings } from 'react-icons/fi';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getReceivedFriendRequests, updateFriendRequestStatus, FriendRequest, getAllFriendRequests } from '../../types/profiles';

const FriendRequests: React.FC = () => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('친구요청 페이지 - Auth 상태 변경:', user);
      setUserId(user ? user.uid : null);
      if (user) {
        console.log('친구요청 페이지 - 사용자 UID:', user.uid);
        loadFriendRequests(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFriendRequests = async (uid: string) => {
    try {
      console.log('친구요청 페이지 - 요청 로딩 시작:', uid);
      setLoading(true);
      
      // 디버깅: 모든 친구 요청 조회
      const allRequests = await getAllFriendRequests();
      console.log('친구요청 페이지 - 전체 친구요청:', allRequests);
      
      const requests = await getReceivedFriendRequests(uid);
      console.log('친구요청 페이지 - 받은 요청들:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('친구요청 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    if (processingRequests.has(requestId)) return;

    setProcessingRequests(prev => new Set(prev).add(requestId));

    try {
      // Firebase Auth 토큰 가져오기
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setModalMessage('로그인이 필요합니다.');
        setModalType('error');
        setShowModal(true);
        return;
      }
      const idToken = await currentUser.getIdToken();

      // Cloud Function endpoint 결정
      const endpoint = action === 'accept'
        ? 'https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/acceptFriendRequest'
        : 'https://asia-northeast3-numeric-vehicle-453915-j9.cloudfunctions.net/rejectFriendRequest';

      // Cloud Function 호출
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ requestId }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setFriendRequests(prev => prev.filter(req => req.requestId !== requestId));
        setModalMessage(action === 'accept' ? '친구요청을 수락했습니다!' : '친구요청을 거절했습니다.');
        setModalType('success');
        setShowModal(true);
      } else {
        setModalMessage(result.message || '요청 처리에 실패했습니다.');
        setModalType('error');
        setShowModal(true);
      }
    } catch (error) {
      console.error('요청 처리 오류:', error);
      setModalMessage('요청 처리 중 오류가 발생했습니다.');
      setModalType('error');
      setShowModal(true);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const pendingRequests = friendRequests.filter(req => req.status === 'pending');

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
            <span style={{ fontWeight: 700, fontSize: 18, textAlign: 'center' }}>
              친구 요청 {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </span>
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
        
        <div className={styles.scrollMain} style={{ paddingTop: 20 }}>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '60vh', minHeight: 300, width: '100%',
              position: 'absolute', left: 0, top: 0, zIndex: 10,
            }}>
              <div className="spinner" style={{ marginBottom: 18 }} />
              <span style={{ color: '#636AE8', fontSize: 18, fontWeight: 600 }}>친구요청을 불러오는 중...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <img src="/char.png" alt="캐릭터" style={{ width: 120, height: 120, marginBottom: 16 }} />
              <span style={{ color: '#888', fontSize: 16 }}>아직 친구 요청이 없습니다.</span>
            </div>
          ) : (
            <div style={{ padding: '0 24px' }}>
              {pendingRequests.map((request) => (
                <div
                  key={request.requestId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <img
                    src={request.fromUserAvatar}
                    alt={request.fromUserName}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      border: '2px solid #eee',
                      background: '#fff'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#222', marginBottom: 4 }}>
                      {request.fromUserName}
                    </div>
                    <div style={{ fontSize: 14, color: '#888' }}>
                      친구요청을 보냈습니다
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleRequestAction(request.requestId, 'accept')}
                      disabled={processingRequests.has(request.requestId)}
                      style={{
                        background: '#636AE8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        opacity: processingRequests.has(request.requestId) ? 0.6 : 1,
                      }}
                    >
                      {processingRequests.has(request.requestId) ? '처리중...' : '수락'}
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.requestId, 'reject')}
                      disabled={processingRequests.has(request.requestId)}
                      style={{
                        background: '#fff',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        opacity: processingRequests.has(request.requestId) ? 0.6 : 1,
                      }}
                    >
                      {processingRequests.has(request.requestId) ? '처리중...' : '거절'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 성공/에러 모달 */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: '32px 24px',
            maxWidth: 320,
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }}>
            {/* 아이콘 */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: modalType === 'success' ? '#E8F5E8' : '#FFEBEE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              {modalType === 'success' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V12M12 16H12.01" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#F44336" strokeWidth="2"/>
                </svg>
              )}
            </div>
            
            {/* 메시지 */}
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#222',
              marginBottom: 24,
              lineHeight: 1.4,
            }}>
              {modalMessage}
            </div>
            
            {/* 확인 버튼 */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: modalType === 'success' ? '#636AE8' : '#F44336',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendRequests; 