import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { analyzeTestStrip } from '@/lib/gemini';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type EntryMode = 'selection' | 'manual' | 'analyzing';

export default function StripAnalysisScreen() {
    const { locale } = useLanguage();
    const [mode, setMode] = useState<EntryMode>('selection');
    const [analyzing, setAnalyzing] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const router = useRouter();

    // Manual Entry State
    const [ph, setPh] = useState('');
    const [chlorine, setChlorine] = useState('');
    const [alkalinity, setAlkalinity] = useState('');

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

    const processImage = async (base64: string) => {
        setMode('analyzing');
        setAnalyzing(true);
        try {
            const result = await analyzeTestStrip(base64, locale);

            Alert.alert(
                t('strip.analysis_completed_title'),
                t('strip.analysis_completed_msg'),
                [
                    { text: t('strip.view_recommendation'), onPress: () => router.push({ pathname: '/analysis/recommendation', params: { ...result } }) },
                    {
                        text: t('common.retry'), style: 'cancel', onPress: () => {
                            setImage(null);
                            setMode('selection');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error(error);
            Alert.alert(t('strip.error_analysis_title'), t('strip.error_analysis_msg'));
            setImage(null);
            setMode('selection');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleManualSubmit = () => {
        if (!ph || !chlorine || !alkalinity) {
            Alert.alert(t('strip.missing_fields_title'), t('strip.missing_fields_msg'));
            return;
        }

        const data = {
            ph: parseFloat(ph),
            free_chlorine: parseFloat(chlorine),
            total_alkalinity: parseFloat(alkalinity),
            confidence: 1.0,
        };

        router.push({ pathname: '/analysis/recommendation', params: { ...data } });
    };

    const InstructionGuide = () => (
        <Modal visible={showGuide} animationType="slide" transparent={false}>
            <View style={styles.guideModal}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowGuide(false)} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={BrandColors.navy} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('strip.guide_title')}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.guideScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{t('strip.guide_step1_title')}</Text>
                            <Text style={styles.stepDesc}>{t('strip.guide_step1_desc')}</Text>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{t('strip.guide_step2_title')}</Text>
                            <Text style={styles.stepDesc}>{t('strip.guide_step2_desc')}</Text>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>{t('strip.guide_step3_title')}</Text>
                            <Text style={styles.stepDesc}>{t('strip.guide_step3_desc')}</Text>
                        </View>
                    </View>

                    <View style={styles.colorReferenceSection}>
                        <Text style={styles.refTitle}>{t('strip.ref_title')}</Text>

                        <View style={styles.refItem}>
                            <Text style={styles.refLabel}>{t('strip.ref_ph')}</Text>
                            <View style={styles.colorScale}>
                                <View style={[styles.colorBox, { backgroundColor: '#FCD34D' }]}><Text style={styles.colorVal}>6.8</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#F59E0B' }]}><Text style={styles.colorVal}>7.2</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#EF4444', borderWidth: 2, borderColor: BrandColors.primary }]}><Text style={styles.colorVal}>7.5</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#B91C1C' }]}><Text style={styles.colorVal}>8.2</Text></View>
                            </View>
                            <Text style={styles.refSub}>{t('strip.ref_ideal')}: 7.2 - 7.6</Text>
                        </View>

                        <View style={styles.refItem}>
                            <Text style={styles.refLabel}>{t('strip.ref_chlorine')} (ppm)</Text>
                            <View style={styles.colorScale}>
                                <View style={[styles.colorBox, { backgroundColor: '#FEF3C7' }]}><Text style={styles.colorVal}>0</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#FDE68A' }]}><Text style={styles.colorVal}>1</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#FCD34D', borderWidth: 2, borderColor: BrandColors.primary }]}><Text style={styles.colorVal}>3</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#D97706' }]}><Text style={styles.colorVal}>5</Text></View>
                            </View>
                            <Text style={styles.refSub}>{t('strip.ref_ideal')}: 1 - 3 ppm</Text>
                        </View>

                        <View style={styles.refItem}>
                            <Text style={styles.refLabel}>{t('strip.ref_alkalinity')} (ppm)</Text>
                            <View style={styles.colorScale}>
                                <View style={[styles.colorBox, { backgroundColor: '#D1FAE5' }]}><Text style={styles.colorVal}>40</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#6EE7B7' }]}><Text style={styles.colorVal}>80</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#10B981', borderWidth: 2, borderColor: BrandColors.primary }]}><Text style={styles.colorVal}>120</Text></View>
                                <View style={[styles.colorBox, { backgroundColor: '#047857' }]}><Text style={styles.colorVal}>180</Text></View>
                            </View>
                            <Text style={styles.refSub}>{t('strip.ref_ideal')}: 80 - 120 ppm</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.guideDoneBtn} onPress={() => setShowGuide(false)}>
                        <Text style={styles.guideDoneText}>{t('common.understand')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );

    if (mode === 'analyzing') {
        return (
            <View style={styles.centerContainer}>
                <Image source={{ uri: image! }} style={styles.analyzingPreview} />
                <View style={styles.analyzingOverlay}>
                    <ActivityIndicator size="large" color={BrandColors.white} />
                    <Text style={styles.analyzingText}>{t('strip.analyzing_ia')}</Text>
                    <Text style={styles.analyzingSubtext}>{t('strip.analyzing_sub')}</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <InstructionGuide />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={{ marginTop: 20 }} />

                {mode === 'selection' ? (
                    <View style={styles.selectionGrid}>
                        <TouchableOpacity style={styles.optionBtn} onPress={pickImage}>
                            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                                <MaterialCommunityIcons name="image-search-outline" size={32} color={BrandColors.primary} />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={styles.optionTitle}>{t('strip.ia_option')}</Text>
                                <Text style={styles.optionDesc}>{t('strip.ia_desc')}</Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={14} color="#CBD5E1" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionBtn} onPress={() => setMode('manual')}>
                            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                                <MaterialCommunityIcons name="form-select" size={32} color="#10B981" />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={styles.optionTitle}>{t('strip.manual_option')}</Text>
                                <Text style={styles.optionDesc}>{t('strip.manual_desc')}</Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={14} color="#CBD5E1" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.formCard}>
                        <View style={styles.formCardHeader}>
                            <Text style={styles.formSubtitle}>{t('strip.form_subtitle')}</Text>
                            <TouchableOpacity style={styles.helpBtn} onPress={() => setShowGuide(true)}>
                                <MaterialCommunityIcons name="help-circle-outline" size={20} color={BrandColors.primary} />
                                <Text style={styles.helpBtnText}>{t('strip.help_btn')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>{t('strip.ph_label')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="7.2"
                                keyboardType="decimal-pad"
                                value={ph}
                                onChangeText={setPh}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>{t('strip.chlorine_label')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1.5"
                                keyboardType="decimal-pad"
                                value={chlorine}
                                onChangeText={setChlorine}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>{t('strip.alkalinity_label')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="100"
                                keyboardType="decimal-pad"
                                value={alkalinity}
                                onChangeText={setAlkalinity}
                            />
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode('selection')}>
                                <Text style={styles.secondaryBtnText}>{t('common.back')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleManualSubmit}>
                                <Text style={styles.primaryBtnText}>{t('common.next')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
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
    selectionGrid: {
        gap: 16,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: BrandColors.navy,
    },
    optionDesc: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.06,
        shadowRadius: 40,
    },
    formCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    helpBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    formSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: BrandColors.navy,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 16,
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.navy,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        backgroundColor: 'transparent',
    },
    primaryBtn: {
        flex: 2,
        backgroundColor: BrandColors.primaryLight,
        borderWidth: 2,
        borderColor: BrandColors.primary,
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: BrandColors.darkBlue,
    },
    secondaryBtn: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    analyzingPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.6,
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    analyzingText: {
        color: BrandColors.white,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 24,
    },
    analyzingSubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    guideModal: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    closeBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: BrandColors.navy,
    },
    guideScroll: {
        padding: 24,
        paddingBottom: 60,
    },
    stepCard: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: BrandColors.navy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    stepContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: BrandColors.navy,
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    colorReferenceSection: {
        marginTop: 16,
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    refTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: BrandColors.navy,
        marginBottom: 20,
    },
    refItem: {
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    refLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: BrandColors.navy,
        marginBottom: 12,
    },
    colorScale: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    colorBox: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorVal: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(0,0,0,0.5)',
    },
    refSub: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    guideDoneBtn: {
        backgroundColor: BrandColors.navy,
        paddingVertical: 20,
        borderRadius: 999,
        alignItems: 'center',
        marginTop: 32,
    },
    guideDoneText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    }
});
