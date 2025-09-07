import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../types/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shortId } = req.query;

  if (!shortId || typeof shortId !== 'string') {
    return res.status(400).json({ error: 'Short ID is required' });
  }

  try {
    console.log('Debug QR lookup for shortId:', shortId);
    
    const results = {
      qrMappings: null,
      qrtokens: null,
      usersPrivateQr: []
    };

    // 1. qrRedirects 컬렉션 확인
    try {
      const qrRedirectRef = doc(db, 'qrRedirects', shortId);
      const qrRedirectSnap = await getDoc(qrRedirectRef);
      results.qrMappings = qrRedirectSnap.exists() ? qrRedirectSnap.data() : null;
    } catch (error) {
      console.error('qrRedirects 조회 오류:', error);
    }

    // 2. qrtokens 컬렉션 확인
    try {
      const qrTokenRef = doc(db, 'qrtokens', shortId);
      const qrTokenSnap = await getDoc(qrTokenRef);
      results.qrtokens = qrTokenSnap.exists() ? qrTokenSnap.data() : null;
    } catch (error) {
      console.error('qrtokens 조회 오류:', error);
    }

    // 3. users 컬렉션에서 shortId와 일치하는 데이터 찾기
    try {
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      
      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        
        // users/{userId}/private/qr 문서 확인
        try {
          const privateQrRef = doc(db, `users/${userId}/private/qr`);
          const privateQrSnap = await getDoc(privateQrRef);
          
          if (privateQrSnap.exists()) {
            const qrData = privateQrSnap.data();
            if (qrData.shortId === shortId) {
              results.usersPrivateQr.push({
                userId,
                qrData
              });
            }
          }
        } catch (error) {
          console.error(`users/${userId}/private/qr 조회 오류:`, error);
        }
      }
    } catch (error) {
      console.error('users 컬렉션 조회 오류:', error);
    }

    console.log('Debug results:', results);
    
    return res.status(200).json({
      shortId,
      results,
      summary: {
        qrMappingsFound: !!results.qrMappings,
        qrtokensFound: !!results.qrtokens,
        usersPrivateQrFound: results.usersPrivateQr.length
      }
    });

  } catch (error) {
    console.error('Debug QR lookup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
