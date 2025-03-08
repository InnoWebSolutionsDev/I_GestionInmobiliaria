

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../Reducer/reducer'; // Mantienes el rootReducer



export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env !== 'production', 
});


