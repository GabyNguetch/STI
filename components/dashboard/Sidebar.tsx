'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Target,
  ScanFace,
  LogOut, 
  HeartPulse, 
  ChevronRight, 
  Play
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth();

  // --- CONFIGURATION DES ONGLETS (Nettoyée) ---
  const menuItems = [
    { 
      id: 'overview', 
      label: "Vue d'Ensemble", 
      icon: LayoutDashboard 
    },
    { 
      id: 'goals', 
      label: 'Objectifs', 
      icon: Play 
    },
    { 
      id: 'practice', 
      label: "M'exercer", 
      icon: Stethoscope 
    },
    { 
      id: 'analytic_profile', 
      label: 'Mon profil', 
      icon: ScanFace 
    }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div 
        className={`
          hidden md:flex flex-col fixed left-0 top-0 h-full bg-white z-50 
          shadow-[4px_0_24px_rgba(0,0,0,0.04)] border-r border-slate-100
          transition-all duration-500 ease-cubic-bezier
          ${isHovered ? 'w-72' : 'w-28'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* LOGO */}
        <div className="h-24 flex items-center justify-center relative w-full mb-6">
          <div className={`flex items-center gap-3 transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : ''}`}>
            <div className={`
                w-12 h-12 bg-gradient-to-br from-[#052648] to-[#2c3d98] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20
                text-white transition-all duration-500 z-10
                ${isHovered ? 'mr-0' : 'scale-90'}
            `}>
                <HeartPulse size={26} strokeWidth={2.5} />
            </div>

            <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${isHovered ? 'w-auto opacity-100 ml-2' : 'w-0 opacity-0 ml-0'}`}>
               <span className="text-xl font-extrabold text-[#052648] tracking-tight">The Good Doctor</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Etudiant</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 flex flex-col space-y-16 py-4 w-full overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  relative h-14 flex items-center cursor-pointer group outline-none
                  transition-all duration-300 w-[92%] rounded-r-full
                  ${isActive ? 'bg-blue-50/80 text-[#052648]' : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                `}
              >
                {isActive && <div className="absolute left-0 h-full w-1.5 bg-[#052648] rounded-r-md shadow-blue-500/50" />}

                <div className="w-24 min-w-[6rem] flex items-center justify-center z-10">
                   <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>

                <span className={`text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'} ${isActive ? 'font-extrabold' : 'font-medium'}`}>
                   {item.label}
                </span>
                
                {isActive && isHovered && <ChevronRight size={16} className="absolute right-4 text-blue-300 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 mb-4">
           <button onClick={logout} className={`w-full h-14 rounded-r-full flex items-center transition-all duration-300 group text-rose-500/80 hover:bg-rose-50 hover:text-rose-600 ${!isHovered ? 'w-16 rounded-2xl justify-center' : ''}`}>
              <div className={`${isHovered ? 'w-24 flex justify-center' : ''}`}>
                  <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className={`text-sm font-bold overflow-hidden transition-all duration-300 ${isHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Déconnexion</span>
           </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 px-2 py-2 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.03)] safe-area-bottom pb-4 overflow-x-auto">
         {menuItems.map((item) => {
             const isActive = activeView === item.id;
             return (
               <button key={item.id} onClick={() => onNavigate(item.id)} className="relative flex flex-col items-center justify-center p-2 min-w-[3.5rem] transition-all duration-300">
                  {isActive && <div className="absolute top-1 w-10 h-10 bg-[#052648] rounded-xl shadow-lg shadow-blue-900/30 animate-in zoom-in-95 duration-200"></div>}
                  <item.icon size={22} className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400'}`} />
               </button>
             );
         })}
      </div>
    </>
  );
};

export default Sidebar;