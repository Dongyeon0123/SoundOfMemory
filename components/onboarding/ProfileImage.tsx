import React, { useState, useEffect } from 'react';
import styles from '../../styles/onboarding/profileImage.module.css';
import { FiCamera } from 'react-icons/fi';

interface ProfileImageProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  onImageStatusChange: (hasImage: boolean) => void;
}

export default function ProfileImage({ onImageSelect, currentImage, onImageStatusChange }: ProfileImageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);

  // 컴포넌트 마운트 시 초기 이미지 상태 확인
  useEffect(() => {
    onImageStatusChange(!!currentImage);
  }, [currentImage, onImageStatusChange]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        onImageSelect(file);
        onImageStatusChange(true); // 이미지가 등록되었음을 부모에게 알림
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.profileImageContainer}>
      {/* 프로필 이미지 등록 버튼 */}
      <div className={styles.imageUploadSection}>
        <div className={styles.imageWrapper}>
          <img
            src={selectedImage || '/char.png'}
            alt="프로필 이미지"
            className={styles.profileImage}
          />
          <input
            type="file"
            id="profileImageInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={styles.cameraButton}
            onClick={() => document.getElementById('profileImageInput')?.click()}
          >
            <FiCamera size={20} color="#222" />
          </button>
        </div>
        <p className={styles.uploadText}>프로필 사진을 등록할 시간이에요!</p>
      </div>

      {/* 가이드 텍스트 */}
      <div className={styles.guideSection}>
        <p className={styles.guideTitle}>
          좋은 명함 프로필 예시로 등록하시면 프로필 <br></br>신뢰도와 전문성 인지가 90%이상 높아져요.
        </p>
      </div>

      {/* 좋은 사진 예시 */}
      <div className={styles.goodExamplesSection}>
        <h3 className={styles.sectionTitle}>명함 프로필에 좋은 사진</h3>
        <div className={styles.exampleImages}>
          <img src="/profile/1.png" alt="좋은 사진 예시 1" className={styles.exampleImage} />
          <img src="/profile/2.png" alt="좋은 사진 예시 2" className={styles.exampleImage} />
          <img src="/profile/3.png" alt="좋은 사진 예시 3" className={styles.exampleImage} />
          <img src="/profile/4.png" alt="좋은 사진 예시 4" className={styles.exampleImage} />
          <img src="/profile/5.png" alt="좋은 사진 예시 5" className={styles.exampleImage} />
        </div>
        <p className={styles.exampleDescription}>
          취미를 즐기는 나의 순간들을 담은 사진<br />
          내가 좋아하는 분야의 전문성을 보여주는 사진
        </p>
      </div>

      {/* 나쁜 사진 예시 */}
      <div className={styles.badExamplesSection}>
        <h3 className={styles.sectionTitle}>명함 프로필에 적합하지 않은 사진</h3>
        <div className={styles.exampleImages}>
          <img src="/profile/6.png" alt="적합하지 않은 사진 예시 1" className={styles.exampleImage} />
          <img src="/profile/7.png" alt="적합하지 않은 사진 예시 2" className={styles.exampleImage} />
          <img src="/profile/8.png" alt="적합하지 않은 사진 예시 3" className={styles.exampleImage} />
          <img src="/profile/9.png" alt="적합하지 않은 사진 예시 4" className={styles.exampleImage} />
          <img src="/profile/10.png" alt="적합하지 않은 사진 예시 5" className={styles.exampleImage} />
        </div>
        <p className={styles.exampleDescription}>
          누군지 구별이 불가한 풍경/사물/캐릭터 사진<br />
          단체 사진에서 일부만 크롭해 경계가 부자연스러운 사진
        </p>
      </div>
    </div>
  );
}// 현재 로그인된 사용자 ID 가져오기
// useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserId(user.uid);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // 컴포넌트 마운트 시 자동으로 저장 시작
//   useEffect(() => {
//     if (userId) {
//       handleAutoSave();
//     }
//   }, [userId]);

//   const handleAutoSave = async () => {
//     if (!userId) return;

//     setIsSaving(true);
//     setSaveStatus('saving');
    
//     try {
//       // 로그인된 사용자의 ID를 사용하여 프로필 정보 저장
//       await setProfileField(userId, {
//         name: userName,
//         aiIntro: `안녕 나는 ${userName}의 개인 AI비서야. 궁금한거 있으면 물어봐!`,
//         img: '/char.png', // 기본 이미지
//         backgroundImg: '/background.png', // 기본 배경 이미지
//         tag: Array.from(selectedInterests) // 선택된 관심사들을 tag 필드에 저장
//       });

//       // chatData 컬렉션에 각 관심사를 문서명으로 하는 문서들 생성
//       for (const interest of selectedInterests) {
//         await updateChatTopicInformation(userId, interest, []);
//       }
      
//       setSaveStatus('success');
      
//       // 2초 후 홈으로 이동
//       setTimeout(() => {
//         router.push('/');
//       }, 2000);
      
//     } catch (error) {
//       console.error('파이어베이스 저장 실패:', error);
//       setSaveStatus('error');
//     } finally {
//       setIsSaving(false);
//     }
//   };
