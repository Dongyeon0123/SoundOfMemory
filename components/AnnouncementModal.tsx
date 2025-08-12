import React from 'react';
import { IoMegaphoneOutline, IoClose } from 'react-icons/io5';
import { Announcement } from '../types/announcements';
import styles from '../styles/announcementModal.module.css';

interface AnnouncementModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (announcementId: string) => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  isOpen,
  onClose,
  onMarkAsRead
}) => {
  // 모달이 열릴 때 자동으로 읽음 상태로 변경 (이미 notifications 페이지에서 처리됨)
  // React.useEffect(() => {
  //   if (isOpen && announcement && !announcement.isRead) {
  //     onMarkAsRead(announcement.id);
  //   }
  // }, [isOpen, announcement, onMarkAsRead]);

  if (!isOpen || !announcement) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    let date: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp인 경우
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore Timestamp 객체인 경우 (seconds, nanoseconds)
      date = new Date(timestamp.seconds * 1000);
    } else {
      // 일반 Date 객체나 timestamp number인 경우
      date = new Date(timestamp);
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${ampm} ${displayHours}:${displayMinutes}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patch':
        return <IoMegaphoneOutline size={24} color="#3B82F6" />;
      case 'maintenance':
        return <IoMegaphoneOutline size={24} color="#F59E0B" />;
      case 'event':
        return <IoMegaphoneOutline size={24} color="#10B981" />;
      case 'notice':
        return <IoMegaphoneOutline size={24} color="#6B7280" />;
      default:
        return <IoMegaphoneOutline size={24} color="#6B7280" />;
    }
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(announcement.id);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 - 공지 제목과 닫기 버튼 */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            {announcement.title}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        {/* 작성자 ID */}
        <div className={styles.modalAuthor}>
          작성자: {announcement.authorId}
        </div>

        {/* 타임스탬프 */}
        <div className={styles.modalTimestamp}>
          {formatDate(announcement.publishedAt)}
        </div>

        {/* 내용 */}
        {announcement.content && (
          <div className={styles.modalContent}>
            {announcement.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementModal;
