import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { fetchProfileById, updateProfileField } from '../../../types/profiles';
import type { Profile } from '../../../types/profiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import styles from '../../../styles/styles.module.css';

import SuccessFailModal from '../../../components/profile/modal/SuccessFailModal';
import ProfileImages from '../../../components/profile/ProfileImages';
import ProfileBasicInfo from '../../../components/profile/ProfileBasicInfo';
import {
  ProfileMBTIBox,
  ProfileIntroduceBox,
  ProfileHistoryBox,
  ProfileCareerBox,
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

  // 수정 가능한 상태 관리
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
      fetchProfileById(id).then(profileObj => {
        setProfile(profileObj);
        setMbti(profileObj?.mbti);
        setIntroduce(profileObj?.introduce);
        setHistory(profileObj?.history ?? []);
        setCareer(profileObj?.career ?? []);
        setLoading(false);
      });
    }
  }, [id]);

  // 저장 버튼 클릭시 모든(편집된) 상태 저장
  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      await updateProfileField(profile.id, {
        mbti,
        introduce,
        history,
        career,
      });
      setModal({ show: true, message: "프로필이 성공적으로 저장되었습니다.", type: "success" });
    } catch (e) {
      setModal({ show: true, message: "프로필 저장 중 오류가 발생했습니다.", type: "error" });
    }
  };

  // 권한 없음(내 프로필 아님)
  if (!isMyProfile) {
    return (
      <div className={styles.fullContainer}>
        <div className={styles.centerCard} style={{ padding: 24, textAlign: 'center', color: '#E53935' }}>
          <h2>접근 권한이 없습니다.</h2>
          <p>본인만 자신의 프로필을 수정할 수 있습니다.</p>
          {id && (
            <Link href={`/profile/${id}`}>
              <span style={{ color: '#636AE8', textDecoration: 'underline', cursor: 'pointer' }}>
                프로필 페이지로 돌아가기
              </span>
            </Link>
          )}
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
        {/* 수정페이지 전용 상단 헤더(뒤로가기+중앙 타이틀+오른쪽 저장) */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            aria-label="뒤로가기"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M18 22L10 14L18 6" stroke="#222" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 18 }}>프로필 수정</span>
          <button
            onClick={handleSaveProfile}
            style={{
              position: 'absolute', right: 16, top: '50%',
              transform: 'translateY(-50%)',
              background: '#636AE8', color: '#fff', border: 'none', borderRadius: 6,
              padding: '7px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer'
            }}
          >
            프로필 저장
          </button>
        </div>

        {/* 본문 */}
        <div className={`${styles.scrollMain} ${styles.scrollMainProfile}`}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ProfileImages backgroundImg={profile.backgroundImg} img={profile.img} name={profile.name} />
            <ProfileBasicInfo name={profile.name} desc={profile.desc} tag={profile.tag} />
            <ProfileMBTIBox mbti={mbti} isMyProfile={true} onEdit={() => {/* 모달 열기 등 */}} />
            <ProfileIntroduceBox introduce={introduce} isMyProfile={true} onEdit={() => {}} />
            <ProfileHistoryBox history={history} isMyProfile={true} onEdit={() => {}} />
            <ProfileCareerBox career={career} isMyProfile={true} onEdit={() => {}} />
            {/* onEdit 핸들러는 각 항목의 상태 set함수로 바로 사용 */}
          </div>
        </div>
      </div>
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
