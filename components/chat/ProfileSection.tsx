import React from 'react';
import styles from '../../styles/chat.module.css';

type ProfileSectionProps = {
  name: string;
  img?: string;
  isProMode?: boolean;
  showProToggle?: boolean;
  onToggleProMode?: () => void;
};

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  img,
  isProMode = false,
  showProToggle = false,
  onToggleProMode,
}) => (
  <div className={styles.profileSection}>
    <img
      src={img || "/chat/profile.png"}
      alt={`${name || "프로필"} 프로필`}
    />
    <div className={styles.profileName}>
      {name}
      <span style={{ fontSize: 14, color: '#999' }}><br/>AI</span>
    </div>
    {showProToggle && (
      <div className={styles.toggleWrap}>
        <div
          className={`${styles.toggle} ${isProMode ? styles.on : ""}`}
          onClick={onToggleProMode}
        />
        <div className={styles.label}>
          {isProMode ? "PRO Mode ON" : "PRO Mode OFF"}
        </div>
      </div>
    )}
  </div>
);

export default ProfileSection;