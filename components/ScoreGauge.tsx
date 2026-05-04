import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights } from '@/constants/theme';
import { useColors } from '@/contexts/ThemeContext';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showPercentage?: boolean;
}

export function ScoreGauge({ score, size = 140, label, showPercentage = true }: ScoreGaugeProps) {
  const C = useColors();
  const percentage = Math.round(score * 100);
  const color = getScoreColor(score);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <View style={[styles.bgCircle, { width: size - 8, height: size - 8, borderRadius: (size - 8) / 2, borderColor: C.border }]} />
        <View style={[styles.progressCircle, {
          width: size - 8, height: size - 8, borderRadius: (size - 8) / 2,
          borderColor: color, borderTopColor: color,
          borderRightColor: score > 0.25 ? color : 'transparent',
          borderBottomColor: score > 0.5 ? color : 'transparent',
          borderLeftColor: score > 0.75 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }]} />
        <View style={[styles.inner, { width: size - 28, height: size - 28, borderRadius: (size - 28) / 2 }]}>
          {showPercentage && <Text style={[styles.pct, { color, fontSize: size > 100 ? FontSizes.xxl : FontSizes.lg }]}>{percentage}%</Text>}
          {label && <Text style={[styles.label, { color: C.textTertiary }]} numberOfLines={1}>{label}</Text>}
        </View>
      </View>
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score < 0.15) return Colors.safe;
  if (score < 0.30) return Colors.lowRisk;
  if (score < 0.50) return Colors.moderate;
  if (score < 0.70) return Colors.high;
  if (score < 0.85) return Colors.severe;
  return Colors.critical;
}

export function getScoreLabelColor(label: string): string {
  switch (label) {
    case 'Safe': return Colors.safe;
    case 'Low Risk': return Colors.lowRisk;
    case 'Moderate': return Colors.moderate;
    case 'High': return Colors.high;
    case 'Severe': return Colors.severe;
    case 'Critical': return Colors.critical;
    default: return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  circleContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bgCircle: { position: 'absolute', borderWidth: 3 },
  progressCircle: { position: 'absolute', borderWidth: 3 },
  inner: { backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  pct: { fontWeight: FontWeights.bold, letterSpacing: -0.5 },
  label: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, marginTop: 2 },
});
