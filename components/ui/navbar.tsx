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
        <header className="w-full sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
            <nav className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <Droplets className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold tracking-tighter">aqualabia</span>
                </Link>

                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                            >
                                <div className="h-7 w-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs font-semibold hidden md:block text-slate-700 dark:text-slate-200">
                                    {user.user_metadata?.full_name || "Usuario"}
                                </span>
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1"
                                    >
                                        <Link
                                            href="/"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Droplets className="h-4 w-4" />
                                            {t("nav.pools")}
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            {t("common.edit")}
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                setIsMenuOpen(false);
                                                router.replace("/");
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t("nav.logout")}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex gap-1.5">
                            <Link href="/login">
                                <Button variant="ghost" className="h-8 px-3 text-xs font-bold">{t("common.login")}</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="h-8 px-4 text-xs font-black rounded-full transition-all active:scale-95 shadow-sm">{t("common.register")}</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Language Selector row below */}
            <div className="container mx-auto px-4 sm:px-6 pb-1.5 flex justify-end">
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"
                    >
                        <Languages className="h-3 w-3" />
                        <span>{language}</span>
                    </button>

                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute right-0 bottom-full mb-2 w-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden z-[60]"
                            >
                                <button
                                    onClick={() => { setLanguage("es"); setIsLangOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${language === "es" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                                >
                                    Español
                                </button>
                                <button
                                    onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${language === "en" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                                >
                                    English
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
