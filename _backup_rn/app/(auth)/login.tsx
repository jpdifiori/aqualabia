import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const { locale } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert(t('common.error'), t('strip.missing_fields_msg'));
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert(t('common.error'), error.message);
        } else {
            router.replace('/(tabs)');
        }
        setLoading(false);
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <MaterialCommunityIcons name="water" size={48} color={BrandColors.white} />
                        </View>
                        <Text style={styles.title}>PoolPal AI</Text>
                        <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.welcomeText}>{t('auth.login_title')}</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.email_label')}</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.email_placeholder')}
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.password_label')}</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.password_placeholder')}
                                    placeholderTextColor="#94A3B8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                            <TouchableOpacity style={styles.forgotBtn}>
                                <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.btnDisabled]}
                            onPress={signInWithEmail}
                            disabled={loading}
                        >
                            <Text style={styles.loginBtnText}>
                                {loading ? t('auth.signin_loading') : t('auth.login_btn')}
                            </Text>
                            {!loading && <MaterialCommunityIcons name="arrow-right" size={20} color={BrandColors.white} />}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('auth.no_account')} </Text>
                            <Link href="/signup" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>{t('auth.signup_btn')}</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    mainContainer: {
        flex: 1,
        backgroundColor: BrandColors.navy,
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 35,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 10,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: BrandColors.white,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 24,
    },
    formCard: {
        backgroundColor: BrandColors.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 32,
        flex: 1,
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '800',
        color: BrandColors.navy,
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.navy,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    loginBtn: {
        flexDirection: 'row',
        backgroundColor: BrandColors.navy,
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
        shadowColor: BrandColors.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    loginBtnText: {
        color: BrandColors.white,
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '500',
    },
    linkText: {
        color: BrandColors.primary,
        fontSize: 15,
        fontWeight: '800',
    },
});
