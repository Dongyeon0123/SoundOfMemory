import React from 'react';
import styles from '../../styles/styles.module.css';

interface ProfileBasicInfoProps {
  name: string;
  desc?: string;
  tag?: string[];
}

function ProfileBasicInfo({ name, desc, tag }: ProfileBasicInfoProps) {
  return (
    <div style={{ marginTop: 0, textAlign: 'center' }}>
              <div className={styles.friendName} style={{ fontSize: 21 }}>
        {name}
      </div>
              <div style={{ marginTop: 12, color: '#9095A0FF', fontSize: 15 }}>
        {desc}
      </div>
      <div
        style={{
          marginTop: 12,
          color: '#636AE8FF',
                      fontSize: 15,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 14,
          textAlign: 'center',
        }}
      >
        {(tag ?? []).map((t, i) => (
          <span key={i}>#{t}</span>
        ))}
      </div>
    </div>
  );
}

export default ProfileBasicInfo;