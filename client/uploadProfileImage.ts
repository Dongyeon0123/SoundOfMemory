import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";

const storage = getStorage();
const auth = getAuth();

/**
 * 프로필 이미지를 Storage에 업로드 (Cloud Function이 자동으로 Firestore 업데이트)
 * @param file - 사용자가 선택한 이미지 파일
 */
export const uploadProfileImage = async (file: File): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("사용자가 로그인되어 있지 않습니다.");
  }

  try {
    // Storage에 업로드 (Cloud Function 트리거 경로)
    const storageRef = ref(storage, `profile_images/${user.uid}/profile`);
    await uploadBytes(storageRef, file);
    
    console.log("이미지 업로드 완료. Cloud Function이 Firestore를 업데이트합니다.");
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    throw error;
  }
}; 