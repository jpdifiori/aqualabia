"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { AlertTriangle, Droplets } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const isConfigured = isSupabaseConfigured();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { email, password } = formData;
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Sesión iniciada");
            router.push("/");

        } catch (err: any) {
            console.error(err);
            let message = err.message || t("auth_errors.general_error");

            if (message.includes("Invalid login credentials")) {
                message = `${t("auth_errors.invalid_login")} ${t("auth_errors.suggest_register")}`;
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
                    <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
                    <CardDescription className="text-center">
                        Accede a tu cuenta de aqualabia.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isConfigured && (
                        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase tracking-wide">Error de Configuración</h3>
                            </div>
                            <p className="text-xs text-red-600/90 dark:text-red-300">
                                Faltan variables de entorno en Vercel.<br />
                                <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</span> y <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">ANON_KEY</span> son requeridas.
                            </p>
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
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
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Ingresando..." : "Iniciar Sesión"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Registrarse
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
