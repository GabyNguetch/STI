'use client';

// La logique est maintenant dans le composant Library, nous l'importons simplement.
import Library from '@/components/dashboard/Library';

/**
 * Cette page sert de point d'entrée pour la route /cas
 * et affiche le composant réutilisable de la bibliothèque.
 */
export default function CasLibraryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <Library />
        </div>
      </main>
    </div>
  );
}