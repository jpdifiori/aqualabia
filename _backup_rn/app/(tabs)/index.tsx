import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

export default function DashboardScreen() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [pool, setPool] = useState<any>(null);
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth > 768;

  async function fetchData() {
    if (!refreshing) setLoading(true);
    const { data: poolData } = await supabase.from('pools').select('*').order('created_at', { ascending: false }).limit(1).single();

    if (poolData) {
      setPool(poolData);
      const { data: measureData } = await supabase
        .from('measurements')
        .select('*')
        .eq('pool_id', poolData.id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();
      if (measureData) setLastMeasurement(measureData);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    // Direct test logout function
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/landing');
    } catch (e) {
      console.error("Test logout failed", e);
      Alert.alert("Error", "Logout failed calling Supabase directly");
    }
  };

  const MetricCard = ({ title, value, unit, icon, color, status }: any) => (
    <View style={[styles.metricCard, isDesktop && styles.desktopMetricCard]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconBox, { backgroundColor: color + '10' }]}>
          <FontAwesome5 name={icon} size={14} color={color} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: status === 'ok' ? '#10B981' : (value != null ? '#F59E0B' : '#E2E8F0') }]} />
      </View>
      <Text style={styles.metricLabel}>{title}</Text>
      <View style={styles.metricValueLine}>
        <Text style={styles.metricValue}>{value != null ? value : '--'}</Text>
        {unit && value != null ? <Text style={styles.metricUnit}>{unit}</Text> : null}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}
        refreshControl={<RefreshControl refreshing={refreshing} colors={[BrandColors.primary]} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Redundant top actions removed - now in GlobalHeader */}

        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.welcome')}</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>
                {lastMeasurement ? new Date(lastMeasurement.measured_at).toLocaleDateString() : 'Sin datos'}
              </Text>
            </View>
          </View>

          <View style={[styles.metricGrid, isDesktop && styles.desktopMetricGrid]}>
            <MetricCard
              title={t('strip.ph_label')}
              value={lastMeasurement?.ph}
              unit="pH"
              icon="vial"
              color="#8B5CF6"
              status={lastMeasurement?.ph >= 7.2 && lastMeasurement?.ph <= 7.6 ? 'ok' : 'warn'}
            />
            <MetricCard
              title={t('strip.chlorine_label')}
              value={lastMeasurement?.free_chlorine}
              unit="ppm"
              icon="vials"
              color={BrandColors.primary}
              status={lastMeasurement?.free_chlorine >= 1.0 && lastMeasurement?.free_chlorine <= 3.0 ? 'ok' : 'warn'}
            />
            <MetricCard
              title={t('strip.alkalinity_label')}
              value={lastMeasurement?.total_alkalinity}
              unit="ppm"
              icon="tint"
              color="#06B6D4"
              status={lastMeasurement?.total_alkalinity >= 80 && lastMeasurement?.total_alkalinity <= 120 ? 'ok' : 'warn'}
            />
            <MetricCard
              title={t('water.clarity')}
              value={lastMeasurement?.water_clarity === 'clear' ? t('history.clarity_excellent') : (lastMeasurement?.water_clarity ? t('history.clarity_adjust') : null)}
              unit=""
              icon="eye"
              color="#10B981"
              status={lastMeasurement?.water_clarity === 'clear' ? 'ok' : 'warn'}
            />
          </View>
        </View>

        {/* --- TEST BUTTON FOR DEBUGGING --- */}
        <TouchableOpacity
          style={{
            backgroundColor: '#EF4444',
            marginHorizontal: 24,
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center'
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>⚠️ TEST LOGOUT (DIRECT)</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>{t('dashboard.visual_analysis')}</Text>
          <View style={[styles.actionGrid, isDesktop && styles.desktopActionGrid]}>
            <TouchableOpacity
              style={styles.actionCardPrimary}
              onPress={() => router.push('/analysis/strip')}
            >
              <View style={styles.actionIconCircle}>
                <MaterialCommunityIcons name="camera-plus-outline" size={24} color={BrandColors.white} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{t('dashboard.strip_analysis')}</Text>
                <Text style={styles.actionSubtitle}>{t('dashboard.strip_desc')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCardSecondary}
              onPress={() => router.push('/analysis/water')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <MaterialCommunityIcons name="waves" size={24} color={BrandColors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: BrandColors.navy }]}>{t('dashboard.visual_analysis')}</Text>
                <Text style={styles.actionSubtitle}>{t('dashboard.visual_desc')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },
  desktopContent: {
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  poolMainName: {
    fontSize: 32,
    fontWeight: '800',
    color: BrandColors.navy,
    letterSpacing: -1,
    marginTop: 4,
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  summarySection: {
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.navy,
    letterSpacing: -0.5,
  },
  dateBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: 'transparent',
  },
  desktopMetricGrid: {
    flexWrap: 'nowrap',
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
  },
  desktopMetricCard: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValueLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: 'transparent',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  quickActions: {
    backgroundColor: 'transparent',
    gap: 20,
  },
  actionGrid: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  desktopActionGrid: {
    flexDirection: 'row',
  },
  actionCardPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.navy,
    padding: 24,
    borderRadius: 28,
    gap: 16,
    shadowColor: BrandColors.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  actionCardSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 28,
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.white,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
});
