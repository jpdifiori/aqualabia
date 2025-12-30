import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { getRecommendations, Recommendation } from '@/lib/recommendations';
import { supabase } from '@/lib/supabase';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function RecommendationScreen() {
    const { locale } = useLanguage();
    const params = useLocalSearchParams();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [volume, setVolume] = useState(0);
    const [loadingPool, setLoadingPool] = useState(true);
    const router = useRouter();
    const { width: windowWidth } = useWindowDimensions();
    const isDesktop = windowWidth > 768;

    useEffect(() => {
        async function loadData() {
            setLoadingPool(true);
            const { data: pool } = await supabase.from('pools').select('volume').order('created_at', { ascending: false }).limit(1).single();
            const poolVolume = pool?.volume || 0;
            setVolume(poolVolume);

            const recs = getRecommendations({
                ph: parseFloat(params.ph as string),
                free_chlorine: parseFloat(params.free_chlorine as string),
                alkalinity: parseFloat(params.alkalinity as string),
                volume: poolVolume,
            }, locale);
            setRecommendations(recs);
            setLoadingPool(false);

            // Save measurement to DB
            try {
                const { data: poolData } = await supabase.from('pools').select('id').order('created_at', { ascending: false }).limit(1).single();
                if (poolData) {
                    await supabase.from('measurements').insert({
                        pool_id: poolData.id,
                        ph: parseFloat(params.ph as string),
                        free_chlorine: parseFloat(params.free_chlorine as string),
                        total_alkalinity: parseInt(params.alkalinity as string),
                        recommendation_json: recs,
                    });
                }
            } catch (e) {
                console.warn('Skipping history save (No pool or Auth off)');
            }
        }

        loadData();
    }, [params, locale]);

    if (loadingPool) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text style={styles.loadingText}>{t('recommendation.syncing_profile')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}
                showsVerticalScrollIndicator={false}
            >

                {recommendations.length === 0 ? (
                    <View style={styles.okCard}>
                        <View style={styles.okIconCircle}>
                            <FontAwesome5 name="check" size={32} color={BrandColors.success} />
                        </View>
                        <Text style={styles.okText}>{t('recommendation.ok_title')}</Text>
                        <Text style={styles.okSub}>{t('recommendation.ok_sub')}</Text>
                        <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
                            <Text style={styles.doneText}>{t('recommendation.done_btn')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.recsList}>
                        {recommendations.map((rec, index) => (
                            <View key={index} style={styles.recCard}>
                                <View style={styles.recSideAccent} />
                                <View style={styles.recContent}>
                                    <View style={styles.recHeader}>
                                        <Text style={styles.recAction}>{rec.action.toUpperCase()}</Text>
                                        <View style={[styles.priorityBadge, { backgroundColor: rec.priority === 1 ? BrandColors.primary + '15' : BrandColors.slate + '15' }]}>
                                            <Text style={[styles.priorityText, { color: rec.priority === 1 ? BrandColors.primary : BrandColors.slate }]}>
                                                {t('recommendation.priority')} {rec.priority}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.dosageRow}>
                                        <Text style={styles.amount}>{rec.amount}</Text>
                                        <Text style={styles.productName}>{rec.product}</Text>
                                    </View>

                                    <View style={styles.reasonBox}>
                                        <MaterialCommunityIcons name="information-outline" size={14} color={BrandColors.slate} />
                                        <Text style={styles.reason}>{rec.reason}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
                            <Text style={styles.doneText}>{t('recommendation.apply_btn')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: BrandColors.lightGray,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BrandColors.white,
    },
    loadingText: {
        marginTop: 12,
        color: BrandColors.slate,
        fontWeight: '600',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 60,
    },
    desktopContent: {
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        marginBottom: 32,
    },
    reportBadge: {
        backgroundColor: BrandColors.navy,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    reportBadgeText: {
        color: BrandColors.white,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: BrandColors.navy,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: BrandColors.slate,
        marginTop: 8,
        lineHeight: 24,
    },
    bold: {
        fontWeight: '700',
        color: BrandColors.navy,
    },
    recsList: {
        gap: 16,
        backgroundColor: 'transparent',
    },
    recCard: {
        backgroundColor: BrandColors.white,
        borderRadius: 20,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: BrandColors.border,
        shadowColor: BrandColors.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
    },
    recSideAccent: {
        width: 6,
        backgroundColor: BrandColors.primary,
    },
    recContent: {
        flex: 1,
        padding: 20,
        backgroundColor: 'transparent',
    },
    recHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    recAction: {
        fontSize: 11,
        fontWeight: '800',
        color: BrandColors.primary,
        letterSpacing: 1,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 9,
        fontWeight: '800',
    },
    dosageRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: BrandColors.navy,
        letterSpacing: -1,
    },
    productName: {
        fontSize: 16,
        color: BrandColors.slate,
        fontWeight: '500',
        flex: 1,
    },
    reasonBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: BrandColors.lightGray,
        padding: 12,
        borderRadius: 12,
    },
    reason: {
        fontSize: 13,
        color: BrandColors.slate,
        flex: 1,
        lineHeight: 18,
    },
    okCard: {
        backgroundColor: BrandColors.white,
        borderRadius: 24,
        padding: 48,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    okIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: BrandColors.success + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    okText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: BrandColors.navy,
        textAlign: 'center',
    },
    okSub: {
        fontSize: 16,
        color: BrandColors.slate,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    primaryButton: {
        backgroundColor: BrandColors.primaryLight,
        padding: 16,
        borderRadius: 999,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 2,
        borderColor: BrandColors.primary,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    doneButton: {
        backgroundColor: BrandColors.white,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 999,
        marginTop: 32,
        borderWidth: 2,
        borderColor: BrandColors.border,
    },
    doneText: {
        color: BrandColors.darkBlue,
        fontSize: 15,
        fontWeight: '700',
    },
});
