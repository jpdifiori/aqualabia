import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useAuth } from '@/context/AuthContext';

export function GlobalHeader() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';
    const headerHeight = 60;

    // Define root paths where we show branding instead of back button
    const rootPaths = [
        '/',
        '/(tabs)',
        '/(tabs)/index',
        '/(tabs)/two',
        '/login',
        '/signup',
        '/(auth)/login',
        '/(auth)/signup',
        '/onboarding/pool-setup',
        '/(onboarding)/pool-setup'
    ];

    const isRoot = rootPaths.includes(pathname);

    const handleLogout = async () => {
        console.log("👆 Logout button pressed");
        Alert.alert(
            t('auth.logout_title'),
            t('auth.logout_confirm'),
            [
                { text: t('common.no'), style: 'cancel' },
                {
                    text: t('common.yes'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            // Navigate immediately for best UX
                            router.replace('/landing');
                        } catch (err) {
                            console.error("Header Logout failed:", err);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.outerContainer, { height: headerHeight + insets.top, paddingTop: insets.top }]}>
            <View style={styles.innerContainer}>
                {/* Left Section: Back Button OR branding logo */}
                <View style={styles.leftSection}>
                    {!isRoot ? (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color={BrandColors.navy} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.branding}
                            onPress={() => router.push('/(tabs)')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.logoBox}>
                                <MaterialCommunityIcons name="water" size={18} color={BrandColors.white} />
                            </View>
                            <Text style={styles.brandName}>PoolPal AI</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Right: Actions (Language, Logout, Profile) */}
                <View style={styles.actions}>
                    <LanguageSwitcher />

                    {user && (
                        <>
                            {/* Quick Logout (Guaranteed visibility as requested) */}
                            <TouchableOpacity
                                style={styles.headerLogoutBtn}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MaterialCommunityIcons name="logout" size={22} color={BrandColors.error} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.profileBtn}
                                onPress={() => router.push('/profile')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.avatarMini}>
                                    <Text style={styles.avatarMiniText}>{userInitial}</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 99999,
    },
    innerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    branding: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        fontSize: 18,
        fontWeight: '900',
        color: BrandColors.navy,
        letterSpacing: -0.5,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerLogoutBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#FFF1F2',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    profileBtn: {
        padding: 2,
    },
    avatarMini: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: BrandColors.navy,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    avatarMiniText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
});
