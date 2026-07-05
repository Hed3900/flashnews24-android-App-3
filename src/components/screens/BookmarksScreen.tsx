import React from 'react';
import { Article } from '../../types';
import { Bookmark, Trash2, Database, ExternalLink, Clock, ChevronRight } from 'lucide-react';

interface BookmarksScreenProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAllBookmarks: () => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  articles,
  onSelectArticle,
  onRemoveBookmark,
  onClearAllBookmarks
}) => {
  return (
    <div className="flex flex-col h-full bg-inherit animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-[#2D333B] sticky top-0 bg-inherit z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-sm">
            <Bookmark className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Room DB Bookmarks</h1>
            <p className="text-[9px] text-[#E1E4E8] opacity-60 font-medium">Offline SQLite Persistence</p>
          </div>
        </div>

        {articles.length > 0 && (
          <button
            onClick={onClearAllBookmarks}
            className="text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            title="Clear all saved articles from Room Database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cache</span>
          </button>
        )}
      </div>

      {/* Offline Status Info Banner */}
      <div className="bg-blue-600/10 border-b border-blue-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-blue-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>Cached in SQLite table <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-white border border-blue-500/30">articles_table</code></span>
        </div>
        <span className="font-bold">{articles.length} saved</span>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {articles.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#1A1D23] rounded-[24px] border border-dashed border-[#2D333B] my-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#0F1115] flex items-center justify-center mx-auto mb-3 text-blue-400 border border-[#2D333B]">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Bookmarks Saved</h3>
            <p className="text-xs text-[#E1E4E8] opacity-60 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Tap the bookmark icon on any article card to cache it locally in Room SQLite Database for offline reading.
            </p>
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-[#1A1D23] rounded-[24px] p-3.5 shadow-2xl border border-[#2D333B] hover:border-blue-500/40 transition-all cursor-pointer flex gap-3 group"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#0F1115] flex-shrink-0 border border-[#2D333B]/50">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-400 mb-1">
                    <span className="uppercase tracking-wider">{art.sourceName}</span>
                    <span className="text-[#E1E4E8] opacity-60 font-normal">{art.category}</span>
                  </div>
                  <h3 className="text-xs font-bold leading-tight line-clamp-2 text-white group-hover:text-blue-400 transition-colors">
                    {art.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#2D333B] text-[10px] text-[#E1E4E8] opacity-60">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 opacity-70" />
                    {art.readTimeMinutes}m read
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold flex items-center gap-0.5">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(art.id);
                      }}
                      className="p-1 text-[#E1E4E8] opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                      title="Delete from Room DB"
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
