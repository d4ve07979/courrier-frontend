import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

// Import de l'image du logo (à placer dans src/assets ou public)
import logoInseed from '../assets/logo-inseed-officiel.jpg'; // À adapter selon le chemin réel

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Déjà connecté, redirection vers /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Tentative de connexion avec:', { 
        email: formData.email,
        backendUrl: 'http://localhost:8097'
      });

      const response = await login(formData);

      if (response.success && response.access_token) {
        console.log('✅ Connexion réussie');
        console.log('👤 Utilisateur connecté:', response.utilisateur);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        navigate('/dashboard', { replace: true });
      } else {
        const errorMsg = response.message || 'Échec de la connexion';
        setError(errorMsg);
        console.error('❌ Erreur de connexion:', errorMsg);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la connexion:', err);
      
      let errorMessage = 'Identifiants incorrects';
      
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

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">
            {isAuthenticated ? 'Redirection vers le tableau de bord...' : 'Vérification de l\'authentification...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      {/* Motif de fond avec couleurs togolaises */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-green-600"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-yellow-400"></div>
        <div className="absolute top-2/3 left-0 w-full h-1/3 bg-red-600"></div>
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Section gauche - Branding INSEED */}
          <div className="hidden md:block text-center space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-green-600">
              {/* Logo officiel INSEED + République Togolaise */}
              <div className="mb-8">
                <div className="inline-block bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-600">
                  <img 
                    src={logoInseed} 
                    alt="Logo officiel INSEED - République Togolaise" 
                    className="w-96 max-w-full h-auto object-contain"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-green-800 mb-2">Système de Gestion de courrier INSEED</h1>
              <p className="text-gray-700 font-medium">Institut National de la Statistique</p>
              <p className="text-gray-700 font-medium">et des Études Économiques</p>
              <p className="text-gray-700 font-medium">et Démographiques</p>

              {/* Armoiries simplifiées (conservées pour le style) */}
              <div className="flex items-center justify-center my-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-700 to-green-900 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 text-yellow-400" />
                </div>
              </div>

              <div className="space-y-3 text-left bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="font-medium">Gestion des courriers</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Suivi en temps réel</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="font-medium">Traçabilité complète</span>
                </div>
              </div>
            </div>

          {/*<div className="text-center space-y-2 bg-white/60 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700">République Togolaise</p>
              <p className="text-xs text-gray-600 italic font-medium">"Travail - Liberté - Patrie"</p>
            </div>*/}
          </div>

          {/* Section droite - Formulaire de connexion */}
          <div className="w-full">
            {/* Header mobile avec le logo officiel */}
            <div className="md:hidden text-center mb-8">
              <div className="inline-block bg-white rounded-2xl shadow-2xl p-5 border-4 border-green-600">
                <img 
                  src={logoInseed} 
                  alt="Logo officiel INSEED - République Togolaise" 
                  className="w-72 max-w-full h-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mt-4 mb-1">INSEED</h1>
              <p className="text-sm text-gray-700 font-medium">Gestion des Courriers</p>
            </div>

            {/* Formulaire */}
            <div className="bg-white/95 backdrop-blur-xl border-2 border-green-600 rounded-2xl p-8 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion</h2>
                <p className="text-gray-600">Accédez à votre espace de travail</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email professionnelle
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
                      placeholder="prenom.nom@inseed.tg"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                    <input
                      id="motDePasse"
                      name="motDePasse"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.motDePasse}
                      onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
                      placeholder="Entrez votre mot de passe"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-medium text-center">{error}</p>
                  </div>
                )}

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              {/* Aide */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Problème de connexion ?{' '}
                  <span className="text-green-700 font-semibold">
                    Contactez le service informatique
                  </span>
                </p>
                <p className="text-center text-xs text-gray-500 mt-2">
                  📞 +228 XX XX XX XX | ✉️ support@inseed.tg
                </p>
              </div>
            </div>

            {/* Note de sécurité */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600 bg-white/70 rounded-lg px-4 py-2 inline-block shadow">
                🔒 Connexion sécurisée - Réservée aux employés de l'INSEED
              </p>
            </div>
          </div>
        </div>

                {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t-2 border-green-200">
          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">
              © 2025 INSEED - Institut National de la Statistique et des Études Économiques et Démographiques
            </p>
            
            <p className="text-xs text-gray-600 italic">
              République Togolaise • Travail - Liberté - Patrie
            </p>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <span>📞 +228 22 25 36 00</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>✉️ contact@inseed.tg</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>www.inseed.tg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};