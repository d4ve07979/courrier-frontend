// src/pages/ModifierCourrierPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FormulaireCourrier } from '../components/courriers/FormulaireCourrier';
import { CourrierService } from '../services/courrierService';
import type { Courrier } from '../types/Courrier';

export const ModifierCourrierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du courrier à modifier
  useEffect(() => {
    const fetchCourrier = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await CourrierService.obtenirCourrierParId(parseInt(id));
        setCourrier(data);
      } catch (err) {
        console.error('Erreur chargement courrier:', err);
        setError('Impossible de charger le courrier à modifier.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourrier();
  }, [id]);

  const handleSuccess = (updatedCourrier: Courrier) => {
    console.log('✅ Courrier modifié avec succès:', updatedCourrier);
    // Rediriger vers la page des courriers après modification
    setTimeout(() => navigate('/courriers'), 1500);
  };

  const handleCancel = () => {
    navigate('/courriers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-4xl mx-auto text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-slate-400">Chargement du courrier...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !courrier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-red-400 mb-4">{error || 'Courrier introuvable'}</p>
              <button
                onClick={() => navigate('/courriers')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg"
              >
                Retour à la liste
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            
            <FormulaireCourrier
              mode="modification"
              courrierToEdit={courrier}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </main>
      </div>
    </div>
  );
};