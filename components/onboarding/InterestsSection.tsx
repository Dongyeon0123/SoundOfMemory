import React, { useState } from 'react';
import styles from '../../styles/onboarding/interestsSection.module.css';

interface InterestsSectionProps {
  onContinue: (interests: Set<string>) => void;
  onBack: () => void;
}

export default function InterestsSection({ onContinue, onBack }: InterestsSectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  // 카테고리 데이터
  const categories = [
    {
      name: "생활",
      interests: ["생활관리", "가족", "연애", "건강", "주거생활", "자기계발"]
    },
    {
      name: "취미와 여가",
      interests: ["독서", "음악", "공예", "글쓰기", "영화", "SNS", "유튜브", "댄스", "노래", "게임", "만화", "사진", "수집", "운동", "스포츠", "요리", "맛집탐방", "조주", "국내여행", "해외여행", "언어교환", "뷰티", "향수", "패션"]
    },
    {
      name: "선호 음식",
      interests: ["한식", "양식", "중식", "일식", "디저트"]
    },
    {
      name: "문화",
      interests: ["공연", "전시회", "연예"]
    },
    {
      name: "외국어",
      interests: ["영어", "중국어", "일본어", "스페인어"]
    },
    {
      name: "커리어와 업무",
      interests: ["경제", "경영", "창업", "부동산", "투자", "전자책", "영상편집", "사이드프로젝트", "금융"]
    },
    {
      name: "기술과 산업",
      interests: ["개발", "보안", "인공지능", "데이터", "제조업", "에너지", "전기전자", "IT", "의료", "의약", "법률", "정치", "건설", "건축", "디자인", "연구", "교육", "공공", "서비스"]
    }
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (selectedInterests.size >= 5) {
      onContinue(selectedInterests);
    }
  };

  return (
    <div className={styles.nameInputContent}>
      {/* 헤더 - 뒤로가기 버튼과 진행상황 바 */}
      <div className={styles.header}>
        <button 
          onClick={onBack} 
          className={styles.backButton}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className={styles.progressBar}>
          <div className={styles.progressContainer}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(2 / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        {/* 헤더 섹션 - 모리와 텍스트 */}
        <div className={styles.headerSection}>
          {/* mori.png 이미지 */}
          <img 
            src="/mori.png" 
            alt="모리" 
            className={styles.moriImageHeader}
          />
          
          {/* 제목과 부제목 */}
          <div className={styles.textSection}>
            <h1 className={styles.title}>평소 관심사를 선택해주세요!</h1>
            <p className={styles.subtitle}>대화하고싶은 관심사를 5개이상 선택해주세요.<br/>유저들이 이 관심사를 보고 대화할거에요.</p>
          </div>
        </div>
        
        {/* 카테고리 선택 */}
        <div className={styles.categoryContainer}>
          {categories.map((category, index) => (
            <div key={index} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category.name}</h3>
              <div className={styles.interestsGrid}>
                {category.interests.map((interest, interestIndex) => (
                  <button
                    key={interestIndex}
                    className={`${styles.interestButton} ${selectedInterests.has(interest) ? styles.selected : ''}`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* 다음 버튼 */}
        <button 
          className={styles.nextButton}
          onClick={handleSubmit}
          disabled={selectedInterests.size < 5}
        >
          다음 ({selectedInterests.size}/5)
        </button>
      </div>
    </div>
  );
}
