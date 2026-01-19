// components/expert/Header.tsx
'use client';
import React from 'react';
import { Search, Bell, Mail } from 'lucide-react';

const ExpertHeader = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* Search Bar Modernisée */}
      <div className="hidden md:flex items-center bg-slate-50 rounded-full px-4 py-2.5 w-96 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
        <Search className="text-slate-400 w-5 h-5 mr-2" />
        <input 
          type="text" 
          placeholder="Rechercher un cas, un étudiant..." 
          className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-[#052648]">
          <Mail className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button className="relative p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-[#052648]">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-blue-500 rounded-full border border-white animate-pulse"></span>
        </button>
        
        {/* User Mini Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#052648]">Pr. Bahebec</p>
                <p className="text-xs text-slate-500">Administrateur</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#052648] to-blue-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                JB
            </div>
        </div>
      </div>
    </header>
  );
};

export default ExpertHeader;