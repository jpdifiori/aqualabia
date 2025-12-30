import { BrandColors } from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function LanguageSwitcher() {
    const { locale, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        const nextLang = locale === 'es' ? 'en' : 'es';
        setLanguage(nextLang);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={toggleLanguage} activeOpacity={0.7}>
            <View style={styles.badge}>
                <MaterialCommunityIcons
                    name="translate"
                    size={16}
                    color={BrandColors.primary}
                />
                <Text style={styles.text}>
                    {locale === 'es' ? 'ES' : 'EN'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BrandColors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: BrandColors.primary + '30',
    },
    text: {
        fontSize: 12,
        fontWeight: '800',
        color: BrandColors.navy,
    }
});
