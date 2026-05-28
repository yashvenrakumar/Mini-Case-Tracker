import { useEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAppSelector } from '@/redux/hooks';
import { selectThemeMode } from '@/redux/slices/themeSlice';
import { THEME_COLORS } from '@/constants/themeColors';
import { createAppTheme } from './createAppTheme';

interface AppThemeProviderProps {
  children: ReactNode;
}

const applyCssVariables = (mode: 'light' | 'dark') => {
  const colors = THEME_COLORS[mode];
  const root = document.documentElement;

  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const mode = useAppSelector(selectThemeMode);
  console.log("  mode------ :  ", mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    applyCssVariables(mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
