import { doc, getDoc, collection, getDocs, updateDoc, setDoc, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type Profile = {
  id: string; // id 1, 2, 3 이런식
  name: string; // 이름
  desc: string; // @개발자, @의사
  img: string;
  backgroundImg: string;
  tag: string[]; // 말 그대로 태그
  mbti?: string; // mbti
  introduce?: string; // 소개글
  history?: {
    school: string; // 학교 / 소속
    period: string; // 연도 ~ 연도
    role: string; // 직책
  }[];
  career?: {
    org: string; // 소속
    dept: string; // 직책
    period: string; // 연도 ~ 연도
    months: number; // 재직개월
    role: string; // 직책
  }[];
  aiIntro?: string; // AI 소개말

  socialLinks?: {
    number?: string; // 전화번호
    email?: string; // 이메일
    personUrl?: string; // 개인 웹사이트 url
    youtubeUrl?: string; // 유튜브 주소
    facebookUrl?: string; // 페이스북 주소
    instagramUrl?: string; // 인스타그램 주소
    twitterUrl?: string; // 트위터 주소
    bandUrl?: string; // 밴드 주소
    linkedinUrl?: string; // 링크드인 주소
    githubUrl?: string; // 깃허브 주소
    cafeUrl?: string; // 카페 주소
    notionUrl?: string; // 노션 주소
    tiktokUrl?: string; // X 주소
    blogUrl?: string; // 블로그 주소
    behanceUrl?: string; // 비잔스 주소
  };
};

export async function fetchProfileById(id: string) {
  const ref = doc(db, "users", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Profile;
}

export async function fetchProfiles(): Promise<Profile[]> {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Profile[];
}

export async function updateProfileField(id: string, data: Partial<Profile>) {
  const ref = doc(db, "users", id);
  await updateDoc(ref, data);
}

export async function setProfileField(id: string, data: Partial<Profile>) {
  const ref = doc(db, "users", id);
  await setDoc(ref, data, { merge: true });
}

export type FriendRequest = {
  requestId: string;        // 자동 생성된 요청 ID
  fromUserId: string;       // 요청자의 userId
  fromUserName: string;     // 요청자의 이름
  fromUserAvatar: string;   // 요청자 프로필 이미지 url
  toUserId: string;         // 받는 사람의 userId
  status: string;           // 요청상태 pending/accept/reject
  createdAt: any;           // 요청 생성 시간 (timestamp)
};

// 친구요청 보내기
export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<boolean> {
  try {
    console.log('친구요청 시작:', { fromUserId, toUserId });
    
    // 요청자 정보 가져오기
    const fromUserProfile = await fetchProfileById(fromUserId);
    if (!fromUserProfile) {
      console.error('요청자 프로필을 찾을 수 없습니다.');
      return false;
    }
    console.log('요청자 프로필:', fromUserProfile);

    // 중복 친구요청 체크
    const isDuplicate = await checkDuplicateFriendRequest(fromUserId, toUserId);
    if (isDuplicate) {
      console.log('이미 친구요청이 존재합니다 (보냈거나 받음).');
      return false;
    }

    // 친구요청 생성
    const friendRequestData = {
      fromUserId: fromUserId,
      fromUserName: fromUserProfile.name,
      fromUserAvatar: fromUserProfile.img,
      toUserId: toUserId, // 받는 사람의 userId 추가
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    console.log('저장할 친구요청 데이터:', friendRequestData);
    
    // users/{toUserId}/friendRequests 서브컬렉션에만 저장
    const userRequestRef = doc(collection(db, "users", toUserId, "friendRequests"));
    await setDoc(userRequestRef, {
      ...friendRequestData,
      requestId: userRequestRef.id, // 문서 ID도 함께 저장
    });
    console.log('users/{toUserId}/friendRequests에만 저장 완료:', userRequestRef.id);
    
    // 저장된 데이터 확인
    const savedDoc = await getDoc(userRequestRef);
    console.log('저장된 문서 데이터:', savedDoc.data());
    
    return true;
  } catch (error) {
    console.error('친구요청 전송 실패:', error);
    return false;
  }
}

// 받은 친구요청 목록 가져오기
export async function getReceivedFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    console.log('받은 친구요청 조회 시작:', userId);
    
    // users/{userId}/friendRequests 서브컬렉션에서 조회
    const q = query(
      collection(db, "users", userId, "friendRequests")
      // orderBy 제거하여 인덱스 없이도 작동하도록 함
    );

    const querySnapshot = await getDocs(q);
    console.log('쿼리 결과 문서 수:', querySnapshot.docs.length);
    
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('문서 데이터:', { id: doc.id, ...data });
      return {
        requestId: doc.id,
        ...data,
      } as FriendRequest;
    });
    
    // duplicate 상태 제외하고 필터링
    const validRequests = requests.filter(req => req.status !== 'duplicate');
    console.log('유효한 친구요청들:', validRequests);
    
    // 클라이언트에서 정렬
    validRequests.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      }
      return 0;
    });
    
    console.log('최종 친구요청 목록:', validRequests);
    return validRequests;
  } catch (error) {
    console.error('친구요청 목록 가져오기 실패:', error);
    return [];
  }
}

// 친구요청 상태 업데이트 (수락/거절)
export async function updateFriendRequestStatus(requestId: string, status: 'accept' | 'reject', toUserId: string): Promise<boolean> {
  try {
    // users/{toUserId}/friendRequests 서브컬렉션 상태 변경
    const userRequestRef = doc(db, "users", toUserId, "friendRequests", requestId);
    await updateDoc(userRequestRef, { status: status });
    console.log(`users/${toUserId}/friendRequests/${requestId} 상태 변경: ${status}`);
    return true;
  } catch (error) {
    console.error('친구요청 상태 업데이트 실패:', error);
    return false;
  }
}

// 보낸 친구요청 목록 가져오기
export async function getSentFriendRequests(fromUserId: string): Promise<FriendRequest[]> {
  try {
    console.log('보낸 친구요청 조회 시작:', fromUserId);
    
    // 모든 사용자의 friendRequests 서브컬렉션에서 fromUserId가 일치하는 요청 찾기
    const allUsers = await fetchProfiles();
    const allRequests: FriendRequest[] = [];
    
    for (const user of allUsers) {
      try {
        const q = query(
          collection(db, "users", user.id, "friendRequests"),
          where("fromUserId", "==", fromUserId)
        );
        
        const querySnapshot = await getDocs(q);
        const userRequests = querySnapshot.docs.map(doc => ({
          requestId: doc.id,
          ...doc.data(),
        })) as FriendRequest[];
        
        allRequests.push(...userRequests);
      } catch (error) {
        console.log(`사용자 ${user.id}의 친구요청 조회 실패:`, error);
        // 특정 사용자의 서브컬렉션이 없어도 계속 진행
        continue;
      }
    }
    
    console.log('보낸 친구요청들:', allRequests);
    
    // 클라이언트에서 정렬
    allRequests.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      }
      return 0;
    });
    
    return allRequests;
  } catch (error) {
    console.error('보낸 친구요청 목록 가져오기 실패:', error);
    return [];
  }
}

// 특정 사용자에게 친구요청을 보냈는지 확인
export async function hasSentFriendRequest(fromUserId: string, toUserId: string): Promise<boolean> {
  try {
    const sentRequests = await getSentFriendRequests(fromUserId);
    return sentRequests.some(req => req.toUserId === toUserId && req.status === 'pending');
  } catch (error) {
    console.error('친구요청 상태 확인 실패:', error);
    return false;
  }
}

// 중복 친구요청 체크 (더 정확한 버전)
export async function checkDuplicateFriendRequest(fromUserId: string, toUserId: string): Promise<boolean> {
  try {
    // 보낸 요청에서 확인
    const sentRequests = await getSentFriendRequests(fromUserId);
    const hasSent = sentRequests.some(req => req.toUserId === toUserId && req.status === 'pending');
    
    // 받은 요청에서도 확인 (상호 친구요청 방지)
    const receivedRequests = await getReceivedFriendRequests(fromUserId);
    const hasReceived = receivedRequests.some(req => req.fromUserId === toUserId && req.status === 'pending');
    
    console.log('중복 체크 결과:', { hasSent, hasReceived, fromUserId, toUserId });
    
    return hasSent || hasReceived;
  } catch (error) {
    console.error('중복 친구요청 체크 실패:', error);
    return false;
  }
}

// 모든 친구요청 조회 (디버깅용)
export async function getAllFriendRequests(): Promise<FriendRequest[]> {
  try {
    console.log('모든 친구요청 조회 시작');
    
    // 모든 사용자의 friendRequests 서브컬렉션에서 모든 요청 수집
    const allUsers = await fetchProfiles();
    const allRequests: FriendRequest[] = [];
    
    for (const user of allUsers) {
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.id, "friendRequests"));
        const userRequests = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`사용자 ${user.id}의 친구요청 문서:`, { id: doc.id, ...data });
          return {
            requestId: doc.id,
            ...data,
          } as FriendRequest;
        });
        
        allRequests.push(...userRequests);
      } catch (error) {
        console.log(`사용자 ${user.id}의 친구요청 조회 실패:`, error);
        // 특정 사용자의 서브컬렉션이 없어도 계속 진행
        continue;
      }
    }
    
    console.log('전체 친구요청 목록:', allRequests);
    return allRequests;
  } catch (error) {
    console.error('전체 친구요청 조회 실패:', error);
    return [];
  }
} 

// 중복 친구요청 정리 (관리자용)
export async function cleanupDuplicateFriendRequests(): Promise<number> {
  try {
    console.log('중복 친구요청 정리 시작');
    
    const allRequests = await getAllFriendRequests();
    const duplicates: string[] = [];
    const seen = new Set<string>();
    
    // pending 상태의 요청들만 필터링
    const pendingRequests = allRequests.filter(req => req.status === 'pending');
    
    pendingRequests.forEach(request => {
      const key = `${request.fromUserId}-${request.toUserId}`;
      if (seen.has(key)) {
        duplicates.push(request.requestId);
      } else {
        seen.add(key);
      }
    });
    
    console.log('중복 요청 ID들:', duplicates);
    
    // 중복 요청 처리 (가장 오래된 것만 남기고 나머지는 duplicate 상태로 변경)
    let deletedCount = 0;
    for (const requestId of duplicates) {
      try {
        // 해당 요청이 어느 사용자의 서브컬렉션에 있는지 찾기
        const request = allRequests.find(req => req.requestId === requestId);
        if (request && request.toUserId) {
          const userRequestRef = doc(db, "users", request.toUserId, "friendRequests", requestId);
          await updateDoc(userRequestRef, { status: 'duplicate' });
          deletedCount++;
          console.log('중복 요청 처리됨:', requestId);
        }
      } catch (error) {
        console.error('중복 요청 처리 실패:', requestId, error);
      }
    }
    
    console.log(`중복 친구요청 정리 완료: ${deletedCount}개 처리됨`);
    return deletedCount;
  } catch (error) {
    console.error('중복 친구요청 정리 실패:', error);
    return 0;
  }
} 

// 친구 목록 불러오기
export async function fetchFriends(userId: string): Promise<any[]> {
  const querySnapshot = await getDocs(collection(db, "users", userId, "friends"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// 즐겨찾기 토글 변경
export async function toggleFavorite(userId: string, friendId: string, value: boolean) {
  const ref = doc(db, "users", userId, "friends", friendId);
  await updateDoc(ref, { favorite: value });
} 