export interface Profile {
  id: string;
  name: string;
  desc: string;
  img: string;
  tag: string[];
  mbti?: string;
}

export const profiles: Profile[] = [
  {
    id: '1',
    name: '임승원',
    desc: '@의사',
    img: '/Selection.png',
    tag: ['#여행', '#AI서비스', '#드론'],
    mbti: 'ESTJ',
  },
  {
    id: '2',
    name: '이동연',
    desc: '@개발자',
    img: '/Selection-5.png',
    tag: ['#축구', '#개발', '#여행'],
    mbti: 'ESTP',
  },
  {
    id: '3',
    name: '한윤석',
    desc: '백엔드와 인프라에 관심이 많은 개발자.',
    img: '/Selection-2.png',
    tag: ['#여행', '#백엔드', '#개발'],
    mbti: '',
  },
  {
    id: '4',
    name: '김희용',
    desc: '데이터와 알고리즘을 좋아하는 개발자.',
    img: '/Selection-3.png',
    tag: ['#알고리즘', '#데이터', '#개발'],
    mbti: '',
  },
  {
    id: '5',
    name: '박준형',
    desc: 'UI/UX와 디자인에 관심이 많은 개발자.',
    img: '/Selection-4.png',
    tag: ['#기획', '#디자인'],
    mbti: '',
  },
  {
    id: '6',
    name: 'DongYeon',
    desc: 'Next.js, React Native, AI에 관심 많은 개발자.',
    img: '/Selection-5.png',
    tag: ['#음악'],
    mbti: '',
  },
]; 