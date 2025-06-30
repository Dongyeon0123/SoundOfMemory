import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../../styles/styles.module.css';

interface Profile {
  name: string;
  desc: string;
  img: string;
}

const profiles: Profile[] = [
  {
    name: '임승원',
    desc: 'AI, 프론트엔드, UX에 관심이 많아요.',
    img: '/Selection.png',
  },
  {
    name: '이동연',
    desc: 'React, TypeScript, 음악을 좋아하는 개발자.',
    img: '/Selection-5.png',
  },
  {
    name: '한윤석',
    desc: '백엔드와 인프라에 관심이 많은 개발자.',
    img: '/Selection-2.png',
  },
  {
    name: '김희용',
    desc: '데이터와 알고리즘을 좋아하는 개발자.',
    img: '/Selection-3.png',
  },
  {
    name: '박준형',
    desc: 'UI/UX와 디자인에 관심이 많은 개발자.',
    img: '/Selection-4.png',
  },
  {
    name: 'DongYeon',
    desc: 'Next.js, React Native, AI에 관심 많은 개발자.',
    img: '/Selection-5.png',
  },
  // 필요시 친구 추가
];

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  const profile = profiles.find((p) => p.name === name);

  if (!profile) return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <div className={styles.headerContent}>
            <Image src="/logo.png" alt="logo" width={60} height={60} />
            <span style={{ fontWeight: 700, fontSize: 22 }}>{profile.name} 프로필</span>
          </div>
          <div className={styles.grayLine} />
        </div>
        {/* 본문 */}
        <div className={styles.scrollMain}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
            <div className={styles.avatarWrap}>
              <Image src={profile.img} alt={profile.name} width={100} height={100} className={styles.avatarImg} />
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <div className={styles.friendName} style={{ fontSize: 22 }}>{profile.name}</div>
              <div style={{ marginTop: 12, color: '#555', fontSize: 16 }}>{profile.desc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 