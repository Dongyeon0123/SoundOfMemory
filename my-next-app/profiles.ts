export type Profile = {
  id: string;
  name: string;
  desc: string;
  img: string;
  tag: string[];
  mbti?: string;
  introduce?: string;
  history?: {
    school: string;
    period: string;
    role: string;
  }[];
  career?: {
    org: string;
    dept: string;
    period: string;
    months: number;
    role: string;
  }[];
};

export const profiles: Profile[] = [
  {
    id: '1',
    name: '임승원',
    desc: '@개발자',
    img: '/Selection.png',
    tag: ['#여행', '#AI서비스', '#드론'],
    mbti: 'ESTJ',
    introduce: '안녕하세요, <임승원>입니다. 여행과 독서를 좋아하며 새로운 사람들과의 소통을 즐깁니다. 평범한 일상 속에서 작은 행복을 찾는 것을 좋아해요. 저의 프로필에 관심 가져주셔서 감사합니다!',
    history: [
      { school: '수유초등학교', period: '2007 ~ 2012', role: '학생' },
      { school: '신일중학교', period: '2013 ~ 2015', role: '학생' },
      { school: '하나고등학교', period: '2016 ~ 2018', role: '학생' },
      { school: '건국대학교', period: '2020 ~', role: '학생' }
    ],
    career: [
      { org: '35사단', dept: '드론봇담당관', period: '2022 ~ 2023', months: 6, role: '간부' }
    ]
  },
  {
    id: '2',
    name: '이동연',
    desc: '@개발자',
    img: '/Selection-5.png',
    tag: ['#축구', '#개발', '#여행'],
    mbti: 'ESTP',
    introduce: '',
  },
  {
    id: '3',
    name: '한윤석',
    desc: '백엔드와 인프라에 관심이 많은 개발자.',
    img: '/Selection-2.png',
    tag: ['#여행', '#백엔드', '#개발'],
    mbti: '',
    introduce: '',
  },
  {
    id: '4',
    name: '김희용',
    desc: '데이터와 알고리즘을 좋아하는 개발자.',
    img: '/Selection-3.png',
    tag: ['#알고리즘', '#데이터', '#개발'],
    mbti: '',
    introduce: '',
  },
  {
    id: '5',
    name: '박준형',
    desc: 'UI/UX와 디자인에 관심이 많은 개발자.',
    img: '/Selection-4.png',
    tag: ['#기획', '#디자인'],
    mbti: '',
    introduce: '',
  },
  {
    id: '6',
    name: 'DongYeon',
    desc: 'Next.js, React Native, AI에 관심 많은 개발자.',
    img: '/Selection-5.png',
    tag: ['#음악'],
    mbti: '',
    introduce: '',
  },
]; 