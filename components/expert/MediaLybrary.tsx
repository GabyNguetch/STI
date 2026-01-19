// components/expert/MediaLibrary.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ImageIcon, Search, Filter, Trash2, Eye, Download, UploadCloud,
  X, CheckCircle2, Maximize2, AlertTriangle, FileDigit, Calendar,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllImages, deleteImage } from '@/services/expertService';
import type { BackendImage } from '@/types/backend';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageUploadModal from './media/ImageUploadModal';
import Image from 'next/image';

const styles = `
    .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
`;

export default function MediaLibrary() {
    // États Données
    const [images, setImages] = useState<BackendImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<BackendImage | null>(null);
    const [filterType, setFilterType] = useState("Tous");
    
    // Drag & Drop States
    const [isDragging, setIsDragging] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    
    // Init
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllImages();
            setImages(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error("Impossible de charger la médiathèque");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIQUE DRAG & DROP ---
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }; // Crucial pour drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith('image/')) return toast.error("Seules les images sont acceptées");
            setFileToUpload(file); // Déclenche l'ouverture du modal
        }
    };
    
    // --- FILTER ---
    const uniqueTypes = useMemo(() => ["Tous", ...Array.from(new Set(images.map(i => i.type_examen || "Autre")))], [images]);
    const filteredImages = useMemo(() => {
        if (filterType === "Tous") return images;
        return images.filter(i => (i.type_examen || "Autre") === filterType);
    }, [images, filterType]);

    // --- ACTIONS ---
    const handleDelete = async (id: number) => {
        if(!confirm("Supprimer définitivement cette image ?")) return;
        const t = toast.loading("Suppression...");
        try {
            await deleteImage(id);
            setImages(prev => prev.filter(img => img.id !== id));
            if(selectedImage?.id === id) setSelectedImage(null);
            toast.success("Image supprimée", {id: t});
        } catch(e) {
            toast.error("Erreur technique", {id: t});
        }
    }

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden relative"
             onDragEnter={handleDragEnter} // Global Drag listener
        >
            <style>{styles}</style>

            {/* OVERLAY DE DRAG & DROP GLOBAL */}
            {isDragging && (
                <div 
                    className="absolute inset-0 z-[100] bg-blue-500/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200 border-8 border-dashed border-white m-4 rounded-3xl"
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <UploadCloud size={80} className="text-white mb-4 animate-bounce"/>
                    <h2 className="text-3xl font-bold text-white">Relâchez pour ajouter l'image</h2>
                    <p className="text-white/80 mt-2 text-lg">Qualification automatique à l'étape suivante</p>
                </div>
            )}

            {/* === COLONNE PRINCIPALE : GRILLE & HEADER === */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedImage ? 'xl:mr-[420px] hidden md:flex' : ''}`}>
                
                {/* Header */}
                <div className="px-6 md:px-8 py-5 flex items-center justify-between gap-4 sticky top-0 bg-slate-50 z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-[#052648] flex items-center gap-2">
                            <ImageIcon className="text-emerald-500"/> PACS & Imagerie
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">{images.length} clichés disponibles dans le cloud sécurisé.</p>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Hidden Input pour Upload bouton */}
                        <label htmlFor="file-upload" className="cursor-pointer bg-[#052648] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95">
                            <UploadCloud size={18}/> <span>Importer</span>
                            <input 
                                id="file-upload" type="file" accept="image/*" className="hidden" 
                                onChange={(e) => {
                                    if(e.target.files?.[0]) setFileToUpload(e.target.files[0]);
                                    e.target.value = ''; // Reset input
                                }}
                            />
                        </label>
                    </div>
                </div>

                {/* Filtres Tags */}
                <div className="px-6 md:px-8 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                     {uniqueTypes.map(type => (
                         <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap
                                ${filterType === type 
                                    ? 'bg-[#052648] text-white border-[#052648] shadow-md' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}
                            `}
                         >
                             {type}
                         </button>
                     ))}
                </div>

                {/* GRILLE D'IMAGES */}
                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-20 custom-scrollbar">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[1,2,3,4,5,6,7,8,9,10].map(i => <Skeleton key={i} className="aspect-square rounded-2xl bg-white/50" />)}
                        </div>
                    ) : filteredImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[200px]">
                             {filteredImages.map((img) => (
                                 <div 
                                    key={img.id}
                                    onClick={() => setSelectedImage(img)}
                                    className={`
                                        group relative rounded-2xl overflow-hidden cursor-pointer bg-black border transition-all duration-300 shadow-sm hover:shadow-xl
                                        ${selectedImage?.id === img.id ? 'ring-4 ring-[#052648] border-transparent scale-[0.98]' : 'border-slate-100 hover:-translate-y-1'}
                                    `}
                                 >
                                     <Image 
                                        src={img.fichier_url} 
                                        alt="Thumbnail" 
                                        fill 
                                        className={`object-cover transition-transform duration-700 ${selectedImage?.id === img.id ? 'opacity-100 scale-105' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'}`}
                                        unoptimized // Crucial pour urls externes
                                     />
                                     
                                     {/* Overlay Information au survol ou actif */}
                                     <div className={`
                                        absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end
                                        transition-opacity duration-300
                                        ${selectedImage?.id === img.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                     `}>
                                         <p className="text-white font-bold text-sm leading-snug line-clamp-1">{img.type_examen}</p>
                                         <p className="text-slate-300 text-xs font-medium">{img.sous_type || "Standard"}</p>
                                     </div>

                                     {/* Validation Badge */}
                                     {img.valide_expert && (
                                         <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                             <CheckCircle2 size={12}/>
                                         </div>
                                     )}
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-3xl">
                            <ImageIcon size={48} className="opacity-30 mb-2"/>
                            <p>Aucune image pour ce filtre.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* === SIDEBAR DETAILS (FIXED RIGHT) === */}
            {selectedImage && (
                <aside className={`
                    fixed inset-y-0 right-0 z-40 w-full md:w-[420px] bg-white shadow-2xl border-l border-slate-200 
                    transform transition-transform duration-300 ease-in-out flex flex-col
                    ${selectedImage ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    
                    {/* TOP: Image Zoom Preview */}
                    <div className="relative w-full h-[40vh] bg-slate-950 flex items-center justify-center shrink-0 group">
                        <Image
                            src={selectedImage.fichier_url}
                            alt="Full"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                        <button 
                            className="absolute top-4 left-4 p-2 bg-black/40 text-white hover:bg-black/60 rounded-full transition md:hidden"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={20}/>
                        </button>
                         {/* Close Button Desktop */}
                        <button 
                             className="absolute top-4 right-4 p-2 bg-white/20 text-white hover:bg-white hover:text-black rounded-full transition shadow-lg backdrop-blur"
                             onClick={() => setSelectedImage(null)}
                        >
                             <X size={18}/>
                        </button>
                    </div>

                    {/* BOTTOM: Scrollable Metadata */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#052648]">{selectedImage.type_examen}</h2>
                                <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                                    <MapPinBadge label={selectedImage.sous_type || "Zone non spécifiée"} />
                                    <span>• {selectedImage.format_image?.toUpperCase() || "JPEG"}</span>
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider mb-1 ${selectedImage.valide_expert ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                    {selectedImage.valide_expert ? 'Validé' : 'À revoir'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">#{selectedImage.id}</span>
                            </div>
                        </div>

                        {/* Qualité */}
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200">
                             <div className="text-xs font-bold uppercase text-slate-400">Qualité</div>
                             <div className="flex gap-1">
                                 {[1,2,3,4,5].map(i => (
                                     <div key={i} className={`w-3 h-3 rounded-full ${i <= selectedImage.qualite_image ? 'bg-[#052648]' : 'bg-slate-200'}`}></div>
                                 ))}
                             </div>
                        </div>

                        {/* Description / Rapport */}
                        <div className="space-y-2">
                             <h3 className="font-bold text-[#052648] flex items-center gap-2 text-sm"><FileText size={16}/> Rapport Radiologique</h3>
                             <p className="text-sm text-slate-700 bg-white p-4 border border-slate-200 rounded-xl leading-relaxed shadow-sm">
                                 {selectedImage.description || <span className="italic text-slate-400">Aucune description saisie.</span>}
                             </p>
                        </div>

                        {/* Technical Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                             <MetaRow icon={FileDigit} label="Poids" value={`${(selectedImage.taille_ko || 0).toFixed(1)} Ko`} />
                             <MetaRow icon={Maximize2} label="Résolution" value={selectedImage.resolution || "Inconnue"} />
                             <MetaRow icon={AlertTriangle} label="Difficulté" value={`Niveau ${selectedImage.niveau_difficulte}`} />
                             <MetaRow icon={Calendar} label="Date" value={new Date(selectedImage.created_at).toLocaleDateString()} />
                        </div>
                        
                        <div className="border-t border-slate-200 my-4"></div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                             <Button variant="outline" className="text-slate-600" onClick={() => window.open(selectedImage.fichier_url, '_blank')}>
                                 <Download size={16} className="mr-2"/> Télécharger
                             </Button>
                             <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-transparent" onClick={() => handleDelete(selectedImage.id)}>
                                 <Trash2 size={16} className="mr-2"/> Supprimer
                             </Button>
                        </div>

                    </div>

                </aside>
            )}

            {/* MODAL UPLOAD QUI POP AU DROP/CLICK */}
            <ImageUploadModal 
                file={fileToUpload}
                isOpen={!!fileToUpload}
                onClose={() => setFileToUpload(null)}
                onSuccess={loadData}
            />

        </div>
    );
}

// Mini composants utilitaires pour le détail
const MapPinBadge = ({ label }: { label: string }) => <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">{label}</span>;
const MetaRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
            <Icon size={12}/> {label}
        </div>
        <div className="font-mono font-bold text-[#052648] truncate" title={value}>{value}</div>
    </div>
);