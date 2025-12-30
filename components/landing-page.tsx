"use client";

import { Button } from "@/components/ui/button";
import { TermsModal } from "@/components/ui/terms-modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    ArrowRight,
    Droplets,
    Github,
    Heart,
    ShieldCheck,
    Star,
    Waves,
    Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const testimonials = [
    { name: "Carlos R.", role: "Dueño de casa", text: "aqualabia me salvó el verano. Antes el agua siempre estaba turbia, ahora es un cristal.", avatar: "CR" },
    { name: "Lucía M.", role: "Administradora de complejos", text: "Gestionar 5 piletas era una pesadilla. Con esta app, sé exactamente qué hacer cada día.", avatar: "LM" },
    { name: "Jorge P.", role: "Usuario entusiasta", text: "La precisión de la IA para leer el pH es asombrosa. Ahorré un 40% en químicos.", avatar: "JP" },
    { name: "Marta S.", role: "Abuela precavida", text: "Me da paz mental saber que el agua es segura para mis nietos. Muy fácil de usar.", avatar: "MS" },
    { name: "Andrés T.", role: "Ingeniero", text: "Diseño impecable y funcionalidad impecable. La mejor herramienta técnica para piletas.", avatar: "AT" },
    { name: "Sofía V.", role: "Casa de fin de semana", text: "Llego los viernes y el agua está perfecta gracias al plan inteligente. ¡Recomendado!", avatar: "SV" },
    { name: "Ricardo G.", role: "Mantenimiento profesional", text: "Uso la app para mis clientes. Les encanta ver el historial y la transparencia del proceso.", avatar: "RG" },
    { name: "Elena B.", role: "Deportista", text: "Entreno a diario en mi pileta. Mantenerla impecable nunca fue tan sencillo.", avatar: "EB" },
    { name: "Pablo M.", role: "Padre de familia", text: "Mis hijos viven en el agua. PoolPal me asegura que no haya riesgos sanitarios.", avatar: "PM" },
    { name: "Valeria D.", role: "Amante del diseño", text: "La interfaz es hermosa y moderna. Da gusto usarla cada mañana.", avatar: "VD" },
];

export function LandingPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    return (
        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
            {/* Hero Section */}
            <section ref={targetRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12 px-6">
                <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-white dark:to-slate-950 z-10" />
                    <Image
                        src="/images/landing/hero_pool.png"
                        alt="Modern Luxury Pool"
                        fill
                        className="object-cover opacity-60 dark:opacity-40"
                        priority
                    />
                </motion.div>

                <div className="container mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
                            <Zap className="h-4 w-4 fill-current" /> {t("hero.badge")}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto px-4">
                            {t("hero.title_1")} <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 italic">{t("hero.title_2")}</span>
                        </h1>
                        <p className="max-w-md md:max-w-lg mx-auto text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed px-4">
                            {t("hero.subtitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register">
                                <Button className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                                    {t("common.start_free")} <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                                    {t("common.login")}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Micro-animations Background */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-20" />
            </section>

            {/* Importance Section */}
            <section className="py-16 px-6 relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 relative aspect-[4/3] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-xl"
                        >
                            <Image
                                src="/images/landing/clean_water.png"
                                alt="Crystal Clear Water"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
                        </motion.div>

                        <div className="md:col-span-3 space-y-6">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-800 dark:text-white">
                                {t("importance.title")} <br />
                                <span className="text-blue-600 italic">{t("importance.subtitle")}</span>
                            </h2>
                            <div className="space-y-4 text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                                <p>{t("importance.text_1")}</p>
                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                    {t("importance.text_2")}
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    { icon: ShieldCheck, title: t("importance.feature_1_title"), desc: t("importance.feature_1_desc") },
                                    { icon: Zap, title: t("importance.feature_2_title"), desc: t("importance.feature_2_desc") },
                                    { icon: Heart, title: t("importance.feature_3_title"), desc: t("importance.feature_3_desc") }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                                    >
                                        <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shrink-0">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider mb-0.5">{item.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risks & Diseases Section */}
            <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 tracking-tight px-4">
                            {t("risks.title")} <br /><span className="text-red-500 uppercase">{t("risks.subtitle")}</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm px-6">
                            {t("risks.intro")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12 items-center">
                        <div className="md:col-span-3 grid grid-cols-1 gap-4 order-2 md:order-1">
                            {[
                                { title: t("risks.risk_1_name"), level: t("risks.level_alto"), desc: t("risks.risk_1_desc") },
                                { title: t("risks.risk_2_name"), level: t("risks.level_medio"), desc: t("risks.risk_2_desc") },
                                { title: t("risks.risk_3_name"), level: t("risks.level_critico"), desc: t("risks.risk_3_desc") },
                                { title: t("risks.risk_4_name"), level: t("risks.level_alto"), desc: t("risks.risk_4_desc") }
                            ].map((risk, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center group hover:border-red-100 dark:hover:border-red-900/30 transition-all"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm sm:text-base">{risk.title}</h4>
                                        <p className="text-[10px] sm:text-xs text-slate-500 max-w-xs mt-0.5">{risk.desc}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black tracking-widest border shrink-0 ml-4 ${risk.level === t("risks.level_critico") ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                        {risk.level}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 relative aspect-video md:aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 order-1 md:order-2"
                        >
                            <Image
                                src="/images/landing/health_risks.png"
                                alt="Health Risks Visual"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Carousel (Infinite Slider) */}
            <section className="py-16 overflow-hidden bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 mb-12 flex flex-col items-center">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center mb-4 uppercase">
                        {t("results.title").split(' ')[0]} {t("results.title").split(' ')[1]} <span className="text-blue-600 italic">{t("results.title").split(' ').slice(2).join(' ')}</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-center max-w-lg text-sm md:text-base">
                        {t("results.subtitle")}
                    </p>
                </div>

                <div className="relative flex overflow-hidden group">
                    {/* First set */}
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ ease: "linear", duration: 60, repeat: Infinity }}
                        className="flex gap-4 md:gap-6 whitespace-nowrap py-10"
                    >
                        {[...testimonials, ...testimonials].map((t, i) => (
                            <div
                                key={i}
                                className="w-[280px] sm:w-[350px] flex-shrink-0 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-300 shadow-sm"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white leading-tight text-sm sm:text-base">{t.name}</h4>
                                        <p className="text-[10px] sm:text-xs text-blue-500 font-bold uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4 text-orange-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />)}
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-normal italic">
                                    "{t.text}"
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Expert Guidance Lead-in */}
                <div className="container mx-auto px-6 mt-8 md:mt-12">
                    <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-center">
                        <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic px-2">
                            {t("results.guidance")}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-10 md:p-14 rounded-[40px] bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-center relative overflow-hidden"
                    >
                        <Droplets className="absolute -top-10 -right-10 h-64 w-64 text-white/10 rotate-12" />
                        <Waves className="absolute -bottom-10 -left-10 h-64 w-64 text-white/5" />

                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.1] px-4">
                            {t("cta_final.title")}
                        </h2>
                        <p className="max-w-md md:max-w-xl mx-auto text-blue-100 text-sm sm:text-base md:text-lg font-medium mb-10 leading-relaxed px-6">
                            {t("cta_final.subtitle")}
                        </p>
                        <Link href="/register">
                            <Button className="h-16 px-12 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 text-xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95">
                                {t("common.create_account")}
                            </Button>
                        </Link>
                        <p className="mt-8 text-blue-200 text-xs font-bold uppercase tracking-[0.2em]">{t("cta_final.tagline")}</p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t dark:border-slate-800">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-6 w-6 text-blue-500" />
                        <span className="text-xl font-bold tracking-tighter">aqualabia</span>
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <button
                            onClick={() => setIsTermsOpen(true)}
                            className="hover:text-blue-500 transition-colors uppercase tracking-widest font-bold"
                        >
                            Terms
                        </button>
                        <Link href="#" className="hover:text-blue-500 transition-colors">Contact</Link>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full"><Github className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full"><Heart className="h-5 w-5 text-red-500" /></Button>
                    </div>
                </div>
                <div className="container mx-auto text-center mt-12 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} aqualabia. Design with precision and care.
                </div>
            </footer>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
}
