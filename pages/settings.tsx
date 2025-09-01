import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import CouponResultModal from '../components/CouponResultModal';
import styles from '../styles/settings.module.css';

export default function SettingsPage() {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    success: boolean;
    message: string;
    couponCode?: string;
  } | null>(null);
  const router = useRouter();
  const auth = getAuth();
    const db = getFirestore();
  
  // 사용자 지갑 잔액 실시간 가져오기
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return;
    
    // 지갑 문서 참조
    const walletRef = doc(db, `users/${user.uid}/wallet/default`);
    
    // 실시간 리스너 설정
    const unsubscribe = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        const walletData = doc.data();
        setWalletBalance(walletData.balance || 0);
        console.log('지갑 잔액 업데이트:', walletData.balance);
      } else {
        console.log('지갑 문서가 존재하지 않습니다');
        setWalletBalance(0);
      }
    }, (error) => {
      console.error('지갑 데이터 가져오기 오류:', error);
      setWalletBalance(0);
    });
    
    // 컴포넌트 언마운트 시 리스너 해제
    return () => unsubscribe();
  }, [db]);
  
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setMessage('쿠폰 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Firebase Functions 직접 호출
      const app = getApp();
      const functions = getFunctions(app, 'asia-northeast3');
      const redeemCoupon = httpsCallable(functions, 'redeemCoupon');

      const result = await redeemCoupon({ couponCode: couponCode.trim() });
      
      console.log('쿠폰 등록 성공:', result);
      
      // 백엔드 응답에서 메시지 추출
      const data = result.data as any;
      
      // 모달에 결과 표시
      setCouponResult({
        success: data.success,
        message: data.message,
        couponCode: data.couponCode
      });
      setIsModalOpen(true);
      setCouponCode('');
      
    } catch (error: any) {
      console.error('쿠폰 등록 오류:', error);
      console.error('에러 코드:', error.code);
      console.error('에러 메시지:', error.message);
      console.error('에러 상세:', error.details);
      
      // Firebase Functions 에러 처리
      let errorMessage = '쿠폰 등록에 실패했습니다. 다시 시도해주세요.';
      
      if (error.code === 'functions/unavailable') {
        errorMessage = '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.code === 'functions/invalid-argument') {
        errorMessage = '잘못된 쿠폰 코드입니다. 다시 확인해주세요.';
      } else if (error.code === 'functions/not-found') {
        errorMessage = '쿠폰을 찾을 수 없습니다. 코드를 다시 확인해주세요.';
      } else if (error.code === 'INTERNAL') {
        errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else {
        errorMessage = error.message || '쿠폰 등록에 실패했습니다. 다시 시도해주세요.';
      }
      
      // 모달에 에러 결과 표시
      setCouponResult({
        success: false,
        message: errorMessage,
        couponCode: couponCode.trim()
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/register/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* 헤더 */}
        <div className={styles.header}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h1 className={styles.title}>
            설정
          </h1>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={styles.content}>
          {/* 지갑 카드 */}
          <div className={styles.walletCard}>
            {/* 배경 패턴 */}
            <div className={styles.bgPattern1} />
            <div className={styles.bgPattern2} />
            
            <div className={styles.walletContent}>
              <div className={styles.walletHeader}>
                <div className={styles.walletIcon}>
                  💰
                </div>
                <div className={styles.walletInfo}>
                  <div className={styles.balanceLabel}>
                    현재 보유 토큰
                  </div>
                  <div className={styles.balanceAmount}>
                    ₩{formatAmount(walletBalance)}
                  </div>
                </div>
              </div>
              
              <div className={styles.userEmail}>
                {auth.currentUser?.email || '사용자'}
              </div>
              <div className={styles.feeInfo}>
                요금: 월 9,900원 (자동 결제)
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className={styles.actionButtons}>
            <button
              onClick={() => alert('충전 기능은 준비 중입니다.')}
              className={`${styles.actionButton} ${styles.chargeButton}`}
            >
              <span style={{ fontSize: '18px' }}>💰</span>
              충전
            </button>
            
            <button
              onClick={() => alert('출금 기능은 준비 중입니다.')}
              className={`${styles.actionButton} ${styles.withdrawButton}`}
            >
              <span style={{ fontSize: '18px' }}>💸</span>
              출금
            </button>
          </div>

          {/* 쿠폰 등록 섹션 */}
          <div className={`${styles.sectionCard} ${styles.couponSection}`}>
            <div className={styles.sectionHeader}>
              <div className={`${styles.sectionIcon} ${styles.couponIcon}`}>
                🎫
              </div>
              <h2 className={styles.sectionTitle}>
                쿠폰 등록
              </h2>
            </div>
            
            <form onSubmit={handleCouponSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드를 입력하세요"
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !couponCode.trim()}
                className={styles.submitButton}
              >
                {isLoading ? '등록 중...' : '쿠폰 등록하기'}
              </button>
            </form>
            

          </div>

          {/* 로그아웃 섹션 */}
          <div className={`${styles.sectionCard} ${styles.logoutSection}`}>
            <div className={styles.sectionHeader}>
              <div className={`${styles.sectionIcon} ${styles.logoutIcon}`}>
                🚪
              </div>
              <h2 className={styles.sectionTitle}>
                계정 관리
              </h2>
            </div>
            
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              로그아웃
            </button>
            
            <div className={styles.logoutInfo}>
              로그아웃하면 모든 세션이 종료됩니다.
            </div>
          </div>
        </div>
      </div>
      
      {/* 쿠폰 결과 모달 */}
      <CouponResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={couponResult}
      />
    </div>
  );
}
