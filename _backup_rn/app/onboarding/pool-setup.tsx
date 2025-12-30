import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 
 * POOL SETUP SCREEN (REWRITTEN V2)
 * Clean implementation with robust validation and layout handling.
 */

export default function PoolSetupScreen() {
    const { locale } = useLanguage();
    const { user, signOut } = useAuth();
    const router = useRouter();

    // -- State --
    const [name, setName] = useState('');
    const [shape, setShape] = useState<'rectangular' | 'oval' | 'round' | 'kidney' | 'custom'>('rectangular');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');
    const [material, setMaterial] = useState<'vinyl' | 'concrete' | 'fiberglass' | 'tile' | 'other'>('concrete');
    const [loading, setLoading] = useState(false);

    // -- Helpers --
    const parseInput = (val: string) => {
        if (!val) return 0;
        // Replace comma with dot for international support
        const normalized = val.replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : parsed;
    };

    const calculateVolume = () => {
        const l = parseInput(length);
        const w = parseInput(width);
        const d = parseInput(depth);

        if (l <= 0 || w <= 0 || d <= 0) return 0;

        let vol = 0;
        // Simple volumetric formulas
        switch (shape) {
            case 'rectangular':
                vol = l * w * d * 1000;
                break;
            case 'round':
                const r = l / 2; // Assuming length is diameter
                vol = Math.PI * Math.pow(r, 2) * d * 1000;
                break;
            case 'oval':
            case 'kidney':
            case 'custom':
                // Approximation factor (0.85) for complex shapes
                vol = l * w * d * 0.85 * 1000;
                break;
        }
        return Math.round(vol);
    };

    // -- Logic --
    const handleSave = async () => {
        // 1. Validation
        if (!user) {
            Alert.alert(t('common.error'), "No user session found. Please login.");
            router.replace('/login');
            return;
        }

        const l = parseInput(length);
        const w = parseInput(width);
        const d = parseInput(depth);

        if (!name.trim()) {
            Alert.alert("Falta Nombre", "Por favor ingresa un nombre para la pileta.");
            return;
        }
        if (l <= 0) {
            Alert.alert("Dimensiones Invalidas", "El LARGO debe ser mayor a 0.");
            return;
        }
        if (w <= 0) {
            Alert.alert("Dimensiones Invalidas", "El ANCHO debe ser mayor a 0.");
            return;
        }
        if (d <= 0) {
            Alert.alert("Dimensiones Invalidas", "La PROFUNDIDAD debe ser mayor a 0.");
            return;
        }

        // 2. Submission
        setLoading(true);
        const volume = calculateVolume();

        try {
            console.log("💾 Saving Pool...", { user_id: user.id, name, volume });

            // A. Ensure Profile
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                full_name: user?.user_metadata?.full_name || name.split(' ')[0],
            });
            if (profileError) console.warn("Profile Upsert Warning (Non-critical):", profileError.message);

            // B. Insert Pool
            const { data, error } = await supabase.from('pools').insert({
                user_id: user.id,
                name: name.trim(),
                shape,
                length: l,
                width: w,
                depth: d,
                volume,
                material,
            }).select();

            if (error) {
                console.error("❌ DB Error:", error);
                throw new Error(error.message);
            }

            // C. Success
            console.log("✅ Saved:", data);

            // Navigate to Dashboard
            if (router.canGoBack()) router.dismissAll();
            router.replace('/(tabs)');

        } catch (err: any) {
            Alert.alert(t('common.error'), err.message || "Unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // -- Render --
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.badgeWrapper}>
                        <Text style={styles.badgeText}>{t('onboarding.badge').toUpperCase()}</Text>
                    </View>
                    {/* Emergency Logout */}
                    <TouchableOpacity onPress={() => { signOut(); router.replace('/landing'); }}>
                        <Text style={{ color: BrandColors.error, fontWeight: '600', fontSize: 12 }}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>{t('onboarding.title')}</Text>
                <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* NAME INPUT */}
                    <View style={styles.section}>
                        <Text style={styles.label}>{t('onboarding.name_label')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('onboarding.name_placeholder')}
                            placeholderTextColor="#9ca3af"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* DIMS INPUTS */}
                    <View style={styles.section}>
                        <Text style={styles.label}>{t('onboarding.dims_label')}</Text>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.subLabel}>{t('onboarding.dim_length')}</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="0.0"
                                    keyboardType="numeric"
                                    value={length}
                                    onChangeText={setLength}
                                />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.subLabel}>{t('onboarding.dim_width')}</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="0.0"
                                    keyboardType="numeric"
                                    value={width}
                                    onChangeText={setWidth}
                                />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.subLabel}>{t('onboarding.dim_depth')}</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="0.0"
                                    keyboardType="numeric"
                                    value={depth}
                                    onChangeText={setDepth}
                                />
                            </View>
                        </View>
                    </View>

                    {/* SHAPE SELECTOR */}
                    <View style={styles.section}>
                        <Text style={styles.label}>{t('onboarding.shape_label')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hozScroll}>
                            {[
                                { id: 'rectangular', label: t('onboarding.shape_rect'), icon: 'shape-rectangle-plus' },
                                { id: 'round', label: t('onboarding.shape_round'), icon: 'shape-circle-plus' },
                                { id: 'oval', label: t('onboarding.shape_oval'), icon: 'ellipse-outline' },
                            ].map(opt => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.chip, shape === opt.id && styles.chipActive]}
                                    onPress={() => setShape(opt.id as any)}
                                >
                                    <MaterialCommunityIcons
                                        name={opt.icon as any}
                                        size={20}
                                        color={shape === opt.id ? '#FFF' : '#64748B'}
                                    />
                                    <Text style={[styles.chipText, shape === opt.id && styles.chipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* MATERIAL SELECTOR */}
                    <View style={styles.section}>
                        <Text style={styles.label}>{t('onboarding.material_label')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hozScroll}>
                            {[
                                { id: 'concrete', label: t('onboarding.material_concrete') },
                                { id: 'vinyl', label: t('onboarding.material_vinyl') },
                                { id: 'fiberglass', label: t('onboarding.material_fiber') },
                                { id: 'tile', label: t('onboarding.material_tile') },
                            ].map(opt => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.chip, material === opt.id && styles.chipActive]}
                                    onPress={() => setMaterial(opt.id as any)}
                                >
                                    <Text style={[styles.chipText, material === opt.id && styles.chipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* INFO BOX */}
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="information-outline" size={24} color={BrandColors.primary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.infoTitle}>{t('onboarding.volume_label')}</Text>
                            <Text style={styles.infoValue}>{calculateVolume().toLocaleString()} L</Text>
                        </View>
                    </View>

                    {/* SAVE BUTTON (NATIVE) */}
                    <View style={styles.btnContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={BrandColors.primary} />
                        ) : (
                            <Button
                                title={t('onboarding.save_btn') || "GUARDAR DATOS"}
                                onPress={handleSave}
                                color={BrandColors.primary}
                            />
                        )}
                    </View>

                    {/* Spacer for bottom safe area */}
                    <View style={{ height: 60 }} />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#E2E8F0',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeWrapper: {
        backgroundColor: BrandColors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: BrandColors.primary,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: BrandColors.navy,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginTop: 4,
        lineHeight: 22,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: BrandColors.navy,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1E293B',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },
    inputSmall: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1E293B',
        textAlign: 'center',
    },
    hozScroll: {
        flexDirection: 'row',
        overflow: 'visible',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        gap: 8,
    },
    chipActive: {
        backgroundColor: BrandColors.navy,
        borderColor: BrandColors.navy,
    },
    chipText: {
        fontWeight: '600',
        color: '#64748B',
    },
    chipTextActive: {
        color: '#FFF',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    infoTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: BrandColors.primary,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 24,
        fontWeight: '800',
        color: BrandColors.navy,
    },
    btnContainer: {
        marginVertical: 20,
        borderRadius: 12,
        overflow: 'hidden', // Enforce rounded corners on Android if needed, optional
    },
});
