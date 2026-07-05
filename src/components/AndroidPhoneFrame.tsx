import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Bell, Sun, Moon, ArrowLeft, RotateCcw } from 'lucide-react';
import { FcmNotification } from '../types';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeNotification: FcmNotification | null;
  onDismissNotification: () => void;
  onNotificationClick: (notif: FcmNotification) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  isDarkMode,
  onToggleDarkMode,
  activeNotification,
  onDismissNotification,
  onNotificationClick,
  isOffline,
  onToggleOffline
}) => {
  const [timeStr, setTimeStr] = useState('10:24');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center select-none py-4">
      {/* Phone Hardware Outer Bezel */}
      <div className="relative w-[380px] h-[780px] bg-[#1A1D23] rounded-[52px] p-[12px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_2px_#2D333B,inset_0_0_0_2px_#0F1115] transition-all duration-300">
        
        {/* Hardware Volume Buttons (Right side) */}
        <div className="absolute -right-[3px] top-[160px] w-[3px] h-[48px] bg-[#2D333B] rounded-r-md"></div>
        <div className="absolute -right-[3px] top-[220px] w-[3px] h-[48px] bg-[#2D333B] rounded-r-md"></div>
        {/* Hardware Power Button (Right side) */}
        <div className="absolute -right-[3px] top-[290px] w-[3px] h-[64px] bg-[#2D333B] rounded-r-md"></div>

        {/* Phone Screen Container */}
        <div className={`relative w-full h-full rounded-[40px] overflow-hidden flex flex-col transition-colors duration-300 ${
          isDarkMode ? 'bg-[#0F1115] text-[#E1E4E8]' : 'bg-[#f6f6f9] text-[#1c1d22]'
        }`}>
          
          {/* Android Status Bar */}
          <div className={`w-full h-[44px] px-6 flex items-center justify-between text-xs font-medium z-50 select-none ${
            isDarkMode ? 'bg-[#0F1115] text-[#E1E4E8]' : 'bg-[#f6f6f9] text-[#1c1d22]'
          }`}>
            <div className="flex items-center gap-2">
              <span>{timeStr}</span>
              {isOffline ? (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-500 font-bold rounded flex items-center gap-1">
                  OFFLINE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  5G
                </span>
              )}
            </div>

            {/* Front Camera Punch-hole */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[12px] w-[16px] h-[16px] bg-black rounded-full flex items-center justify-center shadow-inner">
              <div className="w-[5px] h-[5px] bg-[#1A1D23] rounded-full"></div>
            </div>

            {/* Right Status Icons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onToggleOffline}
                title="Toggle Offline Room DB Mode"
                className={`p-1 rounded transition-colors ${isOffline ? 'text-amber-500 bg-amber-500/10 font-bold' : 'opacity-70 hover:opacity-100'}`}
              >
                <Wifi className="w-3.5 h-3.5" />
              </button>
              <Signal className="w-3.5 h-3.5 opacity-80" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-4 h-4 opacity-90 fill-current" />
              </div>
              <button
                onClick={onToggleDarkMode}
                title="Toggle Material 3 Dark/Light Theme"
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-1"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
              </button>
            </div>
          </div>

          {/* FCM Push Notification System Banner Overlay */}
          {activeNotification && (
            <div className="absolute top-11 left-3 right-3 z-50 animate-in slide-in-from-top-4 duration-300">
              <div 
                onClick={() => onNotificationClick(activeNotification)}
                className="bg-[#1A1D23] text-white p-3.5 rounded-2xl shadow-2xl border border-blue-500/40 cursor-pointer hover:bg-[#2D333B] transition-all flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-900/20">
                  <Bell className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 tracking-widest uppercase">FCM Push Alert</span>
                    <span className="text-[10px] text-[#E1E4E8] opacity-60">Just now</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5 truncate">{activeNotification.title}</h4>
                  <p className="text-[11px] text-[#E1E4E8] opacity-80 mt-0.5 line-clamp-2 leading-tight">{activeNotification.body}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismissNotification();
                  }}
                  className="text-[#E1E4E8] opacity-60 hover:opacity-100 p-1 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Main Native Screen Content Area */}
          <div className="flex-1 overflow-y-auto relative flex flex-col">
            {children}
          </div>

          {/* Android Navigation Gesture Bar */}
          <div className={`w-full h-[24px] flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-[#0F1115]' : 'bg-[#f6f6f9]'
          }`}>
            <div className="w-[130px] h-[4px] bg-gray-500/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
