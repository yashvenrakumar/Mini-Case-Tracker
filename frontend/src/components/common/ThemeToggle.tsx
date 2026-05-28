import { IconButton, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectThemeMode, toggleThemeMode } from '@/redux/slices/themeSlice';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle = ({ size = 'medium' }: ThemeToggleProps) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const isDark = mode === 'dark';
  console.log("mode------  ", mode);
  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        size={size}
        onClick={() => dispatch(toggleThemeMode())}
        aria-label="Toggle theme"
        sx={{
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'custom.backgroundAlt',
          },
        }}
      >
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
};
