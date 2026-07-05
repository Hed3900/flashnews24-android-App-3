import React, { useState } from 'react';
import { Bell, Sparkles, Send, Zap, Radio, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FcmPushLabProps {
  onBroadcastNotification: (title: string, body: string, priority: 'HIGH' | 'NORMAL', articleId?: string) => void;
  onGenerateAiBreakingArticle: (topic: string) => void;
  isGeneratingAiNews: boolean;
  onSyncBloggerPostPush?: () => void;
  isSyncingBlogger?: boolean;
}

const PRESET_TOPICS = [
  { label: '🤖 AI Breakthrough', topic: 'Artificial Intelligence & Robotics' },
  { label: '📈 Market Boom', topic: 'Global Stock Markets & Crypto Rally' },
  { label: '🪐 Space Mission', topic: 'NASA & SpaceX Deep Space Exploration' },
  { label: '📱 Android 16', topic: 'Google I/O & Android OS Innovation' },
  { label: '🏆 World Cup Finals', topic: 'International Football Championship Thriller' }
];

export const FcmPushLab: React.FC<FcmPushLabProps> = ({
  onBroadcastNotification,
  onGenerateAiBreakingArticle,
  isGeneratingAiNews,
  onSyncBloggerPostPush,
  isSyncingBlogger
}) => {
  const [title, setTitle] = useState('🚨 FLASH BREAKING: Gemini 3.5 Native Audio Released');
  const [body, setBody] = useState('Google DeepMind announces zero-latency multimodal reasoning available across all Android 16 developer builds.');
  const [priority, setPriority] = useState<'HIGH' | 'NORMAL'>('HIGH');
  const [isGeneratingAlert, setIsGeneratingAlert] = useState(false);
  const [customTopic, setCustomTopic] = useState('Clean Energy & Quantum Tech');

  const handleSendPush = () => {
    onBroadcastNotification(title, body, priority);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 }
      });
    } catch (e) {}
  };

  const handleGenerateAiAlert = async () => {
    setIsGeneratingAlert(true);
    try {
      const res = await fetch('/api/fcm/generate-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic })
      });
      const data = await res.json();
      if (data.title && data.body) {
        setTitle(data.title);
        setBody(data.body);
        if (data.priority) setPriority(data.priority);
      }
    } catch (err) {
      setTitle('⚡ BREAKING: Quantum Computing Milestone Achieved');
      setBody('Scientists demonstrate 99.9% error-free qubit stability at room temperature.');
    } finally {
      setIsGeneratingAlert(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1D23] text-[#E1E4E8] p-5 rounded-[32px] border border-[#2D333B] shadow-2xl overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2D333B] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              FCM Push Notification Lab
              <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-bold text-[10px] border border-blue-500/30">LIVE</span>
            </h2>
            <p className="text-xs text-[#E1E4E8] opacity-60">Simulate Firebase Cloud Messaging Background Broadcasts</p>
          </div>
        </div>
      </div>

      {/* Live Blogger Feed -> FCM Trigger Card */}
      {onSyncBloggerPostPush && (
        <div className="bg-[#0F1115] p-4 rounded-[24px] border border-blue-500/30 space-y-3 shadow-xl bg-gradient-to-b from-blue-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Blogger Live Post FCM Trigger
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold border border-emerald-500/30">REAL-TIME</span>
          </div>
          <p className="text-xs text-[#E1E4E8] opacity-80 leading-relaxed">
            Fetch the latest published article from <strong className="text-white">flashnews24.site</strong> Blogger JSON API and immediately broadcast it as an incoming Android FCM push notification!
          </p>
          <button
            onClick={onSyncBloggerPostPush}
            disabled={isSyncingBlogger}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSyncingBlogger ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Syncing Blogger Feed & Dispatching FCM...</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 animate-bounce" />
                <span>Sync Latest Blogger Post -&gt; Trigger FCM Push</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Quick Action: Live AI Breaking News Dispatcher */}
      <div className="bg-[#0F1115] p-4 rounded-[24px] border border-[#2D333B] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-500" />
            Live AI Breaking News Dispatcher
          </h3>
          <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-md font-bold border border-blue-500/30">Gemini 3.5</span>
        </div>
        <p className="text-xs text-[#E1E4E8] opacity-80 leading-relaxed">
          Generate a full, authentic breaking news article via Gemini AI and automatically broadcast an FCM push alert to the Android simulator!
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {PRESET_TOPICS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onGenerateAiBreakingArticle(item.topic)}
              disabled={isGeneratingAiNews}
              className="px-2.5 py-1.5 rounded-xl bg-[#1A1D23] hover:bg-blue-600 text-xs font-semibold text-[#E1E4E8] hover:text-white transition-all border border-[#2D333B] hover:border-blue-500 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Custom news topic..."
            className="flex-1 bg-[#1A1D23] border border-[#2D333B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-medium placeholder:text-[#E1E4E8]/40"
          />
          <button
            onClick={() => onGenerateAiBreakingArticle(customTopic)}
            disabled={isGeneratingAiNews || !customTopic.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20 flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            {isGeneratingAiNews ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Generating Story...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Dispatch Story + Push</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom FCM Alert Builder */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            Custom FCM Payload Builder
          </h3>
          <button
            onClick={handleGenerateAiAlert}
            disabled={isGeneratingAlert}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-600/10 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAlert ? 'animate-spin' : ''}`} />
            <span>AI Suggest Payload</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider block mb-1">
              Notification Headline (Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#2D333B] rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider block mb-1">
              Message Body (Text)
            </label>
            <textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#2D333B] rounded-xl px-3.5 py-2.5 text-xs text-[#E1E4E8] outline-none focus:border-blue-500 transition-all font-normal resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider block mb-1.5">
              Android Priority Channel
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPriority('HIGH')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'HIGH'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-sm'
                    : 'bg-[#0F1115] text-[#E1E4E8] opacity-60 border-[#2D333B] hover:opacity-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                HIGH PRIORITY (Heads-up banner & vibration)
              </button>
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                  priority === 'NORMAL'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                    : 'bg-[#0F1115] text-[#E1E4E8] opacity-60 border-[#2D333B] hover:opacity-100'
                }`}
              >
                NORMAL
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSendPush}
          disabled={!title.trim() || !body.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast FCM Push Alert to Device</span>
        </button>
      </div>

      {/* FCM Technical Specs Notes */}
      <div className="pt-2 border-t border-[#2D333B] text-[11px] text-[#E1E4E8] opacity-60 space-y-1.5">
        <div className="flex items-center gap-1.5 text-white font-bold opacity-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Deep-linking Intent Filter configured</span>
        </div>
        <p className="leading-relaxed">
          When triggered, <code className="text-blue-400 font-mono bg-black/30 px-1 py-0.5 rounded">FlashNewsMessagingService.onMessageReceived()</code> processes the payload and issues a high-priority <code className="text-blue-400 font-mono bg-black/30 px-1 py-0.5 rounded">NotificationCompat.Builder</code> notification.
        </p>
      </div>
    </div>
  );
};
