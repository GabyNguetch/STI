'use client';
import React from 'react';
import { LayoutDashboard, Milestone, History, Settings, LogOut, HeartPulse, Stethoscope } from 'lucide-react';
import { NavItem } from '@/types/dashboard';

const PRIMARY_COLOR = '#052648';

// Les éléments de navigation sont définis ici pour une maintenance facile
const navItems: NavItem[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'journey', label: 'Parcours', icon: Milestone },
  { id: 'redo', label: 'Échéances', icon: History },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: NavItem['id']) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen text-white p-4" style={{ backgroundColor: PRIMARY_COLOR }}>
      {/* Logo / Titre */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <Stethoscope size={32} className="text-blue-300"/>
        <h1 className="text-2xl font-bold">Fulltang</h1>
      </div>

      {/* Navigation Principale */}
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-900/50 font-semibold text-white'
                    : 'text-blue-200 hover:bg-blue-900/30 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Section Déconnexion */}
      <div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-red-800/50 hover:text-white transition-colors duration-200">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;