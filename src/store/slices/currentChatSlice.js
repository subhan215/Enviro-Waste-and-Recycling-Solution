import { createSlice } from '@reduxjs/toolkit';

const currentChatSlice = createSlice({
  name: 'currentChat',
  initialState: {
    value: ""
  },
  reducers: {
    setCurrentChat: (state , action) => {
      state.value = action.payload;
      console.log(action)
    }
  },
});

export const { setCurrentChat } = currentChatSlice.actions;
export default currentChatSlice.reducer;