import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface MetabotState {
  userMessages: string[];
  visible: boolean;
}

const initialState: MetabotState = {
  userMessages: [],
  visible: false,
};

export const metabot = createSlice({
  name: "metabase-enterprise/metabot",
  initialState,
  reducers: {
    setVisible: (state, { payload: visible }: PayloadAction<boolean>) => {
      state.visible = visible;
      if (!visible) {
        state.userMessages = [];
      }
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.userMessages.push(action.payload);
    },
    removeUserMessage: (state, action: PayloadAction<number>) => {
      state.userMessages.splice(action.payload, 1);
    },
    clearUserMessages: state => {
      state.userMessages = [];
    },
  },
});

export const metabotReducer = metabot.reducer;
