import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { setProfileField } from '../../profiles';
import cardStyles from '../../styles/styles.module.css';
import mbtiStyles from '../../styles/MbtiModal.module.css';

const MBTI_LETTERS = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['P', 'J'],
];

const DEFAULT_IMG = '/char.png';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [img, setImg] = useState<string>(DEFAULT_IMG);
  const [mbti, setMbti] = useState('');
  const [introduce, setIntroduce] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [mbtiSelection, setMbtiSelection] = useState<string[]>(['E','N','T','J']);

  // 이미지 업로드 핸들러 (base64 변환)
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImg(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 저장
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('로그인이 필요합니다.');
      await setProfileField(user.uid, {
        name,
        img,
        mbti,
        introduce,
        tag: [],
      });
      router.push(`/profile/${user.uid}`);
    } catch (err: any) {
      setError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 스텝별 렌더링
  return (
    <div className={cardStyles.fullContainer}>
      <div className={cardStyles.centerCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        {/* 진행 바 */}
        <div style={{ width: 320, margin: '0 auto 24px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ flex: 1, height: 7, borderRadius: 4, background: '#eee', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${((step + 1) / 4) * 100}%`,
                height: '100%',
                background: '#636AE8',
                borderRadius: 4,
                transition: 'width 0.3s',
                position: 'absolute',
                left: 0, top: 0
              }} />
            </div>
          </div>
          <div style={{ textAlign: 'center', color: '#636AE8', fontWeight: 700, fontSize: 15, letterSpacing: '-1px' }}>
            4단계 중 {step + 1}단계
          </div>
        </div>
        {step === 0 && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>이름을 입력해 주세요</h2>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름 (필수)"
              style={{ fontSize: 18, padding: 12, borderRadius: 8, border: '1.5px solid #636AE8', width: 260, marginBottom: 24 }}
              maxLength={20}
              autoFocus
            />
            <button
              onClick={() => name.trim() && setStep(1)}
              style={{ width: 180, padding: 12, borderRadius: 8, background: name.trim() ? '#636AE8' : '#ccc', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
              disabled={!name.trim() || loading}
            >다음</button>
          </>
        )}
        {step === 1 && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>프로필 이미지를 선택해 주세요</h2>
            <img src={img} alt="프로필" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 18, border: '2px solid #eee' }} />
            <input type="file" accept="image/*" onChange={handleImgChange} style={{ marginBottom: 18 }} />
            <button
              onClick={() => setStep(2)}
              style={{ width: 180, padding: 12, borderRadius: 8, background: '#636AE8', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: 'pointer' }}
              disabled={loading}
            >다음</button>
            <button
              onClick={() => setStep(2)}
              style={{ width: 180, padding: 12, borderRadius: 8, background: '#bbb', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: 'pointer' }}
              disabled={loading}
            >건너뛰기</button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>MBTI를 선택해 주세요</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
              {MBTI_LETTERS.map((pair, idx) => (
                <div key={idx} className={mbtiStyles.mbtiOptionGroup}>
                  {pair.map(letter => (
                    <button
                      key={letter}
                      onClick={() => {
                        const next = [...mbtiSelection];
                        next[idx] = letter;
                        setMbtiSelection(next);
                      }}
                      className={
                        mbtiStyles.mbtiOptionButton +
                        (mbtiSelection[idx] === letter ? ` ${mbtiStyles.selected}` : '')
                      }
                      style={mbtiSelection[idx] === letter ? {
                        border: '2px solid #636AE8FF',
                        background: '#636AE8FF',
                        color: '#fff'
                      } : undefined}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setMbti(mbtiSelection.join('')); setStep(3); }}
              style={{ width: 180, padding: 12, borderRadius: 8, background: '#636AE8', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: 'pointer' }}
              disabled={loading}
            >다음</button>
            <button
              onClick={() => { setMbti(''); setStep(3); }}
              style={{ width: 180, padding: 12, borderRadius: 8, background: '#bbb', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: 'pointer' }}
              disabled={loading}
            >건너뛰기</button>
          </>
        )}
        {step === 3 && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>자기소개를 입력해 주세요</h2>
            <textarea
              value={introduce}
              onChange={e => setIntroduce(e.target.value)}
              placeholder="자기소개 (선택)"
              style={{ fontSize: 17, padding: 12, borderRadius: 8, border: '1.5px solid #636AE8', width: 280, minHeight: 80, marginBottom: 24, resize: 'vertical' }}
              maxLength={200}
            />
            <button
              onClick={handleSubmit}
              style={{ width: 180, padding: 12, borderRadius: 8, background: '#636AE8', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: 'pointer' }}
              disabled={loading}
            >완료</button>
            <button
              onClick={handleSubmit}
              style={{ width: 180, padding: 12, borderRadius: 8, background: '#bbb', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 8, cursor: 'pointer' }}
              disabled={loading}
            >건너뛰기</button>
          </>
        )}
        {error && <div style={{ color: 'red', marginTop: 16, fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
} 