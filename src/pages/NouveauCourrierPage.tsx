// src/pages/NouveauCourrierPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, FileText, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const NouveauCourrierPage: React.FC = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<'entrant' | 'sortant' | null>(null);

  const choices = [
    {
      key: 'entrant' as const,
      route: '/nouveau-courrier-entrant',
      icon: ArrowDownLeft,
      accentColor: '#22c55e',
      accentBg: 'rgba(34,197,94,0.08)',
      accentBorder: 'rgba(34,197,94,0.25)',
      badge: 'ARRIVÉE',
      badgeBg: 'rgba(34,197,94,0.12)',
      badgeColor: '#4ade80',
      title: 'Courrier entrant',
      subtitle: 'Enregistrer un courrier reçu',
      description: 'Courriers physiques ou numériques reçus de l\'extérieur, d\'un ministère, d\'un organisme ou d\'un partenaire.',
      features: [
        'Référence de l\'expéditeur',
        'Date du document original',
        'Mode de réception',
        'Délai de réponse',
      ],
      code: 'CA-' + new Date().getFullYear() + '-XXXX',
    },
    {
      key: 'sortant' as const,
      route: '/nouveau-courrier-sortant',
      icon: ArrowUpRight,
      accentColor: '#3b82f6',
      accentBg: 'rgba(59,130,246,0.08)',
      accentBorder: 'rgba(59,130,246,0.25)',
      badge: 'DÉPART',
      badgeBg: 'rgba(59,130,246,0.12)',
      badgeColor: '#60a5fa',
      title: 'Courrier sortant',
      subtitle: 'Rédiger un courrier à envoyer',
      description: 'Courriers officiels émis par l\'INSEED vers un organisme externe, un ministère ou un partenaire institutionnel.',
      features: [
        'Référence interne INSEED',
        'Mode d\'envoi',
        'Date d\'envoi prévue',
        'Délai de réponse attendu',
      ],
      code: 'CD-' + new Date().getFullYear() + '-XXXX',
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center px-6 md:px-12 py-12 pt-20">
          <div className="max-w-4xl mx-auto w-full">
            {/* Retour */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour
            </button>

            {/* En-tête */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Enregistrement</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Quel type de courrier<br />souhaitez-vous créer ?
              </h1>
              <p className="text-slate-400 mt-3 text-base">
                Sélectionnez le registre correspondant à votre courrier pour accéder au formulaire adapté.
              </p>
            </div>

            {/* Cartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {choices.map(c => {
                const Icon = c.icon;
                const isHovered = hovered === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => navigate(c.route)}
                    onMouseEnter={() => setHovered(c.key)}
                    onMouseLeave={() => setHovered(null)}
                    className="text-left w-full group"
                    style={{ outline: 'none' }}
                  >
                    <div
                      style={{
                        background: isHovered ? c.accentBg : 'rgba(15,23,42,0.6)',
                        border: `1.5px solid ${isHovered ? c.accentColor : 'rgba(100,116,139,0.3)'}`,
                        borderRadius: '16px',
                        padding: '28px',
                        transition: 'all 0.22s ease',
                        transform: isHovered ? 'translateY(-3px)' : 'none',
                        boxShadow: isHovered ? `0 12px 40px ${c.accentColor}22` : '0 2px 12px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {/* Header carte */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: 48, height: 48,
                              borderRadius: 12,
                              background: c.accentBg,
                              border: `1px solid ${c.accentBorder}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s',
                              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                            }}
                          >
                            <Icon size={22} style={{ color: c.accentColor }} />
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: 10, fontWeight: 700,
                                letterSpacing: '1.5px',
                                color: c.badgeColor,
                                background: c.badgeBg,
                                padding: '2px 8px',
                                borderRadius: 4,
                                display: 'inline-block',
                              }}
                            >
                              {c.badge}
                            </span>
                            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 11, marginTop: 2 }}>
                              {c.code}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          style={{
                            color: isHovered ? c.accentColor : 'rgba(100,116,139,0.5)',
                            transition: 'all 0.2s',
                            transform: isHovered ? 'translateX(3px)' : 'none',
                          }}
                        />
                      </div>

                      {/* Titre */}
                      <h2
                        style={{
                          fontSize: 20, fontWeight: 700,
                          color: isHovered ? '#fff' : 'rgba(255,255,255,0.9)',
                          marginBottom: 4,
                          transition: 'color 0.2s',
                        }}
                      >
                        {c.title}
                      </h2>
                      <p style={{ fontSize: 13, color: c.accentColor, fontWeight: 500, marginBottom: 12 }}>
                        {c.subtitle}
                      </p>
                      <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.6, marginBottom: 20 }}>
                        {c.description}
                      </p>

                      {/* Features */}
                      <div
                        style={{
                          borderTop: `1px solid ${isHovered ? c.accentBorder : 'rgba(100,116,139,0.15)'}`,
                          paddingTop: 16,
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(100,116,139,0.7)', letterSpacing: '1px', marginBottom: 10, textTransform: 'uppercase' }}>
                          Champs spécifiques
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {c.features.map(f => (
                            <div key={f} className="flex items-center gap-2">
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.accentColor, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: 'rgba(203,213,225,0.8)' }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <div
                        style={{
                          marginTop: 20,
                          padding: '10px 16px',
                          borderRadius: 10,
                          background: isHovered ? c.accentColor : 'rgba(100,116,139,0.1)',
                          color: isHovered ? '#fff' : 'rgba(148,163,184,0.8)',
                          fontSize: 13,
                          fontWeight: 600,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Icon size={15} />
                        Créer un {c.title.toLowerCase()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Note bas de page */}
            <p className="text-center text-slate-500 text-xs mt-8">
              La numérotation est attribuée automatiquement à la validation du formulaire.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};