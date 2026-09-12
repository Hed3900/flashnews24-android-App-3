import React from 'react';
import { FcmNotification, Article } from '../../types';
import { Bell, Trash2, ArrowRight, ShieldAlert, Sparkles, Clock } from 'lucide-react';

interface NotificationsScreenProps {
  notifications: FcmNotification[];
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onClearNotifications: () => void;
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  allArticles,
  onSelectArticle,
  onClearNotifications,
  onBack
}) => {
  const handleOpenAlert = (notif: FcmNotification) => {
    if (notif.articleId) {
      const target = allArticles.find(a => a.id === notif.articleId);
      if (target) {
        onSelectArticle(target);
        return;
      }
    }
    // If no exact id match or custom AI alert, open the latest breaking article or first article
    const breaking = allArticles.find(a => a.isBreaking) || allArticles[0];
    if (breaking) onSelectArticle(breaking);
  };

  return (
    <div className="flex flex-col h-full bg-inherit animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-[#252629] sticky top-0 bg-inherit z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Back to Home"
          >
            ←
          </button>
          <div className="w-9 h-8 rounded-xl bg-red-600/15 text-red-400 flex items-center justify-center border border-red-500/30 shadow-sm">
            <Bell className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Notifications</h1>
            <p className="text-[9px] text-[#E1E4E8] opacity-60 font-medium">FlashNews24 alerts</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearNotifications}
            className="text-[#E1E4E8] opacity-60 hover:opacity-100 hover:text-red-500 p-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            title="Clear all alerts"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info Header */}
      <div className="bg-red-600/10 border-b border-red-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-red-400 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Live alert service: <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-white border border-red-500/30">FlashNewsMessagingService</code></span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#111214] rounded-[24px] border border-dashed border-[#252629] my-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#08090A] flex items-center justify-center mx-auto mb-3 text-red-400 border border-[#252629]">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Notifications Yet</h3>
            <p className="text-xs text-[#E1E4E8] opacity-60 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Use the FCM Push Notification Lab on the left panel to broadcast simulated breaking news alerts to this device!
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenAlert(notif)}
              className="bg-[#111214] rounded-[24px] p-3.5 shadow-2xl border border-[#252629] hover:border-red-500/40 transition-all cursor-pointer flex flex-col gap-2 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
              
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/15 text-red-400 uppercase tracking-wider border border-red-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  {notif.priority} PRIORITY
                </span>
                <span className="text-[#E1E4E8] opacity-60 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {notif.timestamp}
                </span>
              </div>

              <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                {notif.title}
              </h3>

              <p className="text-[11px] text-[#E1E4E8] opacity-80 leading-relaxed">
                {notif.body}
              </p>

              <div className="flex items-center justify-end pt-1 mt-1 border-t border-[#252629] text-[10px]">
                <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open Alert <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
