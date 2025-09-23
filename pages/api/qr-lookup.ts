import { NextApiRequest, NextApiResponse } from 'next';
import { importPKCS8, SignJWT } from 'jose';

// Google 서비스 계정으로 액세스 토큰을 생성하는 함수
async function getAccessToken(): Promise<string> {
  try {
    // 서비스 계정 키 정보 (환경 변수에서 가져옴)
    const serviceAccount = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      project_id: process.env.FIREBASE_PROJECT_ID,
    };

    if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.project_id) {
      throw new Error('Firebase 서비스 계정 정보가 누락되었습니다.');
    }

    // JWT 생성을 위한 헤더와 클레임
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256' as const,
      typ: 'JWT',
    };

    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    // JWT 생성
    const privateKey = await importPKCS8(serviceAccount.private_key, 'RS256');
    
    const jwt = await new SignJWT(payload)
      .setProtectedHeader(header)
      .sign(privateKey);

    // Google OAuth2 토큰 엔드포인트에 JWT로 액세스 토큰 요청
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`토큰 요청 실패: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('액세스 토큰 생성 실패:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shortId } = req.query;

  if (!shortId || typeof shortId !== 'string') {
    return res.status(400).json({ error: 'Short ID is required' });
  }

  try {
    
    // 환경 변수 체크
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Firebase 환경 변수가 설정되지 않음');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Firestore REST API로 서버 인증 사용
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const accessToken = await getAccessToken();

    // 여러 컬렉션에서 순차적으로 검색
    const collections = ['qrRedirects', 'qrMappings', 'qrRedirets', 'qrtokens'];
    
    for (const collectionName of collections) {
      
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${shortId}`;
      
      const response = await fetch(firestoreUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ownerUserId = data.fields?.ownerUserId?.stringValue;

        if (ownerUserId) {
          
          return res.status(200).json({
            ownerUserId,
            isActive: data.fields?.isActive?.booleanValue || true,
            createdAt: data.fields?.createdAt?.timestampValue,
            foundIn: collectionName
          });
        }
      }
    }

    return res.status(404).json({ error: 'QR redirect not found' });

  } catch (error) {
    console.error('QR lookup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
