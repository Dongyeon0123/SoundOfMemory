import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const storage = getStorage();
const auth = getAuth();
const db = getFirestore();

/**
 * 프로필 이미지를 Storage에 업로드하고 Firestore를 직접 업데이트
 * @param file - 사용자가 선택한 이미지 파일
 * @returns 다운로드 URL
 */
export const uploadProfileImage = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("사용자가 로그인되어 있지 않습니다.");
  }

  console.log("업로드 시작:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    userId: user.uid
  });

  try {
    // Storage에 업로드
    const storageRef = ref(storage, `profile_images/${user.uid}/profile`);
    console.log("Storage 경로:", `profile_images/${user.uid}/profile`);
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log("업로드 성공:", snapshot);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(storageRef);
    console.log("다운로드 URL:", downloadURL);
    
    // Firestore 업데이트
    const profileRef = doc(db, "profiles", user.uid);
    await updateDoc(profileRef, {
      img: downloadURL
    });
    
    console.log("Firestore 업데이트 완료");
    
    return downloadURL;
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    console.error("에러 상세:", {
      code: (error as any).code,
      message: (error as any).message,
      stack: (error as any).stack
    });
    throw error;
  }
}; 