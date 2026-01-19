'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  label?: string;
  value: string | number;
  onChange: (val: string | number) => void;
  options: Option[];
  icon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, icon }) => {
  return (
    <div className="relative group">
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#052648] text-slate-700 text-sm rounded-xl py-3 pl-10 pr-10 outline-none transition-all appearance-none cursor-pointer shadow-sm focus:ring-2 focus:ring-[#052648]/10"
        >
          <option value="" disabled>-- Sélectionner --</option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        {/* Icone gauche */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#052648] transition-colors pointer-events-none">
          {icon}
        </div>
        
        {/* Chevron droit */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};