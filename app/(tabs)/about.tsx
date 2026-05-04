import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useColors } from '@/contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const C = useColors();
  const cardWidth = Math.min(width - Spacing.lg * 2, 500);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>

        {/* Top Bar */}
        <View style={[styles.topBar, { width: cardWidth }]}>
          <View style={styles.topLeft}>
            <Ionicons name="shield-checkmark" size={20} color={C.accent} />
            <Text style={[styles.appName, { color: C.accent }]}>SENTINEL</Text>
          </View>
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: C.surfaceElevated }]}>
            <Ionicons name="notifications-outline" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
          {/* Avatar */}
          <View style={[styles.avatarOuter, { borderColor: C.accent }]}>
            <View style={[styles.avatarInner, { backgroundColor: C.backgroundTertiary }]}>
              <Ionicons name="person" size={40} color={C.textSecondary} />
            </View>
            <View style={[styles.avatarBadge, { backgroundColor: C.accent }]}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
          </View>

          {/* Name & Role */}
          <Text style={[styles.userName, { color: C.textPrimary }]}>Aaryan Sharma</Text>
          <Text style={[styles.userRole, { color: C.primary }]}>PREMIUM GUARDIAN</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: C.backgroundTertiary }]}>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>ANALYSES</Text>
              <Text style={[styles.statValue, { color: C.textPrimary }]}>1,284</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: C.backgroundTertiary }]}>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>ACCURACY</Text>
              <Text style={[styles.statValue, { color: C.textPrimary }]}>99.2%</Text>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.settingCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: C.primary + '15' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={C.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: C.textPrimary }]}>Appearance</Text>
              <Text style={[styles.settingDesc, { color: C.textTertiary }]}>Switch between Dark and Light mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.settingCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: C.accent + '15' }]}>
              <Ionicons name="notifications-outline" size={20} color={C.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: C.textPrimary }]}>Notifications</Text>
              <Text style={[styles.settingDesc, { color: C.textTertiary }]}>Manage analysis alerts & reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Advanced Security */}
        <View style={[styles.securityCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
          <Text style={[styles.securityTitle, { color: C.textPrimary }]}>Advanced{'\n'}Security</Text>
          <View style={styles.securityBody}>
            <Text style={[styles.securityDesc, { color: C.textTertiary }]}>
              Multi-factor authentication and session monitoring are currently active for your account.
            </Text>
            <TouchableOpacity style={[styles.manageBtn, { backgroundColor: C.accent }]}>
              <Text style={styles.manageBtnText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support */}
        <View style={[styles.settingCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: C.warning + '15' }]}>
              <Ionicons name="help-buoy-outline" size={20} color={C.warning} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: C.textPrimary }]}>Help & Support</Text>
              <Text style={[styles.settingDesc, { color: C.textTertiary }]}>24/7 dedicated guardian support</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Content Language */}
        <View style={[styles.settingCard, { width: cardWidth, backgroundColor: C.surfaceElevated, borderColor: C.glassBorder }]}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: C.primaryLight + '15' }]}>
              <Ionicons name="language-outline" size={20} color={C.primaryLight} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: C.textPrimary }]}>Content Language</Text>
              <Text style={[styles.settingDesc, { color: C.textTertiary }]}>Detection focus: English & Hindi</Text>
            </View>
            <View style={[styles.langBadge, { backgroundColor: C.primary + '20' }]}>
              <Text style={[styles.langBadgeText, { color: C.primary }]}>EN / HI</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutCard, { width: cardWidth, backgroundColor: C.dangerBg, borderColor: C.danger + '20' }]} activeOpacity={0.7}>
          <View style={styles.logoutRow}>
            <Ionicons name="log-out-outline" size={20} color={C.danger} />
            <Text style={[styles.logoutText, { color: C.danger }]}>Logout</Text>
            <Text style={[styles.logoutSub, { color: C.danger }]}>END SESSION</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxxl },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.lg },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  appName: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, letterSpacing: 2 },
  bellBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Profile card
  profileCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xxl, alignItems: 'center',
    borderWidth: 1, marginBottom: Spacing.lg,
  },
  avatarOuter: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, position: 'relative' },
  avatarInner: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' },
  avatarBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1A1D23',
  },
  userName: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, marginBottom: Spacing.xs },
  userRole: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, letterSpacing: 2, marginBottom: Spacing.xl },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  statLabel: { fontSize: 9, fontWeight: FontWeights.bold, letterSpacing: 1.5, marginBottom: Spacing.xs },
  statValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },

  // Setting cards
  settingCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, marginBottom: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  settingDesc: { fontSize: FontSizes.sm, marginTop: 2 },

  // Security card
  securityCard: { borderRadius: BorderRadius.lg, padding: Spacing.xl, borderWidth: 1, marginBottom: Spacing.md },
  securityTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, lineHeight: 28, marginBottom: Spacing.md },
  securityBody: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  securityDesc: { fontSize: FontSizes.sm, lineHeight: 20, flex: 1 },
  manageBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full },
  manageBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },

  // Language badge
  langBadge: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  langBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold },

  // Logout
  logoutCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, marginTop: Spacing.md },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoutText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, flex: 1 },
  logoutSub: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, letterSpacing: 1 },
});
