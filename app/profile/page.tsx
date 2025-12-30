"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        } else if (user) {
            setFullName(user.user_metadata?.full_name || "");
        }
    }, [user, authLoading, router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName },
            });

            if (error) throw error;
            toast.success("Perfil actualizado correctamente");
            // Force reload to update context
            window.location.reload();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Error al actualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Mi Perfil</CardTitle>
                    <CardDescription>
                        Actualiza tus datos personales.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={user.email}
                                disabled
                                className="bg-slate-100 dark:bg-slate-800"
                            />
                            <p className="text-xs text-slate-500">El email no se puede cambiar.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Tu Nombre"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
