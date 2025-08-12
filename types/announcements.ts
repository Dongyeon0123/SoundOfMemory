import { Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Announcement {
  id: string;
  title: string;
  content?: string;
  type: 'patch' | 'maintenance' | 'event' | 'notice';
  priority: 'normal' | 'important' | 'urgent';
  createdAt: Timestamp;
  publishedAt: Timestamp;
  isActive: boolean;
  isDeleted: boolean;
  authorId: string;
  version: number;
}

export interface UserAnnouncementRead {
  userId: string;
  announcementId: string;
  noticeId: string; // 문서 ID (noticeId)
  readAt: Timestamp;
  isRead: boolean;
}

export interface AnnouncementWithReadStatus extends Announcement {
  isRead: boolean;
  readAt?: Timestamp;
}

// 활성화된 알림 목록 가져오기
export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  try {
    console.log('getActiveAnnouncements 시작');
    const announcementsRef = collection(db, 'announcements');
    
    // 일단 모든 공지사항을 가져와서 디버깅
    const q = query(announcementsRef);
    
    console.log('쿼리 실행 중...');
    const querySnapshot = await getDocs(q);
    console.log('쿼리 결과:', querySnapshot.docs.length, '개 문서');
    
    const announcements = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('문서 데이터:', doc.id, data);
      return {
        id: doc.id,
        ...data
      };
    }) as Announcement[];
    
    console.log('매핑된 공지사항:', announcements);
    
    // 클라이언트 사이드에서 정렬
    const sortedAnnouncements = announcements.sort((a, b) => {
      if (a.publishedAt && b.publishedAt) {
        if (a.publishedAt.toDate && b.publishedAt.toDate) {
          return b.publishedAt.toDate().getTime() - a.publishedAt.toDate().getTime();
        } else if (a.publishedAt.seconds && b.publishedAt.seconds) {
          return b.publishedAt.seconds - a.publishedAt.seconds;
        }
      }
      return 0;
    });
    
    console.log('정렬된 공지사항:', sortedAnnouncements);
    return sortedAnnouncements;
  } catch (error) {
    console.error('알림 목록 가져오기 실패:', error);
    return [];
  }
};

// 사용자별 읽음 상태 가져오기
export const getUserAnnouncementReads = async (userId: string): Promise<UserAnnouncementRead[]> => {
  try {
    console.log('getUserAnnouncementReads 시작, userId:', userId);
    
    // users/{userId}/readNotices 컬렉션에서 읽음 상태 가져오기
    const readsRef = collection(db, 'users', userId, 'readNotices');
    const querySnapshot = await getDocs(readsRef);
    
    console.log('읽음 상태 문서 개수:', querySnapshot.docs.length);
    
    const reads = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('읽음 상태 문서:', doc.id, data);
      return {
        id: doc.id,
        announcementId: doc.id, // announcementId도 설정
        noticeId: doc.id, // 문서 ID가 noticeId
        userId: userId, // userId 추가
        readAt: data.readAt,
        isRead: true // 이 컬렉션에 존재하면 읽음
      };
    }) as unknown as UserAnnouncementRead[];
    
    console.log('매핑된 읽음 상태:', reads);
    return reads;
  } catch (error) {
    console.error('사용자 읽음 상태 가져오기 실패:', error);
    return [];
  }
};

// 알림 읽음 상태 업데이트
export const markAnnouncementAsRead = async (userId: string, announcementId: string): Promise<void> => {
  try {
    console.log('markAnnouncementAsRead 시작:', { userId, announcementId });
    
    // users/{userId}/readNotices/{noticeId} 경로에 문서 생성
    const readRef = doc(db, 'users', userId, 'readNotices', announcementId);
    const readData = {
      readAt: Timestamp.now(),
      noticeId: announcementId,
      announcementId: announcementId, // announcementId도 함께 저장
      userId: userId // userId도 함께 저장
    };
    console.log('저장할 읽음 상태 데이터:', readData);
    console.log('저장 경로:', `users/${userId}/readNotices/${announcementId}`);
    
    await setDoc(readRef, readData);
    console.log('읽음 상태 저장 완료');
  } catch (error) {
    console.error('알림 읽음 상태 업데이트 실패:', error);
  }
};

// 알림 읽음 상태 해제
export const markAnnouncementAsUnread = async (userId: string, announcementId: string): Promise<void> => {
  try {
    console.log('markAnnouncementAsUnread 시작:', { userId, announcementId });
    
    // users/{userId}/readNotices/{noticeId} 문서 삭제
    const readRef = doc(db, 'users', userId, 'readNotices', announcementId);
    await deleteDoc(readRef);
    console.log('읽음 상태 해제 완료');
  } catch (error) {
    console.error('알림 읽음 상태 해제 실패:', error);
  }
};

// 알림과 읽음 상태를 합친 데이터 가져오기
export const getAnnouncementsWithReadStatus = async (userId: string): Promise<AnnouncementWithReadStatus[]> => {
  try {
    console.log('getAnnouncementsWithReadStatus 시작, userId:', userId);
    
    const [announcements, userReads] = await Promise.all([
      getActiveAnnouncements(),
      getUserAnnouncementReads(userId)
    ]);

    console.log('가져온 공지사항:', announcements);
    console.log('가져온 읽음 상태:', userReads);

    // 읽음 상태 맵 생성 (announcement.id를 키로 사용)
    const readMap = new Map(
      userReads.map(read => [read.announcementId, read])
    );

    console.log('읽음 상태 맵:', Array.from(readMap.entries()));
    console.log('공지사항 ID들:', announcements.map(a => a.id));

    const result = announcements.map(announcement => {
      const userRead = readMap.get(announcement.id);
      const isRead = !!userRead; // 문서가 존재하면 읽음, 없으면 안읽음
      
      console.log(`공지사항 ${announcement.id} (${announcement.title}):`, {
        announcementId: announcement.id,
        userRead: userRead,
        isRead: isRead,
        readAt: userRead?.readAt
      });
      
      return {
        ...announcement,
        isRead: isRead,
        readAt: userRead?.readAt
      };
    });

    console.log('최종 결과:', result);
    return result;
  } catch (error) {
    console.error('알림과 읽음 상태 가져오기 실패:', error);
    return [];
  }
};
