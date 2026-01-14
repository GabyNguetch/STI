// components/dashboard/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Milestone, Calendar, Settings, LogOut, Activity, Stethoscope, ChevronRight, HeartPulse, BookPlus } from 'lucide-react';
import { useRouter } from 'next/navigation'; 
import toast from 'react-hot-toast'; 
import { useAuth } from '@/contexts/AuthContext'; 
import type { NavItem } from '@/types/dashboard/dashboard';

const PRIMARY_COLOR = '#052648';

// CORRECTION : On type explicitement ce tableau avec 'NavItem[]' 
// pour que 'id' soit reconnu comme 'overview' | 'journey' ... et non pas string.
const navItems: NavItem[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'journey', label: 'Parcours', icon: Milestone },
  { id: 'lib', label: 'Bibliothèque', icon: BookPlus },
  { id: 'redo', label: 'Échéances', icon: Calendar },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

interface SidebarProps {
  activeTab: NavItem['id'];
  setActiveTab: (tab: NavItem['id']) => void;
}

// --- Composant Principal ---
const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  
  const { profile, signOut: handleSignOut } = useAuth();
    const onLogoutClick = async () => {
    toast.loading('Déconnexion en cours...');
    await handleSignOut();
    toast.dismiss();
    router.push('/');
  };

  return (
    <aside 
      className="w-72 flex-shrink-0 flex flex-col h-screen text-white relative"
      style={{ 
        background: `linear-gradient(180deg, ${PRIMARY_COLOR} 0%, #063a5f 100%)`
      }}
    >
      {/* Overlay pattern subtil */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Logo / Titre avec animation */}
        <div className="flex items-center gap-4 mb-12 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-lg">
              <HeartPulse size={28} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">The Good Doctor</h1>
          </div>
        </div>

        {/* Navigation Principale */}
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl
                  text-left transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-white/10 shadow-lg backdrop-blur-sm' 
                    : 'hover:bg-white/5 hover:translate-x-1'
                  }
                `}
              >
                {/* Barre indicatrice pour l'élément actif */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full" />
                )}
                
                <div className="flex items-center gap-4">
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-white/5 text-blue-300 group-hover:bg-white/10'
                    }
                  `}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className={`
                    font-medium transition-colors duration-300
                    ${isActive ? 'text-white' : 'text-blue-200'}
                  `}>
                    {item.label}
                  </span>
                </div>
                
                <ChevronRight 
                  size={18} 
                  className={`
                    transition-all duration-300
                    ${isActive 
                      ? 'opacity-100 translate-x-0 text-blue-300' 
                      : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 text-blue-400'
                    }
                  `}
                />
              </button>
            );
          })}
        </nav>

        {/* Section Déconnexion */}
        <button 
          onClick={onLogoutClick} // AJOUT du handler ici
          className="
          w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
          text-blue-200 hover:bg-red-500/20 hover:text-white
          transition-all duration-300 group border border-transparent hover:border-red-500/30
        ">
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-500/20 transition-all duration-300">
            <LogOut size={20} strokeWidth={2.5} />
          </div>
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;