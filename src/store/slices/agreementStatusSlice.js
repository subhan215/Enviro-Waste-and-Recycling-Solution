import { createSlice } from '@reduxjs/toolkit';

const agreementStatusSlice = createSlice({
  name: 'agreementStatus',
  initialState: {
    value: ""
  },
  reducers: {
    setAgreementStatus: (state , action) => {
      state.value = action.payload;
      console.log(action)
    }
  },
});

export const { setAgreementStatus } = agreementStatusSlice.actions;
export default agreementStatusSlice.reducer;