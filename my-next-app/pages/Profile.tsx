import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Image from 'next/image';
import styles from '../styles/styles.module.css'

const Profile = () => {
  const profile = useSelector((state: RootState) => state.profile);
  return (
    <div className={styles.fullContainer}>
        <div className={styles.centerCard}>
            <div style={{ padding: 24 }}>
                <h2>임승원 프로필</h2>
                <Image src={profile.img} alt={profile.name} width={100} height={100} style={{ borderRadius: 50 }} />
                <p>이름: {profile.name}</p>
                <p>설명: {profile.desc}</p>
                {/* 추가 정보는 필요시 여기에 */}
            </div>
        </div>
    </div>
  );
};

export default Profile; 