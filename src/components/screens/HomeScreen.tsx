import React from 'react';
import {
  Search,
  RotateCcw,
  Bookmark,
  Share2,
  Clock,
  Flame,
  WifiOff,
  Menu,
  ChevronRight,
  Zap,
  Home,
  Grid2X2,
  Settings
} from 'lucide-react';
import { Article, NewsCategory } from '../../types';

interface HomeScreenProps {
  articles: Article[];
  bookmarkedIds: string[];
  selectedCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (id: string) => void;
  onShareArticle: (article: Article) => void;
  onRefresh: () => void;
  onOpenSearch: () => void;
  isRefreshing: boolean;
  isOffline: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigate: (screen: string) => void;
}

const STANDARD_CATEGORIES: NewsCategory[] = [
  'Tech',
  'AI',
  'Business',
  'World',
  'Science',
  'Sports'
];

const fallbackImage =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80';

const Skeleton = () => (
  <div className="rounded-3xl bg-[#111214] border border-[#252629] p-3 animate-pulse">
    <div className="h-44 rounded-2xl bg-[#242529]" />
    <div className="h-3 w-1/3 bg-[#242529] rounded mt-4" />
    <div className="h-5 w-4/5 bg-[#242529] rounded mt-3" />
    <div className="h-4 w-3/5 bg-[#242529] rounded mt-2" />
  </div>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  articles,
  bookmarkedIds,
  selectedCategory,
  onSelectCategory,
  onSelectArticle,
  onToggleBookmark,
  onShareArticle,
  onRefresh,
  onOpenSearch,
  isRefreshing,
  isOffline,
  setMenuOpen
}) => {
  const [isPulling, setIsPulling] = React.useState(false);

  const activeCategories: NewsCategory[] = ['All', ...STANDARD_CATEGORIES];

  const getCategoryCount = (category: NewsCategory) =>
    category === 'All'
      ? articles.length
      : articles.filter(a => a.category === category).length;

  const breakingArticles = articles.filter(a => a.isBreaking);
  const regularArticles = articles.filter(a => !a.isBreaking);

  const [breakingIndex, setBreakingIndex] = React.useState(0);

  React.useEffect(() => {
    if (breakingArticles.length <= 1) return;

    const timer = setInterval(() => {
      setBreakingIndex(prev => (prev + 1) % breakingArticles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [breakingArticles.length]);

  React.useEffect(() => {
    if (breakingIndex >= breakingArticles.length && breakingArticles.length > 0) {
      setBreakingIndex(0);
    }
  }, [breakingArticles.length, breakingIndex]);


  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  const handleRefresh = () => {
    onRefresh();
  };


  return (
    <div className="h-full flex flex-col bg-[#08090A] text-white overflow-hidden">

      {/* HEADER */}
      <header className="shrink-0 bg-[#090A0B] border-b border-[#202124] px-4 pt-3 pb-3">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Flame className="w-6 h-6 fill-white text-white" />
            </div>

            <div>
              <h1 className="text-[21px] font-black tracking-tight leading-none">
                FlashNews<span className="text-red-500">24</span>
              </h1>
              <p className="text-[10px] text-gray-400 mt-1">
                Live Updates • flashnews24.site
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-full active:bg-white/10"
            >
              <Search className="w-5 h-5 text-red-400" />
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="p-2.5 rounded-full active:bg-white/10"
            >
              <Menu className="w-5 h-5 text-red-400" />
            </button>

            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-full active:bg-white/10"
            >
              <RotateCcw
                className={`w-5 h-5 text-red-400 ${
                  isRefreshing || isPulling
                    ? 'animate-spin'
                    : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* OFFLINE BAR */}
      {isOffline && (
        <div className="shrink-0 px-4 py-2.5 bg-[#160D0F] border-b border-red-900/40 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-[11px] font-semibold text-red-200">
            Offline mode • Showing cached news
          </span>
        </div>
      )}

      {/* CATEGORY NAV */}
      <div id="category-nav" className="shrink-0 bg-[#090A0B] border-b border-[#202124] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">

          {activeCategories.map(category => {
            const active = selectedCategory === category;
            const count = getCategoryCount(category);

            return (
              <button
                key={category}
                onClick={() =>
                  onSelectCategory(category as NewsCategory)
                }
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${
                  active
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                    : 'bg-[#151618] text-gray-400 border border-[#252629] active:bg-[#202124]'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-[#242529] text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto overscroll-contain">

        {/* PULL REFRESH */}
        {(isPulling || isRefreshing) && (
          <div className="px-4 py-2 bg-[#130B0D] border-b border-red-900/30 flex justify-center items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-red-400 animate-spin" />
            <span className="text-[10px] font-bold text-red-300">
              Updating latest news...
            </span>
          </div>
        )}

          {/* BREAKING */}
          {selectedCategory === 'All' && breakingArticles.length > 0 && (
            <section className="pt-4">
              <div className="px-4 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-[16px] font-black">FLASH BREAKING</h2>
                </div>
                <span className="text-[10px] text-gray-500 font-semibold">⚡ LIVE</span>
              </div>

              <div className="px-4">
                {breakingArticles.map((article, index) => (
                  index === breakingIndex && (
                    <article
                      key={article.id}
                      onClick={() => onSelectArticle(article)}
                      className="w-full h-[240px] rounded-3xl overflow-hidden bg-[#111214] border border-[#252629] shadow-xl cursor-pointer relative"
                    >
                      <img
                        src={article.imageUrl || fallbackImage}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImage;
                        }}
                      />

                      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[9px] font-black tracking-wide shadow-lg">
                        BREAKING
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(article.id);
                        }}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white"
                      >
                        <Bookmark className={`w-4 h-4 ${
                          isBookmarked(article.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-white'
                        }`} />
                      </button>
                    </article>
                  )
                ))}
              </div>
            </section>
          )}
        {/* LATEST HEADER */}
        <section className="px-4 pt-6">

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] text-red-500 font-black tracking-[0.2em] uppercase mb-1">
                FlashNews24
              </p>

              <h2 className="text-[20px] font-black tracking-tight">
                Latest Feed
              </h2>
            </div>

            <span className="text-[10px] text-gray-500 font-semibold">
              {regularArticles.length} stories
            </span>
          </div>

          {/* EMPTY */}
          {regularArticles.length === 0 &&
            articles.length === 0 && (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
              </div>
            )}

          {regularArticles.length === 0 &&
            articles.length > 0 && (
              <div className="py-16 text-center rounded-3xl bg-[#111214] border border-[#252629]">
                <Zap className="w-8 h-8 mx-auto text-red-500 mb-3" />
                <h3 className="font-bold text-sm">
                  No stories in this category
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Try another category.
                </p>
              </div>
            )}

          {/* ARTICLE LIST */}
          <div className="space-y-3 pb-8">

            {regularArticles.map(article => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="rounded-3xl bg-[#111214] border border-[#242529] p-3 active:bg-[#17181A] transition-colors"
              >

                <div className="flex gap-2">

                  <div className="relative w-[60px] h-[60px] shrink-0 rounded-2xl overflow-hidden bg-[#18191B]">
                    <img
                      src={article.imageUrl || fallbackImage}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = fallbackImage;
                      }}
                    />

                    {article.category && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-red-600 text-white text-[8px] font-black">
                        {article.category}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-red-400 uppercase truncate">
                        {article.sourceName ||
                          'FlashNews24.site'}
                      </span>

                      <span className="text-[9px] text-gray-500 whitespace-nowrap">
                        {article.publishedAt}
                      </span>
                    </div>

                    <h3 className="text-[12px] font-extrabold leading-snug line-clamp-2 mt-1">
                      {article.title}
                    </h3>

                    <p className="text-[11px] text-gray-500 hidden leading-relaxed">
                      {article.summary}
                    </p>

                  </div>
                </div>

                <div className="mt-1 pt-1.5 border-t border-[#252629] flex items-center justify-between">

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {article.readTimeMinutes || 1} min read
                    </span>
                  </div>

                  <div className="flex items-center gap-1">

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onShareArticle(article);
                      }}
                      className="p-2 text-gray-500 active:text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleBookmark(article.id);
                      }}
                      className="p-2 text-gray-500"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isBookmarked(article.id)
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                    </button>

                  </div>
                </div>
              </article>
            ))}

          </div>
        </section>

      </main>



    </div>
  );
};
