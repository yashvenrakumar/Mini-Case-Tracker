import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { useMediaQuery, useTheme } from '@mui/material';
import { store, persistor } from '@/redux/store';
import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AppThemeProvider } from '@/theme/AppThemeProvider';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { selectThemeMode } from '@/redux/slices/themeSlice';
import { THEME_COLORS } from '@/constants/themeColors';

const AuthEvents = () => {
  const dispatch = useAppDispatch();




  useEffect(() => {
    console.log('AuthEvents--mounted');
  }, []);
  useEffect(() => {
    const handler = () => dispatch(logout());
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [dispatch]);

  return null;
};

const ThemedToaster = () => {
  const mode = useAppSelector(selectThemeMode);
  console.log('ThemedToaster----->', mode);
  const colors = THEME_COLORS[mode];
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Toaster
      position={isMobile ? 'top-center' : 'top-right'}
      containerStyle={{
        top: isMobile ? 64 : 72,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: 0,
          background: colors.surface,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          maxWidth: 'min(420px, calc(100vw - 32px))',
        },
      }}
    />
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner fullScreen />} persistor={persistor}>
        <AppThemeProvider>
          <ErrorBoundary>
            <AuthEvents />
            <AppRoutes />
            <ThemedToaster />
          </ErrorBoundary>
        </AppThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
