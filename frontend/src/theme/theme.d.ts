import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      primaryDark: string;
      accent: string;
      backgroundAlt: string;
      surface: string;
      border: string;
      textMuted: string;
      onPrimary: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      primaryDark?: string;
      accent?: string;
      backgroundAlt?: string;
      surface?: string;
      border?: string;
      textMuted?: string;
      onPrimary?: string;
    };
  }
}
