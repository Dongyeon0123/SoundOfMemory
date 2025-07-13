import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

// 1. 상태 타입 정의 (Firestore 구조 반영)
export interface ChatState {
  profile: string;
  messages: string[];
  input: string;
  isProMode: boolean;
  isProcessing?: boolean;
  lastSummaryAt?: string;
  lastSummaryIndex?: number;
  lastUpdated?: string;
  processingEndedAt?: string;
  processingStartedAt?: string;
}

// 2. 초기 상태
const initialState: ChatState = {
  profile: "",
  messages: [],
  input: "",
  isProMode: true,
  isProcessing: false,
  lastSummaryAt: "",
  lastSummaryIndex: undefined,
  lastUpdated: "",
  processingEndedAt: "",
  processingStartedAt: "",
};

// 3. slice 생성
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setInput(state, action: PayloadAction<string>) {
      state.input = action.payload;
    },
    addMessage(state, action: PayloadAction<string>) {
      state.messages.push(action.payload);
    },
    setProMode(state, action: PayloadAction<boolean>) {
      state.isProMode = action.payload;
    },
    resetChat() {
      return initialState;
    },
    setProfile(state, action: PayloadAction<string>) {
      state.profile = action.payload;
    },
    setMessages(state, action: PayloadAction<string[]>) {
      state.messages = action.payload;
    },
    setChat(state, action: PayloadAction<Partial<ChatState>>) {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setInput,
  addMessage,
  setProMode,
  resetChat,
  setProfile,
  setMessages,
  setChat,
} = chatSlice.actions;

export default chatSlice.reducer;

// Firestore Timestamp → ISO 문자열 변환 함수
function toDateString(ts: any): string {
  if (!ts) return "";
  if (typeof ts === "string") return ts;
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (ts.toDate) return ts.toDate().toISOString();
  return String(ts);
}

// Firestore에서 채팅 데이터 불러오기
export async function fetchChatById(id: string): Promise<Partial<ChatState> | null> {
    try {
      // /users/{id}/chats/{id}_avatar_chat 문서에서 데이터 읽기
      const ref = doc(db, "users", id, "chats", `${id}_avatar_chat`);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        console.log("문서가 존재하지 않습니다.");
        return null;
      }
      const data = snap.data();
  
      return {
        profile: data.profile ?? "",
        messages: data.messages ?? [],
        isProMode: data.isProMode ?? true,
        isProcessing: data.isProcessing ?? false,
        lastSummaryAt: data.lastSummaryAt ? toDateString(data.lastSummaryAt) : "",
        lastSummaryIndex: data.lastSummaryIndex,
        lastUpdated: data.lastUpdated ? toDateString(data.lastUpdated) : "",
        processingEndedAt: data.processingEndedAt ? toDateString(data.processingEndedAt) : "",
        processingStartedAt: data.processingStartedAt ? toDateString(data.processingStartedAt) : "",
      };
    } catch (error) {
      console.error("fetchChatById 에러:", error);
      return null;
    }
  }