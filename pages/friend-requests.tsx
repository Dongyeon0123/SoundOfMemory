import React, { useEffect, useState } from 'react';
import styles from '../styles/styles.module.css';
import { useRouter } from 'next/router';
import { FiSettings } from 'react-icons/fi';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getReceivedFriendRequests, updateFriendRequestStatus, FriendRequest } from '../types/profiles';

const FriendRequests: React.FC = () => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      if (user) {
        loadFriendRequests(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFriendRequests = async (uid: string) => {
    try {
      setLoading(true);
      const requests = await getReceivedFriendRequests(uid);
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
      // 요청 객체에서 toUserId 추출
      const request = friendRequests.find(req => req.requestId === requestId);
      if (!request) {
        alert('친구 요청을 이미 보낸 대상입니다.');
        setProcessingRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
        return;
      }
      const success = await updateFriendRequestStatus(requestId, action, request.toUserId);
      if (success) {
        setFriendRequests(prev => prev.filter(req => req.requestId !== requestId));
        alert(action === 'accept' ? '친구요청을 수락했습니다!' : '친구요청을 거절했습니다.');
      } else {
        alert('요청 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('요청 처리 오류:', error);
      alert('요청 처리 중 오류가 발생했습니다.');
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
            <div style={{ textAlign: 'center', color: '#636AE8', margin: 24 }}>
              <div className="spinner" style={{ marginBottom: 18 }} />
              친구요청을 불러오는 중...
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
    </div>
  );
};

export default FriendRequests; 