import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap, Radio, Database, Layers } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        return prev + 12;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="absolute inset-0 z-50 bg-[#0B0E14] text-white flex flex-col items-center justify-between p-8 select-none animate-in fade-in duration-300">
      {/* Top Status */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#E1E4E8]/50 tracking-widest uppercase">
        <span>Android 16 • API 35</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          RELEASE READY
        </span>
      </div>

      {/* Center Logo & Branding */}
      <div className="flex flex-col items-center text-center max-w-[280px]">
        {/* Animated Radar & Lightning Bolt Icon */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-transparent animate-pulse blur-xl"></div>
          <div className="absolute inset-2 rounded-2xl border border-blue-500/30 animate-spin" style={{ animationDuration: '12s' }}></div>
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-white/20 scale-105 transition-transform duration-500">
            <Zap className="w-10 h-10 text-white fill-white animate-bounce" />
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-black tracking-wider uppercase border border-white/20 shadow">
            LIVE
          </span>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
          FlashNews24
        </h1>
        
        <p className="text-xs text-[#E1E4E8]/70 mt-1.5 font-medium leading-relaxed">
          Real-Time AI & Global Breaking News
        </p>
        <span className="mt-2.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-blue-300 font-mono font-bold tracking-wide">
          v1.0.0-PROD • NATIVE KOTLIN
        </span>

        {/* Animated Shimmer Progress Bar */}
        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-8 border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-[#E1E4E8]/40 mt-2">
          Initializing Retrofit & Room SQLite... {Math.min(progress, 100)}%
        </span>
      </div>

      {/* Footer Powered By */}
      <div className="w-full flex flex-col items-center gap-2 pt-4 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-[#E1E4E8]/70">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Compose M3
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            FCM Push
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Room DB
          </span>
        </div>
        <div className="text-[10px] text-[#E1E4E8]/40 font-medium">
          Built with Jetpack Compose Material 3 • Ready for Google Play
        </div>
      </div>
    </div>
  );
};
