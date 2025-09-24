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
  const MAX_LEN = 125;

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
          onChange={e => setValue(e.target.value.slice(0, MAX_LEN))}
          placeholder="자기소개를 입력하세요!"
          maxLength={MAX_LEN}
        />
        <div style={{ textAlign: 'right', color: '#888', fontSize: 12, marginTop: 6 }}>
          {value.length} / {MAX_LEN}
        </div>
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