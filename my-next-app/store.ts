import { configureStore, createSlice } from '@reduxjs/toolkit';
import chatReducer from './chat';

const initialProfile = {
  name: '임승원',
  desc: 'AI, 프론트엔드, UX에 관심이 많아요.',
  img: '/Selection.png',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfile,
  reducers: {
    setProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setProfile } = profileSlice.actions;

export function makeStore() {
  return configureStore({
    reducer: {
      profile: profileSlice.reducer,
      chat: chatReducer,
    },
  });
}

export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
export type AppDispatch = ReturnType<typeof makeStore>['dispatch']; 