import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
} as const;

const lightColors = {
  primary: '#0F766E',
  primarySoft: '#DFF7F4',
  background: '#F7F8F5',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1EA',
  border: '#DCE3D7',
  text: '#17211B',
  textMuted: '#5F6B62',
  inputBackground: '#FDFEFC',
  placeholder: '#91A095',
  danger: '#D64545',
  success: '#218A5A',
  white: '#FFFFFF',
  shadow: 'rgba(23, 33, 27, 0.06)',
} as const;

const darkColors = {
  primary: '#67D4C4',
  primarySoft: '#153A39',
  background: '#0D1411',
  surface: '#141E1A',
  surfaceMuted: '#1B2721',
  border: '#26342D',
  text: '#E8F2EA',
  textMuted: '#A8B7AD',
  inputBackground: '#17211C',
  placeholder: '#7F9286',
  danger: '#FF7A7A',
  success: '#4ADE80',
  white: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.28)',
} as const;

export const themes = {
  light: {
    mode: 'light',
    colors: lightColors,
    spacing,
    radii,
    typography,
  },
  dark: {
    mode: 'dark',
    colors: darkColors,
    spacing,
    radii,
    typography,
  },
} as const;

export type AppTheme = (typeof themes)[keyof typeof themes];
export type ThemeMode = keyof typeof themes;

export function getAppTheme(mode: ThemeMode): AppTheme {
  return themes[mode];
}

export function getNavigationTheme(mode: ThemeMode): NavigationTheme {
  const appTheme = getAppTheme(mode);
  const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: appTheme.colors.primary,
      background: appTheme.colors.background,
      card: appTheme.colors.surface,
      text: appTheme.colors.text,
      border: appTheme.colors.border,
      notification: appTheme.colors.primary,
    },
  };
}
