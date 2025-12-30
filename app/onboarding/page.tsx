"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PoolSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');

    const calculateVolume = () => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const d = parseFloat(depth) || 0;
        return (l * w * d * 1000).toLocaleString();
    }

    const handleSave = async () => {
        if (!name || !length) {
            toast.error("Por favor completa los campos.");
            return;
        }

        setLoading(true);
        // Supabase Insert Logic Placeholder
        // Since we need Auth Context to be fully robust, this is a simplified version.
        // Assuming user is authenticated or we skip auth for this demo.

        toast.success("Pileta guardada correctamente (Simulado)");
        setTimeout(() => router.push('/'), 1000);
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Configurar Nueva Pileta</CardTitle>
                    <CardDescription>Ingresa las dimensiones para calcular productos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input placeholder="Ej. Pileta Casa" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Largo (m)</Label>
                            <Input type="number" placeholder="0.0" value={length} onChange={e => setLength(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Ancho (m)</Label>
                            <Input type="number" placeholder="0.0" value={width} onChange={e => setWidth(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Prof. (m)</Label>
                            <Input type="number" placeholder="0.0" value={depth} onChange={e => setDepth(e.target.value)} />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                        <span className="text-blue-700 font-medium">Volumen Estimado</span>
                        <span className="text-2xl font-bold text-blue-900">{calculateVolume()} L</span>
                    </div>

                    <Button className="w-full" onClick={handleSave} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar Pileta"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
