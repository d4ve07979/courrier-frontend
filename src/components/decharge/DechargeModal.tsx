import React, { useState } from 'react';
import { X, CheckCircle, User, FileText } from 'lucide-react';
import { dechargeApi } from '../../api/dechargeApi';

interface Props {
  idCourrier: number;
  objetCourrier: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DechargeModal: React.FC<Props> = ({
  idCourrier,
  objetCourrier,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<'ELECTRONIQUE' | 'PHYSIQUE'>('ELECTRONIQUE');
  const [nomSignataire, setNomSignataire] = useState('');
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (type === 'ELECTRONIQUE') {
        await dechargeApi.accuserReception(idCourrier, observation);
      } else {
        if (!nomSignataire.trim()) {
          setError('Le nom du signataire est obligatoire pour une décharge physique.');
          setLoading(false);
          return;
        }
        await dechargeApi.enregistrerPhysique(idCourrier, nomSignataire, observation);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <CheckCircle size={20} color="#16a34a" />
            <h2 style={styles.title}>Enregistrer une décharge</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Courrier concerné */}
        <div style={styles.courrierBox}>
          <FileText size={14} color="#6b7280" />
          <span style={styles.courrierText}>
            <strong>Courrier :</strong> {objetCourrier}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Type de signature */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Type de signature</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="ELECTRONIQUE"
                  checked={type === 'ELECTRONIQUE'}
                  onChange={() => setType('ELECTRONIQUE')}
                  style={{ marginRight: 8 }}
                />
                <User size={14} style={{ marginRight: 4 }} />
                Électronique (utilisateur connecté)
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="PHYSIQUE"
                  checked={type === 'PHYSIQUE'}
                  onChange={() => setType('PHYSIQUE')}
                  style={{ marginRight: 8 }}
                />
                <FileText size={14} style={{ marginRight: 4 }} />
                Physique (coursier / destinataire)
              </label>
            </div>
          </div>

          {/* Nom signataire (si physique) */}
          {type === 'PHYSIQUE' && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nom du signataire *</label>
              <input
                type="text"
                value={nomSignataire}
                onChange={e => setNomSignataire(e.target.value)}
                placeholder="Ex : AGBEKO Kofi — Coursier Ministère X"
                style={styles.input}
                required
              />
            </div>
          )}

          {/* Observation */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Observation (optionnel)</label>
            <textarea
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Ex : Reçu en bon état, original remis le..."
              rows={3}
              style={{ ...styles.input, resize: 'vertical' as const }}
            />
          </div>

          {/* Erreur */}
          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Enregistrement...' : 'Enregistrer la décharge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  },
  modal: {
    background: 'white', borderRadius: '14px', width: '100%',
    maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#9ca3af', padding: '4px', borderRadius: '6px',
    display: 'flex', alignItems: 'center',
  },
  courrierBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', background: '#f9fafb',
    borderBottom: '1px solid #f3f4f6',
  },
  courrierText: { fontSize: '13px', color: '#374151' },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#374151' },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  radioLabel: {
    display: 'flex', alignItems: 'center', fontSize: '14px',
    color: '#374151', cursor: 'pointer',
  },
  input: {
    padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', color: '#111827',
    outline: 'none', fontFamily: 'inherit', width: '100%',
    boxSizing: 'border-box' as const,
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '10px 14px',
  },
  errorText: { fontSize: '13px', color: '#dc2626', margin: 0 },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', background: '#f3f4f6', border: 'none',
    borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    color: '#374151', fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '10px 20px', background: '#16a34a', border: 'none',
    borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    color: 'white', fontFamily: 'inherit', fontWeight: 600,
  },
};