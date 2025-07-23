import React from 'react';
import styles from '../../styles/styles.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Profile } from '../../types/profiles';

type Props = {
  visible: boolean;
  search: string;
  setSearch: (val: string) => void;
  profiles: Profile[];
  userId: string | null;
  requestedUsers: Set<string>;
  sendingRequests: Set<string>;
  onClose: () => void;
  onRequest: (targetUserId: string) => void;
};

const SearchModal: React.FC<Props> = ({
  visible,
  search,
  setSearch,
  profiles,
  userId,
  requestedUsers,
  sendingRequests,
  onClose,
  onRequest,
}) => {
  const router = useRouter();

  if (!visible) return null;

  const filtered = search
  ? profiles.filter(
      p =>
        p.name &&
        p.name.includes(search) &&
        p.id !== userId
    )
  : [];

  return (
    <div style={{
      position: 'fixed',
      left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(99,106,232,0.08)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '32px 28px 24px 28px',
        minWidth: 340,
        maxWidth: '80%',
        width: '80%',
        boxShadow: '0 8px 32px 0 rgba(99,106,232,0.13)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        position: 'relative',
      }}>
        <img src="/char.png" alt="캐릭터" style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          margin: '0 auto 8px auto',
          display: 'block',
          boxShadow: '0 2px 8px 0 rgba(99,106,232,0.10)',
        }} />

        <h3 style={{
          textAlign: 'center',
          color: '#636AE8',
          fontWeight: 800,
          fontSize: 22,
          marginBottom: 8,
        }}>
          유저 검색
        </h3>

        {/* 닫기 버튼 */}
        <button
          onClick={() => {
            setSearch('');
            onClose();
          }}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            fontSize: 26,
            color: '#636AE8',
            cursor: 'pointer',
            fontWeight: 700,
            lineHeight: 1,
          }}
          aria-label="닫기"
        >
          ×
        </button>

        {/* 입력창 */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름을 입력하세요"
          style={{
            fontSize: 17,
            padding: '13px 14px',
            borderRadius: 10,
            border: '2px solid #636AE8',
            marginBottom: 8,
            outline: 'none',
            fontWeight: 500,
            color: '#222',
            background: '#f7f8fa',
            transition: 'border 0.18s',
            boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)'
          }}
          autoFocus
        />

        {/* 결과 리스트 */}
        <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length > 0 ? (
            filtered.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 8px',
                  borderRadius: 10,
                  background: '#f7f8fa',
                  transition: 'background 0.18s',
                  cursor: 'pointer',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e6eaff'}
                onMouseOut={e => e.currentTarget.style.background = '#f7f8fa'}
                onClick={e => {
                  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    router.push(`/profile/${p.id}`);
                    onClose();
                    setSearch('');
                  }
                }}
              >
                <img
                  src={p.img || '/chat/profile.png'}
                  alt={p.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: '50%',
                    border: '2px solid #eee',
                    background: '#fff',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: 16, color: '#222' }}>{p.name}</span>
                
                <button
                  style={{
                    marginLeft: 'auto',
                    background: requestedUsers.has(p.id) ? '#E0E0E0' : '#636AE8',
                    color: requestedUsers.has(p.id) ? '#666' : '#fff',
                    border: 'none',
                    borderRadius: 7,
                    padding: '7px 18px',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: requestedUsers.has(p.id) ? 'default' : 'pointer',
                    boxShadow: '0 2px 8px 0 rgba(99,106,232,0.07)',
                    transition: 'background 0.18s',
                    opacity: requestedUsers.has(p.id) ? 0.7 : 1,
                    pointerEvents: requestedUsers.has(p.id) ? 'none' : 'auto',
                  }}
                  onMouseOver={e => {
                    if (!requestedUsers.has(p.id)) {
                      e.currentTarget.style.background = '#4850E4';
                    }
                  }}
                  onMouseOut={e => {
                    if (!requestedUsers.has(p.id)) {
                      e.currentTarget.style.background = '#636AE8';
                    }
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    if (!requestedUsers.has(p.id)) {
                      onRequest(p.id);
                    }
                  }}
                  disabled={sendingRequests.has(p.id) || requestedUsers.has(p.id)}
                >
                  {sendingRequests.has(p.id)
                    ? '요청중...'
                    : requestedUsers.has(p.id)
                    ? '요청됨'
                    : '친구추가'}
                </button>
              </div>
            ))
          ) : (
            <div style={{ color: '#888', textAlign: 'center', marginTop: 18, fontWeight: 600 }}>
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
