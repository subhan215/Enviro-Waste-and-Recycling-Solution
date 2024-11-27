import { configureStore } from '@reduxjs/toolkit';
import exampleReducer from './slices/exampleSlice'; // Example slice
import userDataReducer from "./slices/userDataSlice" ; 
import currentChatReducer from "./slices/currentChatSlice"
import agreementStatusReducer from "./slices/agreementStatusSlice"
export const store = configureStore({
  reducer: {
    example: exampleReducer,
    userData: userDataReducer , 
    currentChatId: currentChatReducer , 
    agreementStatus: agreementStatusReducer
  },
});
