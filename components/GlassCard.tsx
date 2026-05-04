import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius } from '@/constants/theme';
import { useColors } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
  const C = useColors();
  const v: Record<string, ViewStyle> = {
    default: { backgroundColor: C.glassBackground, borderWidth: 1, borderColor: C.glassBorder },
    elevated: {
      backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.glassBorder,
      shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
    },
    outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.borderLight },
  };

  return (
    <View style={[styles.card, v[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: BorderRadius.lg, padding: 16, overflow: 'hidden' },
});
