// components/dashboard/Header.tsx
'use client';

import React, { useState } from 'react';
import { Award, Bell, ChevronDown, LogOut, Search } from 'lucide-react';
// MODIFIÉ : On importe le type de profil complet et le type pour le niveau
import type { UserProfile, UserLevel } from '@/types/user/profile'; 
import { useAuth } from '@/contexts/AuthContext'; // MODIFIÉ : on importe useAuth pour la déconnexion

const PRIMARY_COLOR = '#052648';
// Définition des props pour le composant Header
interface HeaderProps {
  // MODIFIÉ : On attend un objet de type UserProfile que l'on nomme 'profile' pour plus de clarté
  profile: UserProfile; 
}

// Fonction utilitaire pour traduire le niveau de l'utilisateur
const getLevelLabel = (level: UserLevel | undefined) => {
    if (!level) return 'Apprenant';
    const labels: Record<UserLevel, string> = {
        student: 'Étudiant(e)',
        intern: 'Interne',
        resident: 'Résident',
        doctor: 'Médecin',
        specialist: 'Spécialiste'
    };
    return labels[level] || 'Apprenant';
};

// Composant pour le badge de niveau
const getLevelBadge = (level: UserLevel | undefined) => {
  if (!level) return { color: 'bg-gray-100 text-gray-600', icon: '📚' };
  
  const badges: Record<UserLevel, { color: string; icon: string }> = {
    student: { color: 'bg-blue-100 text-blue-700', icon: '🎓' },
    intern: { color: 'bg-purple-100 text-purple-700', icon: '💼' },
    resident: { color: 'bg-indigo-100 text-indigo-700', icon: '🏥' },
    doctor: { color: 'bg-green-100 text-green-700', icon: '⚕️' },
    specialist: { color: 'bg-amber-100 text-amber-700', icon: '👨‍⚕️' }
  };
  
  return badges[level] || badges.student;
};

const Header: React.FC<HeaderProps> = ({ profile }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const levelBadge = getLevelBadge(profile.level);
return (
    <header 
      className="flex-shrink-0 h-24 flex items-center justify-between px-8 bg-white border-b-2 shadow-sm relative z-20"
      style={{ borderBottomColor: PRIMARY_COLOR }}
    >
      {/* Section gauche - Bienvenue */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Bienvenue, {profile?.username || 'Docteur'} !
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm">Prêt à relever de nouveaux défis ?</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Award size={12} />
              Niveau {profile.level || 'débutant'}
            </span>
          </div>
        </div>
      </div>

      {/* Section droite - Actions */}
      <div className="flex items-center gap-4">
        {/* Barre de recherche */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 w-64">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:text-white hover:bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl transition-all duration-300 group"
            style={{ 
              backgroundColor: showNotifications ? PRIMARY_COLOR : 'transparent'
            }}
          >
            <Bell size={22} className={showNotifications ? 'text-white' : ''} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Dropdown Notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div 
                className="px-4 py-3 border-b border-slate-200 font-semibold text-white flex items-center justify-between"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <span>Notifications</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">3 nouvelles</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {[
                  { title: 'Nouveau cas clinique', desc: 'Un cas de cardiologie vous attend', time: '5 min', unread: true },
                  { title: 'Quiz complété', desc: 'Félicitations ! Score: 85%', time: '1h', unread: true },
                  { title: 'Rappel échéance', desc: 'Examen dans 2 jours', time: '3h', unread: true }
                ].map((notif, i) => (
                  <div 
                    key={i} 
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.unread && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div 
                className="px-4 py-2.5 text-center text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Voir toutes les notifications
              </div>
            </div>
          )}
        </div>

        {/* Profil utilisateur */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-200 border-2 border-transparent hover:border-slate-200"
          >
            <div className="relative">
              <img
                src="/images/avatar.jpeg"
                alt="Avatar"
                className="w-11 h-11 rounded-full object-cover border-2 shadow-md"
                style={{ borderColor: PRIMARY_COLOR }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-semibold text-slate-800">{profile?.username || 'Docteur'}</p>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${levelBadge.color}`}>
                <span>{levelBadge.icon}</span>
                <span>{getLevelLabel(profile.level)}</span>
              </div>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu Utilisateur */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div 
                className="px-4 py-4 border-b border-slate-200 text-white"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/api/placeholder/48/48"
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                  />
                  <div>
                    <p className="font-semibold">{profile?.username || 'Docteur'}</p>
                    <p className="text-xs text-blue-200">{getLevelLabel(profile.level)}</p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                {[
                  { icon: User, label: 'Mon profil', onClick: () => console.log('Profil') },
                  { icon: Settings, label: 'Paramètres', onClick: () => console.log('Paramètres') }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    <item.icon size={18} className="text-slate-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-200">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 font-medium">
                  <LogOut size={18} />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;