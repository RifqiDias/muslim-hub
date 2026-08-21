import { TextStyle } from 'react-native';

export const colors = {
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
} as const;

export const gradients = {
  emerald: ['#0B3B2A', '#0F5A3C'] as const,
  teal: ['#0E3A3A', '#116B5E'] as const,
  gold: ['#3E2E14', '#8A6A2F'] as const,
  night: ['#171E3B', '#2B3566'] as const,
  plum: ['#331A33', '#5A2A55'] as const,
  primary: ['#059669', '#34D399'] as const,
  bg: ['#0C1A14', '#0A1512', '#07100C'] as const,
  card: ['#132A20', '#0F211A'] as const,
} as const;

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

export const typography = {
  title: {
    fontFamily: font.extrabold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
  } as TextStyle,
  h1: {
    fontFamily: font.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  } as TextStyle,
  h2: {
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  } as TextStyle,
  h3: {
    fontFamily: font.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  body: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  caption: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  } as TextStyle,
  arabic: {
    fontFamily: font.arabic,
    fontSize: 26,
    lineHeight: 46,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  } as TextStyle,
  arabicLg: {
    fontFamily: font.arabic,
    fontSize: 32,
    lineHeight: 58,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  } as TextStyle,
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
