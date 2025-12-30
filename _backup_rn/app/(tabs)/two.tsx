import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function HistoryScreen() {
  const { locale } = useLanguage();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth > 768;
  const dateLocale = locale === 'es' ? es : enUS;

  async function fetchHistory() {
    if (!refreshing) setLoading(true);
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .order('measured_at', { ascending: false });

    if (data) setMeasurements(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const StatusBadge = ({ value, min, max, label }: any) => {
    const isOk = value >= min && value <= max;
    return (
      <View style={styles.statusItem}>
        <Text style={styles.statusLabel}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.statusValue, !isOk && styles.valueWarn]}>{value || '--'}</Text>
          <View style={[styles.indicator, { backgroundColor: isOk ? '#10B981' : '#F59E0B' }]} />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.historyCard, isDesktop && styles.desktopHistoryCard]}>
      <View style={styles.cardTop}>
        <View style={styles.dateTime}>
          <View style={styles.dateCircle}>
            <Text style={styles.dateDay}>{format(new Date(item.measured_at), "dd")}</Text>
          </View>
          <View>
            <Text style={styles.dateMonth}>
              {format(new Date(item.measured_at), "MMMM 'de' yyyy", { locale: dateLocale }).toUpperCase()}
            </Text>
            <Text style={styles.dateTimeText}>
              {format(new Date(item.measured_at), "HH:mm 'hs'", { locale: dateLocale })}
            </Text>
          </View>
        </View>
        <View style={styles.verifiedBadge}>
          <MaterialCommunityIcons name="check-decagram" size={14} color={BrandColors.primary} />
          <Text style={styles.verifiedText}>{t('history.analyzed_ia')}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsRow}>
        <StatusBadge label="pH" value={item.ph} min={7.2} max={7.6} />
        <StatusBadge label={t('strip.chlorine_label').split(' ')[0].toUpperCase()} value={item.free_chlorine} min={1.0} max={3.0} />
        <StatusBadge label={t('strip.alkalinity_label').split(' ')[0].toUpperCase()} value={item.total_alkalinity} min={80} max={120} />
      </View>

      {item.water_clarity && (
        <View style={styles.clarityFooter}>
          <MaterialCommunityIcons name="water" size={14} color="#06B6D4" />
          <Text style={styles.clarityText}>{t('history.clarity_label')}: {item.water_clarity === 'clear' ? t('history.clarity_excellent') : t('history.clarity_adjust')}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      {/* Redundant top header removed - now in GlobalHeader */}

      <FlatList
        data={measurements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, isDesktop && styles.desktopList]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BrandColors.primary]} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="database-off" size={40} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>{t('history.no_history')}</Text>
            <Text style={styles.emptySubtitle}>{t('history.no_history_sub')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 20,
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  desktopHeader: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  screenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: BrandColors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: BrandColors.navy,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 22,
  },
  list: {
    padding: 20,
    paddingBottom: 60,
  },
  desktopList: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
  },
  desktopHistoryCard: {
    padding: 28,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  dateCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '800',
    color: BrandColors.navy,
    letterSpacing: 0.5,
  },
  dateTimeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: BrandColors.primary,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  statusItem: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  valueWarn: {
    color: '#F59E0B',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  clarityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  clarityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 100,
    backgroundColor: 'transparent',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
  },
});
