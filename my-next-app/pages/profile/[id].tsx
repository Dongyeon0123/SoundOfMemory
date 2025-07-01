import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../../styles/styles.module.css';
import { profiles, Profile } from '../../profiles';
import { FiEdit2 } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import { BiQrScan } from 'react-icons/bi';

const ICON_SIZE = 24;

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const profile: Profile | undefined = profiles.find((p: Profile) => p.id === id);

  if (!profile) return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div
            className={styles.headerContent}
            style={{ position: 'relative', justifyContent: 'center' }}
          >
            {/* 뒤로가기 버튼 */}
            <button
              onClick={() => router.back()}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                height: 40,
                width: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="뒤로가기"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 가운데 프로필 텍스트 */}
            <span style={{ fontWeight: 700, fontSize: 18, textAlign: 'center' }}>프로필</span>
            {/* 오른쪽 아이콘들 */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 40
              }}
            >
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="프로필 편집"
              >
                <FiEdit2 size={ICON_SIZE} color="#222" />
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="카메라 스캔"
              >
                <MdDocumentScanner size={ICON_SIZE} color="#222" />
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '10px',
                }}
                aria-label="QR코드"
              >
                <BiQrScan size={ICON_SIZE} color="#222" />
              </button>
            </div>
          </div>
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain + ' ' + styles.scrollMainProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={styles.mainHeader}>
              <div className={styles.avatarWrap}>
                <Image src={profile.img} alt={profile.name} width={100} height={100} className={styles.avatarImg} />
              </div>
            </div>
            <div style={{ marginTop: 0, textAlign: 'center' }}>
              <div className={styles.friendName} style={{ fontSize: 22 }}>{profile.name}</div>
              <div style={{ marginTop: 12, color: '#555', fontSize: 16 }}>{profile.desc}</div>
              <div style={{ marginTop: 10, color: '#636AE8FF', fontSize: 16, textAlign: 'center', }}>{profile.tag.map((t, i) => (
                <span key={i} style={{ marginRight: 14 }}>{t}</span>
              ))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;