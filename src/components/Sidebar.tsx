import React, { useState } from 'react';
import { 
  Home, Mail, Archive, Settings, Users, 
  ChevronLeft, ChevronRight, FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

// Import du logo INSEED (même chemin que dans LoginPage et Dashboard)
import logoInseed from '../assets/logo-inseed-officiel.jpg'; // Adaptez si nécessaire

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Mail, label: 'Courriers', path: '/courriers' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Archive, label: 'Archives', path: '/archives' },
    { icon: BarChart3, label: 'Rapports', path: '/rapports' },
    { icon: Mail, label: 'Mes courriers', path: '/mes-courriers' },
    { icon: Mail, label: 'Ma Boîte', path: '/ma-boite-reception', roles: ['DIRECTION', 'DIVISION', 'SERVICES', 'SECRETARIAT'] },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users', roles: ['ADMIN'] },
    { icon: Settings, label: 'Paramètres', path: '/parametres' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  const handleNavigation = (path: string) => {
    console.log(`🧭 Navigation vers: ${path}`);
    navigate(path);
  };

  const toggleSidebar = () => {
    console.log(`📁 Sidebar ${isCollapsed ? 'étendu' : 'replié'}`);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 min-h-screen transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } flex flex-col`}>
      {/* Logo INSEED en haut */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-center">
        <div className={`bg-white rounded-xl p-2 border-2 border-green-600 shadow-md transition-all ${
          isCollapsed ? 'w-12 h-12' : 'w-48'
        }`}>
          <img
            src={logoInseed}
            alt="Logo officiel INSEED - République Togolaise"
            className={`w-full h-auto object-contain ${isCollapsed ? 'w-8' : 'w-full'}`}
          />
        </div>
      </div>

      {/* Header Sidebar (texte seulement si non replié) */}
      <div className="p-4 border-b border-slate-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-white">Courrier App</h2>
              <p className="text-xs text-slate-400 capitalize">{role?.toLowerCase()}</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2 flex-1">
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-purple-500/20 hover:text-white rounded-lg transition-colors group ${
                isActive ? 'bg-purple-500/20 text-white' : ''
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 bg-slate-700/30 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-slate-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};