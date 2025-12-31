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
        <nav className="w-full border-b bg-white dark:bg-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 group">
                <Droplets className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold tracking-tighter hidden sm:inline">aqualabia</span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Language Selector */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-1 px-2 text-xs font-bold text-slate-600 dark:text-slate-400"
                    >
                        <Languages className="h-4 w-4" />
                        <span className="uppercase">{language}</span>
                    </Button>

                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute right-0 mt-2 w-24 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 overflow-hidden"
                            >
                                <button
                                    onClick={() => { setLanguage("es"); setIsLangOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${language === "es" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                                >
                                    Español
                                </button>
                                <button
                                    onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${language === "en" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                                >
                                    English
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                        >
                            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium hidden md:block text-slate-700 dark:text-slate-200">
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
                    <div className="flex gap-2">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">{t("common.login")}</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">{t("common.register")}</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
