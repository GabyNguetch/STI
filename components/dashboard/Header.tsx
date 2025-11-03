import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { User } from '@/types/dashboard/dashboard';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="flex-shrink-0 h-20 flex items-center justify-between px-8 border-b border-slate-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bienvenue, {user.firstName} !</h2>
        <p className="text-slate-500 text-sm">Prêt à relever de nouveaux défis ?</p>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <img src={user.profilePictureUrl} alt="Photo de profil" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-500">Étudiant(e)</p>
          </div>
          <ChevronDown size={20} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;