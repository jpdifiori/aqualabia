"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Droplets, Ruler, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatePoolPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        material: "concrete",
        shape: "rectangular",
        length: "",
        width: "",
        depth: "",
    });

    const calculateVolume = () => {
        const l = parseFloat(formData.length) || 0;
        const w = parseFloat(formData.width) || 0;
        const d = parseFloat(formData.depth) || 0;
        return Math.round(l * w * d * 1000); // Liters
    };

    const handleNext = () => {
        if (step === 0 && !formData.name) {
            toast.error("Ingresa un nombre para tu pileta");
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const volume = calculateVolume();

            const { error } = await supabase.from('pools').insert({
                user_id: user.id,
                name: formData.name,
                material: formData.material,
                shape: formData.shape,
                length: parseFloat(formData.length) || 0,
                width: parseFloat(formData.width) || 0,
                depth: parseFloat(formData.depth) || 0,
                volume: volume,
            });

            if (error) throw error;

            toast.success("¡Pileta creada exitosamente!");
            router.push('/');

        } catch (err: any) {
            console.error("DEBUG: Save pool error:", err);
            toast.error(err.message || "Error al guardar la pileta (Failed to fetch)");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: t("pool_create.step_basic"), icon: Waves },
        { title: t("pool_create.step_dim"), icon: Ruler },
        { title: t("pool_create.step_confirm"), icon: Check },
    ];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center pt-10 px-4">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-8">
                {steps.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= i ? 'border-current bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300'}`}>
                            {i + 1}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">{s.title}</span>
                        {i < steps.length - 1 && <div className="w-8 h-0.5 bg-slate-200" />}
                    </div>
                ))}
            </div>

            <Card className="w-full max-w-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {step === 0 && t("pool_create.header_1")}
                        {step === 1 && t("pool_create.header_2")}
                        {step === 2 && t("pool_create.header_3")}
                    </CardTitle>
                    <CardDescription>
                        {step === 0 && t("pool_create.desc_1")}
                        {step === 1 && t("pool_create.desc_2")}
                        {step === 2 && t("pool_create.desc_3")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait" custom={step}>
                        <motion.div
                            key={step}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            variants={variants}
                            custom={step}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {step === 0 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t("pool_create.name_label")}</Label>
                                        <Input
                                            placeholder={t("pool_create.name_placeholder")}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pool_create.material_label")}</Label>
                                        <select
                                            className="w-full border rounded-md p-2 bg-background"
                                            value={formData.material}
                                            onChange={e => setFormData({ ...formData, material: e.target.value })}
                                        >
                                            <option value="concrete">{t("materials.concrete")}</option>
                                            <option value="fiberglass">{t("materials.fiberglass")}</option>
                                            <option value="vinyl">{t("materials.vinyl")}</option>
                                            <option value="tile">{t("materials.tile")}</option>
                                            <option value="other">{t("materials.other")}</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Forma</Label>
                                        <select
                                            className="w-full border rounded-md p-2 bg-background"
                                            value={formData.shape}
                                            onChange={e => setFormData({ ...formData, shape: e.target.value })}
                                        >
                                            <option value="rectangular">Rectangular</option>
                                            <option value="oval">Ovalada</option>
                                            <option value="round">Redonda</option>
                                            <option value="kidney">Riñón</option>
                                            <option value="custom">Personalizada</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Largo (m)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                value={formData.length}
                                                onChange={e => setFormData({ ...formData, length: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ancho (m)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                value={formData.width}
                                                onChange={e => setFormData({ ...formData, width: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prof. Promedio (m)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                value={formData.depth}
                                                onChange={e => setFormData({ ...formData, depth: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg flex items-center gap-3">
                                        <Droplets className="text-blue-500" />
                                        <div>
                                            <div className="text-sm text-slate-500">{t("pool_create.vol_est")}</div>
                                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                                {calculateVolume().toLocaleString()} Liters
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold">{t("pool_create.ready")}</h3>
                                    <p className="text-slate-500">
                                        {t("pool_create.confirmation").replace("{{name}}", formData.name).replace("{{volume}}", calculateVolume().toLocaleString())}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between mt-8">
                        {step === 0 ? (
                            <Button variant="ghost" onClick={() => router.push('/')} disabled={loading}>
                                {t("common.cancel")}
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={handleBack} disabled={loading}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> {t("pool_create.btn_back")}
                            </Button>
                        )}

                        {step < 2 ? (
                            <Button onClick={handleNext}>
                                {t("pool_create.btn_next")} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? t("pool_create.btn_saving") : t("pool_create.btn_confirm")}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
