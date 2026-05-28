import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import type { WebStorage } from 'redux-persist/es/types';
import rootReducer, { type RootState } from './rootReducer';
import { setAuthToken } from '@/utils/apiClient';

/**
 * Vite-safe persist storage. Do not import from `redux-persist/lib/storage` or
 * `createWebStorage` — default exports break under ESM (`is not a function`).
 */
const createLocalStorage = (): WebStorage => ({
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
});

const createNoopStorage = (): WebStorage => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
});

const persistStorage: WebStorage =
  typeof window !== 'undefined' ? createLocalStorage() : createNoopStorage();

const persistConfig = {
  key: 'mini-case-tracker',
  storage: persistStorage,
  whitelist: ['auth', 'casesFilter', 'theme'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register', 'rehydrate'],
      },
    }),
});

export const persistor = persistStore(store, null, () => {
  const token = store.getState().auth.token;
  setAuthToken(token);
});

export type { RootState };
export type AppDispatch = typeof store.dispatch;
