import { doc, getDoc, collection, getDocs, updateDoc, setDoc } from "firebase/firestore";
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