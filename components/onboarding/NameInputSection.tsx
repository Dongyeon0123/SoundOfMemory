import React, { useState } from 'react';
import styles from '../../styles/onboarding/nameInputSection.module.css';

interface NameInputSectionProps {
  onContinue: (name: string) => void;
  onBack: () => void;
  step: number;
  title: string;
  subtitle: string;
  placeholder: string;
}

export default function NameInputSection({ 
  onContinue, 
  onBack, 
  step, 
  title, 
  subtitle, 
  placeholder 
}: NameInputSectionProps) {
  const [name, setName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      onContinue(name.trim());
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setName(newValue);
    
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 100);
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
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        {/* mori.png 이미지 */}
        <img 
          src="/mori.png" 
          alt="모리" 
          className={`${styles.moriImage} ${name.trim() ? styles.filled : ''}`}
          style={{
            transition: isTyping ? 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        />
        
        {/* 제목과 부제목 */}
        <h1 className={styles.title}>{title}</h1>
        
        {/* 이름 입력 폼 */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={placeholder}
            className={styles.input}
            maxLength={20}
            autoFocus
          />
          {name && (
            <button 
              className={styles.clearButton}
              onClick={() => setName('')}
            >
              ×
            </button>
          )}
        </div>
        
        <p className={styles.subtitle}>{subtitle}</p>
        
        {/* 다음 버튼 */}
        <button 
          className={styles.nextButton}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          다음
        </button>
      </div>
    </div>
  );
}
