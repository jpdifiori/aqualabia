"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { Droplets, Languages, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";

export function Navbar() {
    const { user, signOut } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    return (
        <header className="w-full sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
            {/* Row 1: Brand & Language */}
            <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="bg-blue-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                        <Droplets className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">aqualabia</span>
                </Link>

                {/* Language Selector in Top Row */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all"
                    >
                        <Languages className="h-4 w-4" />
                        <span>{language}</span>
                    </button>

                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 py-1 overflow-hidden z-[60]"
                            >
                                <button
                                    onClick={() => { setLanguage("es"); setIsLangOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${language === "es" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                                >
                                    Español
                                </button>
                                <button
                                    onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${language === "en" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                                >
                                    English
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Row 2: Auth Actions / Profile */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
                <nav className="container mx-auto px-4 sm:px-6 py-2.5 flex justify-end items-center">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 hover:bg-white dark:hover:bg-slate-800 p-1 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-2">
                                    {user.user_metadata?.full_name || "Usuario"}
                                </span>
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 z-[60]"
                                    >
                                        <Link
                                            href="/"
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Droplets className="h-4 w-4 text-blue-500" />
                                            {t("nav.pools")}
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <UserIcon className="h-4 w-4 text-slate-400" />
                                            {t("common.edit")}
                                        </Link>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                setIsMenuOpen(false);
                                                router.replace("/");
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t("nav.logout")}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className="h-9 px-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                                    {t("common.login")}
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="h-9 px-6 text-xs font-black uppercase tracking-widest rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                                    {t("common.register")}
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
