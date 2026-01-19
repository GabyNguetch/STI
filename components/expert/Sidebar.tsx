// components/expert/Sidebar.tsx
'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Activity, Bug, Syringe, 
  ImageIcon, LogOut, ChevronRight, HeartPulse, Home
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  { name: 'Vue d\'ensemble', icon: LayoutDashboard, path: '/expert' },
  { name: 'Cas Cliniques', icon: FileText, path: '/expert/cas' },
  { name: 'Symptômes', icon: Activity, path: '/expert/symptom' },
  { name: 'Pathologies', icon: Bug, path: '/expert/pathologies' }, // route hypothétique
  { name: 'Traitement', icon: Syringe, path: '/expert/traitements' },
  { name: 'Images Médicales', icon: ImageIcon, path: '/expert/media' },
];

export default function ExpertSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* --- DESKTOP SIDEBAR (HOVER EXPAND) --- */}
      <aside 
        className={`hidden md:flex flex-col h-screen bg-[#052648] text-white fixed left-0 top-0 z-30 transition-all duration-500 ease-in-out border-r border-blue-900/50 shadow-2xl ${
          isHovered ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center relative">
           <div className={`flex items-center gap-3 transition-all duration-300 ${isHovered ? 'px-6 w-full justify-start' : ''}`}>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <HeartPulse className="text-blue-400" />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                    <span className="font-bold text-lg whitespace-nowrap">The Good<span className="text-blue-400">Doctor</span> Expert</span>
                </div>
           </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path}
                href={item.path}
                className={`relative flex items-center h-12 px-6 transition-all duration-200 group ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setIsHovered(false)}
              >
                {/* Active Indicator Line */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                )}

                <div className={`relative z-10 flex items-center gap-4 ${isHovered ? 'justify-start w-full' : 'justify-center w-full'}`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-blue-400' : ''} ${!isHovered && 'group-hover:scale-110'}`} />
                    
                    <span className={`font-medium whitespace-nowrap transition-all duration-300 origin-left ${
                      isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 w-0'
                    }`}>
                      {item.name}
                    </span>
                    
                    {/* Hover Chevron (Only visible when expanded) */}
                    {isHovered && (
                       <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                    )}
                </div>
                
                {/* Background hover effect */}
                <div className={`absolute inset-0 bg-white/5 mx-3 rounded-lg transition-opacity duration-200 ${isActive || (isHovered && 'group-hover:opacity-100') ? '' : 'opacity-0 group-hover:opacity-100'} ${!isHovered && 'mx-2'}`}></div>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/10">
            <button className={`w-full flex items-center h-12 rounded-xl hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all group px-2 ${isHovered ? '' : 'justify-center'}`}
                onClick={() => router.push('/')}
            >
                <div className={`${isHovered ? 'mr-4' : ''}`}>
                    {pathname === '/' ? <Home className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                </div>
                <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                    Retour Accueil
                </span>
            </button>
        </div>
      </aside>

      {/* --- MOBILE NAVIGATION (BOTTOM BAR) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#052648] text-white p-2 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
          {menuItems.slice(0, 5).map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                    pathname === item.path ? 'bg-blue-600 shadow-lg -translate-y-3' : 'text-slate-400'
                }`}
              >
                  <item.icon size={20} />
              </Link>
          ))}
      </nav>
    </>
  );
}