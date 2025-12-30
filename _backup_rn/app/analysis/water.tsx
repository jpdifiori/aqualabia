import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { analyzeWaterQuality } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Localization from 'expo-localization';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function WaterAnalysisScreen() {
    const { locale } = useLanguage();
    const [analyzing, setAnalyzing] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const router = useRouter();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            processImage(result.assets[0].base64!);
        }
    };

    const saveMeasurement = async (aiResult: any) => {
        try {
            const { data: pool } = await supabase.from('pools').select('id').order('created_at', { ascending: false }).limit(1).single();
            if (pool) {
                await supabase.from('measurements').insert({
                    pool_id: pool.id,
                    water_clarity: aiResult.clarity,
                    ai_analysis_json: aiResult,
                    recommendation_text: aiResult.suggestion,
                });
            }
        } catch (e) {
            console.warn('Persistence Error: Could not save visual diagnosis.');
        }
    };

    const processImage = async (base64: string) => {
        setAnalyzing(true);
        try {
            const lang = Localization.getLocales()[0].languageCode ?? 'en';
            const result = await analyzeWaterQuality(base64, lang);
            await saveMeasurement(result);

            Alert.alert(
                t('water.ai_diagnosis'),
                `${t('water.clarity')}: ${result.clarity === 'clear' ? t('history.clarity_excellent') : t('history.clarity_adjust')}\n${t('water.color')}: ${result.color}\n${t('water.confidence')}: ${(result.confidence * 100).toFixed(0)}%\n\n${t('water.suggestion')}: ${result.suggestion}`,
                [{
                    text: t('common.understand'), onPress: () => {
                        setImage(null);
                        router.back();
                    }
                }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error'), t('water.error_analysis'));
            setImage(null);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={{ marginTop: 20 }} />

                {image ? (
                    <View style={styles.previewCard}>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                        {analyzing && (
                            <View style={styles.analyzingOverlay}>
                                <ActivityIndicator size="large" color={BrandColors.white} />
                                <Text style={styles.analyzingText}>{t('water.analyzing')}</Text>
                            </View>
                        )}
                        {!analyzing && (
                            <TouchableOpacity style={styles.retryBtn} onPress={() => setImage(null)}>
                                <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.selectionArea}>
                        <View style={styles.infoCard}>
                            <View style={styles.infoIconBox}>
                                <MaterialCommunityIcons name="information-outline" size={24} color={BrandColors.primary} />
                            </View>
                            <Text style={styles.infoTitle}>{t('water.info_title')}</Text>
                            <Text style={styles.infoDesc}>{t('water.info_desc')}</Text>
                        </View>

                        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                            <View style={styles.uploadIconBox}>
                                <MaterialCommunityIcons name="image-plus" size={40} color={BrandColors.white} />
                            </View>
                            <Text style={styles.uploadTitle}>{t('water.upload_btn')}</Text>
                            <Text style={styles.uploadDesc}>{t('water.upload_desc')}</Text>
                        </TouchableOpacity>

                        <View style={styles.tipsGrid}>
                            <View style={styles.tipItem}>
                                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={BrandColors.primary} />
                                <Text style={styles.tipText}>{t('water.tip_light')}</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <MaterialCommunityIcons name="focus-field" size={20} color={BrandColors.primary} />
                                <Text style={styles.tipText}>{t('water.tip_reflection')}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 60,
    },
    header: {
        marginBottom: 32,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -12,
        marginBottom: 16,
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
        marginTop: 8,
        lineHeight: 24,
    },
    selectionArea: {
        gap: 24,
    },
    infoCard: {
        backgroundColor: '#EFF6FF',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: BrandColors.navy,
        marginBottom: 8,
    },
    infoDesc: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    uploadBtn: {
        backgroundColor: BrandColors.navy,
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        shadowColor: BrandColors.navy,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
    },
    uploadIconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    uploadTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: BrandColors.white,
    },
    uploadDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 6,
    },
    tipsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    previewCard: {
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: '#000',
        aspectRatio: 3 / 4,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 16,
    },
    retryBtn: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
    },
    retryBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: BrandColors.navy,
    },
});
