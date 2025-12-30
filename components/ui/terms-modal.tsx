"use client";

import { useLanguage } from "@/context/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./button";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
    const { t } = useLanguage();

    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-white/20"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                        <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {t("terms.title")}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                                <p className="font-medium text-slate-900 dark:text-white italic">
                                    {t("terms.intro")}
                                </p>

                                <p>{t("terms.p1")}</p>

                                <div className="space-y-3">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">
                                        {t("terms.p2")}
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                                        <li>{t("terms.item1")}</li>
                                        <li>{t("terms.item2")}</li>
                                        <li>{t("terms.item3")}</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-xl">
                                    <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                                        {t("terms.p3")}
                                    </p>
                                </div>

                                <p className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    {t("terms.p4")}
                                </p>

                                <p className="text-center font-black text-slate-900 dark:text-white pt-4">
                                    {t("terms.p5")}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
                                <Button variant="outline" onClick={onClose} className="rounded-full">
                                    {t("terms.close")}
                                </Button>
                                <Button
                                    onClick={onClose}
                                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8"
                                >
                                    {t("terms.accept")}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
