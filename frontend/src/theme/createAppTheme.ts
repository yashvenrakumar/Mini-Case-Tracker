import { createTheme, type Theme } from '@mui/material/styles';
import { THEME_COLORS, type ThemeMode } from '@/constants/themeColors';

export const createAppTheme = (mode: ThemeMode): Theme => {
  const colors = THEME_COLORS[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        contrastText: colors.onPrimary,
      },
      secondary: {
        main: colors.accent,
        contrastText: colors.onPrimary,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text,
        secondary: colors.textMuted,
      },
      divider: colors.border,
      custom: {
        primaryDark: colors.primaryDark,
        accent: colors.accent,
        backgroundAlt: colors.backgroundAlt,
        surface: colors.surface,
        border: colors.border,
        textMuted: colors.textMuted,
        onPrimary: colors.onPrimary,
      },
    },
    shape: { borderRadius: 0 },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        fontSize: '1.375rem',
        lineHeight: 1.3,
        '@media (min-width:600px)': {
          fontSize: '1.75rem',
        },
        '@media (min-width:900px)': {
          fontSize: '2.125rem',
        },
      },
      h5: {
        fontWeight: 700,
        fontSize: '1.25rem',
        '@media (min-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.05rem',
        '@media (min-width:600px)': {
          fontSize: '1.25rem',
        },
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            color: colors.text,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            textTransform: 'none',
            fontWeight: 600,
            '@media (max-width:599.95px)': {
              minHeight: 44,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surface,
            color: colors.text,
            borderBottom: `1px solid ${colors.border}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.surface,
            color: colors.text,
            borderRight: `1px solid ${colors.border}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 0,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            '&.Mui-selected': {
              backgroundColor:
                mode === 'light'
                  ? `${colors.accent}33`
                  : `${colors.accent}22`,
              '&:hover': {
                backgroundColor:
                  mode === 'light'
                    ? `${colors.accent}44`
                    : `${colors.accent}33`,
              },
            },
          },
        },
      },
    },
  });
};
