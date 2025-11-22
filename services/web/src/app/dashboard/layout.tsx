'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Film,
    UploadCloud,
    Settings,
    CreditCard,
    LogOut,
    User,
    Menu,
    X
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Film, label: 'My Clips', href: '/dashboard/clips' },
        { icon: UploadCloud, label: 'Upload', href: '/dashboard/upload' }, // We might make this a modal trigger later
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
        { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    ];

    return (
        <div className="min-h-screen bg-[#05050A] text-white font-sans selection:bg-purple-500/30">
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
                }}
            />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-[#05050A]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
                <div className="font-bold text-xl tracking-tight">Ezclip</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/70">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        backdrop-blur-2xl bg-white/[0.02] border-r border-white/[0.05]
      `}>
                <div className="h-full flex flex-col p-6">
                    <div className="mb-10 px-2 hidden lg:block">
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Ezclip
                        </h1>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}
                  `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/[0.05]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-purple-400' : 'group-hover:text-white'}`} />
                                    <span className="relative z-10 font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-6 border-t border-white/[0.05]">
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors w-full text-left rounded-xl hover:bg-white/[0.05]"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-64 min-h-screen pt-16 lg:pt-0">
                <div className="max-w-7xl mx-auto p-6 lg:p-10">
                    {/* Header Breadcrumbs (Desktop) */}
                    <header className="hidden lg:flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-sm text-white/40">
                            <span>App</span>
                            <span>/</span>
                            <span className="text-white">{(pathname.split('/').pop() || 'Dashboard').charAt(0).toUpperCase() + (pathname.split('/').pop() || 'Dashboard').slice(1)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                                U
                            </div>
                        </div>
                    </header>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
