import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

// 메시지 타입 정의
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// 상태 타입 정의
export interface ChatState {
  profile: string;
  messages: Message[];
  input: string;
  isProMode: boolean;
  isProcessing?: boolean;
  lastSummaryAt?: string;
  lastSummaryIndex?: number;
  lastUpdated?: string;
  processingEndedAt?: string;
  processingStartedAt?: string;
}

const initialState: ChatState = {
  profile: "",
  messages: [],
  input: "",
  isProMode: false,
  isProcessing: false,
  lastSummaryAt: "",
  lastSummaryIndex: undefined,
  lastUpdated: "",
  processingEndedAt: "",
  processingStartedAt: "",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setInput(state, action: PayloadAction<string>) {
      state.input = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
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
    setMessages(state, action: PayloadAction<Message[]>) {
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

// Timestamp → ISO 문자열 변환
function toDateString(ts: any): string {
  if (!ts) return "";
  if (typeof ts === "string") return ts;
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (ts.toDate) return ts.toDate().toISOString();
  return String(ts);
}

// Firestore에서 채팅 데이터 단건 fetch
export async function fetchChatWithTarget(myUid: string, targetUid: string): Promise<Partial<ChatState> | null> {
  try {
    const ref = doc(db, "users", myUid, "chats", `${targetUid}_avatar_chat`);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("문서가 존재하지 않습니다.");
      return null;
    }
    const data = snap.data();

    const rawMessages = data.messages ?? [];
    const messages: Message[] = rawMessages.map((msg: any, index: number) => {
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

    return {
      profile: data.profile ?? "",
      messages: messages,
      isProMode: data.isProMode ?? true,
      isProcessing: data.isProcessing ?? false,
      lastSummaryAt: data.lastSummaryAt ? toDateString(data.lastSummaryAt) : "",
      lastSummaryIndex: data.lastSummaryIndex,
      lastUpdated: data.lastUpdated ? toDateString(data.lastUpdated) : "",
      processingEndedAt: data.processingEndedAt ? toDateString(data.processingEndedAt) : "",
      processingStartedAt: data.processingStartedAt ? toDateString(data.processingStartedAt) : "",
    };
  } catch (error) {
    console.error("fetchChatWithTarget 에러:", error);
    return null;
  }
}

// Firestore 실시간 리스닝
export function subscribeChatWithTarget(
  myUid: string,
  targetUid: string,
  callback: (messages: Message[]) => void,
  onNoDoc?: () => void
) {
  const ref = doc(db, "users", myUid, "chats", `${targetUid}_avatar_chat`);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const rawMessages = data.messages ?? [];
      const messages: Message[] = rawMessages.map((msg: any, index: number) => {
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

      callback(messages);
    } else {
      callback([]);
      if (onNoDoc) onNoDoc();
    }
  });
}