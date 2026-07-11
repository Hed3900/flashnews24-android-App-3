import React, { useState } from 'react';
import { Article, NewsCategory } from '../../types';
import { Search, RotateCcw, Bookmark, Share2, Sparkles, Clock, Flame, WifiOff, ChevronRight, Zap, Menu } from 'lucide-react';

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
}

const STANDARD_CATEGORIES: NewsCategory[] = ['Tech', 'AI', 'Business', 'World', 'Science', 'Sports'];

const ArticleShimmerSkeleton = () => (
  <div className="bg-[#1A1D23] rounded-[24px] p-3.5 shadow-xl border border-[#2D333B] flex gap-3.5 animate-pulse">
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-gray-800 via-gray-700 to-gray-800 flex-shrink-0"></div>
    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
      <div className="space-y-2">
        <div className="h-2.5 w-1/3 bg-gray-700/80 rounded-full"></div>
        <div className="h-3.5 w-full bg-gray-700 rounded-full"></div>
        <div className="h-3.5 w-4/5 bg-gray-700 rounded-full"></div>
      </div>
      <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#2D333B]/50">
        <div className="h-2.5 w-1/4 bg-gray-800 rounded-full"></div>
        <div className="flex gap-2">
          <div className="h-4 w-4 bg-gray-800 rounded-full"></div>
          <div className="h-4 w-4 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const BreakingShimmerSkeleton = () => (
  <div className="w-[280px] h-[250px] flex-shrink-0 rounded-[24px] bg-[#1A1D23] border border-[#2D333B] overflow-hidden flex flex-col animate-pulse shadow-2xl">
    <div className="w-full h-36 bg-gradient-to-tr from-gray-800 via-gray-700 to-gray-800"></div>
    <div className="p-4 flex-1 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-2.5 w-1/3 bg-gray-700 rounded-full"></div>
        <div className="h-3.5 w-full bg-gray-700 rounded-full"></div>
        <div className="h-3.5 w-2/3 bg-gray-700 rounded-full"></div>
      </div>
      <div className="flex justify-between pt-2 border-t border-[#2D333B]/50">
        <div className="h-2.5 w-1/3 bg-gray-800 rounded-full"></div>
        <div className="h-2.5 w-1/4 bg-gray-800 rounded-full"></div>
      </div>
    </div>
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
  const [isPulling, setIsPulling] = useState(false);

  const hasArticlesForCategory = React.useCallback((cat: string) => {
    if (cat === 'All') return articles.length > 0;
    const catLower = cat.toLowerCase();
    return articles.some(a => {
      const matchCategory = typeof a.category === 'string' && a.category.toLowerCase() === catLower;
      const matchTags = a.tags && a.tags.some(tag => tag.toLowerCase().includes(catLower));
      return matchCategory || matchTags;
    });
  }, [articles]);

  const getCategoryCount = React.useCallback((cat: string) => {
    if (cat === 'All') return articles.length;
    const catLower = cat.toLowerCase();
    return articles.filter(a => {
      const matchCategory = typeof a.category === 'string' && a.category.toLowerCase() === catLower;
      const matchTags = a.tags && a.tags.some(tag => tag.toLowerCase().includes(catLower));
      return matchCategory || matchTags;
    }).length;
  }, [articles]);

  const activeCategories = React.useMemo(() => {
    const dynamicCategories = Array.from(new Set(
      articles.map(a => a.category).filter(c => typeof c === 'string' && c && c !== 'All')
    ));

    const allCandidates = Array.from(new Set([...STANDARD_CATEGORIES, ...dynamicCategories]));
    const populated = allCandidates.filter(cat => hasArticlesForCategory(cat));

    return ['All', ...populated];
  }, [articles, hasArticlesForCategory]);

  React.useEffect(() => {
    if (selectedCategory !== 'All' && activeCategories.length > 0 && !activeCategories.includes(selectedCategory)) {
      onSelectCategory('All');
    }
  }, [selectedCategory, activeCategories, onSelectCategory]);

  const breakingArticles = articles.filter(a => a.isBreaking);
const regularArticles = articles
  .filter((a) => {
    if (selectedCategory === "All") {
      return true;
    }

    const catLower = selectedCategory.toLowerCase();

    return (
      (a.category || "").toLowerCase() === catLower ||
      a.tags?.some(tag => tag.toLowerCase().includes(catLower))
    );
  })
  .sort(
    (a, b) =>
      new Date((b as any).rawPublishedAt || b.publishedAt).getTime() -
      new Date((a as any).rawPublishedAt || a.publishedAt).getTime()
  )
  .slice(0, 50);
  const handleManualRefresh = () => {
    setIsPulling(true);
    onRefresh();
    setTimeout(() => setIsPulling(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-inherit">
      {/* Material 3 TopAppBar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#2D333B] sticky top-0 bg-inherit z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-1">
              FlashNews<span className="text-blue-500">24</span>
            </h1>
            <p className="text-[9px] text-[#E1E4E8] opacity-60 font-medium">Blogger Live Feed • flashnews24.site</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isOffline && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20 animate-pulse">
              <WifiOff className="w-3 h-3" />
              Room Offline
            </span>
          )}
          <button
  onClick={onOpenSearch}
  className="p-2 rounded-full hover:bg-white/10 transition-colors"
  title="Search news"
>
  <Search className="w-4 h-4 text-blue-500" />
</button>

<button
  onClick={() => setMenuOpen(true)}
  className="p-2 rounded-full hover:bg-white/10 transition-colors"
  title="Menu"
>
  <Menu className="w-5 h-5 text-blue-500" />
</button>
          
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || isPulling}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              isRefreshing || isPulling ? 'animate-spin text-blue-500' : 'opacity-80'
            }`}
            title="Simulate Pull-to-Refresh (Retrofit sync)"
          >
            <RotateCcw className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Offline Mode Graceful Network Notice */}
      {isOffline && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-amber-300 text-xs font-medium sticky top-[53px] z-20">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-amber-400" />
            <span className="truncate text-[11px] font-semibold">Offline Room DB Mode: Serving SQLite cached articles.</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[9px] rounded-md uppercase tracking-wider transition-colors whitespace-nowrap shadow-sm"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Material 3 Scrollable TabRow */}
      <div className={`flex items-center gap-1.5 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-[#2D333B] bg-inherit sticky ${isOffline ? 'top-[89px]' : 'top-[53px]'} z-20`}>
        {activeCategories.map((cat) => {
          const isSelected = cat === selectedCategory;
          const count = getCategoryCount(cat);
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 scale-105'
                  : 'text-[#E1E4E8] opacity-60 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Simulated Pull-to-Refresh Bar */}
      {(isRefreshing || isPulling) && (
        <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent text-blue-400 text-xs py-2 px-4 font-semibold flex items-center justify-center gap-2.5 animate-pulse border-b border-blue-500/20">
          <RotateCcw className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span>Syncing Blogger Live Feed (flashnews24.site) via Retrofit & Room DB...</span>
        </div>
      )}

      {/* Main Articles Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        
        {/* Breaking News Carousel (Only in All or AI) */}
        {(breakingArticles.length > 0 || (isRefreshing && articles.length === 0)) && selectedCategory === 'All' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold tracking-wider uppercase text-red-500 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Flash Breaking
              </span>
              <span className="text-[10px] text-[#E1E4E8] opacity-60 font-semibold">Live FCM Stream</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
              {articles.length === 0 ? (
                <>
                  <BreakingShimmerSkeleton />
                  <BreakingShimmerSkeleton />
                </>
              ) : (
                breakingArticles.map((art) => {
                  const isBookmarked = bookmarkedIds.includes(art.id);
                  return (
                    <div
                      key={art.id}
                      onClick={() => onSelectArticle(art)}
                      className="w-[280px] flex-shrink-0 snap-start bg-[#1A1D23] text-white rounded-[24px] overflow-hidden shadow-2xl border border-[#2D333B] cursor-pointer group hover:border-blue-500/50 transition-all flex flex-col"
                    >
                      <div className="relative h-36 w-full overflow-hidden bg-gray-800">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/40 to-transparent"></div>
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[9px] tracking-widest uppercase shadow">
                          BREAKING
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(art.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold mb-1">
                            <span>{art.sourceName}</span>
                            <span>•</span>
                            <span>{art.readTimeMinutes} min read</span>
                          </div>
                          <h3 className="text-xs font-bold leading-snug text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {art.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2D333B] text-[10px] text-[#E1E4E8] opacity-60">
                          <span>{art.publishedAt}</span>
                      
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Regular Article List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider">
              {selectedCategory === 'All' ? 'Latest Feed' : `${selectedCategory} News`}
            </span>
            <span className="text-[10px] text-[#E1E4E8] opacity-40">{regularArticles.length} stories cached</span>
          </div>

{regularArticles.length === 0 ? (
  <div className="text-center py-12 px-4 bg-[#1A1D23] rounded-[24px] border border-dashed border-[#2D333B]">
    <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
    <h4 className="text-sm font-bold">
      No articles found in {selectedCategory}
    </h4>
    <p className="text-xs text-[#E1E4E8] opacity-60 mt-1">
      Try selecting another category or pull to refresh from Retrofit.
    </p>

    <button
      onClick={handleManualRefresh}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors"
    >
      Fetch Live Articles
    </button>
  </div>
) : (
  regularArticles.map((art) => {
              const isBookmarked = bookmarkedIds.includes(art.id);
              return (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="bg-[#1A1D23] rounded-[24px] p-3.5 shadow-2xl border border-[#2D333B] hover:border-blue-500/40 transition-all cursor-pointer flex gap-3.5 group"
                >
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#0F1115] flex-shrink-0 border border-[#2D333B]/50">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {art.category === 'AI' && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-blue-600/90 backdrop-blur-sm text-[8px] font-bold text-white flex items-center gap-0.5 uppercase tracking-widest">
                        <Sparkles className="w-2 h-2" /> AI
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-400 mb-1">
                        <span className="truncate max-w-[120px] uppercase tracking-wider">{art.sourceName}</span>
                        <span className="text-[#E1E4E8] opacity-60 font-normal">{art.publishedAt}</span>
                      </div>
                      <h3 className="text-xs font-bold leading-tight line-clamp-2 text-white group-hover:text-blue-400 transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-[11px] text-[#E1E4E8] opacity-70 line-clamp-1 mt-1 font-normal">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#2D333B] text-[10px] text-[#E1E4E8] opacity-60">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 opacity-70" />
                        {art.readTimeMinutes}m read
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareArticle(art);
                          }}
                          className="p-1 hover:text-blue-400 hover:opacity-100 transition-colors"
                          title="Share Article"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(art.id);
                          }}
                          className="p-1 hover:text-blue-400 hover:opacity-100 transition-colors"
                          title={isBookmarked ? 'Remove from Room DB' : 'Save to Room DB'}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isBookmarked ? 'fill-blue-500 text-blue-500 opacity-100' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

