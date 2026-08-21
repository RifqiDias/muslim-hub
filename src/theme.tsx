import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Context,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TextStyle, useColorScheme } from 'react-native';

export interface ThemeColors {
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  gold: string;
  goldSoft: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  danger: string;
  white: string;
  black: string;
}

export interface ThemeGradients {
  emerald: readonly [string, string];
  teal: readonly [string, string];
  gold: readonly [string, string];
  night: readonly [string, string];
  plum: readonly [string, string];
  primary: readonly [string, string];
  bg: readonly [string, string, string];
  card: readonly [string, string];
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeScheme = 'light' | 'dark';

export interface ThemeTypography {
  title: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  arabic: TextStyle;
  arabicLg: TextStyle;
}

export interface AppTheme {
  scheme: ThemeScheme;
  preference: ThemePreference;
  colors: ThemeColors;
  gradients: ThemeGradients;
  typography: ThemeTypography;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

const THEME_KEY = 'muslimhub.theme';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  arabic: 'Amiri_400Regular',
  arabicBold: 'Amiri_700Bold',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

const darkColors: ThemeColors = {
  bg: '#0A1512',
  bgDeep: '#061009',
  surface: '#12211B',
  surfaceAlt: '#1A2E25',
  surfaceHover: '#213A2F',
  primary: '#34D399',
  primaryDeep: '#059669',
  primarySoft: 'rgba(52, 211, 153, 0.14)',
  gold: '#E8B44F',
  goldSoft: 'rgba(232, 180, 79, 0.16)',
  text: '#E8F5F0',
  textMuted: '#8FA8A0',
  textFaint: '#5C736B',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  danger: '#F87171',
  white: '#FFFFFF',
  black: '#0A1512',
};

const lightColors: ThemeColors = {
  bg: '#F7F5EE',
  bgDeep: '#EFECE1',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE2',
  surfaceHover: '#E8E3D5',
  primary: '#0E7A5F',
  primaryDeep: '#0A5C48',
  primarySoft: 'rgba(14, 122, 95, 0.12)',
  gold: '#A8761B',
  goldSoft: 'rgba(168, 118, 27, 0.14)',
  text: '#182720',
  textMuted: '#5B6B63',
  textFaint: '#8B988F',
  border: 'rgba(23, 39, 32, 0.10)',
  borderStrong: 'rgba(23, 39, 32, 0.18)',
  danger: '#C64545',
  white: '#FFFFFF',
  black: '#182720',
};

const darkGradients: ThemeGradients = {
  emerald: ['#0B3B2A', '#0F5A3C'],
  teal: ['#0E3A3A', '#116B5E'],
  gold: ['#3E2E14', '#8A6A2F'],
  night: ['#171E3B', '#2B3566'],
  plum: ['#331A33', '#5A2A55'],
  primary: ['#059669', '#34D399'],
  bg: ['#0C1A14', '#0A1512', '#07100C'],
  card: ['#132A20', '#0F211A'],
};

const lightGradients: ThemeGradients = {
  emerald: ['#DFF1E6', '#BFE3D0'],
  teal: ['#DCEFEF', '#B9E0DD'],
  gold: ['#F6E9CC', '#EBD5A8'],
  night: ['#E2E7F6', '#C9D1EC'],
  plum: ['#F1E1EE', '#DEC6DB'],
  primary: ['#119972', '#0C7A59'],
  bg: ['#FAF8F1', '#F5F2E9', '#EFECE0'],
  card: ['#FFFFFF', '#FBF9F2'],
};

function buildTypography(c: ThemeColors): ThemeTypography {
  return {
    title: { fontFamily: font.extrabold, fontSize: 28, lineHeight: 34, color: c.text },
    h1: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: c.text },
    h2: { fontFamily: font.bold, fontSize: 18, lineHeight: 24, color: c.text },
    h3: { fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: c.text },
    body: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: c.text },
    caption: { fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: c.textMuted },
    arabic: {
      fontFamily: font.arabic,
      fontSize: 26,
      lineHeight: 46,
      color: c.text,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    arabicLg: {
      fontFamily: font.arabic,
      fontSize: 32,
      lineHeight: 58,
      color: c.text,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
  };
}

function buildTheme(
  scheme: ThemeScheme,
  preference: ThemePreference,
  setPreference: (p: ThemePreference) => void,
): AppTheme {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return {
    scheme,
    preference,
    colors,
    gradients: scheme === 'dark' ? darkGradients : lightGradients,
    typography: buildTypography(colors),
    setPreference,
    toggle: () => setPreference(scheme === 'dark' ? 'light' : 'dark'),
  };
}

const ThemeContext = createContext<AppTheme | null>(null);

function readStoredPreference(): Promise<ThemePreference> {
  return AsyncStorage.getItem(THEME_KEY)
    .then((value) => (value === 'light' || value === 'dark' ? value : 'system'))
    .catch(() => 'system' as ThemePreference);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('light');

  useEffect(() => {
    let active = true;
    readStoredPreference().then((value) => {
      if (active && (value === 'light' || value === 'dark')) setPreferenceState(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => undefined);
  };

  const scheme: ThemeScheme =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  const value = useMemo(
    () => buildTheme(scheme, preference, setPreference),
    [scheme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const theme = useContext(ThemeContext as Context<AppTheme | null>);
  return theme ?? buildTheme('light', 'light', () => undefined);
}
