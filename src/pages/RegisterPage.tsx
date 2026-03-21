import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/authApi';
import type { RegisterRequest } from '../types/Auth';
import type { UserRole } from '../types/Auth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'SERVICES' // Rôle par défaut
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value as UserRole : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('🔄 Tentative d\'inscription avec:', {
        email: formData.email,
        role: formData.role,
        backendUrl: 'http://localhost:8089'
      });

      const response = await authApi.register(formData);

      if (response.success) {
        console.log('✅ Inscription réussie:', response.utilisateur);
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');

        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          motDePasse: '',
          role: 'SERVICES'
        });
      } else {
        const errorMessage = response.message || 'Échec de l\'inscription';
        setError(errorMessage);
        console.error('❌ Erreur d\'inscription:', errorMessage);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'inscription:', err);

      let errorMessage = 'Erreur lors de la création du compte';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend Spring Boot est démarré sur le port 8089.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 relative">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse"></div>
            <User className="w-10 h-10 text-white relative" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CourierFlow</h1>
          <p className="text-slate-400">Créez votre compte pour commencer</p>
        </div>

        {/* Register Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Inscription réussie !</h2>
              <p className="text-slate-400 mb-6">{success}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-slate-300 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Votre nom"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Prénom */}
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-slate-300 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Votre prénom"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="email@exemple.com"
                      required
                      disabled={loading}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="motDePasse"
                      name="motDePasse"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.motDePasse}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Mot de passe"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.
                  </p>
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                    Rôle
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    disabled={loading}
                  >
                    <option value="SERVICES">Services</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Le rôle est attribué automatiquement</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer un compte'
                  )}
                </button>
              </form>

              {/* Back to login */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-slate-400">
                  Vous avez déjà un compte ?{' '}
                  <Link
                    to="/login"
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Se connecter
                  </Link>
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-slate-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-1 w-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-500 text-sm mt-8">
          © 2025 CourierFlow. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};