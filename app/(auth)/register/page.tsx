"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TermsModal } from "@/components/ui/terms-modal";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { Droplets } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptedTerms) {
            toast.error(t("terms.accept_required") || "Debes aceptar los términos y condiciones");
            return;
        }

        console.log("Registration attempt:", formData.email);
        setLoading(true);

        try {
            const { fullName, email, password } = formData;

            console.log("Calling supabase.auth.signUp...");
            const response = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            console.log("Supabase signUp response:", response);
            const { data, error } = response;

            if (error) {
                console.error("SignUp error object:", error);
                throw error;
            }

            console.log("Response data:", data);

            if (data.session) {
                console.log("Session established, redirecting.");
                toast.success(t("common.register_success") || "Cuenta creada exitosamente");
                router.push("/");
            } else {
                console.log("No session immediately returned (Email confirmation might be on).");
                toast.success(t("common.register_confirmation") || "Registro iniciado. Por favor verifica tu email si es necesario.");
            }

        } catch (err: any) {
            console.error("Catch block caught:", err);
            let message = err.message || t("auth_errors.general_error");

            if (message.includes("User already registered")) {
                message = `${t("auth_errors.user_already_exists")} ${t("auth_errors.suggest_login")}`;
            }

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                        <Droplets className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl text-center">{t("common.register")}</CardTitle>
                    <CardDescription className="text-center">
                        Crea tu cuenta en aqualabia.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input
                                id="fullName"
                                placeholder="Juan Pérez"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="juan@ejemplo.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("common.password") || "Contraseña"}</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-start space-x-2 py-2">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                required
                            />
                            <Label htmlFor="terms" className="text-sm font-normal text-slate-600 dark:text-slate-400">
                                {t("terms.i_accept") || "Acepto los"}{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsTermsOpen(true)}
                                    className="text-blue-600 hover:underline font-bold"
                                >
                                    {t("terms.title_short") || "Términos y Condiciones"}
                                </button>
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t("common.loading") : t("common.register")}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        {t("common.already_have_account") || "¿Ya tienes una cuenta?"}{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            {t("common.login")}
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
}
