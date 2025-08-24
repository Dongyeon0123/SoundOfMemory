# SoundOfMemory

SoundOfMemory는 사용자의 개성을 파악하고 맞춤형 AI 채팅 경험을 제공하는 Next.js 기반 웹 애플리케이션입니다.  
온보딩 과정을 통해 사용자의 성향과 관심사를 분석하고, 이를 바탕으로 개인화된 AI와의 대화를 가능하게 합니다.

---

## 스크린샷

### 로그인 페이지
<p align="center">
  <img src="https://github.com/user-attachments/assets/b9c6da73-6373-476b-b755-17db79003adf" width="250" />
</p>

### 홈 화면
<p align="center">
  <img src="https://github.com/user-attachments/assets/ad62a1fd-7a47-463a-92bf-5cd1e677ddb6" width="250" />
</p>

### 나의 프로필 페이지
<p align="center">
  <img src="https://github.com/user-attachments/assets/f144181e-7f69-40c8-927b-27b565440e16" width="250" />
</p>

### 채팅창
<p align="center">
  <img src="https://github.com/user-attachments/assets/538930e2-e9b4-4ac6-a535-fc299ed72f7a" width="250" />
</p>

### 채팅 주제 관리  
(내가 내 AI 아바타와 대화를 하면, 나에 대한 정보가 쌓이게 됨.)
<p align="center">
  <img src="https://github.com/user-attachments/assets/15dde99c-5dd4-4880-9df0-cac2629b9db7" width="250" />
</p>

### 프로필 QR 코드 생성
<p align="center">
  <img src="https://github.com/user-attachments/assets/30f368ca-170a-454a-b996-a468774f051c" width="250" />
</p>

### 온보딩 페이지
<p align="center">
  <img src="https://github.com/user-attachments/assets/1bd2fadb-5b34-4cfd-93e2-ddb78cb5ce95" width="250" />
  <img src="https://github.com/user-attachments/assets/f875fbb7-037d-453d-a17d-141b27526a8b" width="250" />
  <img src="https://github.com/user-attachments/assets/ef5d0c83-b0b0-4086-bb36-4baa1821d282" width="250" />
</p>

### 성향 분석 온보딩 채팅
<p align="center">
  <img src="https://github.com/user-attachments/assets/58d21f72-b632-414a-9843-275ecf802508" width="250" />
  <img src="https://github.com/user-attachments/assets/47bc5ec4-f716-4af3-886b-9147eba360a9" width="250" />
  <img src="https://github.com/user-attachments/assets/5da193ed-0305-4c4c-9042-2e8ec442df4e" width="250" />
</p>

---

## 주요 기능

- **개인화 온보딩**: 12단계 질문을 통한 사용자 성향 분석  
- **AI 채팅**: 개인 맞춤형 AI 어시스턴트와의 자연스러운 대화  
- **관심사 기반 추천**: 사용자 선호도에 따른 맞춤 콘텐츠 제공  
- **실시간 타이핑 애니메이션**: 자연스러운 채팅 경험  
- **Firebase 연동**: 사용자 데이터 및 채팅 기록 저장  
- **프로필 관리**: 개인 정보 및 아바타 커스터마이징  

---

## 기술 스택

- **Frontend**: Next.js, React, TypeScript  
- **Styling**: CSS Modules  
- **Backend**: Firebase (Firestore, Authentication)  
- **AI Integration**: Cloud Functions  
- **Deployment**: Vercel
  
## 프로젝트 구조
```
SoundOfMemory/
├── client/ # 클라이언트 사이드 유틸리티
│ └── uploadProfileImage.ts # 프로필 이미지 업로드 로직
│
├── components/ # 재사용 가능한 컴포넌트
│ ├── AnnouncementModal.tsx # 공지사항 모달
│ ├── NotificationModal.tsx # 알림 모달
│ ├── SplashScreen.tsx # 스플래시 화면
│ │
│ ├── chat/ # 채팅 관련 컴포넌트
│ │ ├── ChatHeader.tsx # 채팅 헤더 (뒤로가기, 프로필 등)
│ │ ├── ChatInput.tsx # 채팅 입력 컴포넌트
│ │ ├── MessageList.tsx # 메시지 목록 표시
│ │ └── ProfileSection.tsx # 채팅 상단 프로필 섹션
│ │
│ ├── home/ # 홈 화면 관련 컴포넌트
│ │ ├── FriendsSection.tsx # 친구 목록 섹션
│ │ ├── FullScreenToggleButton.tsx # 전체화면 토글 버튼
│ │ ├── HeaderBar.tsx # 홈 화면 헤더
│ │ ├── MyAvatar.tsx # 내 아바타 표시
│ │ └── SearchModal.tsx # 검색 모달
│ │
│ ├── onboarding/ # 온보딩 관련 컴포넌트
│ │ ├── CompletionSection.tsx # 온보딩 완료 섹션
│ │ ├── FinalGreeting.tsx # 최종 인사말 (서류 준비 중...)
│ │ ├── GreetingSection.tsx # 초기 인사말
│ │ ├── InterestsSection.tsx # 관심사 선택
│ │ ├── NameInputSection.tsx # 이름 입력
│ │ ├── ProfileCompleteGreeting.tsx # 프로필 완료 축하
│ │ └── ProfileImage.tsx # 프로필 이미지 선택
│ │
│ └── profile/ # 프로필 관련 컴포넌트
│ ├── modal/ # 프로필 모달들
│ │ ├── BackgroundModal.tsx # 배경 설정 모달
│ │ ├── CareerModal.tsx # 직업 정보 모달
│ │ ├── ChatTopicModal.tsx # 채팅 주제 모달
│ │ ├── CopyModal.tsx # 복사 완료 모달
│ │ ├── HistoryModal.tsx # 대화 기록 모달
│ │ ├── ImageModal.tsx # 이미지 확대 모달
│ │ ├── IntroduceModal.tsx # 자기소개 모달
│ │ ├── LoginRequiredModal.tsx # 로그인 필요 모달
│ │ ├── MBTIModal.tsx # MBTI 설정 모달
│ │ ├── QRCodeModal.tsx # QR코드 공유 모달
│ │ ├── SocialModal.tsx # 소셜 미디어 모달
│ │ └── SuccessFailModal.tsx # 성공/실패 알림 모달
│ │
│ ├── ProfileActionButton.tsx # 프로필 액션 버튼
│ ├── ProfileBasicInfo.tsx # 기본 정보 표시
│ ├── ProfileDetailsBoxes.tsx # 상세 정보 박스들
│ ├── ProfileHeader.tsx # 프로필 헤더
│ ├── ProfileImages.tsx # 프로필 이미지들
│ └── ProfileLinks.tsx # 프로필 링크들
│
├── pages/ # Next.js 페이지
│ ├── _app.tsx # 앱 전체 설정
│ ├── _document.tsx # HTML 문서 설정
│ ├── index.tsx # 홈 페이지
│ ├── test-onboarding.tsx # 온보딩 테스트 페이지
│ ├── test-chat.tsx # 채팅 테스트 페이지
│ │
│ ├── auth/ # 인증 관련 페이지
│ │ └── kakao/
│ │ └── callback.tsx # 카카오 로그인 콜백
│ │
│ ├── chat/ # 채팅 페이지
│ │ └── [id].tsx # 동적 채팅방 (아바타별)
│ │
│ ├── friend/ # 친구 관련 페이지
│ │ ├── requests.tsx # 친구 요청 목록
│ │ └── friend-requests.tsx # 친구 요청 처리
│ │
│ ├── profile/ # 프로필 관련 페이지
│ │ ├── [id].tsx # 사용자 프로필 보기
│ │ ├── [id]/profileEdit.tsx # 프로필 편집
│ │ └── temp/
│ │ └── [token].tsx # 임시 프로필 (토큰 기반)
│ │
│ └── register/ # 회원가입/로그인
│ └── login.tsx # 로그인 페이지
│
├── public/ # 정적 파일
│ ├── background.png
│ ├── BlueLogo.png
│ ├── char.png
│ ├── logo.png
│ ├── mori.png
│ ├── twoMori.png
│ ├── WhiteLogo.png
│ ├── WhiteMori.png
│ │
│ ├── font/ # 폰트 파일들
│ │ ├── SCDream1.otf ~ SCDream9.otf
│ │
│ ├── profile/ # 기본 프로필 이미지들
│ │ ├── 1.png ~ 10.png
│ │
│ └── Selection*.png
│
├── styles/
│ ├── globals.css
│ ├── styles.module.css
│ ├── announcementModal.module.css
│ ├── chat.module.css
│ ├── HistoryModal.module.css
│ ├── IntroduceModal.module.css
│ ├── login.module.css
│ ├── MbtiModal.module.css
│ ├── notifications.module.css
│ ├── onboarding/
│ │ ├── completionSection.module.css
│ │ ├── greetingSection.module.css
│ │ ├── interestsSection.module.css
│ │ ├── nameInputSection.module.css
│ │ ├── profileImage.module.css
│ │ └── testChat.module.css
│ ├── profile.module.css
│ └── splashScreen.module.css
│
├── types/
│ ├── announcements.ts
│ ├── chat.ts
│ ├── firebase.ts
│ ├── home.ts
│ ├── profiles.ts
│ ├── sanitizeHtml.ts
│ └── store.ts
│
├── package.json
├── tsconfig.json
└── next-env.d.ts
```
---

## 개발 과정에서 겪은 문제점들과 해결 과정

### 1. 온보딩 플로우 연결 문제
- **문제**: 온보딩 완료 후 `test-chat` 페이지로 자연스럽게 연결되지 않음  
- **원인**: 온보딩 컴포넌트들이 독립적으로 작동해 페이지 간 전환이 부자연스러움  
- **해결**:
  ```tsx
  // test-onboarding.tsx
  const handleFinalGreetingComplete = () => {
    router.push('/test-chat'); // 온보딩 완료 후 test-chat으로 이동
  };
  ```
  결과: 온보딩 → test-chat → 홈으로 이어지는 완벽한 플로우 완성

### 2. Firebase 데이터 구조 설계 문제
- **문제**: 온보딩 답변과 관심사 데이터를 효율적으로 저장해야 함
- **해결**:
  ```
  // 서브컬렉션 경로
  const onboardDocRef = doc(db, 'users', user.uid, 'onboard', 'response');
  
  await setDoc(onboardDocRef, {
    answers: arrayUnion(response),
    lastUpdated: new Date()
  }, { merge: true });
  
  if (questionIndex === 12) {
    const interests = response.split(', ').map(item => item.trim()).filter(item => item);
  
    await setDoc(userProfileRef, { tag: interests }, { merge: true });
  
    for (const interest of interests) {
      const chatDataDocRef = doc(db, 'users', user.uid, 'chatData', interest);
      await setDoc(chatDataDocRef, { createdAt: new Date() }, { merge: true });
    }
  }
  ```
### 3. 채팅 경로 분리 및 데이터 격리 문제
- **문제**: 내 아바타 채팅 기록이 다른 사용자에게 노출되는 보안 문제
- **해결**:
  ```
  // 잘못된 방식
  const chatRef = collection(db, 'chats', avatarId, 'messages');
  
  // 수정된 방식
  const chatRef = collection(db, 'users', userId, 'avatars', avatarId, 'chats');
  ```
### 4. AI API 연동 및 에러 처리 문제
- **문제**: 네트워크 오류 발생 시 플로우가 끊김
- **해결**:
  ```
    try {
    const response = await fetch('CLOUD_FUNCTION_URL', { method: 'POST' });
    if (!response.ok) console.error('API 호출 실패');
  } catch (e) {
    console.error('API 오류', e);
  }
  ```
---

## 향후 개선 계획

- AI 응답 품질 향상  
- 다국어 지원  
- 모바일 앱 개발  
- 사용자 피드백 시스템 구축  
- 채팅 데이터 암호화 강화  
- 실시간 채팅 기능 추가  

---

## 보안 고려사항

- 사용자별 데이터 완전 격리  
- Firebase 보안 규칙 강화  
- 채팅 데이터 접근 권한 제한  
- 개인정보 보호 및 암호화 
