# SoundOfMemory

SoundOfMemory는 사용자의 개성을 파악하고 맞춤형 AI 채팅 경험을 제공하는 Next.js 기반 웹 애플리케이션입니다.  
온보딩 과정을 통해 사용자의 성향과 관심사를 분석하고, 이를 바탕으로 개인화된 AI와의 대화를 가능하게 합니다.<br>
명함과 같은 공식적인 수단이 없는 사람들을 위해 사람들만의 개성 있는 브랜딩의 필요성을 느꼈고,<br>
단순히 정보 전달을 넘어서 사용자의 본질을 담아내는 퍼스널 AI 아바타 서비스를 제작하게되었습니다.

## 사이트 URL: soundofmemory.io

---

## 스크린샷

### 로그인 페이지
구글 로그인과 카카오 로그인을 통한 로그인이 가능
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

### 채팅 주제 관리  
(내가 내 AI 아바타와 대화를 하면, 나에 대한 정보가 쌓이게 됨.)
<p align="center">
  <img src="https://github.com/user-attachments/assets/15dde99c-5dd4-4880-9df0-cac2629b9db7" width="250" />
</p>

### 채팅창
(내가 쌓아놓은 정보로 AI가 답변을 하는 모습)
<p align="center">
  <img src="https://github.com/user-attachments/assets/538930e2-e9b4-4ac6-a535-fc299ed72f7a" width="250" />
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
(여기서의 답변을 토대로 AI가 사용자의 성향 & 성격을 분석하여 저장)
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

- **Frontend**: Next.js, Redux Toolkit, TypeScript  
- **Styling**: CSS Modules  
- **Backend**: Firebase (Firestore, Authentication)
- **AI Integration**: Cloud Functions  
- **Deployment**: Vercel

### 내가 맡은 역할
**UI/UX 개발:**
- 온보딩 플로우 설계: 12단계 질문을 단계별로 구분하여 사용자 경험 최적화
- 시각적 피드백: 진행 상황 바, 타이핑 애니메이션, 버튼 상태 변화
- 반응형 인터페이스: 사용자 입력에 따른 동적 UI 업데이트
- 사용자 경험 최적화: 자연스러운 대화 흐름과 직관적인 인터페이스
  
**Firebase/API 연동:**
- 데이터 구조 설계: 사용자별 온보딩 답변과 관심사 데이터 저장
- 외부 API 통합: AI 성격 분석 API와의 연동 및 응답 처리
- 에러 핸들링: 네트워크 오류, API 오류 등 다양한 상황에 대한 처리
- 데이터 동기화: 실시간 데이터 업데이트 및 상태 관리
이 두 역할을 모두 담당하면서 사용자 경험과 기술적 구현을 균형있게 조화시켜 완성도 높은 온보딩 채팅 시스템을 구축했습니다.

---
  
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

## 1. 프로젝트 구현 내용 (README 품질)
- 명확한 프로젝트 설명: AI 기반 퍼스널 아바타 서비스로, 사용자 개성 분석을 통한 맞춤형 채팅 경험 제공
- 상세한 스크린샷과 기능 설명: 12단계 온보딩, AI 채팅, 프로필 관리 등 핵심 기능을 시각적으로 명확하게 제시
- 기술 스택 명시: Next.js, Redux Toolkit, TypeScript, Firebase 등 현대적인 기술 스택 사용

## 2. 디렉토리 구조의 체계성
```
SoundOfMemory/
├── components/          # 기능별 컴포넌트 그룹화
│   ├── chat/           # 채팅 관련 컴포넌트
│   ├── home/           # 홈 화면 컴포넌트  
│   ├── onboarding/     # 온보딩 플로우 컴포넌트
│   └── profile/        # 프로필 관리 컴포넌트
├── types/              # TypeScript 타입 정의
├── styles/             # CSS 모듈별 스타일링
└── pages/              # Next.js 페이지 라우팅
```
## 3. 모듈화 및 코드 품질 (Frontend Fundamentals 준수)
- 컴포넌트 분리 및 책임 분리
```tsx
// ./components/onboarding/InterestsSection.tsx에서 관심사 선택 로직을 독립적인 컴포넌트로 분리
interface InterestsSectionProps {
  onContinue: (interests: Set<string>) => void;
  onBack: () => void;
}

// 카테고리별 관심사를 체계적으로 그룹화하여 유지보수성 향상
const categories = [
  { name: "생활", interests: ["생활관리", "가족", "연애", "건강"] },
  { name: "취미와 여가", interests: ["독서", "음악", "공예", "글쓰기"] }
];
```
- 상태 관리 패턴
```tsx
// ./types/chat.ts에서 Redux Toolkit을 활용한 상태 관리
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    }
  }
});
```
## 4. TypeScript 정확한 사용

- 1. 타입 안전성 확보
```tsx
// ./types/profiles.ts에서 복잡한 사용자 프로필 데이터를 정확한 타입으로 정의
export type Profile = {
  id: string;
  name: string;
  aiName: string;
  desc: string;
  tag: string[];
  mbti?: string;
  introduce?: string;
  history?: {
    school: string;
    period: string;
    role: string;
  }[];
  career?: {
    org: string;
    dept: string;
    period: string;
    months: number;
    role: string;
  }[];
};
```
- 2, 제네릭과 유니온 타입 활용
```tsx
// ./types/chat.ts에서 메시지 타입을 명확하게 구분
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';  // 유니온 타입으로 타입 안전성 확보
  timestamp: Date;
}
```
## 5. 제품 완성도 향상을 위한 고민

- 온보딩 플로우 최적화
```tsx
// ./pages/test-onboarding.tsx에서 단계별 상태 관리를 통한 부드러운 사용자 경험
const [step, setStep] = useState(0);
const [userName, setUserName] = useState('');
const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

// 각 단계별 완료 핸들러로 자연스러운 플로우 연결
const handleFinalGreetingComplete = () => {
  router.push('/test-chat'); // 온보딩 완료 후 채팅으로 자연스럽게 연결
};
```

---

## 개발 과정에서 겪은 문제점들과 해결 과정


### 1. any타입 사용으로 인한 타입 안정성 문제
- 문제상황
```tsx
// ./client/uploadProfileImage.ts - 에러 처리에서 any 타입 사용
catch (error) {
  console.error("에러 상세:", {
    code: (error as any).code,        // any 타입 캐스팅
    message: (error as any).message,  // any 타입 캐스팅
    stack: (error as any).stack       // any 타입 캐스팅
  });
  throw error;
}
```
- 해결방법
```tsx
// 타입 가드를 사용한 안전한 에러 처리
interface FirebaseError {
  code: string;
  message: string;
  stack?: string;
}

function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

catch (error) {
  if (isFirebaseError(error)) {
    console.error("에러 상세:", {
      code: error.code,        // 타입 안전
      message: error.message,  // 타입 안전
      stack: error.stack       // 타입 안전
    });
  }
  throw error;
}
```

### 2. 메시지 데이터 타입 불일치 문제
- 문제상황
```tsx
// ./types/chat.ts - 메시지 데이터 타입 불확실성
const rawMessages = data.messages ?? [];
const messages: Message[] = rawMessages.map((msg: any, index: number) => {  // any 타입 사용
  if (typeof msg === 'string') {
    return {
      id: `msg_${index}`,
      content: msg,
      sender: index % 2 === 1 ? 'ai' : 'user',
      timestamp: new Date(),
    };
  }
  return {
    id: msg.id || `msg_${index}`,
    content: msg.content,
    sender: msg.sender || (index % 2 === 1 ? 'ai' : 'user'),
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  };
});
```
- 해결방법
```tsx
// 메시지 데이터 타입 정의와 검증
interface RawMessage {
  id?: string;
  content?: string;
  sender?: 'user' | 'ai';
  timestamp?: any;
}

interface StringMessage {
  type: 'string';
  value: string;
}

interface ObjectMessage {
  type: 'object';
  value: RawMessage;
}

type MessageInput = string | RawMessage;

function normalizeMessage(input: MessageInput, index: number): Message {
  if (typeof input === 'string') {
    return {
      id: `msg_${index}`,
      content: input,
      sender: index % 2 === 1 ? 'ai' : 'user',
      timestamp: new Date(),
    };
  }
  
  return {
    id: input.id || `msg_${index}`,
    content: input.content || '',
    sender: input.sender || (index % 2 === 1 ? 'ai' : 'user'),
    timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
  };
}

const rawMessages: MessageInput[] = data.messages ?? [];
const messages: Message[] = rawMessages.map(normalizeMessage);
```

### 3. 온보딩 플로우 연결 문제
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

### 4. Firebase 데이터 구조 설계 문제
- **문제**: 온보딩 답변과 관심사 데이터를 효율적으로 저장해야 함
- **해결**:
  ```tsx
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
### 5. 채팅 경로 분리 및 데이터 격리 문제
- **문제**: 내 아바타 채팅 기록이 다른 사용자에게 노출되는 보안 문제
- **해결**:
  ```tsx
  // 잘못된 방식
  const chatRef = collection(db, 'chats', avatarId, 'messages');
  
  // 수정된 방식
  const chatRef = collection(db, 'users', userId, 'avatars', avatarId, 'chats');
  ```
### 6. AI API 연동 및 에러 처리 문제
- **문제**: 네트워크 오류 발생 시 플로우가 끊김
- **해결**:
  ```tsx
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
