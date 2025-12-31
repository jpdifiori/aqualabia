import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "aqualabia",
    description: "Tu experto en mantenimiento de piletas con IA",
    manifest: "/manifest.json",
    themeColor: "#3B82F6",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "aqualabia",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <LanguageProvider>
                    <AuthProvider>
                        <Navbar />
                        {children}
                        <Toaster />
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
