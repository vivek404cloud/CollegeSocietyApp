import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { AppTheme, getAppTheme, getNavigationTheme, ThemeMode } from '@/theme/theme';

export function useTheme(): AppTheme {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return useMemo(() => getAppTheme(mode), [mode]);
}

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return useMemo(() => getNavigationTheme(mode), [mode]);
}
