import React, { useState, useEffect } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { SiNotion, SiTiktok } from 'react-icons/si';
import { 
  FaGithub, FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaBlogger,
  FaEnvelope, FaGlobe, FaBandcamp, FaCoffee, FaBehance, FaPhone
} from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';

import styles from '../../../styles/profile.module.css';

const SOCIAL_LINKS = [
  { key: 'number', label: '전화번호', icon: <FaPhone /> },
  { key: 'email', label: '이메일', icon: <FaEnvelope /> },
  { key: 'personUrl', label: '개인 웹', icon: <FaGlobe /> },
  { key: 'youtubeUrl', label: '유튜브', icon: <FaYoutube /> },
  { key: 'facebookUrl', label: '페이스북', icon: <FaFacebook /> },
  { key: 'instagramUrl', label: '인스타그램', icon: <FaInstagram /> },
  { key: 'twitterUrl', label: 'X', icon: <FaX /> },
  { key: 'bandUrl', label: '밴드', icon: <FaBandcamp /> },
  { key: 'linkedinUrl', label: '링크드인', icon: <FaLinkedin /> },
  { key: 'githubUrl', label: '깃허브', icon: <FaGithub /> },
  { key: 'cafeUrl', label: '카페', icon: <FaCoffee /> },
  { key: 'notionUrl', label: '노션', icon: <SiNotion /> },
  { key: 'tiktokUrl', label: '틱톡', icon: <SiTiktok /> },
  { key: 'blogUrl', label: '블로그', icon: <FaBlogger /> },
  { key: 'behanceUrl', label: 'Behance', icon: <FaBehance /> },
];

const MAX_SELECTION = 6;

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
            onClick={() => onSave(selectedKeys)}
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
                  {React.cloneElement(icon, { size: 20 })}
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
          {`선택된 링크: ${selectedKeys.length} / ${MAX_SELECTION}개 최대 6개`}
        </div>

      </div>
    </div>
  );
};

export default SocialModal;