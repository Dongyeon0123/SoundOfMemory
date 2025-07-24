import React, { useState } from 'react';
import mbtiStyles from '../../../styles/MbtiModal.module.css';

const MBTI_LETTERS = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['P', 'J'],
];

interface MBTIModalProps {
  currentMBTI: string | undefined;
  onClose: () => void;
  onSave: (mbti: string) => void;
}

function MBTIModal({ currentMBTI, onClose, onSave }: MBTIModalProps) {
  const initial = MBTI_LETTERS.map((pair, idx) =>
    currentMBTI && currentMBTI[idx] ? currentMBTI[idx] : pair[0]
  );
  const [selection, setSelection] = useState<string[]>(initial);

  const handleSelect = (groupIdx: number, letter: string) => {
    const next = [...selection];
    next[groupIdx] = letter;
    setSelection(next);
  };

  const handleSave = () => {
    onSave(selection.join(''));
    onClose();
  };

  return (
    <div className={mbtiStyles.mbtiModalOverlay}>
      <div className={mbtiStyles.mbtiModalContent}>
        <h2 className={mbtiStyles.mbtiModalTitle}>MBTI 선택</h2>
        {MBTI_LETTERS.map((pair, idx) => (
          <div key={idx} className={mbtiStyles.mbtiOptionGroup}>
            {pair.map(letter => (
              <button
                key={letter}
                onClick={() => handleSelect(idx, letter)}
                className={
                  mbtiStyles.mbtiOptionButton +
                  (selection[idx] === letter ? ` ${mbtiStyles.selected}` : '')
                }
                style={selection[idx] === letter ? {
                  border: '2px solid #636AE8FF',
                  background: '#636AE8FF',
                  color: '#fff'
                } : undefined}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div className={mbtiStyles.mbtiModalActions}>
          <button
            className={mbtiStyles.mbtiModalButton}
            onClick={onClose}
          >취소</button>
          <button
            className={`${mbtiStyles.mbtiModalButton} ${mbtiStyles.save}`}
            onClick={handleSave}
          >저장</button>
        </div>
      </div>
    </div>
  );
}

export default MBTIModal;