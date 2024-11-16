import { configureStore } from '@reduxjs/toolkit';
import exampleReducer from './slices/exampleSlice'; // Example slice
import userDataReducer from "./slices/userDataSlice" ; 
import currentChatReducer from "./slices/currentChatSlice"
export const store = configureStore({
  reducer: {
    example: exampleReducer,
    userData: userDataReducer , 
    currentChatId: currentChatReducer
  },
});
