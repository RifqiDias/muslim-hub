import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { font, useTheme } from '@/theme';

interface ArabicTextProps extends TextProps {
  size?: number;
  bold?: boolean;
  center?: boolean;
  color?: string;
}

export function ArabicText({ children, size = 26, bold = false, center = false, color, style, ...rest }: PropsWithChildren<ArabicTextProps>) {
  const { colors } = useTheme();
  const composed = useMemo(
    () => [
      styles.base,
      {
        fontSize: size,
        lineHeight: Math.round(size * 1.75),
        fontFamily: bold ? font.arabicBold : font.arabic,
        color: color ?? colors.text,
      },
      center && styles.center,
      style,
    ],
    [size, bold, center, color, colors.text, style],
  );

  return (
    <RNText style={composed} {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  center: {
    textAlign: 'center',
  },
});
