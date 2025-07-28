import React, { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { IoChevronBack } from 'react-icons/io5';
import { 
  FaGithub, FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaBlogger,
  FaEnvelope, FaGlobe, FaBandcamp, FaCoffee, FaBehance 
} from 'react-icons/fa';

import styles from '../../../styles/profile.module.css';

const SOCIAL_LINKS = [
  { key: 'github', label: 'GitHub', icon: <FaGithub /> },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
  { key: 'youtube', label: 'YouTube', icon: <FaYoutube /> },
  { key: 'twitter', label: 'Twitter', icon: <FaTwitter /> },
  { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin /> },
  { key: 'blogger', label: 'Blogger', icon: <FaBlogger /> },
  { key: 'email', label: 'E-mail', icon: <FaEnvelope /> },
  { key: 'website', label: 'Website', icon: <FaGlobe /> },
  { key: 'band', label: 'Band', icon: <FaBandcamp /> },
  { key: 'cafe', label: 'Cafe', icon: <FaCoffee /> },
  { key: 'behance', label: 'Behance', icon: <FaBehance /> },
  // 3 more placeholders to make 15 total
  { key: 'notion', label: 'Notion', icon: <img src="/icons/notion.png" alt="Notion" width={28} height={28} /> },
  { key: 'x', label: 'X', icon: <FaTwitter /> }, // substitute for X
  { key: 'extra', label: 'Extra', icon: <FiEdit2 /> },
];

const MAX_SELECTION = 8;

interface SocialModalProps {
  visible: boolean;
  initialSelectedKeys: string[];
  onSave: (selectedKeys: string[]) => void;
  onClose: () => void;
}

const SocialModal: React.FC<SocialModalProps> = ({ visible, initialSelectedKeys, onSave, onClose }) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedKeys(initialSelectedKeys || []);
    }
  }, [visible, initialSelectedKeys]);

  if (!visible) return null;

  const toggleSelect = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter(k => k !== key));
    } else {
      if (selectedKeys.length < MAX_SELECTION) {
        setSelectedKeys([...selectedKeys, key]);
      }
    }
  };

  return (
    <div className={styles.socialModalOverlay} role="dialog" aria-modal="true" aria-labelledby="social-modal-title">
      <div className={styles.socialModalContainer}>
        {/* Header */}
        <div className={styles.socialModalHeader}>
          <button onClick={onClose} className={styles.socialModalBack} aria-label="뒤로가기">
            <IoChevronBack size={24} />
          </button>
          <h2 id="social-modal-title" className={styles.socialModalTitle}>소셜 링크</h2>
          <button
            className={styles.socialModalSave}
            disabled={selectedKeys.length === 0}
            onClick={() => onSave(selectedKeys)}
            aria-disabled={selectedKeys.length === 0}
          >
            저장
          </button>
        </div>

        {/* Grid */}
        <div className={styles.socialModalGrid}>

          {SOCIAL_LINKS.map(({ key, label, icon }) => {
            const isSelected = selectedKeys.includes(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSelect(key)}
                onKeyDown={e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(key); } }}
                aria-pressed={isSelected}
                aria-label={`${label} 소셜 링크 ${isSelected ? '선택됨' : '선택되지 않음'}`}
                className={`${styles.socialIconBox} ${isSelected ? styles.selected : ''}`}
              >
                <div className={styles.iconWrapper} style={{ color: isSelected ? '#fff' : '#000' }}>
                  {icon}
                </div>
                <span className={styles.iconLabel} style={{ color: isSelected ? '#fff' : '#000' }}>
                  {label}
                </span>
                {isSelected && <div aria-hidden="true" className={styles.selectedDot} />}
              </button>
            );
          })}

        </div>

        {/* Info */}
        <div className={styles.socialModalInfo}>
          {`선택된 링크: ${selectedKeys.length} / ${MAX_SELECTION}개`}
        </div>

      </div>
    </div>
  );
};

export default SocialModal;