// components/dashboard/Settings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Edit2, Save, X, User as UserIcon, Mail, Building, GraduationCap, Heart, Target, ListChecks, Calendar, Zap, Hourglass, BarChart3, Shield } from 'lucide-react';

import { UserProfile, UserLevel, PracticeFrequency, DifficultyLevel, SPECIALTIES, LEARNING_GOALS, CASE_TYPES } from '@/types/user/profile';
import { updateProfile as updateProfileService } from '@/services/authService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// --- PROPS DU COMPOSANT ---
interface SettingsProps {
    user: User;
    profile: UserProfile;
}

// --- SOUS-COMPOSANTS POUR UN DESIGN ÉLÉGANT ---

// Affiche une ligne d'information (label + valeur ou input)
const DisplayRow = ({ icon: Icon, label, value, isEditing, children }: { icon: React.ElementType, label: string, value: any, isEditing: boolean, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center border-t py-4 first:border-t-0">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
            <Icon size={18} />
            <span>{label}</span>
        </div>
        <div className="md:col-span-2">
            {isEditing ? (
                children
            ) : (
                <span className={`font-medium ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                    {value || "À renseigner"}
                </span>
            )}
        </div>
    </div>
);

// Gère un groupe de boutons sélectionnables (pour les tableaux)
const ChipSelector = ({ options, selected, onToggle, isEditing }: { options: readonly string[], selected: string[], onToggle: (item: string) => void, isEditing: boolean }) => (
    <div className="flex flex-wrap gap-2">
        {(selected.length === 0 && !isEditing) && <span className="text-slate-400 italic">À renseigner</span>}
        
        {(isEditing ? options : selected).map(item => {
            const isSelected = selected.includes(item);
            return (
                <button
                    key={item}
                    disabled={!isEditing}
                    onClick={() => onToggle(item)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        isSelected 
                        ? 'bg-[#052648] text-white border-[#052648]' 
                        : 'bg-white text-slate-700 hover:border-slate-400'
                    } ${!isEditing && 'bg-slate-100 text-slate-700 border-slate-200 cursor-default'}`}
                >
                    {item}
                </button>
            );
        })}
    </div>
);

// --- COMPOSANT PRINCIPAL ---

export default function Settings({ user, profile: initialProfile }: SettingsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile);

    useEffect(() => setProfile(initialProfile), [initialProfile]);

    const handleSave = async () => {
        setIsEditing(false);
        const toastId = toast.loading("Sauvegarde des modifications...");
        try {
            await updateProfileService(user.id, profile);
            toast.success("Profil mis à jour !", { id: toastId });
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde.", { id: toastId });
            console.error(error);
            setIsEditing(true); // Permet à l'utilisateur de corriger
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        setProfile(initialProfile);
    };

    const updateProfileField = (field: keyof UserProfile, value: any) => setProfile(prev => ({ ...prev, [field]: value }));

    const toggleArrayItem = (field: keyof UserProfile, item: string) => {
        const currentArray = (profile[field] as string[]) || [];
        const newArray = currentArray.includes(item) ? currentArray.filter(i => i !== item) : [...currentArray, item];
        updateProfileField(field, newArray);
    };
    
    const getLevelLabel = (level: UserLevel | undefined) => { /* ... (inchangé) ... */ };
    
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 space-y-6">
            {/* --- EN-TÊTE AVEC BOUTONS D'ACTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Paramètres du profil</h2>
                    <p className="text-slate-500 mt-1">Gérez vos informations de profil et vos préférences.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0 flex-shrink-0">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}><X size={16} className="mr-2"/> Annuler</Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save size={16} className="mr-2"/> Enregistrer</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit2 size={16} className="mr-2"/> Modifier le Profil</Button>
                    )}
                </div>
            </div>

            {/* --- SECTIONS DU PROFIL --- */}
            <div className="divide-y divide-slate-200">
                <DisplayRow icon={UserIcon} label="Nom d'utilisateur" value={profile.username} isEditing={isEditing}>
                    <Input value={profile.username || ''} onChange={(e) => updateProfileField('username', e.target.value)} />
                </DisplayRow>

                <DisplayRow icon={Mail} label="Adresse e-mail" value={user.email} isEditing={isEditing}>
                    <Input disabled value={user.email || ''} />
                </DisplayRow>

                <DisplayRow icon={GraduationCap} label="Statut professionnel" value={profile.level} isEditing={isEditing}>
                     <select value={profile.level || 'student'} onChange={(e) => updateProfileField('level', e.target.value as UserLevel)} className="w-full p-2 border border-slate-300 rounded-md">
                        {Object.entries({ student: 'Étudiant(e)', intern: 'Interne', resident: 'Résident', doctor: 'Médecin', specialist: 'Spécialiste' }).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </DisplayRow>

                <DisplayRow icon={Building} label="Université" value={profile.university} isEditing={isEditing}>
                     <Input value={profile.university || ''} onChange={(e) => updateProfileField('university', e.target.value)} placeholder="Nom de l'université" />
                </DisplayRow>

                <DisplayRow icon={Heart} label="Spécialité principale" value={profile.specialty} isEditing={isEditing}>
                     <select value={profile.specialty || ''} onChange={(e) => updateProfileField('specialty', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md">
                         <option value="">-- Sélectionnez --</option>
                         {SPECIALTIES.map(item => <option key={item} value={item}>{item}</option>)}
                     </select>
                </DisplayRow>

                 <DisplayRow icon={ListChecks} label="Domaines d'intérêt" value={(profile.areasOfInterest || []).join(', ')} isEditing={isEditing}>
                    <ChipSelector options={SPECIALTIES} selected={profile.areasOfInterest || []} onToggle={(item) => toggleArrayItem('areasOfInterest', item)} isEditing={isEditing} />
                 </DisplayRow>

                <DisplayRow icon={Target} label="Objectifs d'apprentissage" value={(profile.learningGoals || []).join(', ')} isEditing={isEditing}>
                    <ChipSelector options={LEARNING_GOALS} selected={profile.learningGoals || []} onToggle={(item) => toggleArrayItem('learningGoals', item)} isEditing={isEditing} />
                </DisplayRow>

                 <DisplayRow icon={BarChart3} label="Niveau préféré" value={profile.difficultyPreference} isEditing={isEditing}>
                    <div className="flex gap-2">
                        {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(level => (
                             <button key={level} onClick={() => updateProfileField('difficultyPreference', level)} className={`px-4 py-2 flex-1 rounded-md border-2 font-medium transition-all ${profile.difficultyPreference === level ? 'bg-blue-600 text-white border-blue-600' : 'hover:border-blue-300'}`}>
                                 {level.charAt(0).toUpperCase() + level.slice(1)}
                             </button>
                        ))}
                    </div>
                </DisplayRow>
            </div>
        </div>
    );
}