import React from 'react';
import { Article } from '../../types';
import { Bookmark, Trash2, Database, ExternalLink, Clock, ChevronRight } from 'lucide-react';

interface BookmarksScreenProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAllBookmarks: () => void;
  onBack: () => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  articles,
  onSelectArticle,
  onRemoveBookmark,
  onClearAllBookmarks,
  onBack
}) => {
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
          <div className="w-9 h-9 rounded-xl bg-red-600/15 text-red-400 flex items-center justify-center border border-red-500/30 shadow-sm">
            <Bookmark className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Saved Bookmarks</h1>
            <p className="text-[9px] text-[#E1E4E8] opacity-60 font-medium">Your saved stories</p>
          </div>
        </div>

        {articles.length > 0 && (
          <button
            onClick={onClearAllBookmarks}
            className="text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            title="Clear all saved articles from Room Database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Offline Status Info Banner */}
      <div className="bg-red-600/10 border-b border-red-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-red-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>Saved locally <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-white border border-red-500/30">FlashNews24</code></span>
        </div>
        <span className="font-bold">{articles.length} saved</span>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {articles.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#111214] rounded-[24px] border border-dashed border-[#252629] my-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#08090A] flex items-center justify-center mx-auto mb-3 text-red-400 border border-[#252629]">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Saved Stories</h3>
            <p className="text-xs text-[#E1E4E8] opacity-60 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Bookmark any article to save it here for quick access and offline reading.
            </p>
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-[#111214] rounded-[24px] p-3.5 shadow-2xl border border-[#252629] hover:border-red-500/40 transition-all cursor-pointer flex gap-3 group"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#08090A] flex-shrink-0 border border-[#252629]/50">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-red-400 mb-1">
                    <span className="uppercase tracking-wider">{art.sourceName}</span>
                    <span className="text-[#E1E4E8] opacity-60 font-normal">{art.category}</span>
                  </div>
                  <h3 className="text-xs font-bold leading-tight line-clamp-2 text-white group-hover:text-red-400 transition-colors">
                    {art.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#252629] text-[10px] text-[#E1E4E8] opacity-60">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 opacity-70" />
                    {art.readTimeMinutes}m read
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold flex items-center gap-0.5">
                      Read <ChevronRight className="w-3 h-3" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(art.id);
                      }}
                      className="p-1 text-[#E1E4E8] opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
