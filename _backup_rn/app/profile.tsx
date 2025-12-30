import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';

    const handleLogout = async () => {
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
                            // Force immediate navigation to landing
                            router.replace('/landing');
                        } catch (err) {
                            console.error("Logout failed:", err);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.overlay}>
            {/* Tap outside to close */}
            <Pressable style={styles.dismissArea} onPress={() => router.back()} />

            <View style={styles.popupCard}>
                {/* Header with Close */}
                <View style={styles.popupHeader}>
                    <Text style={styles.popupTitle}>{t('navigation.profile')}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* User Info Section */}
                <View style={styles.userInfo}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>{userInitial.toUpperCase()}</Text>
                    </View>
                    <View style={styles.userTextDetails}>
                        <Text style={styles.fullName}>{user?.user_metadata?.full_name || 'User'}</Text>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Actions Section */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => {
                            // Placeholder for "Config" if needed, keeping it simple for now
                            Alert.alert('Settings', 'Settings access coming soon');
                        }}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                            <MaterialCommunityIcons name="cog" size={20} color="#64748B" />
                        </View>
                        <Text style={styles.actionLabel}>{t('profile.personal_section')}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color="#CBD5E1" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutAction} onPress={handleLogout}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF1F2' }]}>
                            <MaterialCommunityIcons name="logout" size={20} color={BrandColors.error} />
                        </View>
                        <Text style={[styles.actionLabel, { color: BrandColors.error }]}>
                            {t('auth.login_btn')} (Sign Out)
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionTag}>{t('profile.version')} 1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Dimmed navy background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dismissArea: {
        ...StyleSheet.absoluteFillObject,
    },
    popupCard: {
        width: Math.min(width - 48, 360),
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        paddingVertical: 32,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    popupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    popupTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: BrandColors.navy,
        letterSpacing: -0.5,
    },
    closeBtn: {
        padding: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    avatarLarge: {
        width: 64,
        height: 64,
        borderRadius: 22,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    avatarLargeText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    userTextDetails: {
        flex: 1,
    },
    fullName: {
        fontSize: 18,
        fontWeight: '800',
        color: BrandColors.navy,
    },
    emailText: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 2,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    actionsContainer: {
        gap: 8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        gap: 12,
    },
    logoutAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        gap: 12,
        marginTop: 4,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
    },
    versionTag: {
        textAlign: 'center',
        fontSize: 11,
        color: '#CBD5E1',
        marginTop: 24,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
