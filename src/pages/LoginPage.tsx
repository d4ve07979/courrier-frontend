import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import logoInseed from '../assets/logo-inseed-officiel.jpg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ email: '', motDePasse: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(formData);
      if (response.success && response.access_token) {
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.message || 'Échec de la connexion');
      }
    } catch (err: any) {
      let errorMessage = 'Identifiants incorrects';
      if (err.message) errorMessage = err.message;
      else if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.code === 'ERR_NETWORK') errorMessage = 'Serveur inaccessible. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>
            {isAuthenticated ? 'Redirection…' : 'Vérification en cours…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Panneau gauche */}
      <div style={{ ...styles.leftPanel, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-24px)', transition: 'all 0.7s ease' }}>
        {/* Bande décorative verticale */}
        <div style={styles.accentBar} />

        <div style={styles.leftContent}>
          {/* Badge République */}
          <div style={styles.republicBadge}>
            <span style={styles.republicText}>RÉPUBLIQUE TOGOLAISE</span>
            <span style={styles.republicDivider}>·</span>
            <span style={styles.republicMotto}>Travail — Liberté — Patrie</span>
          </div>

          {/* Logo */}
          <div style={styles.logoWrapper}>
            <img src={logoInseed} alt="INSEED" style={styles.logo} />
          </div>

          {/* Titre institution */}
          <div style={styles.institutionBlock}>
            <h1 style={styles.institutionName}>INSEED</h1>
            <p style={styles.institutionFull}>
              Institut National de la Statistique<br />
              et des Études Économiques et Démographiques
            </p>
          </div>

          {/* Séparateur */}
          <div style={styles.divider} />

          {/* Titre système */}
          <div style={styles.systemBlock}>
            <p style={styles.systemLabel}>SYSTÈME DE</p>
            <h2 style={styles.systemTitle}>Gestion des Courriers</h2>
          </div>

          {/* Features */}
          <div style={styles.features}>
            {[
              { icon: '📬', label: 'Gestion des courriers entrants et sortants' },
              { icon: '📡', label: 'Suivi et traçabilité en temps réel' },
              { icon: '🔒', label: 'Sécurité et confidentialité des données' },
            ].map((f, i) => (
              <div key={i} style={{ ...styles.feature, animationDelay: `${0.2 + i * 0.1}s` }}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureLabel}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Pied de page gauche */}
          <div style={styles.leftFooter}>
            <p style={styles.leftFooterText}>© 2025 INSEED · Tous droits réservés</p>
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div style={{ ...styles.rightPanel, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.15s' }}>
        <div style={styles.formCard}>
          {/* En-tête formulaire */}
          <div style={styles.formHeader}>
            <div style={styles.formHeaderAccent} />
            <div>
              <h2 style={styles.formTitle}>Connexion</h2>
              <p style={styles.formSubtitle}>Accédez à votre espace de travail</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={styles.form} autoComplete="on">
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Adresse email</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="prenom.nom@inseed.tg"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  value={formData.motDePasse}
                  onChange={e => setFormData({ ...formData, motDePasse: e.target.value })}
                  required
                  disabled={loading}
                  style={{ ...styles.input, paddingRight: '44px' }}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none', paddingRight: '44px' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorDot}>⚠</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => !loading && Object.assign((e.target as HTMLElement).style, styles.submitBtnHover)}
              onMouseLeave={e => !loading && Object.assign((e.target as HTMLElement).style, { background: '#16a34a', transform: 'none' })}
            >
              {loading ? (
                <span style={styles.btnContent}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Connexion en cours…
                </span>
              ) : (
                <span style={styles.btnContent}>Se connecter</span>
              )}
            </button>
          </form>

          {/* Aide */}
          <div style={styles.helpBlock}>
            <p style={styles.helpText}>
              Problème de connexion ?{' '}
              <span style={styles.helpLink}>Contactez le service informatique</span>
            </p>
            <p style={styles.helpContact}>📞 +228 22 25 36 00 &nbsp;|&nbsp; ✉️ support@inseed.tg</p>
          </div>

          {/* Badge sécurité */}
          <div style={styles.securityBadge}>
            <span style={styles.securityIcon}>🔒</span>
            <span style={styles.securityText}>Connexion sécurisée — Réservée aux agents de l'INSEED</span>
          </div>
        </div>

        {/* Logo mobile */}
        <div style={styles.mobileLogo}>
          <img src={logoInseed} alt="INSEED" style={{ height: '48px', objectFit: 'contain' }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

const GREEN = '#16a34a';
const GREEN_DARK = '#15803d';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_BORDER = '#bbf7d0';

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  // === Panneau gauche ===
  leftPanel: {
    width: '45%',
    background: `linear-gradient(160deg, ${GREEN_DARK} 0%, ${GREEN} 60%, #22c55e 100%)`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: 'rgba(255,255,255,0.3)',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  republicBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '6px',
    padding: '8px 14px',
    marginBottom: '40px',
    backdropFilter: 'blur(8px)',
    width: 'fit-content',
  },
  republicText: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '1.5px',
  },
  republicDivider: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
  },
  republicMotto: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    letterSpacing: '0.5px',
  },
  logoWrapper: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px 28px',
    marginBottom: '32px',
    width: 'fit-content',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  logo: {
    height: '64px',
    objectFit: 'contain',
    display: 'block',
  },
  institutionBlock: {
    marginBottom: '24px',
  },
  institutionName: {
    fontSize: '36px',
    fontWeight: 800,
    color: 'white',
    margin: 0,
    letterSpacing: '2px',
    lineHeight: 1,
  },
  institutionFull: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.75)',
    margin: '8px 0 0',
    lineHeight: 1.6,
  },
  divider: {
    width: '48px',
    height: '3px',
    background: 'rgba(255,255,255,0.4)',
    borderRadius: '2px',
    marginBottom: '24px',
  },
  systemBlock: {
    marginBottom: '36px',
  },
  systemLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '2px',
    margin: 0,
  },
  systemTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'white',
    margin: '6px 0 0',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flex: 1,
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    backdropFilter: 'blur(4px)',
  },
  featureIcon: {
    fontSize: '18px',
    lineHeight: 1,
  },
  featureLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 500,
  },
  leftFooter: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.15)',
  },
  leftFooterText: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },

  // === Panneau droit ===
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    background: '#f8fafc',
  },
  formCard: {
    width: '100%',
    maxWidth: '420px',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '32px',
  },
  formHeaderAccent: {
    width: '4px',
    height: '48px',
    background: GREEN,
    borderRadius: '2px',
    flexShrink: 0,
    marginTop: '2px',
  },
  formTitle: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    lineHeight: 1.2,
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: GREEN,
    boxShadow: `0 0 0 3px ${GREEN_LIGHT}`,
    background: 'white',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 16px',
  },
  errorDot: {
    fontSize: '14px',
    color: '#ef4444',
    flexShrink: 0,
  },
  errorText: {
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: 500,
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: GREEN,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '4px',
  },
  submitBtnHover: {
    background: GREEN_DARK,
    transform: 'translateY(-1px)',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  helpBlock: {
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #f3f4f6',
    textAlign: 'center' as const,
  },
  helpText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  helpLink: {
    color: GREEN,
    fontWeight: 600,
    cursor: 'pointer',
  },
  helpContact: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '6px 0 0',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '20px',
    background: GREEN_LIGHT,
    border: `1px solid ${GREEN_BORDER}`,
    borderRadius: '8px',
    padding: '10px 16px',
  },
  securityIcon: {
    fontSize: '13px',
  },
  securityText: {
    fontSize: '11px',
    color: GREEN_DARK,
    fontWeight: 500,
  },
  mobileLogo: {
    display: 'none',
  },

  // === Loading ===
  loadingScreen: {
    minHeight: '100vh',
    background: GREEN_LIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${GREEN_BORDER}`,
    borderTopColor: GREEN,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: GREEN_DARK,
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
  },
};
