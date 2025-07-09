import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
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
};

export const profiles: Profile[] = [
  {
    id: '1',
    name: '임승원',
    desc: '@개발자',
    img: '/Selection.png',
    backgroundImg: '/background.png',
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
    backgroundImg: '',
    tag: ['#축구', '#개발', '#여행'],
    mbti: 'ESTP',
    introduce: '',
  },
  {
    id: '3',
    name: '한윤석',
    desc: '백엔드와 인프라에 관심이 많은 개발자.',
    img: '/Selection-2.png',
    backgroundImg: '',
    tag: ['#여행', '#백엔드', '#개발'],
    mbti: '',
    introduce: '',
  },
  {
    id: '4',
    name: '김희용',
    desc: '데이터와 알고리즘을 좋아하는 개발자.',
    img: '/Selection-3.png',
    backgroundImg: '',
    tag: ['#알고리즘', '#데이터', '#개발'],
    mbti: '',
    introduce: '',
  },
  {
    id: '5',
    name: '박준형',
    desc: 'UI/UX와 디자인에 관심이 많은 개발자.',
    img: '/Selection-4.png',
    backgroundImg: '',
    tag: ['#기획', '#디자인'],
    mbti: '',
    introduce: '',
  },
  {
    id: '6',
    name: 'DongYeon',
    desc: 'Next.js, React Native, AI에 관심 많은 개발자.',
    img: '/Selection-5.png',
    backgroundImg: '',
    tag: ['#음악'],
    mbti: '',
    introduce: '',
  },
];

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