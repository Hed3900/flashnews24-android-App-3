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
const INITIAL_ARTICLES: Article[] = [
  {

    id: 'art-1',
    title: 'Google DeepMind Unveils Gemini 3.5: Next-Gen Autonomous Reasoning Engine',
    summary: 'The new architecture introduces native multimodal tool chaining and real-time reflection loops, outperforming human experts in complex engineering benchmarks.',
    content: 'In a landmark keynote today, researchers at Google DeepMind revealed the Gemini 3.5 series. The model introduces massive upgrades in real-time latency, native speech synthesis, and autonomous task execution. Early enterprise testers report a 4x increase in software development productivity and automated bug resolution. The new architecture also features enhanced safety guardrails and verifiable citation grounding.',
    author: 'Elena Rostova',
    sourceName: 'TechCrunch 24',
    publishedAt: '10 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    category: 'AI',
    url: 'https://flashnews24.io/articles/gemini-3-5-unveiled',
    readTimeMinutes: 4,
    isBreaking: true,
    sentiment: 'Urgent'
  },
  {
    id: 'art-2',
    title: 'Global Markets Rally as Green Energy Adoption Hits Tipping Point in Europe',
    summary: 'Solar and wind energy output officially surpassed fossil fuels across EU grids during Q2, triggering massive institutional investments in clean tech.',
    content: 'Stock markets across Europe and North America surged today following data from the International Energy Agency showing that renewable sources provided over 52% of total electricity generation last quarter. Solar grid installations grew by 38% year-over-year, driven by breakthrough perovskite panel efficiency and grid-scale battery storage cost drops.',
    author: 'Marcus Vance',
    sourceName: 'Bloomberg News',
    publishedAt: '32 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
    category: 'Business',
    url: 'https://flashnews24.io/articles/green-energy-tipping-point',
    readTimeMinutes: 5,
    isBreaking: false,
    sentiment: 'Positive'
  },
  {
    id: 'art-3',
    title: 'James Webb Telescope Spots Earliest Water-Rich Atmosphere on Exoplanet K2-18c',
    summary: 'Spectroscopic analysis reveals clear signatures of water vapor and carbon-bearing molecules in the habitable zone of a nearby red dwarf star.',
    content: 'Astronomers using the James Webb Space Telescope have detected definitive signatures of water vapor, methane, and carbon dioxide in the atmosphere of exoplanet K2-18c, located 120 light-years from Earth. The findings suggest an ocean-covered sub-Neptune world capable of sustaining liquid water on its surface.',
    author: 'Dr. Aris Thorne',
    sourceName: 'Scientific American',
    publishedAt: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    category: 'Science',
    url: 'https://flashnews24.io/articles/jwst-water-atmosphere',
    readTimeMinutes: 6,
    isBreaking: false,
    sentiment: 'Analytical'
  },
  {
    id: 'art-4',
    title: 'Android 16 Developer Preview Brings Real-time Spatial Audio & Satellite SOS',
    summary: 'Google releases the first beta build featuring Jetpack Compose 1.8 optimizations, dynamic material color synthesis, and satellite emergency messaging.',
    content: 'The Android development ecosystem is buzzing following the release of the Android 16 Developer Preview. Highlights include native spatial audio rendering with dynamic head tracking, automated background battery management powered by on-device AI, and built-in satellite SOS APIs for developers building mission-critical field apps.',
    author: 'Sarah Jenkins',
    sourceName: 'Android Central',
    publishedAt: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&auto=format&fit=crop&q=80',
    category: 'Tech',
    url: 'https://flashnews24.io/articles/android-16-preview',
    readTimeMinutes: 3,
    isBreaking: false,
    sentiment: 'Positive'
  },
  {
    id: 'art-5',
    title: 'Championship Thriller: Underdog FC Tokyo Secures Last-Minute Victory in Extra Time',
    summary: 'A dramatic 94th-minute volley seals a historic 3-2 comeback against the reigning champions in front of a sold-out stadium of 65,000 fans.',
    content: 'In one of the most memorable matches of the decade, FC Tokyo overturned a 2-0 halftime deficit to defeat the league champions 3-2. Teenager Kenji Sato scored the winner in the 94th minute with a stunning volley from 25 yards out, igniting euphoric celebrations across the stadium.',
    author: 'David Beckham Jr.',
    sourceName: 'ESPN Global',
    publishedAt: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    category: 'Sports',
    url: 'https://flashnews24.io/articles/fc-tokyo-thriller',
    readTimeMinutes: 4,
    isBreaking: false,
    sentiment: 'Positive'
  },
  {
    id: 'art-6',
    title: 'Next-Gen Quantum Chip Achieves 99.9% Error-Correction Gate Fidelity',
    summary: 'Physicists demonstrate fault-tolerant topological qubits operating at room temperature, paving the way for commercial quantum supercomputers by 2028.',
    content: 'A consortium of quantum researchers has announced a major breakthrough in qubit stability. By utilizing topological braiding in diamond nitrogen-vacancy centers, the team achieved a 99.9% two-qubit gate fidelity without requiring liquid helium dilution refrigerators. This milestone removes the biggest hurdle to commercial quantum scaling.',
    author: 'Prof. Chen Wei',
    sourceName: 'Nature Technology',
    publishedAt: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    category: 'Tech',
    url: 'https://flashnews24.io/articles/quantum-chip-fidelity',
    readTimeMinutes: 5,
    isBreaking: false,
    sentiment: 'Analytical'
  }
];

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
  if (isRefreshing) return;

  setIsRefreshing(true);
  triggerHapticMedium();

  const startTime = Date.now();

  if (isOffline) {
    setTimeout(() => {
      setIsRefreshing(false);
      addRetrofitLog(
        "GET",
        BLOGGER_JSON_FEED_URL,
        503,
        Date.now() - startTime,
        "0 B"
      );
    }, 500);
    return;
  }

  fetchBloggerArticles(selectedCategory)
  .then((liveArticles) => {
    console.log("FETCH COUNT =", liveArticles.length);

    if (liveArticles && liveArticles.length > 0) {
      liveArticles.sort(
        (a, b) =>
          new Date(b.rawPublishedAt || b.publishedAt).getTime() -
          new Date(a.rawPublishedAt || a.publishedAt).getTime()
      );

      setArticles(liveArticles);
    }
  


setTimeout(() => {
  console.log("After 2 sec:", liveArticles.length);
}, 2000);
        saveNativeArticlesCache(liveArticles);

        addRetrofitLog(
          "GET",
          `${BLOGGER_JSON_FEED_URL}?category=${selectedCategory}`,
          200,
          Date.now() - startTime,
          "48.2 KB"
        );
      } else {
        addRetrofitLog(
          "GET",
          `${BLOGGER_JSON_FEED_URL}?category=${selectedCategory}`,
          304,
          Date.now() - startTime,
          "0 B"
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
}, [
  selectedCategory,
  isOffline,
  addRetrofitLog
]);

useEffect(() => {
  handleRefreshNews();
  initCapacitorNativeUI();

  const removeNetListenerPromise =
    initCapacitorNetworkListener((connected) => {
      setIsOffline(!connected);
    });

  initCapacitorPushNotifications((title, body, articleId) => {
    handleBroadcastNotification(title, body, "HIGH", articleId);
  });

  loadNativeBookmarks().then((saved) => {
    if (saved?.length) {
      setBookmarkedIds(saved);
    }
  });
loadNativeArticlesCache().then(cache => {
  if (cache && cache.length > 0) {
    setArticles(prev => prev.length === 0 ? cache : prev);
  }
});
    const interval = setInterval(() => {
  if (!isOffline) {
    fetchBloggerArticles(selectedCategory)
  then((liveArticles) => {

  console.log("LIVE ARTICLES:", liveArticles.length);
  console.log(liveArticles);


        if (liveArticles && liveArticles.length > 0) {
          setArticles((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));

            const newArrivals = liveArticles.filter(
              (a) => !existingIds.has(a.id)
            );

            if (newArrivals.length > 0) {
              const newest = newArrivals[0];

              handleBroadcastNotification(
                `🚨 NEW BLOGGER POST (${newest.category}): ${newest.title.slice(0, 45)}...`,
                newest.summary ||
                  "Real-time feed sync received via Firebase Cloud Messaging.",
                "HIGH",
                newest.id
              );
            }

            const unique = Array.from(
              new Map(
                [...liveArticles, ...prev].map((item) => [item.id, item])
              ).values()
            );

            unique.sort(
              (a, b) =>
                new Date(b.rawPublishedAt || b.publishedAt).getTime() -
                new Date(a.rawPublishedAt || a.publishedAt).getTime()
            );

            saveNativeArticlesCache(unique);

            return unique;
          });
        }
      })
      .catch(console.error);
  }
}, 600000);

return () => {
  clearInterval(interval);
  removeNetListenerPromise.then((remove) => remove());
};
}, [handleRefreshNews, isOffline, selectedCategory]);

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

      await AdMob.showAppOpen();

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
    }, 3000);
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

  setArticles(prev => {
    const merged = Array.from(
      new Map([...liveArticles, ...prev].map(item => [item.id, item])).values()
    );

    merged.sort(
      (a, b) =>
        new Date(b.rawPublishedAt || b.publishedAt).getTime() -
        new Date(a.rawPublishedAt || a.publishedAt).getTime()
    );

    return merged;
  });

  saveNativeArticlesCache(liveArticles);

  const latest = liveArticles[0];

  addRetrofitLog(
    "GET",
    `${BLOGGER_JSON_FEED_URL}?category=all&fcm_trigger=1`,
    200,
    Date.now() - startTime,
    "48.2 KB"
  );

  handleBroadcastNotification(
    `🚨 NEW BLOGGER POST (${latest.category}): ${latest.title.slice(0,45)}...`,
    latest.summary || "Real-time Blogger headline synced.",
    "HIGH",
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


