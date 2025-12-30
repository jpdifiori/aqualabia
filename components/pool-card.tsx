"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-white dark:bg-slate-800">
                <div
                    className="h-32 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center"
                    onClick={() => onSelect(pool.id)}
                >
                    <Waves className="h-16 w-16 text-white/80" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-lg">
                        <span className="truncate">{pool.name}</span>
                        <span className="text-xs font-normal bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                            {pool.volume.toLocaleString()} L
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {t(`materials.${pool.material || 'concrete'}`)} • {t(`shapes.${pool.shape || 'rectangular'}`)}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(pool.id)}>
                                <Edit className="h-4 w-4 text-slate-500 hover:text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(pool.id)}>
                                <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
