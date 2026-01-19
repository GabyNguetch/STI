'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-100 transform transition-all scale-100">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-red-600 w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Supprimer le cas ?</h3>
            <p className="text-slate-500 text-sm mt-1">Cette action est irréversible. Toutes les données associées (images, historique) seront perdues.</p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>Annuler</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? '...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};