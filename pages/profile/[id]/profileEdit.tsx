import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { fetchProfileById, updateProfileField } from '../../../types/profiles';
import type { Profile } from '../../../types/profiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import styles from '../../../styles/styles.module.css';

import SuccessFailModal from '../../../components/profile/modal/SuccessFailModal';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import ProfileImages from '../../../components/profile/ProfileImages';
import ProfileBasicInfo from '../../../components/profile/ProfileBasicInfo';
import {
  ProfileMBTIBox,
  ProfileIntroduceBox,
  ProfileHistoryBox,
  ProfileCareerBox
} from '../../../components/profile/ProfileDetailsBoxes';

const ProfileEditPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [modal, setModal] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // 상세 정보 편집 상태
  const [mbti, setMbti] = useState<string | undefined>(undefined);
  const [introduce, setIntroduce] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<any[]>([]);
  const [career, setCareer] = useState<any[]>([]);

  const isMyProfile = myUid && id === myUid;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setMyUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof id === 'string') {
      setLoading(true);
      fetchProfileById(id).then(profile => {
        setProfile(profile);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    setMbti(profile?.mbti);
    setIntroduce(profile?.introduce);
    setHistory(profile?.history ?? []);
    setCareer(profile?.career ?? []);
  }, [profile]);

  // 필드 저장 핸들러(예: MBTI 등)
  const handleSaveMbti = async (newMbti: string) => {
    setMbti(newMbti);
    if (profile) await updateProfileField(profile.id, { mbti: newMbti });
  };
  const handleSaveIntroduce = async (newIntro: string) => {
    setIntroduce(newIntro);
    if (profile) await updateProfileField(profile.id, { introduce: newIntro });
  };
  const handleSaveHistory = async (newHistory: any[]) => {
    setHistory(newHistory);
    if (profile) await updateProfileField(profile.id, { history: newHistory });
  };
  const handleSaveCareer = async (newCareer: any[]) => {
    setCareer(newCareer);
    if (profile) await updateProfileField(profile.id, { career: newCareer });
  };

  // 권한 없음(내 프로필 아님)
  if (!isMyProfile) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard} style={{ padding: 24, textAlign: 'center', color: '#E53935' }}>
          <h2>접근 권한이 없습니다.</h2>
          <p>본인의 프로필만 수정할 수 있습니다.</p>
          <Link href={`/profile/${id}`} style={{ color: '#636AE8', textDecoration: 'underline' }}>
            프로필 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
          }}>
            <div className="spinner" style={{ marginBottom: 18 }} />
            <div style={{ fontSize: 18, color: '#636AE8', fontWeight: 600 }}>로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div style={{ padding: 24 }}>존재하지 않는 프로필입니다.</div>;
  }

  return (
    <div className={styles.fullContainer}>
      <div className={styles.centerCard}>
        {/* 헤더 */}
        <div className={styles.fixedHeader}>
          <ProfileHeader
            isMyProfile={true}
            onBack={() => router.back()}
            isFriend={false}
            isFavorite={false}
            onToggleFavorite={() => {}}
            onEditProfile={() => {}}
            onScan={() => {}}
            onShowQR={() => {}}
            onBlock={() => {}}
            onReport={() => {}}
          />
        </div>

        {/* 본문 */}
        <div className={`${styles.scrollMain} ${styles.scrollMainProfile}`}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ProfileImages backgroundImg={profile.backgroundImg} img={profile.img} name={profile.name} />

            {/* 기본 정보(이름, 설명, 태그 등) */}
            <ProfileBasicInfo name={profile.name} desc={profile.desc} tag={profile.tag} /* 편집 로직 필요시 props 추가 */ />

            {/* 세부 정보(아래 부분은 샘플) */}
            <ProfileMBTIBox mbti={mbti} isMyProfile={true} onEdit={() => {/* 모달 열기 등 */}} />
            <ProfileIntroduceBox introduce={introduce} isMyProfile={true} onEdit={() => {/* 모달 열기 등 */}} />
            <ProfileHistoryBox history={history} isMyProfile={true} onEdit={() => {/* 모달 열기 등 */}} />
            <ProfileCareerBox career={career} isMyProfile={true} onEdit={() => {/* 모달 열기 등 */}} />
            {/* 각 onEdit에는 Modal을 열어서 내용 입력/수정 후 위의 handleSave* 함수로 저장하도록 구현 */}
          </div>
        </div>
      </div>
      {/* 성공/실패 모달 */}
      <SuccessFailModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, show: false })}
      />
    </div>
  );
};

export async function getServerSideProps() {
  return { props: {} };
}

export default ProfileEditPage;