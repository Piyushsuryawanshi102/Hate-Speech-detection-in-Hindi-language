import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Animated, KeyboardAvoidingView, Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme, useColors } from '@/contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { GlassCard } from '@/components/GlassCard';
import { ScoreGauge, getScoreLabelColor } from '@/components/ScoreGauge';
import { CategoryBar } from '@/components/CategoryBar';
import { analyzeText, addToHistory, checkBackendHealth, AnalysisResult } from '@/services/api';



export default function DetectScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const C = useColors();

  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const cardWidth = Math.min(width - Spacing.lg * 2, 500);
  const miniCardWidth = (cardWidth - Spacing.sm * 2 - 32) / 3;

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
  }, []);

  const animateResult = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    try {
      const analysisResult = await analyzeText(text.trim());
      setResult(analysisResult);
      addToHistory(analysisResult);
      animateResult();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => { setText(''); setResult(null); setError(null); };

  const categoryLabels = [
    { key: 'toxicity' as const, label: 'Toxicity', icon: 'warning' },
    { key: 'severeToxicity' as const, label: 'Severe Toxicity', icon: 'alert-circle' },
    { key: 'identityAttack' as const, label: 'Identity Attack', icon: 'people' },
    { key: 'insult' as const, label: 'Insult', icon: 'chatbox-ellipses' },
    { key: 'profanity' as const, label: 'Profanity', icon: 'volume-mute' },
    { key: 'threat' as const, label: 'Threat', icon: 'skull' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { width: cardWidth }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerSub, { color: C.textMuted }]}>HINDI TEXT ANALYSIS</Text>
              <Text style={[styles.titleWhite, { color: C.textPrimary }]}>Hate Speech</Text>
              <Text style={[styles.titlePurple, { color: C.primary }]}>Detector</Text>
              <View style={[styles.accentLine, { backgroundColor: C.primary }]} />
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.iconBtn, { backgroundColor: C.surfaceElevated }]}
              >
                <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={C.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                style={[styles.iconBtn, { backgroundColor: C.surfaceElevated }]}
              >
                <Ionicons name="settings-outline" size={18} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Backend Status Badge */}
          <View style={[styles.statusRow, { width: cardWidth }]}>
            <View style={[styles.statusBadge, {
              backgroundColor: backendOnline === null ? C.warningBg : backendOnline ? C.successBg : C.dangerBg,
              borderColor: backendOnline === null ? C.warning + '30' : backendOnline ? C.success + '30' : C.danger + '30',
            }]}>
              <View style={[styles.statusDot, {
                backgroundColor: backendOnline === null ? C.warning : backendOnline ? C.success : C.danger,
              }]} />
              <Text style={[styles.statusText, {
                color: backendOnline === null ? C.warning : backendOnline ? C.success : C.danger,
              }]}>
                {backendOnline === null ? 'Checking...' : backendOnline ? 'ML Model Online' : 'ML Model Offline'}
              </Text>
            </View>
            {!backendOnline && backendOnline !== null && (
              <Text style={[styles.statusHint, { color: C.textMuted }]}>
                Using Perspective API fallback
              </Text>
            )}
          </View>

          {/* Input Card */}
          <View style={[styles.inputCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
            {/* Language badge */}
            <View style={styles.langRow}>
              <View style={[styles.langBadge, { backgroundColor: C.backgroundTertiary }]}>
                <Text style={[styles.langIcon, { color: C.textPrimary }]}>हि</Text>
                <Text style={[styles.langText, { color: C.textSecondary }]}>Hindi / English</Text>
              </View>
              {text.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearIcon}>
                  <Ionicons name="close-circle" size={20} color={C.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Text Input */}
            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? C.backgroundTertiary : '#F0F2F8', color: C.textPrimary, borderColor: C.border }]}
              placeholder="Type or paste Hindi/English text here..."
              placeholderTextColor={C.textMuted}
              multiline
              numberOfLines={5}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              maxLength={1000}
            />

            {/* Char count */}
            <Text style={[styles.charCount, { color: C.textMuted }]}>
              {text.length}/1000
            </Text>
          </View>



          {/* Analyze Button */}
          <Animated.View style={[{ width: cardWidth, transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={text.trim() ? C.gradientPrimary : [C.textMuted, C.textMuted]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.analyzeBtn, !text.trim() && { opacity: 0.5 }]}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="scan" size={20} color="#fff" />
                )}
                <Text style={styles.analyzeBtnText}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Error */}
          {error && (
            <View style={[styles.errorCard, { width: cardWidth, backgroundColor: C.dangerBg, borderColor: C.danger + '25' }]}>
              <Ionicons name="alert-circle" size={20} color={C.danger} />
              <Text style={[styles.errorText, { color: C.dangerLight }]}>{error}</Text>
            </View>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <View style={[styles.loadingCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
              <ActivityIndicator color={C.primary} size="large" />
              <Text style={[styles.loadingText, { color: C.textPrimary }]}>Analyzing content...</Text>
              <Text style={[styles.loadingSub, { color: C.textMuted }]}>
                {backendOnline ? 'Using local ML model' : 'Checking across 6 categories'}
              </Text>
            </View>
          )}

          {/* Results */}
          {result && !isAnalyzing && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: cardWidth }}>

              {/* Model Source & Translation Info */}
              <View style={[styles.modelInfoCard, { backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
                {/* Source badge */}
                <View style={styles.modelInfoRow}>
                  <View style={[styles.sourceBadge, {
                    backgroundColor: result.source === 'local_model' ? C.accent + '15' : C.primary + '15',
                  }]}>
                    <Ionicons
                      name={result.source === 'local_model' ? 'hardware-chip' : 'cloud'}
                      size={14}
                      color={result.source === 'local_model' ? C.accent : C.primary}
                    />
                    <Text style={[styles.sourceText, {
                      color: result.source === 'local_model' ? C.accent : C.primary,
                    }]}>
                      {result.source === 'local_model' ? 'Local ML Model' : 'Perspective API'}
                    </Text>
                  </View>
                  {result.confidence !== undefined && (
                    <Text style={[styles.confidenceText, { color: C.textSecondary }]}>
                      {Math.round(result.confidence * 100)}% confident
                    </Text>
                  )}
                </View>

                {/* Hindi detection & translation */}
                {result.isHindi && (
                  <View style={styles.translationBox}>
                    <View style={[styles.hindiBadge, { backgroundColor: C.warning + '15' }]}>
                      <Text style={[styles.hindiIcon, { color: C.warning }]}>हि</Text>
                      <Text style={[styles.hindiBadgeText, { color: C.warning }]}>Hindi Detected</Text>
                    </View>
                    {result.translatedText && (
                      <View style={[styles.translatedWrap, { backgroundColor: isDark ? C.backgroundTertiary : '#F0F2F8', borderColor: C.border }]}>
                        <Text style={[styles.translatedLabel, { color: C.textMuted }]}>
                          Translated to English:
                        </Text>
                        <Text style={[styles.translatedText, { color: C.textSecondary }]}>
                          {result.translatedText}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Prediction label */}
                <View style={[styles.predictionRow, { borderTopColor: C.glassBorder }]}>
                  <Text style={[styles.predictionLabel, { color: C.textMuted }]}>Prediction:</Text>
                  <View style={[styles.predictionBadge, {
                    backgroundColor: result.prediction === 1 ? C.dangerBg : C.successBg,
                  }]}>
                    <Ionicons
                      name={result.prediction === 1 ? 'close-circle' : 'checkmark-circle'}
                      size={16}
                      color={result.prediction === 1 ? C.danger : C.success}
                    />
                    <Text style={[styles.predictionText, {
                      color: result.prediction === 1 ? C.danger : C.success,
                    }]}>
                      {result.prediction === 1 ? 'Hate Speech Detected' : 'Not Hate Speech'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Score Card */}
              <View style={[styles.resultCard, { backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: C.textPrimary }]}>Analysis Result</Text>
                  <View style={[styles.labelBadge, { backgroundColor: getScoreLabelColor(result.label) + '20' }]}>
                    <View style={[styles.dot, { backgroundColor: getScoreLabelColor(result.label) }]} />
                    <Text style={[styles.labelText, { color: getScoreLabelColor(result.label) }]}>{result.label}</Text>
                  </View>
                </View>
                <View style={styles.gaugeWrap}>
                  <ScoreGauge score={result.overallScore} size={150} label="Overall" />
                </View>
                <View style={[styles.recBox, { backgroundColor: getScoreLabelColor(result.label) + '10', borderColor: getScoreLabelColor(result.label) + '25' }]}>
                  <Ionicons name={getRecIcon(result.label)} size={18} color={getScoreLabelColor(result.label)} />
                  <Text style={[styles.recText, { color: getScoreLabelColor(result.label) }]}>{getRec(result.label)}</Text>
                </View>
              </View>

              {/* Breakdown */}
              <View style={[styles.resultCard, { backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
                <View style={styles.breakdownHdr}>
                  <Ionicons name="bar-chart" size={16} color={C.accent} />
                  <Text style={[styles.breakdownTitle, { color: C.textPrimary }]}>Category Breakdown</Text>
                </View>
                {categoryLabels.map((cat) => (
                  <CategoryBar key={cat.key} label={cat.label} score={result.categories[cat.key]} />
                ))}
              </View>

              {/* Mini scores */}
              <View style={styles.miniGrid}>
                {categoryLabels.map((cat) => (
                  <View key={cat.key} style={[styles.miniCard, { width: miniCardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
                    <Ionicons
                      name={cat.icon as any}
                      size={18}
                      color={result.categories[cat.key] > 0.5 ? C.danger : result.categories[cat.key] > 0.3 ? C.warning : C.safe}
                    />
                    <Text style={[styles.miniVal, { color: C.textPrimary }]}>{Math.round(result.categories[cat.key] * 100)}%</Text>
                    <Text style={[styles.miniLabel, { color: C.textMuted }]} numberOfLines={1}>{cat.label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getRec(label: string): string {
  const map: Record<string, string> = {
    'Safe': 'This content appears to be safe and respectful.',
    'Low Risk': 'Minor concerns detected. Content is mostly acceptable.',
    'Moderate': 'Some problematic content detected. Consider revising.',
    'High': 'Significant harmful content detected. Revision recommended.',
    'Severe': 'Highly toxic content. This should not be published.',
    'Critical': 'Extremely harmful content detected. Immediate action required.',
  };
  return map[label] || '';
}

function getRecIcon(label: string): any {
  const map: Record<string, string> = {
    'Safe': 'checkmark-circle', 'Low Risk': 'information-circle',
    'Moderate': 'warning', 'High': 'alert-circle',
    'Severe': 'close-circle', 'Critical': 'skull',
  };
  return map[label] || 'help-circle';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxxl },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  headerLeft: { flex: 1 },
  headerSub: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.xs },
  titleWhite: { fontSize: 30, fontWeight: FontWeights.extrabold, lineHeight: 36 },
  titlePurple: { fontSize: 30, fontWeight: FontWeights.extrabold, lineHeight: 36 },
  accentLine: { width: 50, height: 3, borderRadius: 2, marginTop: Spacing.sm },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.xs },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Backend status
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  statusHint: { fontSize: FontSizes.xs },

  // Input card
  inputCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, marginBottom: Spacing.md },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  langBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md },
  langIcon: { fontSize: 16, fontWeight: FontWeights.bold },
  langText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  clearIcon: { padding: Spacing.xs },
  textInput: { borderRadius: BorderRadius.md, padding: Spacing.lg, fontSize: FontSizes.md, minHeight: 120, maxHeight: 200, borderWidth: 1, lineHeight: 22 },
  charCount: { fontSize: FontSizes.xs, textAlign: 'right', marginTop: Spacing.sm, fontWeight: FontWeights.medium },



  // Analyze button
  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.lg, borderRadius: BorderRadius.xl, gap: Spacing.sm,
    ...Shadows.md,
  },
  analyzeBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: FontWeights.bold },

  // Error
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: Spacing.lg },
  errorText: { fontSize: FontSizes.sm, flex: 1, lineHeight: 20 },

  // Loading
  loadingCard: { alignItems: 'center', padding: Spacing.xxxl, borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: Spacing.lg, gap: Spacing.md },
  loadingText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, marginTop: Spacing.sm },
  loadingSub: { fontSize: FontSizes.sm },

  // Model info card (new)
  modelInfoCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, marginTop: Spacing.lg },
  modelInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  sourceText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  confidenceText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  translationBox: { marginTop: Spacing.md },
  hindiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginBottom: Spacing.sm },
  hindiIcon: { fontSize: 13, fontWeight: FontWeights.bold },
  hindiBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  translatedWrap: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  translatedLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, marginBottom: 4 },
  translatedText: { fontSize: FontSizes.sm, lineHeight: 20 },
  predictionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
  predictionLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  predictionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  predictionText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },

  // Results
  resultCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, marginTop: Spacing.lg },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  resultTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  labelBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, gap: Spacing.sm },
  dot: { width: 7, height: 7, borderRadius: 4 },
  labelText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  gaugeWrap: { alignItems: 'center', paddingVertical: Spacing.lg },
  recBox: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.md, borderWidth: 1 },
  recText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, flex: 1, lineHeight: 20 },
  breakdownHdr: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  breakdownTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  miniCard: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.xs, borderRadius: BorderRadius.lg, borderWidth: 1 },
  miniVal: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  miniLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, textAlign: 'center' },
});
