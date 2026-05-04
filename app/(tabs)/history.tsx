import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { useColors } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/GlassCard';
import { getScoreLabelColor } from '@/components/ScoreGauge';
import { getHistory, clearHistory, AnalysisHistory } from '@/services/api';

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const C = useColors();
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const cardWidth = Math.min(width - Spacing.lg * 2, 500);

  const loadHistory = useCallback(() => { setHistory(getHistory()); }, []);
  useFocusEffect(useCallback(() => { loadHistory(); }, [loadHistory]));

  const onRefresh = () => { setRefreshing(true); loadHistory(); setTimeout(() => setRefreshing(false), 500); };
  const handleClear = () => { clearHistory(); setHistory([]); };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item, index }: { item: AnalysisHistory; index: number }) => {
    const { result } = item;
    const lc = getScoreLabelColor(result.label);
    const pct = Math.round(result.overallScore * 100);
    return (
      <View style={{ alignItems: 'center' }}>
        <GlassCard style={[styles.historyItem, { width: cardWidth }]} variant="elevated">
          <View style={styles.itemHeader}>
            <View style={styles.itemLeft}>
              <View style={[styles.scoreCircle, { borderColor: lc, backgroundColor: C.background }]}>
                <Text style={[styles.scoreText, { color: lc }]}>{pct}</Text>
              </View>
              <View style={styles.itemInfo}>
                <View style={[styles.labelBadge, { backgroundColor: lc + '18' }]}>
                  <View style={[styles.dot, { backgroundColor: lc }]} />
                  <Text style={[styles.labelText, { color: lc }]}>{result.label}</Text>
                </View>
                <Text style={[styles.timeText, { color: C.textMuted }]}>{formatTime(result.timestamp)}</Text>
              </View>
            </View>
            <Text style={[styles.itemNum, { color: C.textMuted }]}>#{history.length - index}</Text>
          </View>
          <Text style={[styles.preview, { color: C.textSecondary }]} numberOfLines={2}>{result.text}</Text>
          <View style={styles.miniCats}>
            {[{ key: 'toxicity', label: 'TOX' }, { key: 'insult', label: 'INS' }, { key: 'threat', label: 'THR' }, { key: 'profanity', label: 'PRO' }].map((cat) => {
              const val = result.categories[cat.key as keyof typeof result.categories];
              return (
                <View key={cat.key} style={styles.miniCatItem}>
                  <View style={[styles.miniBar, { backgroundColor: C.border }]}>
                    <View style={[styles.miniFill, { width: `${Math.max(val * 100, 3)}%`, backgroundColor: val > 0.5 ? C.danger : val > 0.3 ? C.warning : C.safe }]} />
                  </View>
                  <Text style={[styles.miniLabel, { color: C.textMuted }]}>{cat.label}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <View style={[styles.header, { maxWidth: cardWidth + Spacing.lg * 2, alignSelf: 'center', width: '100%' }]}>
        <View>
          <Text style={[styles.title, { color: C.textPrimary }]}>History</Text>
          <Text style={[styles.subtitle, { color: C.textMuted }]}>{history.length} {history.length === 1 ? 'scan' : 'scans'} recorded</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity style={[styles.clearBtn, { backgroundColor: C.dangerBg, borderColor: C.danger + '20' }]} onPress={handleClear} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={C.danger} />
            <Text style={[styles.clearText, { color: C.danger }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {history.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: C.surface }]}>
            <Ionicons name="time-outline" size={56} color={C.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: C.textPrimary }]}>No scans yet</Text>
          <Text style={[styles.emptySub, { color: C.textMuted }]}>Your analysis history will appear here after you scan some text</Text>
        </View>
      ) : (
        <FlatList data={history} renderItem={renderItem} keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  clearText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxxl },
  historyItem: { gap: Spacing.md },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  scoreCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  itemInfo: { gap: Spacing.xs },
  labelBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.full, gap: Spacing.xs, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  labelText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  timeText: { fontSize: FontSizes.xs },
  itemNum: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium },
  preview: { fontSize: FontSizes.sm, lineHeight: 20 },
  miniCats: { flexDirection: 'row', gap: Spacing.sm },
  miniCatItem: { flex: 1, gap: 4 },
  miniBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },
  miniLabel: { fontSize: 9, fontWeight: FontWeights.medium, letterSpacing: 0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxxxl },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xxl },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.semibold, marginBottom: Spacing.sm },
  emptySub: { fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22 },
});
