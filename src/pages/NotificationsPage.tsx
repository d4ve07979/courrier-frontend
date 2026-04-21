// src/pages/NotificationsPage.tsx
import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Bell, CheckCircle, Mail, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { notificationApi, type Notification } from '../api/notificationApi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.getMesNotifications();
      const sorted = (response.notifications || []).sort((a: Notification, b: Notification) =>
        new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()
      );
      setNotifications(sorted);
    } catch (err) {
      setError('Impossible de charger les notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.lue) {
      try {
        await notificationApi.marquerCommeLue(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, lue: true } : n));
      } catch (err) {
        console.error('Erreur marquage lu', err);
      }
    }
    if (notif.idCourrier) {
      navigate(`/courriers/${notif.idCourrier}`);
    }
  };

  const handleMarquerToutCommeLu = async () => {
    try {
      await notificationApi.marquerToutCommeLu();
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    } catch (err) {
      console.error('Erreur marquage tout lu', err);
    }
  };

  const nonLues = notifications.filter(n => !n.lue).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 pt-20"> {/* ← AJOUT DE pt-20 */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Bell className="w-8 h-8 text-purple-400" />
                  Notifications
                </h1>
                <p className="text-slate-400">
                  {nonLues > 0 
                    ? `${nonLues} notification${nonLues > 1 ? 's' : ''} non lue${nonLues > 1 ? 's' : ''}`
                    : 'Toutes vos notifications sont lues'}
                </p>
              </div>
              {nonLues > 0 && (
                <button
                  onClick={handleMarquerToutCommeLu}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Aucune notification</h3>
                <p className="text-slate-400">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-5 rounded-xl transition-all ${
                      !notif.lue 
                        ? 'bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30' 
                        : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notif.lue ? 'bg-purple-500' : 'bg-slate-700'
                      }`}>
                        {notif.idCourrier ? <Mail className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white whitespace-pre-wrap font-sans">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {format(new Date(notif.dateEnvoi), 'PPP à HH:mm', { locale: fr })}
                        </p>
                        {!notif.lue && (
                          <span className="inline-block mt-3 px-3 py-1 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                            Nouvelle
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};