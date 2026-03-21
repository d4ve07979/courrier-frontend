// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, Mail, FileText, Users, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { notificationApi, type Notification } from '../api/notificationApi';
import axiosInstance from '../api/axiosConfig';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { notifications: realtimeNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitial = async () => {
      if (!user) return;
      try {
        const result = await notificationApi.getMesNotifications();
        setNotifications(result.notifications);
      } catch (err) {
        console.error('Erreur chargement notifications', err);
        setNotifications([]);
      }
    };
    loadInitial();
  }, [user]);

  useEffect(() => {
    setNotifications(prev => {
      const all = [...realtimeNotifications, ...prev];
      const unique = all.filter((n, i, a) => a.findIndex(t => t.id === n.id) === i);
      return unique.sort((a, b) => new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime());
    });
  }, [realtimeNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      const response = await axiosInstance.get('/api/courriers/rechercher', {
        params: { q: searchQuery.trim() }
      });

      if (response.data.success && Array.isArray(response.data.resultats)) {
        setSearchResults(response.data.resultats);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleResultClick = (result: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    switch (result.type) {
      case 'courrier':
        navigate(`/courriers/${result.id}`);
        break;
      case 'contact':
        navigate('/contacts');
        break;
      case 'document':
        navigate('/documents');
        break;
      default:
        navigate('/search', { state: { query: searchQuery } });
    }
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    setShowSearchResults(false);
  };

  const handleNotificationClick = (notif: Notification) => {
    setShowNotifications(false);
    if (notif.idCourrier) {
      navigate(`/courriers/${notif.idCourrier}`);
    }
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  // ✅ Nouvelle fonction pour changer le mot de passe
  const handleChangePassword = () => {
    setShowUserMenu(false);
    navigate('/changer-mot-de-passe');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const renderResultIcon = (type: string) => {
    switch (type) {
      case 'courrier':
        return <Mail className="w-4 h-4 text-purple-400" />;
      case 'contact':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { color: 'bg-orange-500', text: 'En attente' },
      traité: { color: 'bg-green-500', text: 'Traité' },
      archivé: { color: 'bg-blue-500', text: 'Archivé' },
      contact: { color: 'bg-purple-500', text: 'Contact' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const nonLues = notifications.filter(n => !n.lue).length;

  return (
    <>
      {/* Navbar fixe en haut */}
      <header className="fixed top-0 left-0 right-0 bg-slate-800/70 backdrop-blur-md border-b border-slate-700 z-[999] shadow-lg">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Barre de recherche */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  placeholder="Rechercher un courrier, un contact, un document..."
                  className="w-full pl-10 pr-20 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || searchLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800 text-white rounded text-sm transition-colors disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                  Rechercher
                </button>
              </div>
            </form>
          </div>

          {/* Section droite */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={handleNotifications}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {nonLues > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {nonLues > 99 ? '99+' : nonLues}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Menu utilisateur */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="text-right hidden md:block">
                  <p className="text-white text-sm font-medium">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-slate-400 text-xs capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dropdowns en position fixed (au-dessus de tout) */}
      {/* Dropdown Notifications */}
      {showNotifications && (
        <div 
          ref={notificationsRef}
          className="fixed right-8 top-20 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[9999] max-h-96 overflow-y-auto"
        >
          <div className="p-3 border-b border-slate-700 flex justify-between items-center">
            <span className="text-white font-medium">Notifications</span>
            <span className="text-xs text-slate-400">
              {nonLues} non lue(s)
            </span>
          </div>
          <div className="divide-y divide-slate-700">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 hover:bg-slate-700/50 transition-colors ${
                    !notification.lue ? 'bg-slate-700/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.lue ? 'bg-slate-600' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm whitespace-pre-wrap break-words">
                        {notification.message}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(notification.dateEnvoi).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-slate-700">
            <button
              onClick={() => {
                navigate('/notifications');
                setShowNotifications(false);
              }}
              className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Recherche */}
      {showSearchResults && (
        <div 
          ref={searchRef}
          className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[9999] max-h-96 overflow-y-auto"
        >
          {searchLoading ? (
            <div className="p-4 text-center text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
              Recherche en cours...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  {searchResults.length} résultat(s) trouvé(s)
                </span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fermer
                </button>
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {renderResultIcon(result.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{result.title}</span>
                        {renderStatusBadge(result.status)}
                      </div>
                      <p className="text-slate-400 text-xs">{result.description}</p>
                      <p className="text-slate-500 text-xs mt-1">{result.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucun résultat trouvé pour "{searchQuery}"</p>
              <p className="text-sm mt-1">Essayez d'autres termes de recherche</p>
            </div>
          ) : null}
        </div>
      )}

      {/* ✅ Menu utilisateur amélioré avec option "Changer le mot de passe" */}
      {showUserMenu && (
        <div 
          ref={userMenuRef}
          className="fixed right-8 top-20 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[9999] overflow-hidden"
        >
          {/* En-tête avec dégradé */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600">
            <p className="text-white font-semibold">{user?.prenom} {user?.nom}</p>
            <p className="text-purple-100 text-xs mt-1">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-white text-xs">
              {user?.role}
            </span>
          </div>

          {/* Options du menu */}
          <div className="p-2">
            <button
              onClick={handleProfile}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Mon profil</span>
            </button>

            {/* ✅ NOUVEAU BOUTON : Changer le mot de passe */}
            <button
              onClick={handleChangePassword}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Changer le mot de passe</span>
            </button>

            <button
              onClick={handleSettings}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>

            <div className="border-t border-slate-200 my-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};