"use client";

import { MaintenanceSchedule } from "@/components/maintenance-schedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { analyzeTestStrip, analyzeWaterQuality, generateTreatmentPlan } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { addDays, format } from "date-fns";
import {
    ArrowLeft,
    Beaker,
    Camera,
    Droplets,
    History,
    Maximize2,
    Ruler,
    Shapes,
    Waves
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PoolDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const router = useRouter();
    const [pool, setPool] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState("analysis");

    // Manual measurements state
    const [measurements, setMeasurements] = useState({
        ph: "7.2",
        free_chlorine: "1.5",
        alkalinity: "100",
        hardness: "250",
        cya: "40",
        clarity: "clear"
    });

    const [treatmentPlan, setTreatmentPlan] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchPoolData = async () => {
            if (!user || !id) return;
            try {
                const { data, error } = await supabase
                    .from('pools')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setPool(data);

                // Fetch measurements history
                const { data: histData, error: histError } = await supabase
                    .from('measurements')
                    .select('*')
                    .eq('pool_id', id)
                    .order('measured_at', { ascending: false });

                if (!histError) setHistory(histData || []);

            } catch (err: any) {
                toast.error("Error al cargar los datos de la pileta");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchPoolData();
    }, [id, user, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'water' | 'strip') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
                let result;
                if (type === 'water') {
                    result = await analyzeWaterQuality(base64, language);
                    if (result) {
                        toast.success(t("common.loading"));
                        // Automatically generate treatment plan based on diagnosis
                        const plan = await generateTreatmentPlan(pool, { ...measurements, clarity: result.clarity }, language);
                        setTreatmentPlan(plan);

                        // Save measurement and tasks
                        await supabase.from('measurements').insert({
                            pool_id: id,
                            ph: parseFloat(measurements.ph),
                            free_chlorine: parseFloat(measurements.free_chlorine),
                            total_alkalinity: parseInt(measurements.alkalinity),
                            calcium_hardness: parseInt(measurements.hardness),
                            cyanuric_acid: parseInt(measurements.cya),
                            water_clarity: result.clarity,
                            ai_analysis_json: plan,
                            recommendation_text: plan.status_summary || "Plan generado via foto"
                        });

                        if (plan.maintenance_plan_daily) {
                            const todayLocal = format(new Date(), 'yyyy-MM-dd');

                            // Remove future uncompleted tasks for this pool to refresh the plan
                            await supabase
                                .from('maintenance_tasks')
                                .delete()
                                .eq('pool_id', id)
                                .eq('is_completed', false)
                                .gte('scheduled_date', todayLocal);

                            const tasksToInsert = plan.maintenance_plan_daily.flatMap((dayData: any) => {
                                const scheduledDate = addDays(new Date(), dayData.day_index);
                                const dateStr = format(scheduledDate, 'yyyy-MM-dd');

                                return dayData.tasks.map((task: any) => ({
                                    pool_id: id,
                                    scheduled_date: dateStr,
                                    action: task.action,
                                    note: task.note,
                                    is_completed: false
                                }));
                            });

                            if (tasksToInsert.length > 0) {
                                await supabase.from('maintenance_tasks').insert(tasksToInsert);
                            }
                        }

                        toast.success("Análisis y plan de mantenimiento guardados");
                    }
                } else {
                    result = await analyzeTestStrip(base64, language);
                    if (result) {
                        setMeasurements({
                            ph: result.ph.toString(),
                            free_chlorine: result.free_chlorine.toString(),
                            alkalinity: result.alkalinity.toString(),
                            hardness: (result.hardness || 250).toString(),
                            cya: (result.cya || 40).toString(),
                            clarity: measurements.clarity
                        });
                        toast.success("Tira reactiva analizada correctamente");
                    }
                }
            } catch (err) {
                toast.error("Error al analizar la imagen");
            } finally {
                setAnalyzing(false);
            }
        };
    };

    const handleManualSubmit = async () => {
        setAnalyzing(true);
        try {
            const numericMeasurements = {
                ph: parseFloat(measurements.ph),
                free_chlorine: parseFloat(measurements.free_chlorine),
                alkalinity: parseInt(measurements.alkalinity),
                hardness: parseInt(measurements.hardness),
                cya: parseInt(measurements.cya),
                clarity: measurements.clarity
            };

            const plan = await generateTreatmentPlan(pool, numericMeasurements, language);
            setTreatmentPlan(plan);

            // Save measurement
            const { error: measError } = await supabase.from('measurements').insert({
                pool_id: id,
                ph: numericMeasurements.ph,
                free_chlorine: numericMeasurements.free_chlorine,
                total_alkalinity: numericMeasurements.alkalinity,
                calcium_hardness: numericMeasurements.hardness,
                cyanuric_acid: numericMeasurements.cya,
                water_clarity: numericMeasurements.clarity,
                ai_analysis_json: plan,
                recommendation_text: plan.status_summary || "Plan generado"
            });

            if (measError) throw measError;

            // Persist maintenance tasks if available
            if (plan.maintenance_plan_daily) {
                const todayLocal = format(new Date(), 'yyyy-MM-dd');

                // Remove future uncompleted tasks for this pool to refresh the plan
                await supabase
                    .from('maintenance_tasks')
                    .delete()
                    .eq('pool_id', id)
                    .eq('is_completed', false)
                    .gte('scheduled_date', todayLocal);

                const tasksToInsert = plan.maintenance_plan_daily.flatMap((dayData: any) => {
                    const scheduledDate = addDays(new Date(), dayData.day_index);
                    const dateStr = format(scheduledDate, 'yyyy-MM-dd');

                    return dayData.tasks.map((task: any) => ({
                        pool_id: id,
                        scheduled_date: dateStr,
                        action: task.action,
                        note: task.note,
                        is_completed: false
                    }));
                });

                if (tasksToInsert.length > 0) {
                    const { error: taskError } = await supabase.from('maintenance_tasks').insert(tasksToInsert);
                    if (taskError) console.error("Error saving tasks:", taskError);
                }
            }

            toast.success("Medición guardada y plan generado");

            // Refresh history
            const { data: histData } = await supabase
                .from('measurements')
                .select('*')
                .eq('pool_id', id)
                .order('measured_at', { ascending: false });
            setHistory(histData || []);

        } catch (err) {
            toast.error("Error al procesar los datos");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">{t("common.loading")}</div>;
    if (!pool) return null;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {pool.name} <Waves className="h-6 w-6 text-blue-500" />
                    </h1>
                    <p className="text-slate-500 capitalize">{pool.material} • {pool.volume.toLocaleString()} L</p>
                </div>
            </div>

            {/* Pool Characteristics Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm flex items-center p-4 gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                        <Maximize2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dimensiones</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {pool.length}m x {pool.width}m
                        </p>
                    </div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm flex items-center p-4 gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl">
                        <Droplets className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Volumen</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {pool.volume.toLocaleString()} L
                        </p>
                    </div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm flex items-center p-4 gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                        <Shapes className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forma</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white capitalize">
                            {pool.shape || "Rectangular"}
                        </p>
                    </div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm flex items-center p-4 gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                        <Ruler className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profundidad</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {pool.depth} m
                        </p>
                    </div>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger value="analysis" className="gap-2">
                        <Camera className="h-4 w-4" /> {t("nav.dashboard")}
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="gap-2">
                        <Beaker className="h-4 w-4" /> {t("common.edit")}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <History className="h-4 w-4" /> {t("nav.pools")}
                    </TabsTrigger>
                </TabsList>

                {/* AI Analysis Tab */}
                <TabsContent value="analysis" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-dashed border-2 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 transition-colors">
                            <CardHeader className="text-center">
                                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2">
                                    <Camera className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                </div>
                                <CardTitle>Foto del Agua</CardTitle>
                                <CardDescription>Saca una foto a la pileta para ver la claridad y posibles algas.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Label className="cursor-pointer">
                                    <Input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={(e) => handleImageUpload(e, 'water')}
                                        disabled={analyzing}
                                    />
                                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        {analyzing ? "Analizando..." : "Tomar Foto"}
                                    </div>
                                </Label>
                            </CardContent>
                        </Card>

                        <Card className="border-dashed border-2 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 transition-colors flex flex-col">
                            <CardHeader className="text-center">
                                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-2">
                                    <Droplets className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                                </div>
                                <CardTitle>Análisis de Tira</CardTitle>
                                <CardDescription>Fotografía tus tiras reactivas para que la IA cargue los valores por ti.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4 mt-auto">
                                <div className="flex flex-wrap justify-center gap-3 w-full">
                                    <Label className="cursor-pointer">
                                        <Input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => handleImageUpload(e, 'strip')}
                                            disabled={analyzing}
                                        />
                                        <div className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                                            {analyzing ? "Analizando..." : <><Camera className="h-4 w-4" /> Escanear Tira</>}
                                        </div>
                                    </Label>
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-purple-200 hover:bg-purple-50 gap-2"
                                        onClick={() => setActiveTab("manual")}
                                    >
                                        <Beaker className="h-4 w-4 text-purple-600" /> Cargar Manual
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Guidance Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <h4 className="font-bold text-sm">pH Balanceado</h4>
                                </div>
                                <p className="text-xs text-slate-500">El rango ideal es 7.2 a 7.6. Fuera de esto, el cloro pierde efectividad y puede irritar los ojos.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <h4 className="font-bold text-sm">Cloro Libre</h4>
                                </div>
                                <p className="text-xs text-slate-500">Mantenlo entre 1 y 3 ppm. Es lo que mantiene el agua libre de bacterias y algas.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                    <h4 className="font-bold text-sm">Alcalinidad</h4>
                                </div>
                                <p className="text-xs text-slate-500">El rango ideal es 80-120 ppm. Ayuda a "frenar" los cambios bruscos de pH.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {treatmentPlan && (
                        <div className="mt-8">
                            <MaintenanceSchedule plan={treatmentPlan} poolId={id as string} />
                        </div>
                    )}
                </TabsContent>

                {/* Manual Measurement Tab */}
                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Carga de Valores Manual</CardTitle>
                            <CardDescription>Ingresa los resultados de tu test químico.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                {/* pH Visual Help */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-[11px] font-bold mb-2 flex items-center gap-2">
                                        <Beaker className="h-3 w-3 text-pink-500" /> Color pH
                                    </h4>
                                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-300 via-emerald-500 to-red-600 mb-1" />
                                    <div className="flex justify-between text-[9px] font-medium text-slate-500">
                                        <span>6.8</span>
                                        <span className="text-emerald-600 font-bold">7.2 - 7.6</span>
                                        <span>8.2</span>
                                    </div>
                                </div>

                                {/* Chlorine Visual Help */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-[11px] font-bold mb-2 flex items-center gap-2">
                                        <Droplets className="h-3 w-3 text-blue-500" /> Color Cloro (ppm)
                                    </h4>
                                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-white via-yellow-200 to-yellow-600 mb-1" />
                                    <div className="flex justify-between text-[9px] font-medium text-slate-500">
                                        <span>0</span>
                                        <span className="text-blue-600 font-bold">1.0 - 3.0</span>
                                        <span>5.0+</span>
                                    </div>
                                </div>

                                {/* Alkalinity Visual Help */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-[11px] font-bold mb-2 flex items-center gap-2">
                                        <Waves className="h-3 w-3 text-orange-500" /> Alcalinidad (ppm)
                                    </h4>
                                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-100 via-emerald-200 to-blue-900 mb-1" />
                                    <div className="flex justify-between text-[9px] font-medium text-slate-500">
                                        <span>40</span>
                                        <span className="text-orange-600 font-bold">80 - 120</span>
                                        <span>180+</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-500 mb-6 italic bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                                💡 Compara los colores de tu tira reactiva o kit de gotas con las escalas de arriba para obtener los valores.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>pH (6.8 - 8.2)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={measurements.ph}
                                        onChange={(e) => setMeasurements({ ...measurements, ph: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cloro Libre (ppm)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={measurements.free_chlorine}
                                        onChange={(e) => setMeasurements({ ...measurements, free_chlorine: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alcalinidad (ppm)</Label>
                                    <Input
                                        type="number"
                                        value={measurements.alkalinity}
                                        onChange={(e) => setMeasurements({ ...measurements, alkalinity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Claridad del Agua</Label>
                                    <select
                                        className="w-full border rounded-md p-2 bg-background"
                                        value={measurements.clarity}
                                        onChange={(e) => setMeasurements({ ...measurements, clarity: e.target.value })}
                                    >
                                        <option value="clear">Cristalina</option>
                                        <option value="cloudy">Turbia</option>
                                        <option value="algae">Presencia de Algas</option>
                                        <option value="very_dirty">Muy Sucia</option>
                                    </select>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleManualSubmit}
                                disabled={analyzing}
                            >
                                {analyzing ? "Procesando..." : "Generar Plan de Acción"}
                            </Button>
                        </CardContent>
                    </Card>

                    {treatmentPlan && (
                        <div className="mt-8">
                            <MaintenanceSchedule plan={treatmentPlan} poolId={id as string} />
                        </div>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No hay registros previos.</div>
                        ) : (
                            history.map((h) => (
                                <Card key={h.id}>
                                    <CardHeader className="py-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm font-bold">
                                                {new Date(h.measured_at).toLocaleDateString()} - {new Date(h.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </CardTitle>
                                            <div className="text-xs px-2 py-1 bg-slate-100 rounded-full flex items-center gap-1">
                                                <History className="h-3 w-3" /> Registro
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                            <div><span className="text-slate-500">pH:</span> {h.ph}</div>
                                            <div><span className="text-slate-500">Cloro:</span> {h.free_chlorine} ppm</div>
                                            <div><span className="text-slate-500">Alcalinidad:</span> {h.total_alkalinity} ppm</div>
                                            <div className="capitalize"><span className="text-slate-500">Claridad:</span> {h.water_clarity}</div>
                                        </div>
                                        {h.recommendation_text && (
                                            <div className="mt-3 p-2 bg-slate-50 rounded text-xs border-l-4 border-blue-400">
                                                {h.recommendation_text}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
