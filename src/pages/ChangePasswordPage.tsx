// src/pages/ChangePasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/authApi';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // ✅ CORRECTION : Utiliser les noms de champs attendus par le backend
  const [formData, setFormData] = useState({
    ancienMotDePasse: '',        // ← Changé de currentPassword
    nouveauMotDePasse: '',        // ← Changé de newPassword
    confirmationMotDePasse: ''    // ← Changé de confirmPassword
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const togglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Au moins 8 caractères');
    if (!/[A-Z]/.test(password)) errors.push('Une majuscule');
    if (!/[a-z]/.test(password)) errors.push('Une minuscule');
    if (!/[0-9]/.test(password)) errors.push('Un chiffre');
    if (!/[@#$%^&+=!]/.test(password)) errors.push('Un caractère spécial (@#$%^&+=!)');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.ancienMotDePasse || !formData.nouveauMotDePasse || !formData.confirmationMotDePasse) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (formData.nouveauMotDePasse !== formData.confirmationMotDePasse) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    const passwordErrors = validatePassword(formData.nouveauMotDePasse);
    if (passwordErrors.length > 0) {
      setError(`Mot de passe trop faible : ${passwordErrors.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ Envoyer avec les bons noms de champs
      await authApi.changePassword({
        ancienMotDePasse: formData.ancienMotDePasse,
        nouveauMotDePasse: formData.nouveauMotDePasse,
        confirmationMotDePasse: formData.confirmationMotDePasse
      });

      setSuccess('✅ Mot de passe modifié avec succès !');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Erreur changement mot de passe:', err);
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const passwordErrors = formData.nouveauMotDePasse ? validatePassword(formData.nouveauMotDePasse) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-md mx-auto">
            {/* Bouton retour */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            {/* Carte principale */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
              {/* En-tête */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-10 h-10 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Changer le mot de passe
                </h1>
                <p className="text-slate-400">
                  {user?.prenom} {user?.nom}
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="ancienMotDePasse"  // ← Changé
                      value={formData.ancienMotDePasse}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="nouveauMotDePasse"  // ← Changé
                      value={formData.nouveauMotDePasse}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Indicateur de force du mot de passe */}
                  {formData.nouveauMotDePasse && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1">
                        {passwordErrors.length === 0 ? (
                          <div className="h-2 w-full bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 rounded-full"
                               style={{ width: `${Math.max(20, 100 - passwordErrors.length * 16)}%` }}>
                          </div>
                        )}
                      </div>
                      <ul className="text-xs space-y-1">
                        <li className={passwordErrors.includes('Au moins 8 caractères') ? 'text-red-400' : 'text-green-400'}>
                          ✓ 8 caractères minimum
                        </li>
                        <li className={passwordErrors.includes('Une majuscule') ? 'text-red-400' : 'text-green-400'}>
                          ✓ Au moins une majuscule
                        </li>
                        <li className={passwordErrors.includes('Une minuscule') ? 'text-red-400' : 'text-green-400'}>
                          ✓ Au moins une minuscule
                        </li>
                        <li className={passwordErrors.includes('Un chiffre') ? 'text-red-400' : 'text-green-400'}>
                          ✓ Au moins un chiffre
                        </li>
                        <li className={passwordErrors.includes('Un caractère spécial') ? 'text-red-400' : 'text-green-400'}>
                          ✓ Au moins un caractère spécial (@#$%^&+=!)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmationMotDePasse"  // ← Changé
                      value={formData.confirmationMotDePasse}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmationMotDePasse && formData.nouveauMotDePasse !== formData.confirmationMotDePasse && (
                    <p className="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>

              {/* Note de sécurité */}
              <p className="mt-6 text-xs text-center text-slate-500">
                🔒 Pour des raisons de sécurité, vous serez déconnecté après le changement de mot de passe.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};