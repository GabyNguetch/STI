'use client';
import React, { useState } from 'react';
import { Menu, X, Brain, Users, Target, Award, Zap, TrendingUp, CheckCircle, ArrowRight, Stethoscope, BookOpen, BarChart3, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, Play, Star, GraduationCap } from 'lucide-react';
import Link from 'next/link';

// Navbar Component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FT</span>
            </div>
            <span className="text-2xl font-bold text-[#052648]">FullTang</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-gray-700 hover:text-[#052648] transition-colors font-medium">Accueil</a>
            <a href="#fonctionnalites" className="text-gray-700 hover:text-[#052648] transition-colors font-medium">Fonctionnalités</a>
            <a href="#avantages" className="text-gray-700 hover:text-[#052648] transition-colors font-medium">Avantages</a>
            <a href="#contact" className="text-gray-700 hover:text-[#052648] transition-colors font-medium">Contact</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="px-5 py-2 text-[#052648] font-medium hover:text-[#0a4d8f] transition-colors">
              Connexion
            </button>
            <button className="px-6 py-2.5 bg-[#052648] text-white rounded-lg font-medium hover:bg-[#0a4d8f] transition-all shadow-lg hover:shadow-xl">
              Commencer
            </button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-6 space-y-4">
            <a href="#accueil" className="block text-gray-700 hover:text-[#052648] transition-colors font-medium">Accueil</a>
            <a href="#fonctionnalites" className="block text-gray-700 hover:text-[#052648] transition-colors font-medium">Fonctionnalités</a>
            <a href="#avantages" className="block text-gray-700 hover:text-[#052648] transition-colors font-medium">Avantages</a>
            <a href="#contact" className="block text-gray-700 hover:text-[#052648] transition-colors font-medium">Contact</a>
            <div className="pt-4 space-y-2">
              <button className="w-full px-5 py-2 text-[#052648] font-medium border border-[#052648] rounded-lg hover:bg-[#052648] hover:text-white transition-all">
                Connexion
              </button>
              <button className="w-full px-6 py-2.5 bg-[#052648] text-white rounded-lg font-medium hover:bg-[#0a4d8f] transition-all shadow-lg">
                Commencer
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-[#052648] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FT</span>
              </div>
              <span className="text-2xl font-bold">FullTang</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Votre partenaire de formation médicale pour devenir un médecin d'excellence.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Liens Rapides</h3>
            <ul className="space-y-3">
              {['Accueil', 'Fonctionnalités', 'Avantages', 'Tarifs', 'Contact'].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Ressources</h3>
            <ul className="space-y-3">
              {['Bibliothèque de Cas', 'Guides d\'Étude', 'Blog Médical', 'FAQ', 'Support'].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="text-cyan-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <a href="mailto:contact@fulltang.cm" className="text-gray-300 hover:text-white transition-colors">
                    contact@fulltang.cm
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-cyan-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Téléphone</div>
                  <a href="tel:+237123456789" className="text-gray-300 hover:text-white transition-colors">
                    +237 123 456 789
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-cyan-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Adresse</div>
                  <p className="text-gray-300">Yaoundé, Cameroun</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2025 FullTang. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {['Politique de Confidentialité', 'Conditions d\'Utilisation', 'Mentions Légales'].map((link, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section id="accueil" className="pt-32 pb-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-[#052648]/10 backdrop-blur-sm rounded-full text-sm font-medium text-[#052648]">
                <GraduationCap size={20} className="mr-3" />
                Plateforme de Formation Médicale Intelligente
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Sauvez des Vies
                <span className="block text-[#052648] mt-2">Virtuelles</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Et devenez un meilleur médecin. La pratique délibérée est la clé du succès clinique. Améliorez vos capacités diagnostiques en traitant des patients simulés.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-[#052648] text-white rounded-lg font-semibold text-lg hover:bg-[#0a4d8f] transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2">
                  <Link href='/simulation' >Jouer Maintenant</Link>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white border-2 border-[#052648] text-[#052648] rounded-lg font-semibold text-lg hover:bg-[#052648] hover:text-white transition-all flex items-center justify-center gap-2">
                  <Play size={20} />
                  Voir la Démo
                </button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#052648]">10K+</div>
                  <div className="text-sm text-gray-600">Étudiants</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#052648]">500+</div>
                  <div className="text-sm text-gray-600">Cas Cliniques</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">4.9/5 Notes</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="aspect-video bg-[url('/images/simu1.jpg')] bg-contain bg-center bg-no-repeat  rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white p-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Stethoscope size={48} />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      EN DIRECT
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">Patient virtuel</div>
                        <div className="text-xs text-gray-500">Cas de cardiologie</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-6 top-16 bg-white p-4 rounded-xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Diagnostic Correct!</div>
                    <div className="text-xs text-gray-500">+25 XP gagnés</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -left-6 bottom-16 bg-white p-4 rounded-xl shadow-xl transform -rotate-6 hover:rotate-0 transition-transform animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="text-[#052648]" size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Niveau 12</div>
                    <div className="text-xs text-gray-500">Expert cardiologie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#052648] mb-4">Points Forts</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une expérience d'apprentissage complète et innovante
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "IA Adaptative", desc: "Le système s'adapte à votre niveau d'apprentissage" },
              { icon: Stethoscope, title: "Cas Réalistes", desc: "Basés sur des situations médicales authentiques" },
              { icon: BarChart3, title: "Suivi Détaillé", desc: "Analysez vos progrès et performances" }
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-xl hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-full flex items-center justify-center mx-auto mb-6">
                  <item.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#052648] mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fonctionnalites" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#052648] mb-4">Fonctionnalités Avancées</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour exceller en médecine
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Intelligence Artificielle", desc: "Personnalise votre parcours d'apprentissage selon vos besoins" },
              { icon: Users, title: "Apprentissage Collaboratif", desc: "Échangez et apprenez avec d'autres étudiants" },
              { icon: Target, title: "Objectifs Personnalisés", desc: "Fixez et atteignez vos objectifs de formation" },
              { icon: BookOpen, title: "Bibliothèque Complète", desc: "Accédez à des milliers de ressources médicales" },
              { icon: Award, title: "Certifications", desc: "Obtenez des badges reconnus par les institutions" },
              { icon: Zap, title: "Feedback Instantané", desc: "Recevez des corrections immédiates sur vos diagnostics" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#052648] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="avantages" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#052648]">Pourquoi Choisir FullTang ?</h2>
              <p className="text-xl text-gray-600">
                Rejoignez des milliers d'étudiants qui ont transformé leur formation médicale
              </p>
              
              <div className="space-y-4">
                {[
                  "Apprentissage sans risque dans un environnement simulé",
                  "Feedback instantané sur vos décisions médicales",
                  "Progression mesurable avec des objectifs clairs",
                  "Préparation optimale aux examens cliniques",
                  "Accès 24/7 depuis n'importe quel appareil"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle className="text-green-600" size={16} />
                    </div>
                    <p className="text-gray-700 text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-2xl p-8 text-white">
              <div className="space-y-6">
                {[
                  { icon: Target, value: "98%", label: "Précision diagnostique" },
                  { icon: TrendingUp, value: "+45%", label: "Amélioration moyenne" },
                  { icon: Zap, value: "30 min", label: "Pratique quotidienne" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all">
                    <stat.icon className="text-cyan-300 flex-shrink-0" size={32} />
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm opacity-90">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 px-4 bg-transparent text-gray-700">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Prêt à Transformer Votre Formation ?
          </h2>
          <p className="text-xl text-gray-500">
            Commencez gratuitement et accédez à des centaines de cas cliniques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-white text-[#052648] rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              Essai Gratuit 14 Jours
            </button>
            <button className="px-10 py-4 bg-[#052648] border-2 border-white text-white hover:text-[#052648] rounded-lg font-bold text-lg hover:bg-[#052648]/10 transition-all">
              Demander une Démo
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(-10px) rotate(-6deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #052648 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}