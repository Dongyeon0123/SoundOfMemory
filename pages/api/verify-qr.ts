import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../types/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid token' });
  }

  try {
    console.log('QR 토큰 검증 시작:', token);

    // 1. qrRedirects 컬렉션에서 조회 (메인 구조)
    try {
      const qrRedirectRef = doc(db, 'qrRedirects', token);
      const qrRedirectSnap = await getDoc(qrRedirectRef);
      
      if (qrRedirectSnap.exists()) {
        const data = qrRedirectSnap.data();
        console.log('qrRedirects에서 찾음:', data);
        
        if (data.ownerUserId) {
          return res.status(200).json({ ownerUserId: data.ownerUserId });
        }
      }
    } catch (error) {
      console.log('qrRedirects 조회 실패:', error);
    }

    // 3. qrtokens 컬렉션에서 조회 (또 다른 구조)
    try {
      const qrTokenRef = doc(db, 'qrtokens', token);
      const qrTokenSnap = await getDoc(qrTokenRef);
      
      if (qrTokenSnap.exists()) {
        const data = qrTokenSnap.data();
        console.log('qrtokens에서 찾음:', data);
        
        if (data.ownerUserId) {
          return res.status(200).json({ ownerUserId: data.ownerUserId });
        }
      }
    } catch (error) {
      console.log('qrtokens 조회 실패:', error);
    }

    console.log('모든 컬렉션에서 QR 토큰을 찾을 수 없음:', token);
    return res.status(404).json({ error: 'QR token not found' });

  } catch (error) {
    console.error('QR 토큰 검증 API 에러:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
