import React, { useEffect, useState } from 'react';
import { CheckCircle, User, FileText, Calendar } from 'lucide-react';
import { dechargeApi, Decharge } from '../../api/dechargeApi';

interface Props {
  idCourrier: number;
  refresh?: number; // incrémenter pour forcer le rechargement
}

export const ListeDecharges: React.FC<Props> = ({ idCourrier, refresh }) => {
  const [decharges, setDecharges] = useState<Decharge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dechargeApi.getByCourrier(idCourrier)
      .then(setDecharges)
      .catch(() => setDecharges([]))
      .finally(() => setLoading(false));
  }, [idCourrier, refresh]);

  if (loading) return <p style={{ fontSize: 13, color: '#9ca3af' }}>Chargement...</p>;

  if (decharges.length === 0) {
    return (
      <div style={styles.empty}>
        <FileText size={24} color="#d1d5db" />
        <p style={styles.emptyText}>Aucune décharge enregistrée pour ce courrier.</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {decharges.map(d => (
        <div key={d.id_decharge} style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.badge(d.type_signature)}>
              {d.type_signature === 'ELECTRONIQUE'
                ? <><User size={11} /> Électronique</>
                : <><FileText size={11} /> Physique</>
              }
            </div>
            <div style={styles.date}>
              <Calendar size={12} color="#9ca3af" />
              <span>{new Date(d.dateSignature).toLocaleString('fr-FR')}</span>
            </div>
          </div>
          <div style={styles.signataire}>
            <CheckCircle size={14} color="#16a34a" />
            <span style={styles.signataireText}>
              Signé par : <strong>{d.nom_signataire}</strong>
            </span>
          </div>
          {d.observation && (
            <p style={styles.observation}>
              Observation : {d.observation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, any> = {
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    background: '#f9fafb', borderRadius: '10px',
    padding: '14px 16px', border: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '8px',
  },
  badge: (type: string) => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
    fontWeight: 600,
    background: type === 'ELECTRONIQUE' ? '#dbeafe' : '#fef3c7',
    color: type === 'ELECTRONIQUE' ? '#1e40af' : '#92400e',
  }),
  date: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#9ca3af',
  },
  signataire: { display: 'flex', alignItems: 'center', gap: '8px' },
  signataireText: { fontSize: '13px', color: '#374151' },
  observation: {
    fontSize: '12px', color: '#6b7280',
    background: 'white', borderRadius: '6px',
    padding: '6px 10px', margin: 0,
    border: '1px solid #f3f4f6',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', padding: '24px', color: '#9ca3af',
  },
  emptyText: { fontSize: '13px', margin: 0 },
};