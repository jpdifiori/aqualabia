"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Edit, Trash2, Waves } from "lucide-react";

interface Pool {
    id: string;
    name: string;
    volume: number;
    material?: string;
    shape?: string;
    image_url?: string;
    last_treatment_plan?: any;
}

interface PoolCardProps {
    pool: Pool;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
}

export function PoolCard({ pool, onEdit, onDelete, onSelect }: PoolCardProps) {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-3xl bg-white dark:bg-slate-900 group relative"
            >
                {/* Header Image Area */}
                <div
                    className="h-40 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 relative overflow-hidden cursor-pointer"
                    onClick={() => onSelect(pool.id)}
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <Waves className="h-16 w-16 text-white drop-shadow-md" />
                    </div>

                    {/* Status Pill - Absolute Positioned */}
                    {pool.last_treatment_plan?.status_summary ? (
                        <div className="absolute bottom-3 left-4 right-4">
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-2 flex items-center gap-2 shadow-sm">
                                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${pool.last_treatment_plan.priority === 'alta' ? 'bg-red-500 animate-pulse box-shadow-red' :
                                    pool.last_treatment_plan.priority === 'media' ? 'bg-orange-500' : 'bg-green-500'
                                    }`} />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex-1">
                                    {pool.last_treatment_plan.status_summary}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute bottom-3 left-4">
                            <div className="bg-white/20 backdrop-blur-md rounded-lg px-2 py-1">
                                <span className="text-[10px] text-white font-medium">Sin análisis</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1" onClick={() => onSelect(pool.id)}>
                                {pool.name}
                            </h3>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                                {pool.volume.toLocaleString()} Litros
                            </p>
                        </div>
                        {/* Quick Actions */}
                        <div className="flex -mr-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" onClick={() => onEdit(pool.id)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" onClick={() => onDelete(pool.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {t(`materials.${pool.material || 'concrete'}`)}
                        </span>
                        <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {t(`shapes.${pool.shape || 'rectangular'}`)}
                        </span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
