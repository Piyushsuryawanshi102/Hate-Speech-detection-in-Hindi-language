import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useColors } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/GlassCard';
import { getStats, getHistory } from '@/services/api';

export default function StatsScreen() {
  const { width } = useWindowDimensions();
  const C = useColors();
  const [stats, setStats] = useState(getStats());
  const [history, setHistory] = useState(getHistory());
  const cardWidth = Math.min(width - Spacing.lg * 2, 500);
  const statCardW = (cardWidth - Spacing.sm) / 2;

  useFocusEffect(useCallback(() => { setStats(getStats()); setHistory(getHistory()); }, []));

  const statCards = [
    { icon: 'scan-outline', label: 'Total Scans', value: stats.totalScans.toString(), gradient: C.gradientAccent },
    { icon: 'shield-checkmark-outline', label: 'Safe Rate', value: `${stats.safePercentage}%`, gradient: C.gradientSafe },
    { icon: 'speedometer-outline', label: 'Avg Score', value: `${Math.round(stats.averageScore * 100)}%`, gradient: C.gradientPrimary },
    { icon: 'trending-up-outline', label: 'Top Category', value: stats.highestCategory, gradient: C.gradientDanger, small: true },
  ];

  const dist = { safe: 0, lowRisk: 0, moderate: 0, high: 0, severe: 0, critical: 0 };
  history.forEach((h) => {
    const map: Record<string, keyof typeof dist> = { 'Safe': 'safe', 'Low Risk': 'lowRisk', 'Moderate': 'moderate', 'High': 'high', 'Severe': 'severe', 'Critical': 'critical' };
    const k = map[h.result.label]; if (k) dist[k]++;
  });
  const total = history.length || 1;
  const bars = [
    { label: 'Safe', count: dist.safe, color: C.safe }, { label: 'Low Risk', count: dist.lowRisk, color: C.lowRisk },
    { label: 'Moderate', count: dist.moderate, color: C.moderate }, { label: 'High', count: dist.high, color: C.high },
    { label: 'Severe', count: dist.severe, color: C.severe }, { label: 'Critical', count: dist.critical, color: C.critical },
  ];

  const catAvg: Record<string, number> = { toxicity: 0, severeToxicity: 0, identityAttack: 0, insult: 0, profanity: 0, threat: 0 };
  if (history.length > 0) {
    history.forEach((h) => { Object.keys(catAvg).forEach((k) => { catAvg[k] += h.result.categories[k as keyof typeof h.result.categories]; }); });
    Object.keys(catAvg).forEach((k) => { catAvg[k] /= history.length; });
  }
  const catItems = [
    { key: 'toxicity', label: 'Toxicity', icon: 'warning' }, { key: 'severeToxicity', label: 'Severe Toxicity', icon: 'alert-circle' },
    { key: 'identityAttack', label: 'Identity Attack', icon: 'people' }, { key: 'insult', label: 'Insult', icon: 'chatbox-ellipses' },
    { key: 'profanity', label: 'Profanity', icon: 'volume-mute' }, { key: 'threat', label: 'Threat', icon: 'skull' },
  ];
  const catW = (cardWidth - 32 - Spacing.md * 2) / 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { width: cardWidth }]}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Insights</Text>
          <Text style={[styles.subtitle, { color: C.textMuted }]}>Analytics from your scans</Text>
        </View>

        <View style={[styles.grid, { width: cardWidth }]}>
          {statCards.map((s, i) => (
            <View key={i} style={{ width: statCardW }}>
              <GlassCard style={styles.statCard} variant="elevated">
                <LinearGradient colors={s.gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statIcon}>
                  <Ionicons name={s.icon as any} size={18} color="#fff" />
                </LinearGradient>
                <Text style={[styles.statVal, s.small && { fontSize: FontSizes.md }, { color: C.textPrimary }]} numberOfLines={1}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: C.textMuted }]}>{s.label}</Text>
              </GlassCard>
            </View>
          ))}
        </View>

        {stats.totalScans >= 10 && (
          <GlassCard style={[styles.trendCard, { width: cardWidth }]} variant="elevated">
            <View style={styles.trendRow}>
              <Ionicons name={stats.recentTrend === 'up' ? 'trending-up' : stats.recentTrend === 'down' ? 'trending-down' : 'remove'} size={22}
                color={stats.recentTrend === 'up' ? C.danger : stats.recentTrend === 'down' ? C.safe : C.textSecondary} />
              <View>
                <Text style={[styles.trendTitle, { color: C.textPrimary }]}>Recent Trend</Text>
                <Text style={[styles.trendSub, { color: C.textSecondary }]}>
                  {stats.recentTrend === 'up' ? 'Toxicity is increasing' : stats.recentTrend === 'down' ? 'Toxicity is decreasing — great!' : 'Toxicity levels are stable'}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        <GlassCard style={[styles.distCard, { width: cardWidth }]} variant="elevated">
          <View style={styles.secHdr}><Ionicons name="pie-chart" size={16} color={C.accent} /><Text style={[styles.secTitle, { color: C.textPrimary }]}>Severity Distribution</Text></View>
          {history.length === 0 ? <Text style={[styles.noData, { color: C.textMuted }]}>No data yet. Start scanning to see distribution.</Text> : (
            <View style={{ gap: Spacing.md }}>
              {bars.map((b) => (
                <View key={b.label} style={styles.distRow}>
                  <View style={styles.distLabel}><View style={[styles.distDot, { backgroundColor: b.color }]} /><Text style={[styles.distText, { color: C.textSecondary }]}>{b.label}</Text></View>
                  <View style={[styles.distTrack, { backgroundColor: C.border }]}><View style={[styles.distFill, { width: `${Math.max((b.count / total) * 100, 2)}%`, backgroundColor: b.color }]} /></View>
                  <Text style={[styles.distCount, { color: b.color }]}>{b.count}</Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        <GlassCard style={[styles.catCard, { width: cardWidth }]} variant="elevated">
          <View style={styles.secHdr}><Ionicons name="grid" size={16} color={C.primary} /><Text style={[styles.secTitle, { color: C.textPrimary }]}>Average by Category</Text></View>
          {history.length === 0 ? <Text style={[styles.noData, { color: C.textMuted }]}>No data yet.</Text> : (
            <View style={styles.catGrid}>
              {catItems.map((cat) => {
                const avg = catAvg[cat.key]; const pct = Math.round(avg * 100);
                const color = avg > 0.5 ? C.danger : avg > 0.3 ? C.warning : C.safe;
                return (
                  <View key={cat.key} style={[styles.catItem, { width: catW }]}>
                    <View style={[styles.catIconBg, { backgroundColor: color + '12' }]}><Ionicons name={cat.icon as any} size={16} color={color} /></View>
                    <Text style={[styles.catVal, { color }]}>{pct}%</Text>
                    <Text style={[styles.catLabel, { color: C.textMuted }]} numberOfLines={1}>{cat.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </GlassCard>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxxl },
  header: { paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold },
  statLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium },
  trendCard: { marginBottom: Spacing.lg },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trendTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  trendSub: { fontSize: FontSizes.sm, marginTop: 2 },
  distCard: { marginBottom: Spacing.lg },
  secHdr: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  secTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  noData: { fontSize: FontSizes.sm, textAlign: 'center', paddingVertical: Spacing.xxl },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  distLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, width: 80 },
  distDot: { width: 7, height: 7, borderRadius: 4 },
  distText: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium },
  distTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 3 },
  distCount: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, width: 28, textAlign: 'right' },
  catCard: { marginBottom: Spacing.lg },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  catItem: { alignItems: 'center', gap: Spacing.xs },
  catIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catVal: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  catLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, textAlign: 'center' },
});
