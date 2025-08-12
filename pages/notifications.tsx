import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { IoArrowBack, IoNotifications, IoSettings } from 'react-icons/io5';
import { FiSettings } from 'react-icons/fi';
import { IoMegaphoneOutline } from 'react-icons/io5';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAnnouncementsWithReadStatus, markAnnouncementAsRead, markAnnouncementAsUnread } from '../types/announcements';
import type { AnnouncementWithReadStatus } from '../types/announcements';
import AnnouncementModal from '../components/AnnouncementModal';
import styles from '../styles/notifications.module.css';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementWithReadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithReadStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user ? user.uid : null);
      if (user) {
        loadAnnouncements(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadAnnouncements = async (userId: string) => {
    try {
      setLoading(true);
      const data = await getAnnouncementsWithReadStatus(userId);
      setAnnouncements(data);
    } catch (error) {
      console.error('알림 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    // 설정 페이지로 이동하는 로직 추가 가능
    console.log('설정 페이지로 이동');
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (!currentUserId) return;
    
    try {
      await markAnnouncementAsRead(currentUserId, announcementId);
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId 
            ? { ...announcement, isRead: true, readAt: new Date() as any }
            : announcement
        )
      );
    } catch (error) {
      console.error('읽음 상태 업데이트 실패:', error);
    }
  };

  const handleMarkAsUnread = async (announcementId: string) => {
    if (!currentUserId) return;
    
    try {
      await markAnnouncementAsUnread(currentUserId, announcementId);
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId 
            ? { ...announcement, isRead: false, readAt: undefined }
            : announcement
        )
      );
    } catch (error) {
      console.error('읽음 상태 해제 실패:', error);
    }
  };

  const handleOpenModal = async (announcement: AnnouncementWithReadStatus) => {
    // 모달을 열 때 즉시 읽음 상태로 변경
    if (!announcement.isRead && currentUserId) {
      try {
        await markAnnouncementAsRead(currentUserId, announcement.id);
        // 로컬 상태도 즉시 업데이트
        setAnnouncements(prev => 
          prev.map(prevAnnouncement => 
            prevAnnouncement.id === announcement.id 
              ? { ...prevAnnouncement, isRead: true, readAt: new Date() as any }
              : prevAnnouncement
          )
        );
        // 선택된 공지사항도 업데이트
        setSelectedAnnouncement({
          ...announcement,
          isRead: true,
          readAt: new Date() as any
        });
      } catch (error) {
        console.error('읽음 상태 업데이트 실패:', error);
      }
    }
    
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      console.log('timestamp가 없음:', timestamp);
      return '';
    }
    
    console.log('formatDate 호출됨:', timestamp, typeof timestamp);
    
    let date: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp인 경우
      console.log('Firestore Timestamp.toDate() 사용');
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore Timestamp 객체인 경우 (seconds, nanoseconds)
      console.log('Firestore Timestamp.seconds 사용:', timestamp.seconds);
      date = new Date(timestamp.seconds * 1000);
    } else {
      // 일반 Date 객체나 timestamp number인 경우
      console.log('일반 Date 생성 사용');
      date = new Date(timestamp);
    }
    
    console.log('생성된 date:', date);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.log('유효하지 않은 날짜:', date);
      return '';
    }
    
    const result = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    console.log('최종 결과:', result);
    return result;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patch':
        return <IoMegaphoneOutline size={20} color="#3B82F6" />;
      case 'maintenance':
        return <IoMegaphoneOutline size={20} color="#F59E0B" />;
      case 'event':
        return <IoMegaphoneOutline size={20} color="#10B981" />;
      case 'notice':
        return <IoMegaphoneOutline size={20} color="#6B7280" />;
      default:
        return <IoMegaphoneOutline size={20} color="#6B7280" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'important':
        return '#F59E0B';
      case 'normal':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerContent} style={{ position: 'relative', justifyContent: 'center' }}>
          {/* 왼쪽 상단 뒤로가기 버튼 */}
          <button
            onClick={handleBack}
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
            알림
          </span>
          {/* 오른쪽 환경설정 버튼 */}
          <button
            onClick={handleSettings}
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
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" style={{ marginBottom: 16 }} />
            <span style={{ color: '#636AE8', fontSize: 16, fontWeight: 500 }}>알림을 불러오는 중...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 100 }}>
            <img src="/char.png" alt="캐릭터" style={{ width: 120, height: 120, marginBottom: 16 }} />
            <span style={{ color: '#888', fontSize: 16 }}>받은 알림이 없어요!</span>
          </div>
        ) : (
          <div className={styles.announcementsList}>
            {announcements.map((announcement) => (
              <div key={announcement.id} className={styles.announcementItem}>
                {/* 날짜 헤더 */}
                <div className={styles.dateHeader}>
                  {formatDate(announcement.publishedAt)}
                </div>
                
                {/* 알림 내용 - 클릭 가능 */}
                <div 
                  className={`${styles.announcementContent} ${!announcement.isRead ? styles.unread : ''}`}
                  onClick={() => handleOpenModal(announcement)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.announcementInfo}>
                    {/* System + 확성기 아이콘 */}
                    <div className={styles.systemSection}>
                      <span className={styles.systemText}>System</span>
                      <div className={styles.systemIcon}>
                        <IoMegaphoneOutline size={24} color="#000" />
                      </div>
                    </div>
                    
                    <div className={styles.announcementText}>
                      <div className={styles.announcementTitle}>
                        {announcement.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* 읽음/안읽음 상태 표시 (클릭 불가) */}
                  <div className={styles.readButtons}>
                    {announcement.isRead ? (
                      <div className={styles.readStatus}>
                        읽음
                      </div>
                    ) : (
                      <div className={styles.unreadStatus}>
                        안읽음
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 알림 모달 */}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default NotificationsPage;
