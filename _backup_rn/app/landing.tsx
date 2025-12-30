import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandColors } from '@/constants/Colors';
import { t } from '@/constants/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

import { useEffect, useRef } from 'react';

const TESTIMONIAL_KEYS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function LandingPage() {
    const { locale } = useLanguage();
    const router = useRouter();
    const { width: windowWidth } = useWindowDimensions();
    const isDesktop = windowWidth > 992;
    const isTablet = windowWidth > 768 && windowWidth <= 992;

    // Carousel Auto-Scroll Logic
    const scrollRef = useRef<ScrollView>(null);
    const scrollPosition = useRef(0);
    const CARD_WIDTH = 320;
    const SPACING = 24;
    const TOTAL_ITEM_WIDTH = CARD_WIDTH + SPACING;

    useEffect(() => {
        const interval = setInterval(() => {
            if (!scrollRef.current) return;

            // Calculate next position
            scrollPosition.current += TOTAL_ITEM_WIDTH;

            // Loop back if we reach end (approximate check based on item count)
            if (scrollPosition.current > (TESTIMONIAL_KEYS.length - 1) * TOTAL_ITEM_WIDTH) {
                scrollPosition.current = 0;
            }

            scrollRef.current.scrollTo({
                x: scrollPosition.current,
                animated: true,
            });
        }, 3000); // 3 seconds interval

        return () => clearInterval(interval);
    }, []);

    const renderTestimonial = (item: number) => (
        <View key={item} style={styles.testimonialCard}>
            <MaterialCommunityIcons name="format-quote-open" size={24} color={BrandColors.primary} />
            <Text style={styles.testimonialText}>{t(`landing.testimonial_${item}_text`)}</Text>
            <View style={styles.testimonialFooter}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{(t(`landing.testimonial_${item}_name`) || 'U').charAt(0)}</Text>
                </View>
                <Text style={styles.testimonialName}>{t(`landing.testimonial_${item}_name`)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 1. Hero Section */}
                <ImageBackground
                    source={require('../assets/images/landing_hero.png')}
                    style={[styles.heroBg, isDesktop && styles.heroBgDesktop]}
                >
                    <LinearGradient
                        colors={['rgba(15, 23, 42, 0.8)', 'rgba(30, 58, 138, 0.4)', 'rgba(15, 23, 42, 0.8)']}
                        style={styles.heroOverlay}
                    >
                        <View style={[styles.topBar, (isDesktop || isTablet) && styles.contentWide]}>
                            <View style={styles.brand}>
                                <View style={styles.logoBox}>
                                    <MaterialCommunityIcons name="water" size={24} color={BrandColors.white} />
                                </View>
                                <Text style={styles.brandName}>PoolPal AI</Text>
                            </View>
                            <LanguageSwitcher />
                        </View>

                        <View style={[styles.heroContent, (isDesktop || isTablet) && styles.contentWide]}>
                            <View style={isDesktop ? styles.heroTextLeft : styles.heroTextCenter}>
                                <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                                    {t('landing.hero_title')}
                                </Text>
                                <Text style={styles.heroSubtitle1}>{t('landing.hero_subtitle_1')}</Text>
                                <Text style={styles.heroSubtitle2}>{t('landing.hero_subtitle_2')}</Text>

                                <View style={[styles.heroActions, isDesktop && styles.heroActionsDesktop]}>
                                    <TouchableOpacity
                                        style={styles.primaryBtn}
                                        onPress={() => router.push('/signup')}
                                    >
                                        <Text style={styles.primaryBtnText}>{t('landing.get_started')}</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={22} color={BrandColors.white} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.secondaryBtn}
                                        onPress={() => router.push('/login')}
                                    >
                                        <Text style={styles.secondaryBtnText}>{t('landing.login')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>

                {/* 2. Problem Section */}
                <View style={[styles.section, styles.bgLight]}>
                    <View style={[(isDesktop || isTablet) && styles.rowReverse, styles.alignCenter]}>
                        <View style={styles.half}>
                            <Image source={require('../assets/images/landing_problem.png')} style={styles.sectionImage} />
                        </View>
                        <View style={styles.halfText}>
                            <Text style={styles.sectionPreTitle}>{t('landing.problem_title')}</Text>
                            <View style={styles.problemList}>
                                {[1, 2, 3].map(i => (
                                    <View key={i} style={styles.problemItem}>
                                        <View style={styles.bulletRed} />
                                        <Text style={styles.problemText}>{t(`landing.problem_item_${i}`)}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.problemFooter}>{t('landing.problem_footer')}</Text>
                        </View>
                    </View>
                </View>

                {/* 3. Solution Section (Premium Card) */}
                <View style={styles.section}>
                    <ImageBackground
                        source={require('../assets/images/landing_solution.png')}
                        style={styles.solutionCardBg}
                        imageStyle={{ borderRadius: 32 }}
                    >
                        <LinearGradient
                            colors={['rgba(37, 99, 235, 0.95)', 'rgba(15, 23, 42, 0.85)']}
                            style={styles.solutionOverlay}
                        >
                            <Text style={styles.solutionTitle}>{t('landing.solution_title')}</Text>
                            <View style={styles.solutionGrid}>
                                {[1, 2, 3].map(i => (
                                    <View key={i} style={styles.solutionStep}>
                                        <View style={styles.solutionIconBox}>
                                            <MaterialCommunityIcons
                                                name={i === 1 ? "database-plus" : i === 2 ? "camera-iris" : "format-list-checks"}
                                                size={32}
                                                color={BrandColors.white}
                                            />
                                        </View>
                                        <Text style={styles.solutionStepText}>{t(`landing.solution_step_${i}`)}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.solutionFooterText}>{t('landing.solution_footer')}</Text>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                {/* 4. Features Section */}
                <View style={[styles.section, styles.bgWhite]}>
                    <View style={(isDesktop || isTablet) && styles.row}>
                        <View style={styles.halfTextLarge}>
                            <Text style={styles.featureLabel}>{t('landing.features_title')}</Text>
                            <View style={styles.featurePoint}>
                                <LinearGradient colors={[BrandColors.primary, BrandColors.darkBlue]} style={styles.featureIcon}>
                                    <MaterialCommunityIcons name="check-decagram" size={24} color={BrandColors.white} />
                                </LinearGradient>
                                <View style={styles.flex1}>
                                    <Text style={styles.featureContent}>{t('landing.features_analyzes')}</Text>
                                </View>
                            </View>
                            <View style={styles.featurePoint}>
                                <LinearGradient colors={[BrandColors.success, '#059669']} style={styles.featureIcon}>
                                    <MaterialCommunityIcons name="clipboard-text-play" size={24} color={BrandColors.white} />
                                </LinearGradient>
                                <View style={styles.flex1}>
                                    <Text style={styles.featureContent}>{t('landing.features_delivers')}</Text>
                                </View>
                            </View>
                            <Text style={styles.featureClose}>{t('landing.features_close')}</Text>
                        </View>
                    </View>
                </View>

                {/* 5. Benefits & Emotional Prop */}
                <View style={[styles.section, styles.bgDeep]}>
                    <Text style={styles.benefitsTitle}>{t('landing.benefits_title_main')}</Text>
                    <Text style={styles.benefitsSubtitle}>{t('landing.benefits_subtitle_main')}</Text>

                    <View style={styles.benefitsVisualGrid}>
                        <View style={styles.benefitsImageContainer}>
                            <Image source={require('../assets/images/landing_benefits.png')} style={styles.benefitsMainImage} />
                            <LinearGradient colors={['transparent', 'rgba(15, 23, 42, 0.9)']} style={styles.imageOverlay} />
                        </View>

                        <View style={styles.benefitsListContainer}>
                            {[1, 2, 3, 4].map(i => (
                                <View key={i} style={styles.benefitBox}>
                                    <View style={styles.checkIcon}>
                                        <MaterialCommunityIcons name="shield-check" size={24} color={BrandColors.success} />
                                    </View>
                                    <Text style={styles.benefitItemText}>{t(`landing.benefit_${i}`)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* 6. Risk Section */}
                <View style={styles.sectionRisk}>
                    <LinearGradient colors={['#991B1B', '#450A0A']} style={styles.riskGradient}>
                        <MaterialCommunityIcons name="alert-decagram" size={48} color={BrandColors.white} />
                        <Text style={styles.riskTitle}>{t('landing.risk_title')}</Text>
                        <Text style={styles.riskBody}>{t('landing.risk_text')}</Text>
                    </LinearGradient>
                </View>

                {/* 7. Testimonials Section (Social Proof) */}
                <View style={[styles.section, styles.bgLight]}>
                    <Text style={styles.sectionTitleCenter}>{t('landing.testimonials_title')}</Text>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.testimonialsScroll}
                        snapToInterval={344} // CARD_WIDTH (320) + GAP (24)
                        decelerationRate="fast"
                    >
                        {TESTIMONIAL_KEYS.map(key => renderTestimonial(key))}
                    </ScrollView>
                </View>

                {/* 8. Final CTA journey */}
                <View style={styles.sectionFinal}>
                    <Text style={styles.finalQuestion}>{t('landing.final_phrase')}</Text>
                    <View style={[styles.ctaStack, isDesktop && styles.rowCenter]}>
                        <TouchableOpacity style={styles.finalCta} onPress={() => router.push('/signup')}>
                            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.ctaGrad}>
                                <Text style={styles.ctaTextSmall}>{t('landing.cta_button_1')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.finalCta} onPress={() => router.push('/signup')}>
                            <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.ctaGrad}>
                                <Text style={styles.ctaTextSmall}>{t('landing.cta_button_2')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.finalCta} onPress={() => router.push('/signup')}>
                            <LinearGradient colors={['#10B981', '#047857']} style={styles.ctaGrad}>
                                <Text style={styles.ctaTextSmall}>{t('landing.cta_button_3')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 PoolPal AI. {t('common.all_rights_reserved')}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.white,
    },
    scrollView: {
        flex: 1,
    },
    contentWide: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    heroBg: {
        width: '100%',
        height: 700,
    },
    heroBgDesktop: {
        height: 850,
    },
    heroOverlay: {
        flex: 1,
        paddingHorizontal: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 60,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: BrandColors.primary,
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    brandName: {
        fontSize: 24,
        fontWeight: '900',
        color: BrandColors.white,
        letterSpacing: -1,
    },
    heroContent: {
        flex: 1,
        justifyContent: 'center',
    },
    heroTextCenter: {
        alignItems: 'center',
    },
    heroTextLeft: {
        alignItems: 'flex-start',
        maxWidth: 700,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: BrandColors.white,
        lineHeight: 56,
        letterSpacing: -2,
        textAlign: 'center',
    },
    heroTitleDesktop: {
        fontSize: 72,
        lineHeight: 80,
        textAlign: 'left',
    },
    heroSubtitle1: {
        fontSize: 24,
        fontWeight: '700',
        color: BrandColors.primaryHover,
        marginTop: 20,
        textAlign: 'center',
    },
    heroSubtitle2: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 16,
        lineHeight: 28,
        textAlign: 'center',
    },
    heroActions: {
        marginTop: 48,
        width: '100%',
        gap: 16,
    },
    heroActionsDesktop: {
        flexDirection: 'row',
        width: 'auto',
    },
    primaryBtn: {
        backgroundColor: BrandColors.primary,
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },
    primaryBtnText: {
        color: BrandColors.white,
        fontSize: 20,
        fontWeight: '800',
    },
    secondaryBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    secondaryBtnText: {
        color: BrandColors.white,
        fontSize: 20,
        fontWeight: '700',
    },
    section: {
        paddingVertical: 80,
        paddingHorizontal: 24,
    },
    bgLight: {
        backgroundColor: '#F8FAFC',
    },
    bgWhite: {
        backgroundColor: BrandColors.white,
    },
    bgDeep: {
        backgroundColor: BrandColors.navy,
    },
    row: {
        flexDirection: 'row',
        gap: 60,
    },
    rowReverse: {
        flexDirection: 'row-reverse',
        gap: 60,
    },
    alignCenter: {
        alignItems: 'center',
    },
    half: {
        flex: 1,
    },
    halfText: {
        flex: 1.2,
    },
    halfTextLarge: {
        flex: 2,
    },
    sectionImage: {
        width: '100%',
        height: 400,
        borderRadius: 32,
    },
    sectionPreTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: BrandColors.navy,
        marginBottom: 32,
        lineHeight: 40,
    },
    problemList: {
        gap: 16,
    },
    problemItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    bulletRed: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: BrandColors.error,
        marginTop: 8,
    },
    problemText: {
        fontSize: 18,
        color: BrandColors.slate,
        lineHeight: 28,
        fontWeight: '500',
    },
    problemFooter: {
        fontSize: 18,
        color: BrandColors.navy,
        fontWeight: '700',
        marginTop: 32,
        lineHeight: 28,
        fontStyle: 'italic',
    },
    solutionCardBg: {
        width: '100%',
    },
    solutionOverlay: {
        padding: 50,
        borderRadius: 32,
    },
    solutionTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: BrandColors.white,
        textAlign: 'center',
        marginBottom: 50,
        lineHeight: 46,
    },
    solutionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
    },
    solutionStep: {
        width: '45%',
        alignItems: 'center',
        marginBottom: 20,
    },
    solutionIconBox: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    solutionStepText: {
        color: BrandColors.white,
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
    },
    solutionFooterText: {
        fontSize: 20,
        color: BrandColors.primaryLight,
        textAlign: 'center',
        marginTop: 40,
        fontWeight: '700',
    },
    featureLabel: {
        fontSize: 36,
        fontWeight: '900',
        color: BrandColors.navy,
        marginBottom: 48,
        textAlign: 'center',
    },
    featurePoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
        marginBottom: 32,
        backgroundColor: '#F1F5F9',
        padding: 24,
        borderRadius: 24,
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureContent: {
        fontSize: 18,
        color: BrandColors.navy,
        lineHeight: 28,
        fontWeight: '500',
    },
    featureClose: {
        fontSize: 18,
        color: BrandColors.slate,
        fontWeight: '900',
        textAlign: 'center',
        marginTop: 20,
        letterSpacing: 1,
    },
    benefitsTitle: {
        fontSize: 38,
        fontWeight: '900',
        color: BrandColors.white,
        textAlign: 'center',
    },
    benefitsSubtitle: {
        fontSize: 22,
        color: BrandColors.primaryHover,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 60,
        fontWeight: '700',
    },
    benefitsVisualGrid: {
        flexDirection: 'row',
        gap: 40,
        alignItems: 'center',
    },
    benefitsImageContainer: {
        flex: 1.2,
        height: 500,
        borderRadius: 40,
        overflow: 'hidden',
    },
    benefitsMainImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '40%',
    },
    benefitsListContainer: {
        flex: 1,
        gap: 24,
    },
    benefitBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    checkIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitItemText: {
        fontSize: 20,
        fontWeight: '800',
        color: BrandColors.white,
    },
    sectionRisk: {
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
    riskGradient: {
        padding: 60,
        borderRadius: 40,
        alignItems: 'center',
    },
    riskTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: BrandColors.white,
        textAlign: 'center',
        marginTop: 24,
    },
    riskBody: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 30,
        marginTop: 16,
        maxWidth: 700,
    },
    sectionTitleCenter: {
        fontSize: 32,
        fontWeight: '900',
        color: BrandColors.navy,
        textAlign: 'center',
        marginBottom: 50,
    },
    testimonialsScroll: {
        paddingHorizontal: 24,
        gap: 24,
    },
    testimonialCard: {
        backgroundColor: '#FFFFFF',
        width: 320,
        padding: 32,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Explicit border
        shadowColor: '#0F172A', // Navy shadow instead of black
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1, // Increased opacity
        shadowRadius: 24,
        elevation: 6,
        marginRight: 24, // Ensure spacing is handled by card margin if container fails
    },
    testimonialText: {
        fontSize: 18, // Increased size
        color: '#1E293B', // Slate 800 - Very dark
        lineHeight: 28,
        fontStyle: 'italic',
        fontWeight: '500', // Added weight
        marginVertical: 24,
    },
    testimonialFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: BrandColors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: BrandColors.primary,
        fontSize: 18,
        fontWeight: '900',
    },
    testimonialName: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.navy,
    },
    sectionFinal: {
        paddingVertical: 120,
        paddingHorizontal: 24,
        backgroundColor: BrandColors.white,
        alignItems: 'center',
    },
    finalQuestion: {
        fontSize: 36,
        fontWeight: '900',
        color: BrandColors.navy,
        textAlign: 'center',
        marginBottom: 60,
        maxWidth: 800,
    },
    ctaStack: {
        width: '100%',
        maxWidth: 1000,
        gap: 16,
    },
    rowCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    finalCta: {
        flex: 1,
        maxWidth: 320,
    },
    ctaGrad: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    ctaTextSmall: {
        color: BrandColors.white,
        fontSize: 15,
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerSize: {
        height: 100,
    },
    footer: {
        paddingVertical: 60,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: BrandColors.border,
    },
    footerText: {
        fontSize: 14,
        color: BrandColors.slate,
    },
    flex1: { flex: 1 },
});
