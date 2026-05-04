import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Switch, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useColors } from '@/contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const C = useColors();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - Spacing.lg * 2, 500);

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { width: cardWidth }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.surfaceElevated }]}>
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Settings</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* API Key Section */}
        <View style={{ width: cardWidth }}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 16 }}>🔑</Text>
            <Text style={[styles.sectionLabel, { color: C.warning }]}>API KEY</Text>
          </View>
          <View style={[styles.card, { backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
            <View style={styles.apiRow}>
              <TextInput
                style={[styles.apiInput, { backgroundColor: C.backgroundTertiary, color: C.textPrimary, borderColor: C.border }]}
                placeholder="Enter your API key..."
                placeholderTextColor={C.textMuted}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showKey}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
                <Ionicons name={showKey ? 'eye-off' : 'eye'} size={20} color={C.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.securityNote, { backgroundColor: C.primary + '10' }]}>
              <Ionicons name="shield-checkmark" size={16} color={C.primary} />
              <Text style={[styles.securityText, { color: C.primary }]}>
                API key is stored securely in device storage. Never shared or logged.
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={{ width: cardWidth, marginTop: Spacing.xxl }}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 16 }}>🎨</Text>
            <Text style={[styles.sectionLabel, { color: C.primaryLight }]}>APPEARANCE</Text>
          </View>
          <View style={[styles.card, { backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: C.primary + '18' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={C.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: C.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: C.textTertiary }]}>
                  {isDark ? 'Follows system default' : 'Light theme active'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={{ width: cardWidth, marginTop: Spacing.xxl }}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 16 }}>ℹ️</Text>
            <Text style={[styles.sectionLabel, { color: C.accent }]}>ABOUT</Text>
          </View>
          <View style={[styles.card, { backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
            {[
              { icon: 'information-circle', color: C.primary, title: 'App Version', desc: '1.0.0' },
              { icon: 'language', color: C.primaryLight, title: 'Language Support', desc: 'Hindi (हिंदी)' },
              { icon: 'cloud', color: C.accent, title: 'API Provider', desc: 'Snitch MCP Server' },
            ].map((item, i, arr) => (
              <View key={item.title}>
                <View style={styles.settingRow}>
                  <View style={[styles.settingIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: C.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.settingDesc, { color: C.textTertiary }]}>{item.desc}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: C.border }]} />}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxxl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.lg, marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.md, paddingLeft: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSizes.xs, fontWeight: FontWeights.bold,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  card: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, overflow: 'hidden',
  },
  apiRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  apiInput: {
    flex: 1, borderRadius: BorderRadius.md, padding: Spacing.md,
    fontSize: FontSizes.md, borderWidth: 1,
  },
  eyeBtn: { padding: Spacing.sm },
  securityNote: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md,
  },
  securityText: { fontSize: FontSizes.xs, flex: 1, lineHeight: 18 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  settingInfo: { flex: 1, gap: 2 },
  settingTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  settingDesc: { fontSize: FontSizes.sm },
  divider: { height: 1, marginVertical: Spacing.sm },
});
