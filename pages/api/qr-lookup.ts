import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
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
    console.log('QR lookup request for shortId:', shortId);
    
    // qrRedirets 컬렉션에서 shortId로 조회
    const qrRedirectRef = doc(db, 'qrRedirets', shortId);
    const qrRedirectSnap = await getDoc(qrRedirectRef);

    console.log('QR redirect exists:', qrRedirectSnap.exists());

    if (qrRedirectSnap.exists()) {
      const qrRedirectData = qrRedirectSnap.data();
      console.log('QR redirect data:', qrRedirectData);
      
      return res.status(200).json({
        ownerUserId: qrRedirectData.ownerUserId,
        isActive: qrRedirectData.isActive || true,
        createdAt: qrRedirectData.createdAt
      });
    }

    console.log('QR redirect not found for shortId:', shortId);
    return res.status(404).json({ error: 'QR redirect not found' });

  } catch (error) {
    console.error('QR lookup error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      shortId,
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
