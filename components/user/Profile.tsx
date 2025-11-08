'use client';
import React, { useState } from 'react';
import { User, GraduationCap, Target, Settings, Award, TrendingUp, Calendar, Edit2, Save, X, Mail, MapPin, BookOpen, Heart, Zap, BarChart3, Trophy, CheckCircle, ArrowLeft } from 'lucide-react';
import { UserProfile, UserLevel, PracticeFrequency, DifficultyLevel, SPECIALTIES, LEARNING_GOALS, CASE_TYPES } from '@/types/user/profile';
import Link from 'next/link';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'preferences' | 'stats'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Données de profil simulées
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Dr. elsamiss',
    email: 'elsamiss@email.com',
    avatar: '',
    level: 'student',
    yearOfStudy: 3,
    university: 'Université de Yaoundé',
    specialty: 'Cardiologie',
    areasOfInterest: ['Cardiologie', 'Médecine Interne', 'Neurologie'],
    learningGoals: ['Préparation aux examens', 'Perfectionnement clinique'],
    targetExam: 'ECN 2025',
    practiceFrequency: 'daily',
    difficultyPreference: 'intermediate',
    preferredCaseTypes: ['Cas cliniques standards', 'Cas d\'urgence'],
    totalCasesCompleted: 47,
    averageScore: 85,
    currentStreak: 12,
    joinedDate: new Date('2024-01-15')
  });

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    const currentArray = (profile[field] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateProfile(field, newArray);
  };

  const handleSave = () => {
    console.log('Profil sauvegardé:', profile);
    setIsEditing(false);
  };

  const getLevelLabel = (level: UserLevel) => {
    const labels = {
      student: 'Étudiant',
      intern: 'Interne',
      resident: 'Résident',
      doctor: 'Médecin',
      specialist: 'Spécialiste'
    };
    return labels[level];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-[#052648] hover:text-[#0a4d8f] transition-colors">
                <ArrowLeft size={20} />
                <span className="font-medium">Retour</span>
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">FT</span>
                </div>
                <span className="text-2xl font-bold text-[#052648]">FullTang</span>
              </div>
            </div>
            
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <X size={18} />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#052648] text-white rounded-lg hover:bg-[#0a4d8f] transition-all"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#052648] text-white rounded-lg hover:bg-[#0a4d8f] transition-all"
              >
                <Edit2 size={18} />
                Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Carte de profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-white" size={40} />
                </div>
                <h2 className="text-xl font-bold text-[#052648] mb-1">{profile.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{getLevelLabel(profile.level)}</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-[#052648]" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  {profile.university && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-[#052648]" />
                      <span className="truncate">{profile.university}</span>
                    </div>
                  )}
                  {profile.specialty && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart size={16} className="text-[#052648]" />
                      <span className="truncate">{profile.specialty}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#052648]">{profile.totalCasesCompleted}</div>
                      <div className="text-xs text-gray-600">Cas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#052648]">{profile.averageScore}%</div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#052648]">{profile.currentStreak}</div>
                      <div className="text-xs text-gray-600">Jours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Onglets */}
            <div className="bg-white rounded-2xl shadow-lg mb-6">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: User },
                  { id: 'academic', label: 'Académique', icon: GraduationCap },
                  { id: 'preferences', label: 'Préférences', icon: Settings },
                  { id: 'stats', label: 'Statistiques', icon: BarChart3 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                      activeTab === tab.id
                        ? 'text-[#052648] border-b-2 border-[#052648]'
                        : 'text-gray-600 hover:text-[#052648]'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Vue d'ensemble */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#052648] mb-4">Informations personnelles</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profile.name}
                              onChange={(e) => updateProfile('name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={profile.email}
                              onChange={(e) => updateProfile('email', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-xl font-bold text-[#052648] mb-4">Objectifs d'apprentissage</h3>
                      <div className="space-y-3">
                        {profile.learningGoals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-lg">
                            <CheckCircle className="text-green-600" size={20} />
                            <span className="text-gray-900">{goal}</span>
                          </div>
                        ))}
                      </div>
                      {profile.targetExam && (
                        <div className="mt-4 bg-blue-50 px-4 py-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Target className="text-[#052648]" size={20} />
                            <span className="font-medium text-gray-900">Objectif: {profile.targetExam}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-xl font-bold text-[#052648] mb-4">Domaines d'intérêt</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.areasOfInterest.map((area, index) => (
                          <span key={index} className="px-4 py-2 bg-[#052648] text-white rounded-full text-sm font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Académique */}
                {activeTab === 'academic' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                        {isEditing ? (
                          <select
                            value={profile.level}
                            onChange={(e) => updateProfile('level', e.target.value as UserLevel)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                          >
                            <option value="student">Étudiant</option>
                            <option value="intern">Interne</option>
                            <option value="resident">Résident</option>
                            <option value="doctor">Médecin</option>
                            <option value="specialist">Spécialiste</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium">{getLevelLabel(profile.level)}</p>
                        )}
                      </div>

                      {(profile.level === 'student' || profile.level === 'intern') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Année d'études</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={profile.yearOfStudy || ''}
                              onChange={(e) => updateProfile('yearOfStudy', parseInt(e.target.value))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                            />
                          ) : (
                            <p className="text-gray-900 font-medium">{profile.yearOfStudy}ème année</p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Université</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.university || ''}
                            onChange={(e) => updateProfile('university', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{profile.university || 'Non renseigné'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                        {isEditing ? (
                          <select
                            value={profile.specialty || ''}
                            onChange={(e) => updateProfile('specialty', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052648] focus:border-transparent outline-none"
                          >
                            <option value="">Sélectionnez une spécialité</option>
                            {SPECIALTIES.map((spec) => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium">{profile.specialty || 'Non renseigné'}</p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Domaines d'intérêt</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {SPECIALTIES.slice(0, 12).map((specialty) => (
                            <button
                              key={specialty}
                              onClick={() => toggleArrayItem('areasOfInterest', specialty)}
                              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                profile.areasOfInterest?.includes(specialty)
                                  ? 'border-[#052648] bg-[#052648] text-white'
                                  : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                              }`}
                            >
                              {specialty}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Préférences */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Fréquence de pratique</label>
                      {isEditing ? (
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'daily', label: 'Quotidienne' },
                            { value: 'weekly', label: 'Hebdomadaire' },
                            { value: 'occasional', label: 'Occasionnelle' }
                          ].map((freq) => (
                            <button
                              key={freq.value}
                              onClick={() => updateProfile('practiceFrequency', freq.value as PracticeFrequency)}
                              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                                profile.practiceFrequency === freq.value
                                  ? 'border-[#052648] bg-[#052648] text-white'
                                  : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                              }`}
                            >
                              {freq.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium capitalize">{profile.practiceFrequency === 'daily' ? 'Quotidienne' : profile.practiceFrequency === 'weekly' ? 'Hebdomadaire' : 'Occasionnelle'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Niveau de difficulté</label>
                      {isEditing ? (
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'beginner', label: 'Débutant' },
                            { value: 'intermediate', label: 'Intermédiaire' },
                            { value: 'advanced', label: 'Avancé' }
                          ].map((level) => (
                            <button
                              key={level.value}
                              onClick={() => updateProfile('difficultyPreference', level.value as DifficultyLevel)}
                              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                                profile.difficultyPreference === level.value
                                  ? 'border-[#052648] bg-[#052648] text-white'
                                  : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium capitalize">
                          {profile.difficultyPreference === 'beginner' ? 'Débutant' : profile.difficultyPreference === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Types de cas préférés</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {CASE_TYPES.map((caseType) => (
                            <button
                              key={caseType}
                              onClick={() => toggleArrayItem('preferredCaseTypes', caseType)}
                              className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all flex items-center justify-between ${
                                profile.preferredCaseTypes?.includes(caseType)
                                  ? 'border-[#052648] bg-[#052648] text-white'
                                  : 'border-gray-300 text-gray-700 hover:border-[#052648]'
                              }`}
                            >
                              {caseType}
                              {profile.preferredCaseTypes?.includes(caseType) && <CheckCircle size={20} />}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredCaseTypes.map((type, index) => (
                            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistiques */}
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Trophy className="text-blue-600" size={32} />
                          <span className="text-3xl font-bold text-blue-900">{profile.totalCasesCompleted}</span>
                        </div>
                        <p className="text-blue-700 font-medium">Cas complétés</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Award className="text-green-600" size={32} />
                          <span className="text-3xl font-bold text-green-900">{profile.averageScore}%</span>
                        </div>
                        <p className="text-green-700 font-medium">Score moyen</p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Zap className="text-orange-600" size={32} />
                          <span className="text-3xl font-bold text-orange-900">{profile.currentStreak}</span>
                        </div>
                        <p className="text-orange-700 font-medium">Jours consécutifs</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="text-[#052648]" size={24} />
                        <h3 className="text-lg font-bold text-[#052648]">Membre depuis</h3>
                      </div>
                      <p className="text-gray-700">
                        {profile.joinedDate?.toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#052648] to-[#0a4d8f] p-6 rounded-xl text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={24} />
                        <h3 className="text-lg font-bold">Progression</h3>
                      </div>
                      <p className="text-white/90 mb-4">
                        Vous êtes sur la bonne voie ! Continuez à pratiquer régulièrement pour améliorer vos compétences.
                      </p>
                      <Link 
                        href="/simulation"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#052648] rounded-lg font-semibold hover:bg-gray-100 transition-all"
                      >
                        Commencer un cas
                        <ArrowLeft className="rotate-180" size={18} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
