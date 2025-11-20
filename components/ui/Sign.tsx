// components/ui/sign.tsx
'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from './Button';

const SignaturePad = () => {
  // On utilise une référence pour accéder directement à l'élément canvas du DOM
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Un état pour savoir si l'utilisateur est en train de dessiner
  const [isDrawing, setIsDrawing] = useState(false);
  // Un état pour savoir si quelque chose a été dessiné (pour masquer le placeholder)
  const [isSigned, setIsSigned] = useState(false);

  // Cet effet s'exécute après le premier rendu du composant
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Le contexte 2D est l'objet sur lequel on dessine
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // -- Configuration du style du "pinceau" --
    ctx.strokeStyle = '#052648'; // Couleur du trait (bleu foncé)
    ctx.lineWidth = 2;           // Épaisseur du trait
    ctx.lineCap = 'round';       // Extrémités des traits arrondies
    ctx.lineJoin = 'round';      // Jonctions entre les traits arrondies

    // --- Gestion du redimensionnement ---
    // C'est crucial pour que la signature ne soit pas déformée si la fenêtre change de taille
    const handleResize = () => {
        // On donne au canvas une taille explicite en pixels, basée sur sa taille d'affichage CSS
        // Cela évite les déformations et le flou.
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Re-appliquer les styles après redimensionnement, car le contexte est réinitialisé
        ctx.strokeStyle = '#052648';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    handleResize(); // Appel initial
    window.addEventListener('resize', handleResize);

    // Fonction de nettoyage pour enlever l'écouteur d'événement
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- Fonctions de dessin ---

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number, y: number } | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) { // Événement tactile
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }
    // Événement souris
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(event);
    if (!coords) return;
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    if(!isSigned) setIsSigned(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const coords = getCoordinates(event);
    if (!coords) return;
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
    }
  };
  
  // Dans une vraie application, cette fonction enverrait les données de l'image
  const saveSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          // Vous pouvez maintenant utiliser cette dataUrl (ex: l'envoyer à un serveur, l'afficher ailleurs)
          console.log('Signature sauvegardée:', dataUrl);
          alert('Signature capturée ! (Vérifiez la console)');
      }
  }

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 w-full h-20 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing} // Important pour arrêter le dessin si la souris sort du canvas
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {/* Placeholder qui s'affiche uniquement si rien n'est dessiné */}
      {!isSigned && (
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 italic pointer-events-none">
          Dessinez votre signature ici
        </p>
      )}

      {/* Bouton pour effacer */}
      {isSigned && (
        <div className="absolute top-2 right-2">
            <Button variant="ghost" size="sm" onClick={clearSignature} title="Effacer la signature">
                <Eraser className="w-4 h-4 mr-2" /> Effacer
            </Button>
            {/* Vous pouvez ajouter un bouton de sauvegarde ici si nécessaire */}
            {/* 
            <Button size="sm" onClick={saveSignature} className="ml-2">
                Sauvegarder
            </Button> 
            */}
        </div>
      )}
    </div>
  );
};

export default SignaturePad;