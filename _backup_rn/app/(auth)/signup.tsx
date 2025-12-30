import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
    const { locale } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signUpWithEmail() {
        if (!email || !password || !fullName) {
            Alert.alert(t('common.error'), t('strip.missing_fields_msg'));
            return;
        }

        setLoading(true);
        const { data: { session }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            Alert.alert(t('common.error'), error.message);
        } else {
            // Manual Profile Sync (Fallback if trigger is slow/missing)
            if (session?.user) {
                await supabase.from('profiles').upsert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: fullName,
                });
            }

            if (!session) {
                Alert.alert(t('auth.confirm_email_title'), t('auth.confirm_email_msg'));
            }
            router.replace('/login');
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
                        <View style={[styles.logoCircle, { backgroundColor: '#34D399' }]}>
                            <MaterialCommunityIcons name="account-plus-outline" size={48} color={BrandColors.white} />
                        </View>
                        <Text style={styles.title}>{t('auth.signup_title')}</Text>
                        <Text style={styles.subtitle}>{t('auth.signup_subtitle')}</Text>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.name_label')}</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.name_placeholder')}
                                    placeholderTextColor="#94A3B8"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

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
                        </View>

                        <TouchableOpacity
                            style={[styles.signupBtn, loading && styles.btnDisabled]}
                            onPress={signUpWithEmail}
                            disabled={loading}
                        >
                            <Text style={styles.signupBtnText}>
                                {loading ? t('auth.signup_loading') : t('auth.signup_btn')}
                            </Text>
                            {!loading && <MaterialCommunityIcons name="check" size={20} color={BrandColors.white} />}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('auth.have_account')} </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>{t('auth.login_btn')}</Text>
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
        backgroundColor: '#34D399', // Emerald/Green for Signup
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#34D399',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 10,
    },
    title: {
        fontSize: 32,
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
    inputGroup: {
        marginBottom: 20,
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
    signupBtn: {
        flexDirection: 'row',
        backgroundColor: '#10B981', // Emerald 500
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    signupBtnText: {
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
