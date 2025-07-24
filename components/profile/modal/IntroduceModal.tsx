import React, { useState } from 'react';
import introStyles from '../../../styles/IntroduceModal.module.css';

interface IntroduceModalProps {
  currentIntroduce: string | undefined;
  onClose: () => void;
  onSave: (intro: string) => void;
}

function IntroduceModal({
  currentIntroduce,
  onClose,
  onSave,
}: IntroduceModalProps) {
  const [value, setValue] = useState(currentIntroduce ?? '');

  const handleSave = () => {
    onSave(value.trim());
    onClose();
  };

  return (
    <div className={introStyles.introModalOverlay}>
      <div className={introStyles.introModalContent}>
        <h2 className={introStyles.introModalTitle}>소개 입력</h2>
        <textarea
          className={introStyles.introTextarea}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="자기소개를 입력하세요!"
        />
        <div className={introStyles.introModalActions}>
          <button
            className={introStyles.introModalButton}
            onClick={onClose}
          >취소</button>
          <button
            className={`${introStyles.introModalButton} ${introStyles.save}`}
            onClick={handleSave}
          >저장</button>
        </div>
      </div>
    </div>
  );
}

export default IntroduceModal;