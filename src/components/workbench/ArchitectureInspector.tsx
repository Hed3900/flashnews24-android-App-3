import React, { useState } from 'react';
import { Article, RetrofitLog, NewsUiState, InspectorTab, AndroidProjectFile } from '../../types';
import { ANDROID_PROJECT_FILES } from '../../data/androidProjectFiles';
import { Database, Wifi, ShieldAlert, Code, Download, RefreshCw, Layers, CheckCircle2, Copy, Check, FileCode, Terminal } from 'lucide-react';
import JSZip from 'jszip';

interface ArchitectureInspectorProps {
  articles: Article[];
  bookmarkedIds: string[];
  uiState: NewsUiState;
  retrofitLogs: RetrofitLog[];
  isOffline: boolean;
  onToggleOffline: () => void;
  onClearRoomCache: () => void;
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({
  articles,
  bookmarkedIds,
  uiState,
  retrofitLogs,
  isOffline,
  onToggleOffline,
  onClearRoomCache
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('room');
  const [selectedCodeFile, setSelectedCodeFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleCopyCode = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      
      // Add all project files into the zip structure
      ANDROID_PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add a readme file explaining how to open in Android Studio
      const readmeContent = `# FlashNews24 - Native Android Jetpack Compose News App

This is a clean, production-ready Android Studio project exported from Google AI Studio Build.

## Architecture Highlights
- **Language**: Kotlin 2.0+
- **UI Framework**: Jetpack Compose Material 3 (No WebViews!)
- **Architecture**: MVVM with Clean Architecture (Data -> Domain -> UI layers)
- **Network Layer**: Retrofit + OkHttp Logging Interceptor
- **Local Persistence**: Room SQLite Database (Offline Caching)
- **Image Loading**: Coil Compose
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Navigation**: Jetpack Navigation Compose

## How to Run in Android Studio
1. Unzip this directory.
2. Open **Android Studio** -> Select **Open an Existing Project** -> Select the unzipped folder.
3. Wait for Gradle to complete sync.
4. Add your Firebase \`google-services.json\` inside the \`/app/\` folder for FCM notifications (or run in offline Room mode).
5. Click **Run 'app'** on an emulator or physical Android 16 device!

## Ready for Google Play Store
This project includes shrinker Proguard rules, clean package namespace \`com.flashnews24.nativeapp\`, and required hardware permission declarations.
`;
      zip.file('README.md', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'FlashNews24-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1D23] text-[#E1E4E8] p-5 rounded-[32px] border border-[#2D333B] shadow-2xl overflow-hidden">
      {/* Top Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#2D333B] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('room')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'room'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'text-[#E1E4E8] opacity-60 hover:opacity-100 hover:bg-[#0F1115]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Room SQLite ({articles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('retrofit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'retrofit'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'text-[#E1E4E8] opacity-60 hover:opacity-100 hover:bg-[#0F1115]'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Retrofit Log ({retrofitLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mvvm')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'mvvm'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'text-[#E1E4E8] opacity-60 hover:opacity-100 hover:bg-[#0F1115]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>MVVM StateFlow</span>
        </button>

        <button
          onClick={() => setActiveTab('code_export')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'code_export'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Android Studio Project Export</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pt-4">
        
        {/* TAB 1: Room SQLite Database */}
        {activeTab === 'room' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-[#0F1115] p-3.5 rounded-[24px] border border-[#2D333B]">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-400" />
                  Room Offline Persistence Table (<code className="text-blue-400 font-mono">articles_table</code>)
                </h3>
                <p className="text-[11px] text-[#E1E4E8] opacity-60 mt-0.5">
                  Simulating SQLite data cached on Android device filesystem for instant offline startup.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleOffline}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                    isOffline
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-[#1A1D23] text-[#E1E4E8] border-[#2D333B] hover:border-blue-500'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{isOffline ? 'Offline Mode Active' : 'Simulate Offline'}</span>
                </button>
                <button
                  onClick={onClearRoomCache}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20"
                >
                  Clear Cache
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-[#2D333B]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1115] text-[#E1E4E8] opacity-60 uppercase font-mono text-[10px] border-b border-[#2D333B]">
                  <tr>
                    <th className="py-2.5 px-3">id (PK)</th>
                    <th className="py-2.5 px-3">title</th>
                    <th className="py-2.5 px-3">category</th>
                    <th className="py-2.5 px-3">bookmarked</th>
                    <th className="py-2.5 px-3">cachedAt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D333B] font-mono text-[11px]">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-[#0F1115]/80 transition-colors">
                      <td className="py-2 px-3 text-blue-400 font-bold truncate max-w-[80px]">{art.id}</td>
                      <td className="py-2 px-3 text-white truncate max-w-[200px] font-sans font-medium">{art.title}</td>
                      <td className="py-2 px-3 text-purple-400">{art.category}</td>
                      <td className="py-2 px-3">
                        {bookmarkedIds.includes(art.id) ? (
                          <span className="text-emerald-400 font-bold">TRUE</span>
                        ) : (
                          <span className="text-gray-500">false</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#E1E4E8] opacity-60 text-[10px]">{new Date().toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Retrofit Network Log */}
        {activeTab === 'retrofit' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="bg-[#0F1115] p-3 rounded-[24px] border border-[#2D333B] flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-400" />
                OkHttp Logging Interceptor Output
              </span>
              <span className="text-[10px] text-[#E1E4E8] opacity-60 font-mono">Host: api.flashnews24.io</span>
            </div>

            {retrofitLogs.length === 0 ? (
              <div className="text-center py-12 text-[#E1E4E8] opacity-60 text-xs">No HTTP requests intercepted yet. Tap pull-to-refresh!</div>
            ) : (
              retrofitLogs.map((log) => (
                <div key={log.id} className="bg-[#0F1115] rounded-[24px] p-3 border border-[#2D333B] font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold text-[10px] border border-blue-500/30">{log.method}</span>
                      <span className="text-emerald-400 font-bold">{log.status} OK</span>
                    </div>
                    <span className="text-[#E1E4E8] opacity-60 text-[10px]">{log.timestamp} ({log.durationMs}ms)</span>
                  </div>
                  <div className="text-white text-[11px] truncate">{log.url}</div>
                  <div className="text-[10px] text-[#E1E4E8] opacity-60 flex items-center justify-between pt-1 border-t border-[#2D333B]">
                    <span>Response Size: {log.responseSize}</span>
                    <span className="text-blue-400">Gson Converter ➔ ArticleEntity</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: MVVM StateFlow */}
        {activeTab === 'mvvm' && (
          <div className="space-y-4 animate-in fade-in duration-200 font-mono">
            <div className="bg-[#0F1115] p-3 rounded-[24px] border border-[#2D333B]">
              <span className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                NewsViewModel MutableStateFlow Viewer
              </span>
            </div>

            <div className="bg-[#0F1115] p-4 rounded-[24px] border border-[#2D333B] text-xs space-y-2 text-[#E1E4E8] overflow-x-auto">
              <div className="text-purple-400 font-bold">// Current active StateFlow emission</div>
              <div><span className="text-blue-400">data class</span> <span className="text-yellow-400">NewsUiState</span>(</div>
              <div className="pl-4">isLoading = <span className="text-emerald-400">{uiState.status === 'loading' ? 'true' : 'false'}</span>,</div>
              <div className="pl-4">selectedCategory = <span className="text-green-400">"{uiState.selectedCategory}"</span>,</div>
              <div className="pl-4">searchQuery = <span className="text-green-400">"{uiState.searchQuery}"</span>,</div>
              <div className="pl-4">articlesCount = <span className="text-amber-400">{articles.length}</span>,</div>
              <div className="pl-4">bookmarkedCount = <span className="text-amber-400">{bookmarkedIds.length}</span>,</div>
              <div className="pl-4">isOfflineFallback = <span className="text-red-400">{isOffline ? 'true' : 'false'}</span>,</div>
              <div className="pl-4">lastUpdated = <span className="text-green-400">"{uiState.lastUpdated}"</span></div>
              <div>)</div>
            </div>

            <div className="p-3 bg-blue-600/10 rounded-[24px] border border-blue-500/20 text-[11px] text-blue-300 font-sans leading-relaxed">
              <strong>Reactive Architecture Notice:</strong> Any UI interaction (tab selection, bookmark toggle, search filter) updates this StateFlow via <code className="font-mono bg-black/30 px-1 rounded text-white">_uiState.update</code>, instantly recomposing the Jetpack Compose screen components.
            </div>
          </div>
        )}

        {/* TAB 4: Android Studio Project Export & Code Viewer */}
        {activeTab === 'code_export' && (
          <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
            {/* Top Export ZIP Banner */}
            <div className="bg-gradient-to-r from-emerald-900/40 via-blue-900/40 to-transparent p-4 rounded-3xl border border-emerald-500/40 flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                  <Download className="w-5 h-5 animate-bounce" />
                  Capacitor 8 Native Android & Kotlin Compose Project
                </h3>
                <p className="text-xs text-gray-300 max-w-[480px] leading-relaxed">
                  <strong>Capacitor Android Generated:</strong> The native Gradle project is initialized in <code className="text-blue-400 bg-black/40 px-1 rounded">/android</code> with 6 native plugins (Haptics, Push, StatusBar, Network, Preferences). Compile directly to APK/AAB using <code className="text-emerald-300 bg-black/40 px-1 rounded">./gradlew assembleDebug</code>! You can also download the reference Kotlin Compose project below.
                </p>
              </div>
              <button
                onClick={handleExportZip}
                disabled={isExportingZip}
                className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {isExportingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Zipping Files...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Kotlin SDK (.zip)</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Explorer Grid */}
            <div className="flex-1 flex gap-4 min-h-[360px]">
              {/* Left File Tree Sidebar */}
              <div className="w-64 bg-[#0F1115] rounded-[24px] p-2.5 border border-[#2D333B] space-y-1 overflow-y-auto flex-shrink-0">
                <div className="text-[10px] font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider px-2 py-1">
                  Kotlin Source Architecture
                </div>
                {ANDROID_PROJECT_FILES.map((file) => {
                  const isSelected = selectedCodeFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedCodeFile(file)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 font-mono ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                          : 'text-[#E1E4E8] opacity-60 hover:bg-[#1A1D23] hover:opacity-100'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                      <span className="truncate text-[11px]">{file.path.split('/').pop()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Code Viewer */}
              <div className="flex-1 bg-[#0F1115] rounded-[24px] border border-[#2D333B] flex flex-col overflow-hidden min-w-0">
                <div className="bg-[#1A1D23] px-4 py-2.5 border-b border-[#2D333B] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/30">
                      {selectedCodeFile.layer}
                    </span>
                    <span className="text-xs font-mono text-white font-bold truncate">{selectedCodeFile.path}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(selectedCodeFile.content, selectedCodeFile.path)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F1115] hover:bg-blue-600/20 text-xs font-semibold text-[#E1E4E8] transition-colors border border-[#2D333B]"
                  >
                    {copiedPath === selectedCodeFile.path ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-[#1A1D23]/50 border-b border-[#2D333B] text-[11px] text-[#E1E4E8] opacity-80 italic">
                  {selectedCodeFile.description}
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#E1E4E8] leading-relaxed">
                  <pre className="whitespace-pre">{selectedCodeFile.content}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
