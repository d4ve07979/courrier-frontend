import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, BarChart2, FileText } from 'lucide-react';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(formData);
      if (response.success && response.access_token) {
        await new Promise(r => setTimeout(r, 100));
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setError('Serveur inaccessible. Contactez le service informatique.');
      } else {
        setError(err.response?.data?.message || err.message || 'Identifiants incorrects.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="inseed-loading">
        <div className="inseed-spinner" />
        <p>{isAuthenticated ? 'Redirection…' : 'Vérification en cours…'}</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .inseed-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #f1f5f1;
        }

        .inseed-left {
          width: 52%;
          background: #0d3318;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateX(-16px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .inseed-left.mounted { opacity: 1; transform: translateX(0); }

        .inseed-top-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, rgba(22,163,74,0) 100%);
        }

        .inseed-deco-ring {
          position: absolute;
          bottom: -100px; right: -100px;
          width: 340px; height: 340px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.05);
          pointer-events: none;
        }
        .inseed-deco-ring-2 {
          position: absolute;
          bottom: -50px; right: -50px;
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
          pointer-events: none;
        }
        .inseed-deco-dot {
          position: absolute;
          top: 200px; right: 60px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(34,197,94,0.3);
        }

        .inseed-left-inner {
          position: relative;
          z-index: 1;
          padding: 52px 48px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .inseed-republic {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 7px 14px;
          margin-bottom: 48px;
          width: fit-content;
        }
        .inseed-flag {
          display: flex;
          gap: 2px;
        }
        .inseed-flag-stripe {
          width: 4px;
          height: 14px;
          border-radius: 1px;
        }
        .inseed-republic-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .inseed-logo-wrap {
          background: white;
          border-radius: 12px;
          padding: 16px 22px;
          width: fit-content;
          margin-bottom: 36px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .inseed-logo-wrap img {
          height: 54px;
          object-fit: contain;
          display: block;
        }

        .inseed-acronym {
          font-size: 50px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 8px;
        }
        .inseed-fullname {
          font-size: 12.5px;
          color: rgba(255,255,255,0.45);
          line-height: 1.75;
          font-weight: 400;
          margin-bottom: 28px;
        }

        .inseed-rule {
          width: 36px;
          height: 2px;
          background: #22c55e;
          border-radius: 2px;
          margin-bottom: 24px;
        }

        .inseed-platform-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .inseed-platform-name {
          font-size: 19px;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          margin-bottom: 40px;
        }

        .inseed-modules {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .inseed-module {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          cursor: default;
          transition: background 0.2s;
        }
        .inseed-module:hover { background: rgba(255,255,255,0.07); }
        .inseed-module-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ade80;
          flex-shrink: 0;
        }
        .inseed-module-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.82);
          display: block;
          line-height: 1.3;
        }
        .inseed-module-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          display: block;
          margin-top: 2px;
        }

        .inseed-left-footer {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .inseed-left-footer-text {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
        }
        .inseed-version-tag {
          font-size: 10px;
          color: rgba(255,255,255,0.18);
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.5px;
        }

        /* ── Panneau droit ── */
        .inseed-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s ease 0.18s, transform 0.7s ease 0.18s;
        }
        .inseed-right.mounted { opacity: 1; transform: translateY(0); }

        .inseed-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .inseed-mobile-logo {
          display: none;
          text-align: center;
          margin-bottom: 32px;
        }
        .inseed-mobile-logo img { height: 44px; object-fit: contain; }
        .inseed-mobile-logo p { font-size: 12px; color: #6b7280; margin-top: 8px; }

        .inseed-form-eyebrow {
          font-size: 10px;
          font-weight: 700;
          color: #16a34a;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .inseed-form-title {
          font-size: 28px;
          font-weight: 700;
          color: #0d3318;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .inseed-form-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        .inseed-field { margin-bottom: 20px; }
        .inseed-field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 7px;
          letter-spacing: 0.2px;
        }
        .inseed-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .inseed-field-icon {
          position: absolute;
          left: 14px;
          color: #c4c9d0;
          pointer-events: none;
          transition: color 0.2s;
          display: flex;
        }
        .inseed-field-wrap.active .inseed-field-icon { color: #16a34a; }

        .inseed-field-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          color: #111827;
          background: #ffffff;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inseed-field-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.08);
        }
        .inseed-field-input::placeholder { color: #d1d5db; font-size: 13px; }
        .inseed-field-input:disabled { background: #f9fafb; opacity: 0.7; }

        .inseed-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #c4c9d0;
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .inseed-eye-btn:hover { color: #6b7280; background: #f3f4f6; }

        .inseed-error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-left: 3px solid #ef4444;
          border-radius: 8px;
          padding: 11px 14px;
          margin-bottom: 18px;
        }
        .inseed-error-box p {
          font-size: 13px;
          color: #b91c1c;
          font-weight: 500;
          line-height: 1.5;
        }

        .inseed-submit {
          width: 100%;
          padding: 14px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(22,163,74,0.28);
          margin-top: 6px;
        }
        .inseed-submit:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(22,163,74,0.32);
        }
        .inseed-submit:active:not(:disabled) { transform: none; }
        .inseed-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .inseed-help {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid #f0f0f0;
          text-align: center;
        }
        .inseed-help-main { font-size: 13px; color: #9ca3af; }
        .inseed-help-main strong { color: #374151; font-weight: 600; }
        .inseed-help-contact { font-size: 11.5px; color: #c4c9d0; margin-top: 6px; }

        .inseed-secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 18px;
          padding: 9px 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }
        .inseed-secure-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
          animation: blink 2.5s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .inseed-secure-badge p { font-size: 11px; color: #15803d; font-weight: 500; }

        .inseed-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #f1f5f1;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .inseed-loading p { font-size: 14px; color: #6b7280; }
        .inseed-spinner {
          width: 32px; height: 32px;
          border: 2.5px solid #bbf7d0;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 800px) {
          .inseed-left { display: none !important; }
          .inseed-right { width: 100% !important; }
          .inseed-mobile-logo { display: block !important; }
        }
      `}</style>

      <div className="inseed-root">

        {/* Panneau gauche */}
        <div className={`inseed-left ${mounted ? 'mounted' : ''}`}>
          <div className="inseed-top-accent" />
          <div className="inseed-deco-ring" />
          <div className="inseed-deco-ring-2" />
          <div className="inseed-deco-dot" />

          <div className="inseed-left-inner">

            <div className="inseed-republic">
              <div className="inseed-flag">
                <div className="inseed-flag-stripe" style={{ background: '#16a34a' }} />
                <div className="inseed-flag-stripe" style={{ background: '#facc15' }} />
                <div className="inseed-flag-stripe" style={{ background: '#dc2626' }} />
              </div>
              <span className="inseed-republic-label">République Togolaise</span>
            </div>

            <div className="inseed-logo-wrap">
              <img src={logoInseed} alt="Logo INSEED" />
            </div>

            <div className="inseed-acronym">INSEED</div>
            <p className="inseed-fullname">
              Institut National de la Statistique<br />
              et des Études Économiques<br />
              et Démographiques
            </p>

            <div className="inseed-rule" />

            <p className="inseed-platform-label">Plateforme de</p>
            <h2 className="inseed-platform-name">Gestion des Courriers</h2>

            <div className="inseed-modules">
              {[
                {
                  icon: <FileText size={15} />,
                  name: 'Courriers entrants & sortants',
                  desc: 'Enregistrement, suivi et archivage',
                },
                {
                  icon: <BarChart2 size={15} />,
                  name: 'Statistiques et rapports',
                  desc: 'Tableaux de bord en temps réel',
                },
                {
                  icon: <CheckCircle size={15} />,
                  name: 'Traçabilité complète',
                  desc: 'Journalisation de chaque action',
                },
              ].map((m, i) => (
                <div className="inseed-module" key={i}>
                  <div className="inseed-module-icon">{m.icon}</div>
                  <div>
                    <span className="inseed-module-name">{m.name}</span>
                    <span className="inseed-module-desc">{m.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="inseed-left-footer">
              <span className="inseed-left-footer-text">© 2025 INSEED — Tous droits réservés</span>
              <span className="inseed-version-tag">v2.0.0</span>
            </div>

          </div>
        </div>

        {/* Panneau droit */}
        <div className={`inseed-right ${mounted ? 'mounted' : ''}`}>
          <div className="inseed-form-wrap">

            <div className="inseed-mobile-logo">
              <img src={logoInseed} alt="INSEED" />
              <p>Institut National de la Statistique</p>
            </div>

            <p className="inseed-form-eyebrow">Espace Agent</p>
            <h1 className="inseed-form-title">Connexion</h1>
            <p className="inseed-form-subtitle">
              Renseignez vos identifiants pour accéder à la plateforme de gestion des courriers.
            </p>

            <form onSubmit={handleSubmit} autoComplete="on">

              <div className="inseed-field">
                <label className="inseed-field-label" htmlFor="email">
                  Adresse email professionnelle
                </label>
                <div className={`inseed-field-wrap ${focusedField === 'email' ? 'active' : ''}`}>
                  <span className="inseed-field-icon"><Mail size={15} /></span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="prenom.nom@inseed.tg"
                    className="inseed-field-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="inseed-field">
                <label className="inseed-field-label" htmlFor="motDePasse">
                  Mot de passe
                </label>
                <div className={`inseed-field-wrap ${focusedField === 'password' ? 'active' : ''}`}>
                  <span className="inseed-field-icon"><Lock size={15} /></span>
                  <input
                    id="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    className="inseed-field-input"
                    style={{ paddingRight: '46px' }}
                    value={formData.motDePasse}
                    onChange={e => setFormData({ ...formData, motDePasse: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="inseed-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="inseed-error-box">
                  <p>{error}</p>
                </div>
              )}

              <button type="submit" className="inseed-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.75s linear infinite' }} />
                    Connexion en cours…
                  </>
                ) : 'Se connecter'}
              </button>

            </form>

            <div className="inseed-help">
              <p className="inseed-help-main">
                Problème de connexion ? <strong>Contactez le service informatique</strong>
              </p>
              <p className="inseed-help-contact">
                +228 22 25 36 00 &nbsp;·&nbsp; support@inseed.tg
              </p>
            </div>

            <div className="inseed-secure-badge">
              <div className="inseed-secure-dot" />
              <p>Accès sécurisé — Réservé aux agents de l'INSEED</p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};
