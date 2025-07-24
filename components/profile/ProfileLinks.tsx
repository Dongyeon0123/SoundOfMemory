import React from 'react';
import styles from '../../styles/styles.module.css';
import { FiPhone, FiAtSign } from 'react-icons/fi';
import { FaChrome, FaYoutube } from 'react-icons/fa';

function ProfileLinks() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 16 }}>
      <div className={styles.profileIcons}>
        <FiPhone size={28} color="#000" style={{ cursor: 'pointer' }} />
      </div>
      <div className={styles.profileIcons}>
        <FiAtSign size={28} color="#000" style={{ cursor: 'pointer' }} />
      </div>
      <div className={styles.profileIcons}>
        <FaChrome size={28} color="#000" style={{ cursor: 'pointer' }} />
      </div>
      <div className={styles.profileIcons}>
        <FaYoutube size={28} color="#FF0000" style={{ cursor: 'pointer' }} />
      </div>
    </div>
  );
}

export default ProfileLinks;