import React from 'react';
import { User } from '@/types/dashboard';

// Composant pour l'onglet Paramètres
const Settings: React.FC<{ user: User }> = ({ user }) => (
  <div className="bg-white p-8 rounded-xl border border-slate-200/80 divide-y divide-slate-200">
    {/* Infos Personnelles */}
    <div className="pb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Informations Personnelles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-slate-600">Prénom</label>
          <input type="text" defaultValue={user.firstName} className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Nom</label>
          <input type="text" defaultValue={user.lastName} className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none" />
        </div>
         {/* ... Autres champs: email, date de naissance, etc. ... */}
      </div>
    </div>
    
    {/* Mot de Passe */}
    <div className="pt-8">
       <h3 className="text-xl font-bold text-slate-800 mb-4">Changer de mot de passe</h3>
       <div className="space-y-4 max-w-sm">
         <input type="password" placeholder="Mot de passe actuel" className="w-full p-2 border border-slate-300 rounded-md" />
         <input type="password" placeholder="Nouveau mot de passe" className="w-full p-2 border border-slate-300 rounded-md" />
         <button className="px-5 py-2.5 bg-[#052648] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity w-full">
           Mettre à jour
         </button>
       </div>
    </div>
  </div>
);

export default Settings;