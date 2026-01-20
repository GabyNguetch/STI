// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, ArrowRight, Star, Play, Stethoscope, 
  CheckCircle, Award, HeartPulse, Zap, GraduationCap, 
  Users, Mail, Phone, Facebook, Twitter, Linkedin, 
  Instagram, Youtube, ChevronRight, Activity, Brain, BarChart3, 
  Smartphone,
  MapPin
} from 'lucide-react';
import Image from 'next/image';
import router, { useRouter } from 'next/navigation';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <HeartPulse className="text-white" size={22} />
            </div>
            <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-[#052648]' : 'text-[#052648]'}`}>The Good Doctor</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {['Accueil', 'Fonctionnalités', 'Réseau', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-600 hover:text-[#052648] font-medium transition-colors text-sm">{item}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/connexion" 
              className="text-[#052648] font-semibold hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="group relative px-6 py-2.5 bg-[#052648] text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <span className="relative z-10">Commencer</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-[#052648] opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-700">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl">
          <div className="px-4 py-6 space-y-4">
            {['Accueil', 'Fonctionnalités', 'Réseau', 'Contact'].map((item) => (
               <a key={item} href={`#${item.toLowerCase()}`} className="block text-gray-600 font-medium py-2">{item}</a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/connexion" className="w-full px-5 py-3 text-[#052648] font-bold text-center border border-slate-200 rounded-xl">
                Connexion
              </Link>
              <Link href="/inscription" className="w-full px-6 py-3 bg-[#052648] text-white rounded-xl font-bold text-center shadow-lg">
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const router = useRouter();
  return (
    <section id="accueil" className="pt-32 pb-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50/50 relative overflow-hidden">
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
                <Link href='/simulation' className="group px-8 py-4 bg-[#052648] text-white rounded-lg font-semibold text-lg hover:bg-[#0a4d8f] transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2">
                  Jouer Maintenant
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {/* --- CORRECTION ICI : Bouton Démo devient Guide --- */}
                <Link 
                  href='/aide' 
                  className="px-8 py-4 bg-white border-2 border-[#052648] text-[#052648] rounded-lg font-semibold text-lg hover:bg-[#052648] hover:text-white transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
                >
                  <Play size={20} className="group-hover:fill-white transition-colors" />
                  Voir le Guide
                </Link>
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
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                    <Image 
                       src="/images/simu1.jpg" 
                       alt="Simulation" 
                       fill 
                       className="object-contain"
                    />
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
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
            </div>
          </div>
        </div>
      </section>
  );
}

function AppExperienceSection() {
  return (
    <section className="py-1 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative mx-auto lg:mx-0 max-w-[320px] lg:max-w-[400px]">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[#052648]/5 rounded-full z-0 blur-3xl"></div>
             
             <div className="relative z-10 bg-slate-900 rounded-[2.5rem] border-8 border-slate-900 shadow-2xl overflow-hidden aspect-[6/8] transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-slate-50 flex flex-col">
                   <div className="h-6 bg-[#052648] w-full shrink-0"></div>
                   <div className="px-6 py-6 bg-[#052648] text-white rounded-b-3xl mb-4 shrink-0">
                      <div className="flex justify-between items-center mb-4">
                         <div className="w-8 h-8 rounded-full bg-white/20"></div>
                         <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                         </div>
                      </div>
                      <div className="h-2 w-24 bg-white/30 rounded-full mb-2"></div>
                      <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                   </div>
                   
                   <div className="flex-1 px-4 space-y-3 overflow-hidden relative">
                      {[1,2,3,4].map(i => (
                         <div key={i} className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 animate-slide-up" style={{ animationDelay: `${i*150}ms` }}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${i===1?'bg-cyan-100 text-cyan-600':i===2?'bg-purple-100 text-purple-600':'bg-slate-100 text-slate-400'}`}>
                               <Activity size={20}/>
                            </div>
                            <div className="flex-1 space-y-1">
                               <div className="h-2 w-20 bg-slate-200 rounded"></div>
                               <div className="h-1.5 w-12 bg-slate-100 rounded"></div>
                            </div>
                         </div>
                      ))}
                      <div className="absolute bottom-4 right-4 left-4 bg-[#052648] p-3 rounded-xl shadow-xl flex items-center gap-3 text-white animate-bounce-slow">
                          <div className="p-2 bg-white/20 rounded-lg"><CheckCircle size={16}/></div>
                          <div>
                             <p className="text-xs font-bold">Cas terminé !</p>
                             <p className="text-[10px] opacity-80">Score: 18/20</p>
                          </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>

          <div className="space-y-8">
             <div>
                <h3 className="text-lg font-semibold text-cyan-600 uppercase tracking-widest mb-2">Étudiant ou Professionnel</h3>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#052648] leading-tight">
                   Laissez la théorie <br/>
                   <span className="text-slate-300">aux livres.</span> <br/>
                   Passez à la pratique.
                </h2>
                <p className="mt-4 text-md text-slate-600 font-light">
                   Concentrez-vous uniquement sur vos compétences cliniques. Notre plateforme gère la complexité pédagogique pour vous.
                </p>
             </div>

             <div className="grid gap-3">
                <div className="flex gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                   <div className="w-14 h-14 bg-gradient-to-br from-[#052648] to-blue-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Users size={28}/>
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-[#052648] mb-1">Accès illimité aux patients virtuels</h4>
                      <p className="text-sm text-slate-500">Une file active gigantesque générée par IA. Chaque jour de nouveaux cas.</p>
                   </div>
                </div>

                <div className="flex gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                   <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Smartphone size={28}/>
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-[#052648] mb-1">Connexion fluide partout</h4>
                      <p className="text-sm text-slate-500">Depuis votre smartphone ou votre ordinateur. En quelques clics, vous traitez votre premier patient.</p>
                   </div>
                </div>

                <div className="flex gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                   <div className="w-14 h-14 bg-gradient-to-br from-[#052648] to-[#0a4d8f] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <BarChart3 size={28}/>
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-[#052648] mb-1">Feedback Tuteur IA & Gestion</h4>
                      <p className="text-sm text-slate-500">Rapports de performance détaillés, organisation des lacunes et plans de révision personnalisés.</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function NetworkMapSection() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#052648] leading-tight">
                            Nous sommes présents dans <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">toutes les régions.</span>
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Rejoignez la plus grande communauté d'apprentissage médical en Afrique Centrale. Ne vous préoccupez que de vos compétences.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-start gap-4 hover:-translate-y-1 transition-transform cursor-default">
                            <span className="text-5xl font-extrabold text-slate-200 shrink-0 select-none">1<sup className="text-3xl align-top">er</sup></span>
                            <div>
                                <h4 className="text-lg font-bold text-[#052648] mb-1">Plateforme Spécialisée</h4>
                                <p className="text-sm text-slate-500">Première IA générative dédiée exclusivement au contexte médical local et tropical.</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                            <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-[#052648] mb-1">Communauté Active</h4>
                                <p className="text-sm text-slate-500">Un réseau d'entraide entre étudiants et experts.</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <Award size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-[#052648] mb-1">Support Premium</h4>
                                <p className="text-sm text-slate-500">Accompagnement pédagogique pour tous les membres.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 relative h-[500px] w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                            src="/images/map.png" 
                            alt="Carte du réseau" 
                            className="w-full h-full max-w-[650px] object-contain opacity-90 hover:opacity-40 transition-opacity duration-500" 
                        />
                    </div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#052648] w-4 h-4 rounded-full shadow-[0_0_20px_#052648] animate-ping-slow"></div>
                    
                    {[
                        { t: '55%', l: '30%', img: 'https://i.pravatar.cc/150?u=1', d: '0s' },
                        { t: '75%', l: '50%', img: 'https://i.pravatar.cc/150?u=2', d: '1.2s' },
                        { t: '65%', l: '80%', img: 'https://i.pravatar.cc/150?u=4', d: '0.5s' },
                        { t: '80%', l: '45%', img: 'https://i.pravatar.cc/150?u=5', d: '1.8s' }
                    ].map((pin, i) => (
                        <div key={i} className="absolute flex flex-col items-center gap-1 group cursor-pointer hover:z-50" style={{ top: pin.t, left: pin.l }}>
                            <div className="relative w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden transform group-hover:scale-125 transition-transform duration-300" style={{ animation: `float 3s ease-in-out infinite ${pin.d}` }}>
                                <img src={pin.img} alt="User" className="w-full h-full object-cover"/>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 bg-[#052648] text-white text-[10px] font-bold py-1 px-2 rounded-full transition-opacity absolute top-12 whitespace-nowrap">
                                Étudiant Actif
                            </div>
                        </div>
                    ))}
                    
                    <div className="absolute top-10 right-0 bg-white/80 backdrop-blur shadow-xl rounded-xl p-4 max-w-[180px] animate-float">
                        <div className="flex -space-x-2 mb-2">
                            {[1,2,3].map(j=><div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>)}
                        </div>
                        <p className="text-xs font-semibold text-slate-700">Rejoint par +120 étudiants cette semaine</p>
                    </div>

                </div>
            </div>
        </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#052648] text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                <HeartPulse className="text-[#052648]" size={20} strokeWidth={3}/>
              </div>
              <span className="text-2xl font-bold tracking-wide">FullTang</span>
            </div>
            <p className="text-blue-100/80 leading-relaxed text-sm">
              Votre partenaire de formation médicale pour devenir un médecin d'excellence au Cameroun et en Afrique.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#052648] transition-all transform hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">Liens Rapides <div className="h-1 w-8 bg-cyan-400 rounded-full"></div></h3>
            <ul className="space-y-3">
              {['Accueil', 'Fonctionnalités', 'Réseau', 'Tarifs', 'Contact'].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-blue-100/70 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400"/> {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">Ressources <div className="h-1 w-8 bg-cyan-400 rounded-full"></div></h3>
            <ul className="space-y-3">
              {['Bibliothèque de Cas', 'Guides ECN', 'Blog Médical', 'Support', 'Partenaires'].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-blue-100/70 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400"/> {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">Nous Contacter <div className="h-1 w-8 bg-cyan-400 rounded-full"></div></h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="text-cyan-400" size={16} />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Email</div>
                  <a href="mailto:contact@fulltang.cm" className="text-white hover:text-cyan-400 transition-colors text-sm">contact@fulltang.cm</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="text-cyan-400" size={16} />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Téléphone</div>
                  <a href="tel:+237699000000" className="text-white hover:text-cyan-400 transition-colors text-sm">+237 699 00 00 00</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-cyan-400" size={16} />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Siège</div>
                  <p className="text-white text-sm">Yaoundé, Cameroun</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-200/60">
            <p>© 2025 FullTang Medical. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {['Confidentialité', 'CGU', 'Mentions Légales'].map((link, i) => (
                <a key={i} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white scroll-smooth font-sans text-slate-900 selection:bg-cyan-100 selection:text-[#052648]">
      <Navbar />

      <main>
        <HeroSection />
        
        {/* Highlight Section */}
        <section className="py-16 bg-white relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <span className="text-cyan-600 font-bold uppercase tracking-widest text-xs">Pédagogie Avancée</span>
                <h2 className="text-3xl font-bold text-[#052648] mt-2">Apprendre par la simulation</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Brain, title: "Raisonnement Clinique", desc: "Développez vos réflexes face aux urgences." },
                { icon: Stethoscope, title: "Sémiologie", desc: "Interprétez les signes physiques virtuels avec précision." },
                { icon: BarChart3, title: "Analyse & Feedback", desc: "Suivez votre progression courbe par courbe." }
              ].map((item, i) => (
                <div key={i} className="text-center p-8 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default">
                  <div className="w-16 h-16 bg-[#052648] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                    <item.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#052648] mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AppExperienceSection />
        <NetworkMapSection />

        <section id="contact" className="py-24 px-4 bg-white text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
              <h2 className="text-4xl lg:text-5xl text-[#052648] font-extrabold tracking-tight">
                Rejoignez l'élite médicale de demain.
              </h2>
              <p className="text-xl text-blue-900 max-w-2xl mx-auto">
                Commencez gratuitement dès aujourd'hui et accédez à une bibliothèque de cas conçue par des professeurs agrégés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="px-10 py-4 bg-white text-[#052648] rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2">
                  Essai Gratuit
                  <Zap size={20} className="fill-[#052648]" />
                </button>
                <button className="px-10 py-4 bg-[#052648] border-2 border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                  Voir les Tarifs Universitaires
                </button>
              </div>
           </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes ping-slow {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite 2s; }
        .animate-slide-up { animation: slideInUp 0.6s ease-out forwards; opacity: 0; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}