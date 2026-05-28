import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import casesFilterReducer from './slices/casesFilterSlice';
import themeReducer from './slices/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  casesFilter: casesFilterReducer,
  theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
