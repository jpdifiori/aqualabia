"use client";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CalendarIcon, Check, CheckCircle2, Info, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface MaintenanceScheduleProps {
    plan: any;
    poolId?: string;
}

export function MaintenanceSchedule({ plan, poolId }: MaintenanceScheduleProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [days, setDays] = useState<Date[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate 30 days starting from today
        const generatedDays = Array.from({ length: 60 }, (_, i) => addDays(new Date(), i));
        setDays(generatedDays);
        setSelectedDate(generatedDays[0]);
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!poolId) return;
            setLoadingTasks(true);
            try {
                const { data, error } = await supabase
                    .from('maintenance_tasks')
                    .select('*')
                    .eq('pool_id', poolId)
                    .order('scheduled_date', { ascending: true });

                if (error) throw error;
                setTasks(data || []);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, [poolId, plan]);

    if (!plan) return null;

    // Get tasks for the selected day from persistent list
    const tasksForDay = tasks.filter(t => isSameDay(new Date(t.scheduled_date + 'T12:00:00'), selectedDate));

    const handleToggleTask = async (taskId: string, currentState: boolean) => {
        try {
            const { error } = await supabase
                .from('maintenance_tasks')
                .update({
                    is_completed: !currentState,
                    completed_at: !currentState ? new Date().toISOString() : null
                })
                .eq('id', taskId);

            if (error) throw error;

            // Update local state
            setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentState } : t));

            if (!currentState) {
                toast.success("Tarea completada");
            }
        } catch (err) {
            toast.error("Error al actualizar la tarea");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Status Summary */}
            <div className={cn(
                "p-4 rounded-2xl flex items-start gap-4 border shadow-sm",
                plan.priority === 'alta' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20' :
                    plan.priority === 'media' ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20' :
                        'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20'
            )}>
                <AlertTriangle className={cn(
                    "h-6 w-6 mt-1 flex-shrink-0",
                    plan.priority === 'alta' ? 'text-red-500' :
                        plan.priority === 'media' ? 'text-orange-500' :
                            'text-green-500'
                )} />
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-1">Diagnóstico IA</h3>
                    <p className="text-slate-900 dark:text-white font-medium leading-relaxed">{plan.status_summary}</p>
                </div>
            </div>

            {/* Shopping List */}
            {plan.shopping_list?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <Waves className="h-4 w-4" /> Compras Necesarias (2 Meses)
                    </h3>
                    <div className="grid gap-3">
                        {plan.shopping_list.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{item.item}</p>
                                    <p className="text-[10px] text-slate-500">{item.notes}</p>
                                </div>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                                    {item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Immediate Recovery Steps */}
            {plan.immediate_steps?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Waves className="h-5 w-5 text-blue-500" /> Plan de Recuperación Inmediata
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.immediate_steps.map((step: any, i: number) => (
                            <Card key={i} className="bg-white dark:bg-slate-800 border-none shadow-sm p-4 flex gap-4">
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black flex-shrink-0">
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase">{step.action}</h4>
                                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                                        {step.product} • {step.amount}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{step.instructions}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Linear Calendar */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        Cronograma Semanal
                    </h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        Próximos 60 días
                    </span>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide no-scrollbar items-center mask-fade-edges"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {days.map((date, i) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const tasksThisDay = tasks.filter(t => isSameDay(new Date(t.scheduled_date + 'T12:00:00'), date));
                        const hasTasks = tasksThisDay.length > 0;
                        const allCompleted = hasTasks && tasksThisDay.every(t => t.is_completed);

                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border relative",
                                    isSelected
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                                        : allCompleted
                                            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400"
                                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase",
                                    isSelected ? "text-blue-100" : allCompleted ? "text-green-600" : "text-slate-400"
                                )}>
                                    {format(date, 'eee', { locale: es })}
                                </span>
                                <span className="text-xl font-black">{format(date, 'd')}</span>
                                {hasTasks && !isSelected && !allCompleted && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                )}
                                {allCompleted && !isSelected && (
                                    <Check className="absolute top-2 right-2 h-3 w-3 text-green-500" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Daily Tasks Detail */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedDate.toISOString()}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[200px]"
                >
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                Tareas para el {format(selectedDate, "d 'de' MMMM", { locale: es })}
                            </h4>
                            {tasksForDay.length > 0 && (
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                                    {tasksForDay.filter(t => t.is_completed).length} / {tasksForDay.length} completadas
                                </span>
                            )}
                        </div>

                        {loadingTasks ? (
                            <div className="flex justify-center py-12">
                                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : tasksForDay.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                <CheckCircle2 className="h-12 w-12 mb-3 opacity-20" />
                                <p className="font-medium">No hay tareas programadas para hoy.</p>
                                <p className="text-xs">¡Disfruta de tu pileta!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasksForDay.map((task: any, i: number) => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "flex gap-4 group p-3 rounded-2xl transition-all border cursor-pointer",
                                            task.is_completed
                                                ? "bg-green-50/50 border-green-100 dark:bg-green-900/5 dark:border-green-900/10"
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200"
                                        )}
                                        onClick={() => handleToggleTask(task.id, task.is_completed)}
                                    >
                                        <div className={cn(
                                            "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                            task.is_completed
                                                ? "bg-green-500 border-green-500 text-white"
                                                : "border-slate-200 dark:border-slate-600 text-slate-300 group-hover:border-blue-500"
                                        )}>
                                            {task.is_completed ? <Check className="h-5 w-5" /> : (i + 1)}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className={cn(
                                                "font-bold text-sm uppercase transition-all",
                                                task.is_completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                                            )}>
                                                {task.action}
                                            </h5>
                                            {task.note && (
                                                <div className="flex items-start gap-2 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                                                    <Info className="h-3 w-3 mt-0.5 text-blue-400" />
                                                    <p>{task.note}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Final Summary */}
            {plan.final_summary && (
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                    <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Resumen del Experto</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                        "{plan.final_summary}"
                    </p>
                </div>
            )}

            {/* Warnings Section - Compact */}
            {plan.warnings?.length > 0 && (
                <div className="p-4 bg-slate-900 rounded-2xl border-l-4 border-yellow-500">
                    <h4 className="font-bold text-white text-xs mb-2 flex items-center gap-2 uppercase tracking-widest">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" /> Reglas Prácticas
                    </h4>
                    <ul className="space-y-1">
                        {plan.warnings.map((w: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                                <span className="text-yellow-500">•</span> {w}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
}
