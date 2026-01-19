'use client';
import React from 'react';
import { Eye, Edit2, Trash2, X } from 'lucide-react';

interface ActionMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ x, y, onClose, onDetails, onEdit, onDelete }) => {
  // Ajustement pour ne pas sortir de l'écran (sommaire)
  const style = { top: y, left: x };

  return (
    <>
      {/* Overlay invisible pour fermer au clic dehors */}
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      
      {/* Menu */}
      <div 
        className="fixed z-50 bg-white min-w-[180px] rounded-xl shadow-2xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-200"
        style={style}
      >
        <button onClick={onDetails} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#052648] flex items-center gap-2 transition-colors">
          <Eye size={16}/> Voir détails
        </button>
        <button onClick={onEdit} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 transition-colors">
          <Edit2 size={16}/> Modifier
        </button>
        <div className="h-px bg-slate-100 my-1 mx-2" />
        <button onClick={onDelete} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors">
          <Trash2 size={16}/> Supprimer
        </button>
      </div>
    </>
  );
};