import {
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../types/firebase';

// 타입 정의
export interface PrivateQrData {
  shortId: string;
  qrDeepLink: string; // QR에 담긴 주소 (예: /q/shortId)
  qrImagePath?: string;
  qrImageUrl?: string; // 선택적 필드 (이미지가 없을 수 있음)
  qrToken: string; // 내부 보안용 토큰
  qrCreatedAt: any; // Timestamp
}

/**
 * [수정] 현재 로그인한 사용자의 QR 정보를 가져오는 함수
 * - 생성 로직은 백엔드(onUserDocumentCreate)에서 처리하므로, 클라이언트는 읽기만 합니다.
 */
export async function getMyQrData(userId: string): Promise<PrivateQrData | null> {
  try {
    const privateQrRef = doc(db, `users/${userId}/private/qr`);
    const docSnap = await getDoc(privateQrRef);

    if (docSnap.exists()) {
      console.log('내 QR 정보 가져오기 성공');
      return docSnap.data() as PrivateQrData;
    } else {
      console.log('아직 QR 정보가 생성되지 않았습니다.');
      return null;
    }
  } catch (error) {
    console.error('내 QR 정보 가져오기 실패:', error);
    return null;
  }
}

/**
 * [수정] QR 토큰을 검증하는 함수 (기존 qr-lookup API 사용)
 * - 이 함수는 게스트 프로필 페이지 등에서 최종 권한을 확인할 때 사용됩니다.
 */
export async function verifyQRToken(token: string): Promise<{ ownerUserId: string } | null> {
  try {
    const response = await fetch(`/api/qr-lookup?shortId=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Token verification failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('QR 토큰 검증 성공:', result);
    return result.ownerUserId ? { ownerUserId: result.ownerUserId } : null;
  } catch (error) {
    console.error('QR 토큰 검증 실패:', error);
    return null;
  }
}
