import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.json({
    message: 'API 정상 작동',
    timestamp: new Date().toISOString(),
    method: req.method,
    query: req.query
  });
}



