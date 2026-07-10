/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Share } from '@capacitor/share';
import { Article, NewsCategory, NewsUiState, RetrofitLog, FcmNotification, SimulatorScreen } from './types';
import { HomeScreen } from './components/screens/HomeScreen';
import { DetailScreen } from './components/screens/DetailScreen';
import { BookmarksScreen } from './components/screens/BookmarksScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { FcmPushLab } from './components/workbench/FcmPushLab';
import { ArchitectureInspector } from './components/workbench/ArchitectureInspector';
import { SplashScreen } from './components/screens/SplashScreen';
import { fetchBloggerArticles, BLOGGER_JSON_FEED_URL } from './services/bloggerService';
import {
  isNativeCapacitor,
  initCapacitorNativeUI,
  initCapacitorNetworkListener,
  initCapacitorPushNotifications,
  triggerHapticLight,
  triggerHapticMedium,
  saveNativeBookmarks,
  loadNativeBookmarks,
  saveNativeArticlesCache,
  loadNativeArticlesCache
} from './services/capacitorService';
import { Flame, Bell, Database, Smartphone, Code, Wifi, Sparkles, Download } from 'lucide-react';
import {
  Menu,
  MenuItem,
  IconButton
} from '@capacitor-community/material-menu';

import { Menu as MenuIcon } from 'lucide-react';
import AboutScreen from "./components/screens/AboutScreen";
import SettingsScreen from "./components/screens/SettingsScreen";
import PrivacyScreen from "./components/screens/PrivacyScreen";
import TermsScreen from "./components/screens/TermsScreen";
import ContactScreen from "./components/screens/ContactScreen";
import { AdMob, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";
const showInterstitial = async () => {
  try {
    await AdMob.prepareInterstitial({
      adId: "ca-app-pub-3288039417600063/1445588386",
    });

    await AdMob.showInterstitial();
  } catch (err) {
    console.error(err);
  }
};

export default function App() {
const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['art-1', 'art-4']);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [activeScreen, setActiveScreen] = useState<SimulatorScreen>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingAiNews, setIsGeneratingAiNews] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isSyncingBlogger, setIsSyncingBlogger] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Workbench tabs for responsive screens
  const [mobileWorkbenchTab, setMobileWorkbenchTab] = useState<'phone' | 'fcm' | 'inspector'>('phone');

  // FCM Notifications
  const [notifications, setNotifications] = useState<FcmNotification[]>([
    {
      id: 'fcm-init-1',
      title: '🚨 FLASH BREAKING: Gemini 3.5 Unveiled',
      body: 'Google DeepMind announces autonomous reasoning architecture with real-time reflection.',
      priority: 'HIGH',
      timestamp: '10 mins ago',
      articleId: 'art-1'
    }
  ]);
  const [activeBanner, setActiveBanner] = useState<FcmNotification | null>(null);

  // Retrofit HTTP Interceptor Logs
  const [retrofitLogs, setRetrofitLogs] = useState<RetrofitLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      method: 'GET',
      url: BLOGGER_JSON_FEED_URL,
      status: 200,
      durationMs: 142,
      responseSize: '42.8 KB'
    }
  ]);

  const addRetrofitLog = useCallback((method: 'GET' | 'POST', url: string, status: number, duration: number, size: string) => {
    const newLog: RetrofitLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      durationMs: duration,
      responseSize: size
    };
    setRetrofitLogs(prev => [newLog, ...prev]);
  }, []);

  const handleRefreshNews = useCallback(() => {
    if (articles.length === 0) {
  setIsRefreshing(true);
    }
    triggerHapticMedium();
    const startTime = Date.now();
    
    if (isOffline) {
      setTimeout(() => {
        setIsRefreshing(false);
        addRetrofitLog('GET', BLOGGER_JSON_FEED_URL, 503, Date.now() - startTime, '0 B');
      }, 500);
      return;
    }

    fetchBloggerArticles("All")
  .then((liveArticles) => {
    if (liveArticles && liveArticles.length > 0) {
    setArticles(liveArticles);
        
      addRetrofitLog(
        "GET",
        `${BLOGGER_JSON_FEED_URL}?category=all`,
        200,
        Date.now() - startTime,
        "48.2 KB"
      );
    } else {
      addRetrofitLog(
        "GET",
        `${BLOGGER_JSON_FEED_URL}?category=all`,
        304,
        Date.now() - startTime,
        "12.4 KB"
      );
    }
  })
  .catch(() => {
    addRetrofitLog(
      "GET",
      BLOGGER_JSON_FEED_URL,
      500,
      Date.now() - startTime,
      "0 B"
    );
  })
  .finally(() => {
    setIsRefreshing(false);
  });
  }, [isOffline, addRetrofitLog, articles.length]);

  useEffect(() => {
    handleRefreshNews();
    initCapacitorNativeUI();

    const removeNetListenerPromise = initCapacitorNetworkListener((connected) => {
      setIsOffline(!connected);
    });

    initCapacitorPushNotifications((title, body, articleId) => {
      handleBroadcastNotification(title, body, 'HIGH', articleId);
    });

    loadNativeBookmarks().then(saved => {
      if (saved && saved.length > 0) {
        setBookmarkedIds(saved);
      }
    });

    

    const interval = setInterval(() => {
      if (!isOffline) {
        fetchBloggerArticles('All').then(liveArticles => {
          console.log("LIVE ARTICLES:", liveArticles.length, liveArticles);
          if (liveArticles && liveArticles.length > 0) {
            setArticles(prev => {
              const existingIds = new Set(prev.map(a => a.id));
              const newArrivals = liveArticles.filter(a => !existingIds.has(a.id));
              if (newArrivals.length > 0) {
                const newest = newArrivals[0];
                handleBroadcastNotification(
                  `🚨 NEW BLOGGER POST (${newest.category}): ${newest.title.slice(0, 45)}...`,
                  newest.summary || 'Real-time feed sync received via Firebase Cloud Messaging.',
                  'HIGH',
                  newest.id
                );
              }
              const unique = Array.from(
  new Map([...liveArticles, ...prev].map(item => [item.id, item])).values()
);
unique.sort(
  (a, b) =>
    new Date(b.rawPublishedAt || b.publishedAt).getTime() -
    new Date(a.rawPublishedAt || a.publishedAt).getTime()
);
return unique;
            });
          }
        }).catch(() => {});
      }
    }, 45000);
    return () => {
      clearInterval(interval);
      removeNetListenerPromise.then(remove => remove());
    };
  }, [handleRefreshNews, isOffline]);
  
useEffect(() => {
  const initAds = async () => {
    try {
      await AdMob.initialize();

      // Banner
      await AdMob.showBanner({
        adId: "ca-app-pub-3288039417600063/3826509024",
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
      });

      // App Open
      await AdMob.prepareAppOpen({
        adId: "ca-app-pub-3288039417600063/7707211570",
      });

     // await AdMob.showAppOpen();

    } catch (e) {
      console.log(e);
    }
  };

  initAds();
}, []);
  
  useEffect(() => {
    saveNativeBookmarks(bookmarkedIds);
  }, [bookmarkedIds]);

  useEffect(() => {
    if (articles.length > 0) {
      saveNativeArticlesCache(articles);
    }
  }, [articles]);

  const handleToggleBookmark = (id: string) => {
    triggerHapticLight();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectArticle = async (article: Article) => {
  triggerHapticLight();

  setSelectedArticle(article);
  setActiveScreen("detail");

  try {
    await AdMob.prepareInterstitial({
      adId: "ca-app-pub-3288039417600063/1445588386",
    });

    await AdMob.showInterstitial();
  } catch (err) {
    console.log("AdMob Error:", err);
  }
};

  const handleShareArticle = async (article: Article) => {
  try {
    await Share.share({
      title: article.title,
      text: article.summary,
      url: article.url,
      dialogTitle: 'Share News'
    });
  } catch (err) {
    console.log('Share cancelled', err);
  }
};
  
const handleShareApp = async () => {
  try {
    await Share.share({
      title: "FlashNews24",
      text: "Get the latest breaking news with FlashNews24!",
      url: "https://play.google.com/store/apps/details?id=com.flashnews24.app",
      dialogTitle: "Share FlashNews24",
    });
  } catch (error) {
    console.error(error);
  }
};
  
  const handleBroadcastNotification = (title: string, body: string, priority: 'HIGH' | 'NORMAL', articleId?: string) => {
    const newNotif: FcmNotification = {
      id: `fcm-${Date.now()}`,
      title,
      body,
      priority,
      timestamp: 'Just now',
      articleId
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveBanner(newNotif);
    
    // Auto hide banner after 6 seconds
    setTimeout(() => {
      setActiveBanner(curr => curr?.id === newNotif.id ? null : curr);
    }, 6000);
  };

  const handleGenerateAiBreakingArticle = async (topic: string) => {
    setIsGeneratingAiNews(true);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/news/ai-breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (data.article) {
        setArticles(prev => [data.article, ...prev]);
        addRetrofitLog('POST', 'https://api.flashnews24.io/top-headlines/ai-dispatch', 201, Date.now() - startTime, '4.2 KB');
        
        // Broadcast push alert for this new story
        handleBroadcastNotification(
          `⚡ BREAKING (${data.article.category}): ${data.article.title.slice(0, 45)}...`,
          data.article.summary,
          'HIGH',
          data.article.id
        );
      }
    } catch (err) {
      addRetrofitLog('POST', 'https://api.flashnews24.io/top-headlines/ai-dispatch', 500, Date.now() - startTime, '0 B');
    } 
  };

  const handleSyncLatestBloggerPostPush = async () => {
  setIsSyncingBlogger(true);

  // Hide syncing banner after 5 seconds, background sync continues
  setTimeout(() => {
    setIsSyncingBlogger(false);
  }, 5000);

  const startTime = Date.now();

  try {
    const liveArticles = await fetchBloggerArticles('All');

    if (liveArticles && liveArticles.length > 0) {
      const latest = liveArticles[0];

      console.log("LIVE:", liveArticles.length);
console.log("STATE BEFORE:", articles.length);

setArticles(liveArticles);

console.log("FIRST ARTICLE:", liveArticles[0]);

addRetrofitLog(
        'GET',
        `${BLOGGER_JSON_FEED_URL}?category=all&fcm_trigger=1`,
        200,
        Date.now() - startTime,
        '48.2 KB'
      );

      handleBroadcastNotification(
        `🚨 NEW BLOGGER POST (${latest.category}): ${latest.title.slice(0, 45)}...`,
        latest.summary || 'Real-time Blogger headline synced via Retrofit and Room.',
        'HIGH',
        latest.id
      );
    }
  } catch (err) {
    addRetrofitLog(
      'GET',
      BLOGGER_JSON_FEED_URL,
      500,
      Date.now() - startTime,
      '0 B'
    );
  }
};

  const bookmarkedArticles = articles.filter(a => bookmarkedIds.includes(a.id));

  const uiState: NewsUiState = {
    status: isRefreshing ? 'loading' : 'success',
    articles,
    bookmarkedIds,
    selectedCategory,
    searchQuery: '',
    isRefreshing,
    isOfflineMode: isOffline,
    lastUpdated: new Date().toLocaleTimeString()
  };

  return (
    <div className="w-full h-screen bg-[#0F1115]">
            {showSplash ? (
              <SplashScreen onFinish={() => setShowSplash(false)} />
            ) : (
              <>
                {activeScreen === 'home' && (
  <HomeScreen
    articles={articles}
    bookmarkedIds={bookmarkedIds}
    selectedCategory={selectedCategory}
    onSelectCategory={setSelectedCategory}
    onSelectArticle={handleSelectArticle}
    onToggleBookmark={handleToggleBookmark}
    onShareArticle={handleShareArticle}
    onRefresh={handleRefreshNews}
    onOpenSearch={() => setActiveScreen('search')}
    isRefreshing={isRefreshing}
    isOffline={isOffline}
    setMenuOpen={setMenuOpen}
  />
)}
            {activeScreen === 'detail' && selectedArticle && (
              <DetailScreen
  article={selectedArticle}
  isBookmarked={bookmarkedIds.includes(selectedArticle.id)}
  relatedArticles={articles.filter(a => a.id !== selectedArticle.id)}
  onBack={() => setActiveScreen("home")}
  onToggleBookmark={handleToggleBookmark}
  onShare={handleShareArticle}
  onSelectArticle={handleSelectArticle}
/>
            )}

            {activeScreen === 'bookmarks' && (
              <BookmarksScreen
                articles={bookmarkedArticles}
                onSelectArticle={handleSelectArticle}
                onRemoveBookmark={handleToggleBookmark}
                onClearAllBookmarks={() => setBookmarkedIds([])}
              />
            )}

            {activeScreen === 'search' && (
              <SearchScreen
                allArticles={articles}
                onSelectArticle={handleSelectArticle}
                onClose={() => setActiveScreen('home')}
              />
            )}

                        {activeScreen === 'notifications' && (
              <NotificationsScreen
                notifications={notifications}
                allArticles={articles}
                onSelectArticle={handleSelectArticle}
                onClearNotifications={() => setNotifications([])}
              />
            )}
                {activeScreen === "about" && (
  <AboutScreen onBack={() => setActiveScreen("home")} />
)}

{activeScreen === "settings" && (
  <SettingsScreen onBack={() => setActiveScreen("home")} />
)}

{activeScreen === "privacy" && (
  <PrivacyScreen onBack={() => setActiveScreen("home")} />
)}

{activeScreen === "terms" && (
  <TermsScreen onBack={() => setActiveScreen("home")} />
)}

{activeScreen === "contact" && (
  <ContactScreen onBack={() => setActiveScreen("home")} />
)}
          </>
        )}
      {menuOpen && (
  <div className="fixed inset-0 z-50">
    <div
      className="absolute inset-0"
      onClick={() => setMenuOpen(false)}
    />

    <div className="absolute top-16 right-4 w-56 bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-700 overflow-hidden">

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("home");
    }}
  >
    🏠 Home
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("bookmarks");
    }}
  >
    🔖 Bookmarks
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("notifications");
    }}
  >
    🔔 Notifications
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      window.open("https://play.google.com/store/apps/details?id=com.flashnews24.app","_blank");
    }}
  >
    ⭐ Rate App
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={handleShareApp}
  >
    📤 Share App
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("settings");
    }}
  >
    ⚙️ Settings
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("about");
    }}
  >
    ℹ️ About
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("privacy");
    }}
  >
    🔒 Privacy Policy
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("terms");
    }}
  >
    📜 Terms & Conditions
  </button>

  <button
    className="w-full text-left px-4 py-3 hover:bg-gray-700"
    onClick={() => {
      setMenuOpen(false);
      setActiveScreen("contact");
    }}
  >
    📞 Contact Us
  </button>

</div>
  </div>
)}
    </div>
  );
}

