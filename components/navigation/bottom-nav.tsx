'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GitFork, 
  TrendingUp, 
  History, 
  Plus 
} from 'lucide-react';
import { QuickLogDrawer } from '../quick-log/quick-log-drawer';

export function BottomNav() {
  const pathname = usePathname();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const navItems = [
    { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { label: 'Quyết toán 20', href: '/decision', icon: GitFork },
    { label: 'Mục tiêu 5 năm', href: '/goal', icon: TrendingUp },
    { label: 'Lịch sử & File', href: '/history', icon: History },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* First 2 items */}
          <Link
            href={navItems[0].href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === navItems[0].href ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">{navItems[0].label}</span>
          </Link>

          <Link
            href={navItems[1].href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === navItems[1].href ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-5 h-5" />
            <span className="text-[10px]">{navItems[1].label}</span>
          </Link>

          {/* Floating Action Button (FAB) (+) */}
          <div className="relative -top-5">
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-4 border-slate-950"
              title="Ghi chép nhanh (< 3s)"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Last 2 items */}
          <Link
            href={navItems[2].href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === navItems[2].href ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">{navItems[2].label}</span>
          </Link>

          <Link
            href={navItems[3].href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === navItems[3].href ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">{navItems[3].label}</span>
          </Link>
        </div>
      </nav>

      {/* Quick Log Drawer */}
      <QuickLogDrawer isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />
    </>
  );
}
