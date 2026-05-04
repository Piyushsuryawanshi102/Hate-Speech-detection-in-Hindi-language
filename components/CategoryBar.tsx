import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';
import { useColors } from '@/contexts/ThemeContext';

interface CategoryBarProps {
  label: string;
  score: number;
  color?: string;
}

export function CategoryBar({ label, score, color }: CategoryBarProps) {
  const C = useColors();
  const percentage = Math.round(score * 100);
  const barColor = color || getBarColor(score, C);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: barColor }]}>{percentage}%</Text>
      </View>
      <View style={styles.trackContainer}>
        <View style={[styles.track, { backgroundColor: C.border }]}>
          <View
            style={[
              styles.fill,
              { width: `${Math.max(percentage, 2)}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function getBarColor(score: number, C: any): string {
  if (score < 0.15) return C.safe;
  if (score < 0.30) return C.lowRisk;
  if (score < 0.50) return C.moderate;
  if (score < 0.70) return C.high;
  if (score < 0.85) return C.severe;
  return C.critical;
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.xs + 2,
  },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  value: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  trackContainer: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  track: { height: 5, borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: BorderRadius.full },
});
