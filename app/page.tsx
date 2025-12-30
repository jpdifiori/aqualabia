"use client";

import { LandingPage } from "@/components/landing-page";
import { MaintenanceSchedule } from "@/components/maintenance-schedule";
import { PoolCard } from "@/components/pool-card";
import { Button } from "@/components/ui/button";
import { TermsModal } from "@/components/ui/terms-modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Note: Lucide icons sometimes have different import names in different versions
import { Calendar as CalendarIcon, LayoutGrid as LayoutGridIcon, Plus as PlusIcon } from "lucide-react";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [pools, setPools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoolId, setSelectedPoolId] = useState<string>("");
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    useEffect(() => {
        const fetchPools = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('pools')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.error("Error fetching pools:", error);
                } else {
                    const poolData = data || [];
                    setPools(poolData);
                    if (poolData.length > 0) {
                        setSelectedPoolId(poolData[0].id);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPools();
    }, [user]);

    useEffect(() => {
        const fetchLatestPlan = async () => {
            if (!selectedPoolId) return;

            setLoadingPlan(true);
            try {
                const { data, error } = await supabase
                    .from('measurements')
                    .select('ai_analysis_json')
                    .eq('pool_id', selectedPoolId)
                    .not('ai_analysis_json', 'is', null)
                    .order('measured_at', { ascending: false })
                    .limit(1)
                    .single();

                if (!error && data) {
                    setSelectedPlan(data.ai_analysis_json);
                } else {
                    setSelectedPlan(null);
                }
            } catch (err) {
                setSelectedPlan(null);
            } finally {
                setLoadingPlan(false);
            }
        };

        fetchLatestPlan();
    }, [selectedPoolId]);

    const handleDelete = async (id: string) => {
        if (!confirm(t("dashboard.delete_confirm"))) return;

        try {
            const { error } = await supabase.from('pools').delete().eq('id', id);
            if (error) throw error;
            setPools(pools.filter(p => p.id !== id));
            toast.success("Pileta eliminada");
        } catch (err: any) {
            toast.error("Error al eliminar");
        }
    };

    if (authLoading || (loading && user)) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">{t("dashboard.loading_exp")}</p>
            </div>
        </div>
    );

    if (!user) return <LandingPage />;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t("dashboard.title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("dashboard.subtitle")}</p>
                </div>
                <Link href="/pools/create">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 h-11 px-6 text-base shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                        <PlusIcon className="h-5 w-5" />
                        {t("dashboard.new_pool")}
                    </Button>
                </Link>
            </div>

            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <LayoutGridIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold">{t("dashboard.overview")}</h2>
                </div>

                {pools.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("dashboard.start_journey")}</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">{t("dashboard.register_desc")}</p>
                        <Link href="/pools/create">
                            <Button variant="outline" className="h-11 px-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50">{t("dashboard.setup_first")}</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pools.map(pool => (
                            <PoolCard
                                key={pool.id}
                                pool={pool}
                                onEdit={(id) => router.push(`/pools/${id}/edit`)}
                                onDelete={handleDelete}
                                onSelect={(id) => router.push(`/pools/${id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {pools.length > 0 && (
                <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("dashboard.care_schedule")}</h2>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full px-4 border border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("dashboard.pool_selector")}</span>
                            <select
                                value={selectedPoolId}
                                onChange={(e) => setSelectedPoolId(e.target.value)}
                                className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-slate-900 dark:text-white min-w-[140px]"
                            >
                                {pools.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none min-h-[400px] flex flex-col">
                        {loadingPlan ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium">{t("dashboard.loading_schedule")}</p>
                            </div>
                        ) : selectedPlan ? (
                            <MaintenanceSchedule plan={selectedPlan} poolId={selectedPoolId} />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300">
                                    <CalendarIcon className="h-8 w-8" />
                                </div>
                                <div className="max-w-md">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.no_active_plan")}</h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {t("dashboard.no_plan_desc")}
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-2 text-blue-600 font-bold"
                                        onClick={() => router.push(`/pools/${selectedPoolId}`)}
                                    >
                                        {t("dashboard.go_analyze")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <footer className="pt-16 pb-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                    onClick={() => setIsTermsOpen(true)}
                    className="text-xs font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"
                >
                    {t("terms.title_short")}
                </button>
                <p className="mt-4 text-[10px] text-slate-300 dark:text-slate-700 font-bold uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} PoolPal AI. All rights reserved.
                </p>
            </footer>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
}
