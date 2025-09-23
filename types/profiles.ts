import { doc, getDoc, collection, getDocs, updateDoc, setDoc, addDoc, query, where, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export type Profile = {
  id: string; // id 1, 2, 3 이런식
  name: string; // 이름
  aiName: string; // AI 이름
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
    
    // 요청자 정보 가져오기
    const fromUserProfile = await fetchProfileById(fromUserId);
    if (!fromUserProfile) {
      console.error('요청자 프로필을 찾을 수 없습니다.');
      return false;
    }

    // 중복 친구요청 체크
    const isDuplicate = await checkDuplicateFriendRequest(fromUserId, toUserId);
    if (isDuplicate) {
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

    
    // users/{toUserId}/friendRequests 서브컬렉션에만 저장
    const userRequestRef = doc(collection(db, "users", toUserId, "friendRequests"));
    await setDoc(userRequestRef, {
      ...friendRequestData,
      requestId: userRequestRef.id, // 문서 ID도 함께 저장
    });
    
    // 저장된 데이터 확인
    const savedDoc = await getDoc(userRequestRef);
    
    return true;
  } catch (error) {
    console.error('친구요청 전송 실패:', error);
    return false;
  }
}

// 받은 친구요청 목록 가져오기
export async function getReceivedFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    
    // users/{userId}/friendRequests 서브컬렉션에서 조회
    const q = query(
      collection(db, "users", userId, "friendRequests")
      // orderBy 제거하여 인덱스 없이도 작동하도록 함
    );

    const querySnapshot = await getDocs(q);
    
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        requestId: doc.id,
        ...data,
      } as FriendRequest;
    });
    
    // duplicate 상태 제외하고 필터링
    const validRequests = requests.filter(req => req.status !== 'duplicate');
    
    // 클라이언트에서 정렬
    validRequests.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      }
      return 0;
    });
    
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
    return true;
  } catch (error) {
    console.error('친구요청 상태 업데이트 실패:', error);
    return false;
  }
}

// 보낸 친구요청 목록 가져오기
export async function getSentFriendRequests(fromUserId: string): Promise<FriendRequest[]> {
  try {
    
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
        // 특정 사용자의 서브컬렉션이 없어도 계속 진행
        continue;
      }
    }
    
    
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
    
    
    return hasSent || hasReceived;
  } catch (error) {
    console.error('중복 친구요청 체크 실패:', error);
    return false;
  }
}

// 모든 친구요청 조회 (디버깅용)
export async function getAllFriendRequests(): Promise<FriendRequest[]> {
  try {
    
    // 모든 사용자의 friendRequests 서브컬렉션에서 모든 요청 수집
    const allUsers = await fetchProfiles();
    const allRequests: FriendRequest[] = [];
    
    for (const user of allUsers) {
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.id, "friendRequests"));
        const userRequests = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            requestId: doc.id,
            ...data,
          } as FriendRequest;
        });
        
        allRequests.push(...userRequests);
      } catch (error) {
        // 특정 사용자의 서브컬렉션이 없어도 계속 진행
        continue;
      }
    }
    
    return allRequests;
  } catch (error) {
    console.error('전체 친구요청 조회 실패:', error);
    return [];
  }
} 

// 중복 친구요청 정리 (관리자용)
export async function cleanupDuplicateFriendRequests(): Promise<number> {
  try {
    
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
        }
      } catch (error) {
        console.error('중복 요청 처리 실패:', requestId, error);
      }
    }
    
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

// 채팅 주제 데이터 타입
export type ChatTopic = {
  topicName: string;
  information: string[];
};

// 사용자의 채팅 주제 목록 불러오기
export async function fetchUserChatTopics(userId: string): Promise<ChatTopic[]> {
  try {
    const chatDataRef = collection(db, "users", userId, "chatData");
    const querySnapshot = await getDocs(chatDataRef);
    
    const topics: ChatTopic[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // information 배열이 없거나 비어있어도 문서가 존재하면 포함
      topics.push({
        topicName: doc.id, // 문서 ID가 주제명
        information: (data.information && Array.isArray(data.information)) ? data.information : []
      });
    });
    
    return topics;
  } catch (error) {
    console.error('채팅 주제 조회 실패:', error);
    return [];
  }
}

// 채팅 주제 정보 업데이트 (information 배열 저장)
export async function updateChatTopicInformation(userId: string, topicName: string, information: string[]) {
  try {
    const chatDataRef = doc(db, "users", userId, "chatData", topicName);
    await setDoc(chatDataRef, { information }, { merge: true });
  } catch (error) {
    console.error('채팅 주제 정보 업데이트 실패:', error);
    throw error;
  }
}

// 채팅 주제 삭제
export async function deleteChatTopic(userId: string, topicName: string) {
  try {
    const chatDataRef = doc(db, "users", userId, "chatData", topicName);
    await deleteDoc(chatDataRef);
  } catch (error) {
    console.error('채팅 주제 삭제 실패:', error);
    throw error;
  }
}

// 선택된 채팅 주제 불러오기
export async function fetchSelectedChatTopics(userId: string): Promise<string[]> {
  try {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return [];
    }
    
    const data = snap.data();
    
    // selectedChatTopics 필드가 없는 경우 빈 배열 반환
    if (!data.selectedChatTopics) {
      return [];
    }
    
    // 배열인 경우 그대로 반환
    if (Array.isArray(data.selectedChatTopics)) {
      return data.selectedChatTopics;
    }
    
    // 문자열인 경우 JSON 파싱 시도
    if (typeof data.selectedChatTopics === 'string') {
      try {
        const parsed = JSON.parse(data.selectedChatTopics);
        return Array.isArray(parsed) ? parsed : [data.selectedChatTopics];
      } catch {
        return [data.selectedChatTopics];
      }
    }
    
    // 기타 타입의 경우 빈 배열 반환
    return [];
  } catch (error) {
    console.error('선택된 채팅 주제 불러오기 실패:', error);
    return [];
  }
}

// 임시 토큰 저장 (1분 유효)
export async function saveTempToken(userId: string, token: string) {
  try {
    const tempTokenRef = doc(db, "tempTokens", token);
    const expiryTime = new Date(Date.now() + 60 * 1000); // 1분 후 만료
    
    await setDoc(tempTokenRef, {
      userId: userId,
      expiryTime: expiryTime,
      createdAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error('임시 토큰 저장 실패:', error);
    throw error;
  }
}

// 임시 토큰 검증 및 사용자 ID 반환
export async function verifyTempToken(token: string): Promise<string | null> {
  try {
    const tempTokenRef = doc(db, "tempTokens", token);
    const snap = await getDoc(tempTokenRef);
    
    if (!snap.exists()) {
      return null;
    }
    
    const data = snap.data();
    const expiryTime = data.expiryTime.toDate();
    const now = new Date();
    
    if (now > expiryTime) {
      // 만료된 토큰 삭제
      await deleteDoc(tempTokenRef);
      return null;
    }
    
    return data.userId;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return null;
  }
}

// Firebase에서 기존 QR 토큰 조회 (생성하지 않음)
export async function getExistingQRToken(userId: string): Promise<{ token: string; qrImageUrl: string } | null> {
  try {
    // 기존 토큰이 있는지 확인
    const existingTokenQuery = query(
      collection(db, "qrtokens"),
      where("ownerUserId", "==", userId),
      where("isActive", "==", true)
    );
    const existingTokenSnap = await getDocs(existingTokenQuery);
    
    // 기존 토큰이 있으면 반환
    if (!existingTokenSnap.empty) {
      const existingToken = existingTokenSnap.docs[0].data();
      
      // Firestore에서 QR 이미지 URL 가져오기
      try {
        const qrDocRef = doc(db, `users/${userId}/private/qr`);
        const qrDocSnap = await getDoc(qrDocRef);
        
        let qrImageUrl = '';
        if (qrDocSnap.exists()) {
          const qrData = qrDocSnap.data();
          qrImageUrl = qrData.qrimageurl || '';
        } else {
        }
        
        return {
          token: existingToken.tokenId,
          qrImageUrl
        };
      } catch (error) {
        console.error('QR 이미지 URL 가져오기 실패:', error);
        return {
          token: existingToken.tokenId,
          qrImageUrl: ''
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('QR 토큰 조회 실패:', error);
    return null;
  }
}

// 영구 QR 토큰 검증 및 사용자 ID 반환 (기존 qr-lookup API 사용)
export async function verifyQRToken(token: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/qr-lookup?shortId=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    if (result.ownerUserId) {
      return result.ownerUserId;
    } else {
      return null;
    }
  } catch (error) {
    console.error('QR 토큰 검증 실패:', error);
    return null;
  }
}

// QR 관련 함수들은 lib/firebaseApi.ts로 이동되었습니다.
// 백엔드에서 모든 QR 생성/수정 로직을 처리하므로 클라이언트에서는 읽기만 합니다.