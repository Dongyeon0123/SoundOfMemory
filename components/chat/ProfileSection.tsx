import React from 'react';
import styles from '../../styles/chat.module.css';

type ProfileSectionProps = {
  name: string;
  img?: string;
  tag?: string[];
  isProMode?: boolean;
  showProToggle?: boolean;
  onToggleProMode?: () => void;
};

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  img,
  tag,
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
      <div style={{ 
        fontSize: 14, 
        color: '#999', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        flexWrap: 'wrap',
        marginTop: '2px'
      }}>
        <span>AI</span>
        {tag && tag.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {tag.map((tagItem, index) => (
              <span 
                key={index}
                style={{
                  fontSize: '12px',
                  color: '#636AE8',
                  fontWeight: '500'
                }}
              >
                #{tagItem}
              </span>
            ))}
          </div>
        )}
      </div>
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