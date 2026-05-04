// src/pages/NouveauCourrierPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, FileText, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const NouveauCourrierPage: React.FC = () => {
  const navigate = useNavigate();
  const annee = new Date().getFullYear();

  const cardBase: React.CSSProperties = {
    textAlign: 'left', background: 'white',
    border: '1.5px solid #e5e7eb', borderRadius: 12,
    padding: 28, cursor: 'pointer', width: '100%',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f7f8fa', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 40px 48px 40px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>

            {/* Retour */}
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 13, marginBottom: 36, padding: 0 }}>
              <ArrowLeft size={14} /> Retour
            </button>

            {/* En-tête */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: '#ede9fe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={17} color="#7c3aed" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Enregistrement</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                Quel type de courrier souhaitez-vous créer ?
              </h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                Sélectionnez le registre correspondant pour accéder au formulaire adapté.
              </p>
            </div>

            <div style={{ height: 1, background: '#e5e7eb', marginBottom: 28 }} />

            {/* Cartes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Entrant */}
              <button style={cardBase}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                onClick={() => navigate('/nouveau-courrier-entrant')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowDownLeft size={20} color="#16a34a" />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '1.5px', textTransform: 'uppercase' }}>ARRIVÉE</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>CA-{annee}-XXXX</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#d1d5db" />
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Courrier entrant</h2>
                <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, margin: '0 0 10px' }}>Enregistrer un courrier reçu</p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: '0 0 20px' }}>
                  Courriers reçus de l'extérieur — ministères, organismes, partenaires institutionnels.
                </p>

                <div style={{ height: 1, background: '#f3f4f6', marginBottom: 14 }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>Champs spécifiques</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 0' }}>
                  {['Référence expéditeur', 'Date du document', 'Mode de réception', 'Délai de réponse'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowDownLeft size={13} color="#16a34a" />
                  <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Créer un courrier entrant</span>
                </div>
              </button>

              {/* Sortant */}
              <button style={cardBase}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                onClick={() => navigate('/nouveau-courrier-sortant')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowUpRight size={20} color="#2563eb" />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#2563eb', letterSpacing: '1.5px', textTransform: 'uppercase' }}>DÉPART</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>CD-{annee}-XXXX</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#d1d5db" />
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Courrier sortant</h2>
                <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, margin: '0 0 10px' }}>Rédiger un courrier à envoyer</p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: '0 0 20px' }}>
                  Courriers officiels émis par l'INSEED vers un organisme externe ou partenaire.
                </p>

                <div style={{ height: 1, background: '#f3f4f6', marginBottom: 14 }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>Champs spécifiques</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 0' }}>
                  {["Référence interne", "Mode d'envoi", "Date d'envoi prévue", "Délai de réponse"].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowUpRight size={13} color="#2563eb" />
                  <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>Créer un courrier sortant</span>
                </div>
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
              La numérotation est attribuée automatiquement à la validation du formulaire.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
