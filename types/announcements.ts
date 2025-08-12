import { Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
    const readsRef = collection(db, 'userAnnouncementReads');
    const q = query(readsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const reads = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('읽음 상태 문서:', doc.id, data);
      return {
        id: doc.id,
        ...data
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
    const readRef = doc(db, 'userAnnouncementReads', `${userId}_${announcementId}`);
    const readData = {
      userId,
      announcementId,
      readAt: Timestamp.now(),
      isRead: true
    };
    console.log('저장할 읽음 상태 데이터:', readData);
    
    await setDoc(readRef, readData);
    console.log('읽음 상태 저장 완료');
  } catch (error) {
    console.error('알림 읽음 상태 업데이트 실패:', error);
  }
};

// 알림 읽음 상태 해제
export const markAnnouncementAsUnread = async (userId: string, announcementId: string): Promise<void> => {
  try {
    const readRef = doc(db, 'userAnnouncementReads', `${userId}_${announcementId}`);
    await updateDoc(readRef, {
      isRead: false,
      readAt: null
    });
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

    const readMap = new Map(
      userReads.map(read => [read.announcementId, read])
    );

    console.log('읽음 상태 맵:', Array.from(readMap.entries()));

    const result = announcements.map(announcement => {
      const userRead = readMap.get(announcement.id);
      console.log(`공지사항 ${announcement.id} (${announcement.title}):`, {
        userRead: userRead,
        isRead: userRead?.isRead || false,
        readAt: userRead?.readAt
      });
      return {
        ...announcement,
        isRead: userRead?.isRead || false,
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
